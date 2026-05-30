import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Headphones,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type {
  GroupAnswer,
  GroupPassage,
  GroupQuestion,
  MediaAsset,
  PatchGroupPassageInput,
  QuestionGroupDetail,
  QuestionGroupSummary,
  ReviewStatus,
} from '../../types/teacherTestTypes';

interface StepReviewGroupsProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

type DirtyPatch = {
  images?: boolean;
  audio?: boolean;
  passages?: boolean;
  questionIds?: number[];
  answerIds?: number[];
};

type DirtyState = {
  images: boolean;
  audio: boolean;
  passages: boolean;
  questionIds: Set<number>;
  answerIds: Set<number>;
};

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const createDirtyState = (): DirtyState => ({
  images: false,
  audio: false,
  passages: false,
  questionIds: new Set<number>(),
  answerIds: new Set<number>(),
});

const cloneDirtyState = (dirty: DirtyState): DirtyState => ({
  images: dirty.images,
  audio: dirty.audio,
  passages: dirty.passages,
  questionIds: new Set(dirty.questionIds),
  answerIds: new Set(dirty.answerIds),
});

const hasDirtyState = (dirty: DirtyState) =>
  dirty.images || dirty.audio || dirty.passages || dirty.questionIds.size > 0 || dirty.answerIds.size > 0;

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

const getMediaName = (media: MediaAsset[], mediaAssetId?: number | null) => {
  if (!mediaAssetId) return 'Chưa chọn';
  const item = media.find((asset) => asset.id === mediaAssetId);
  return item ? item.label : `Media #${mediaAssetId}`;
};

const BLOCKING_REVIEW_FLAGS = ['missing_questions', 'missing_image', 'missing_audio', 'missing_passage'];

const getReviewStatusLabel = (status: ReviewStatus) => {
  if (status === 'reviewed') return 'Đã review';
  return 'Cần review';
};

const getMissingFlagLabel = (flag: string) => {
  const labels: Record<string, string> = {
    missing_questions: 'Thiếu questions',
    missing_image: 'Thiếu image',
    missing_audio: 'Thiếu Audio',
    missing_passage: 'Thiếu passage',
    missing_answers: 'Thiếu answers',
    invalid_correct_answer: 'Đáp án đúng không hợp lệ',
  };
  return labels[flag] || flag;
};

const getPassageTitleFromLabel = (label?: string | null) => {
  if (!label || !label.includes('_')) return null;
  return normalizePassageTitle(label.split('_').slice(1).join('-'));
};

const normalizePassageTitle = (value?: string | null) => {
  if (!value) return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || null;
};

const formatQuestionRange = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const normalized = String(value).trim();
  const commaNumbers = normalized
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  if (commaNumbers.length > 1) {
    return `${commaNumbers[0]}-${commaNumbers[commaNumbers.length - 1]}`;
  }
  if (commaNumbers.length === 1 && normalized.includes(',')) {
    return String(commaNumbers[0]);
  }
  if (!/^\d+$/.test(normalized)) return normalized;
  if (normalized.length <= 3) return normalized;

  const chunkSize = normalized.length % 3 === 0 ? 3 : normalized.length % 2 === 0 ? 2 : 0;
  if (!chunkSize) return normalized;

  const numbers = normalized.match(new RegExp(`\\d{${chunkSize}}`, 'g')) || [];
  if (numbers.length <= 1) return normalized;
  return `${Number(numbers[0])}-${Number(numbers[numbers.length - 1])}`;
};

export const StepReviewGroups = ({ testId, nextStep, prevStep }: StepReviewGroupsProps) => {
  const [groups, setGroups] = useState<QuestionGroupSummary[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [detail, setDetail] = useState<QuestionGroupDetail | null>(null);
  const [activePart, setActivePart] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [dirtyVersion, setDirtyVersion] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const detailRef = useRef<QuestionGroupDetail | null>(null);
  const lastSavedDetailRef = useRef<QuestionGroupDetail | null>(null);
  const dirtyRef = useRef<DirtyState>(createDirtyState());
  const dirtyVersionRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  const imageAssets = useMemo(() => mediaAssets.filter((asset) => asset.media_type === 'image'), [mediaAssets]);
  const audioAssets = useMemo(() => mediaAssets.filter((asset) => asset.media_type === 'audio'), [mediaAssets]);
  const availableParts = useMemo(() => {
    const parts = Array.from(new Set(groups.map((group) => group.part_number))).sort((a, b) => a - b);
    return parts.length ? parts : [1, 2, 3, 4, 5, 6, 7];
  }, [groups]);
  const filteredGroups = useMemo(
    () => groups.filter((group) => group.part_number === activePart),
    [groups, activePart]
  );
  const reviewableGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.review_status !== 'reviewed' &&
          !group.missing_flags.some((flag) => BLOCKING_REVIEW_FLAGS.includes(flag))
      ),
    [groups]
  );
  const blockedReviewCount = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.review_status !== 'reviewed' &&
          group.missing_flags.some((flag) => BLOCKING_REVIEW_FLAGS.includes(flag))
      ).length,
    [groups]
  );

  const loadGroups = async (preferredGroupId?: number) => {
    try {
      setLoadingList(true);
      setErrorMsg('');
      const [groupsRes, mediaRes] = await Promise.all([
        teacherTestService.getQuestionGroups(testId),
        teacherTestService.getTestMedia(testId),
      ]);

      if (groupsRes.code === 1000) {
        const nextGroups = groupsRes.result || [];
        setGroups(nextGroups);
        const activePartGroups = nextGroups.filter((group) => group.part_number === activePart);
        const nextSelectedId = preferredGroupId || selectedGroupId || activePartGroups[0]?.id || nextGroups[0]?.id || null;
        setSelectedGroupId(nextSelectedId);
        if (nextSelectedId) {
          await loadGroupDetail(nextSelectedId);
        } else {
          setDetail(null);
        }
      } else {
        setErrorMsg(groupsRes.message || 'Không thể tải danh sách nhóm câu.');
      }

      if (mediaRes.code === 1000) {
        setMediaAssets(mediaRes.result || []);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải dữ liệu review.'));
    } finally {
      setLoadingList(false);
    }
  };

  const loadGroupDetail = async (groupId: number) => {
    try {
      setLoadingDetail(true);
      setErrorMsg('');
      const res = await teacherTestService.getQuestionGroupDetail(groupId);
      if (res.code === 1000) {
        setDetail(res.result);
        detailRef.current = res.result;
        lastSavedDetailRef.current = res.result;
        dirtyRef.current = createDirtyState();
        dirtyVersionRef.current = 0;
        setDirtyVersion(0);
        setSaveStatus('idle');
      } else {
        setErrorMsg(res.message || 'Không thể tải chi tiết nhóm câu.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải chi tiết nhóm câu.'));
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGroups();
  }, [testId]);

  const updateCurrentGroup = (nextDetail: QuestionGroupDetail) => {
    setDetail(nextDetail);
    detailRef.current = nextDetail;
    lastSavedDetailRef.current = nextDetail;
    setGroups((prev) =>
      prev.map((group) =>
        group.id === nextDetail.id
          ? {
              ...group,
              review_status: nextDetail.review_status,
              missing_flags: nextDetail.missing_flags ?? group.missing_flags,
            }
          : group
      )
    );
  };

  const updateGroupSummary = (nextDetail: QuestionGroupDetail) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === nextDetail.id
          ? {
              ...group,
              review_status: nextDetail.review_status,
              missing_flags: nextDetail.missing_flags ?? group.missing_flags,
            }
          : group
      )
    );
  };

  const refreshGroupSummaries = async (currentGroupId?: number) => {
    const res = await teacherTestService.getQuestionGroups(testId);
    if (res.code !== 1000) return;

    const nextGroups = res.result || [];
    setGroups(nextGroups);

    if (!currentGroupId) return;
    const currentSummary = nextGroups.find((group) => group.id === currentGroupId);
    if (!currentSummary || detailRef.current?.id !== currentGroupId) return;

    const nextDetail = {
      ...detailRef.current,
      review_status: currentSummary.review_status,
      missing_flags: currentSummary.missing_flags,
    };
    setDetail(nextDetail);
    detailRef.current = nextDetail;
  };

  const markDirty = (patch: DirtyPatch) => {
    if (patch.images) dirtyRef.current.images = true;
    if (patch.audio) dirtyRef.current.audio = true;
    if (patch.passages) dirtyRef.current.passages = true;
    patch.questionIds?.forEach((id) => dirtyRef.current.questionIds.add(id));
    patch.answerIds?.forEach((id) => dirtyRef.current.answerIds.add(id));
    dirtyVersionRef.current += 1;
    setDirtyVersion(dirtyVersionRef.current);
    setSaveStatus('dirty');
  };

  const clearSaveTimer = () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  };

  const saveDirtyDetail = useCallback(async () => {
    if (savePromiseRef.current) return savePromiseRef.current;

    const snapshot = detailRef.current;
    const dirtySnapshot = cloneDirtyState(dirtyRef.current);
    const startVersion = dirtyVersionRef.current;
    if (!snapshot || !hasDirtyState(dirtySnapshot)) return true;

    clearSaveTimer();
    const savePromise = (async () => {
      try {
        setSaving(true);
        setSaveStatus('saving');
        setErrorMsg('');
        let latestDetail = snapshot;

        if (dirtySnapshot.images) {
          const res = await teacherTestService.patchGroupImages(
            snapshot.id,
            snapshot.images.map((image, index) => ({
              media_asset_id: image.media_asset_id,
              order_index: index,
            }))
          );
          if (res.code !== 1000) throw new Error(res.message || 'Lưu image thất bại.');
          latestDetail = res.result;
        }

        if (dirtySnapshot.audio) {
          const res = await teacherTestService.patchGroupAudio(snapshot.id, {
            media_asset_id: snapshot.audio?.media_asset_id || null,
            start_ms: null,
            end_ms: null,
            transcript_en: snapshot.audio?.transcript_en ?? null,
            transcript_vi: snapshot.audio?.transcript_vi ?? null,
          });
          if (res.code !== 1000) throw new Error(res.message || 'Lưu Audio thất bại.');
          latestDetail = res.result;
        }

        if (dirtySnapshot.passages) {
          const passages: PatchGroupPassageInput[] = snapshot.passages.map((passage, index) => ({
            media_asset_id: passage.media_asset_id,
            title: passage.content_format === 'image' ? normalizePassageTitle(passage.title) : passage.title,
            passage_type: passage.passage_type,
            content_format: passage.content_format,
            content_en: passage.content_en,
            content_vi: passage.content_vi,
            vocab_hints: passage.vocab_hints,
            order_index: index,
          }));
          const res = await teacherTestService.patchGroupPassages(snapshot.id, passages);
          if (res.code !== 1000) throw new Error(res.message || 'Lưu passage thất bại.');
          latestDetail = res.result;
        }

        for (const questionId of dirtySnapshot.questionIds) {
          const question = snapshot.questions.find((item) => item.id === questionId);
          if (!question) continue;
          const res = await teacherTestService.patchQuestion(question.id, {
            question_text_en: question.question_text_en,
            question_text_vi: question.question_text_vi,
            explanation_vi: question.explanation_vi,
          });
          if (res.code !== 1000) throw new Error(res.message || 'Lưu Question thất bại.');
          latestDetail = res.result;
        }

        for (const answerId of dirtySnapshot.answerIds) {
          const answer = snapshot.questions.flatMap((question) => question.answers).find((item) => item.id === answerId);
          if (!answer) continue;
          const res = await teacherTestService.patchAnswer(answer.id, {
            answer_text_en: answer.answer_text_en,
            answer_text_vi: answer.answer_text_vi,
            is_correct: answer.is_correct,
          });
          if (res.code !== 1000) throw new Error(res.message || 'Lưu Answer thất bại.');
          latestDetail = res.result;
        }

        if (snapshot.review_status === 'reviewed') {
          const res = await teacherTestService.patchReviewStatus(snapshot.id, 'needs_review');
          if (res.code === 1000) latestDetail = res.result;
        }

        updateGroupSummary(latestDetail);
        await refreshGroupSummaries(snapshot.id);
        lastSavedDetailRef.current = snapshot;

        if (dirtyVersionRef.current === startVersion) {
          dirtyRef.current = createDirtyState();
          dirtyVersionRef.current = 0;
          setDirtyVersion(0);
          setSaveStatus('saved');
          if (detailRef.current?.id === latestDetail.id) {
            const current = detailRef.current;
            const nextDetail = {
              ...current,
              review_status: latestDetail.review_status,
              missing_flags: latestDetail.missing_flags,
            };
            setDetail(nextDetail);
            detailRef.current = nextDetail;
            lastSavedDetailRef.current = nextDetail;
          }
        } else {
          setSaveStatus('dirty');
        }

        return true;
      } catch (err) {
        setSaveStatus('error');
        setErrorMsg(getErrorMessage(err, 'Không thể tự lưu thay đổi. Vui lòng thử lại.'));
        return false;
      } finally {
        setSaving(false);
        savePromiseRef.current = null;
      }
    })();

    savePromiseRef.current = savePromise;
    return savePromise;
  }, []);

  useEffect(() => {
    if (!dirtyVersion || !hasDirtyState(dirtyRef.current)) return;
    clearSaveTimer();
    saveTimerRef.current = window.setTimeout(() => {
      void saveDirtyDetail();
    }, 800);

    return clearSaveTimer;
  }, [dirtyVersion, saveDirtyDetail]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasDirtyState(dirtyRef.current)) {
        void saveDirtyDetail();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearSaveTimer();
    };
  }, [saveDirtyDetail]);

  const patchReviewStatus = async (reviewStatus: ReviewStatus) => {
    if (!detail) return;
    try {
      setSaving(true);
      setErrorMsg('');
      const saved = await saveDirtyDetail();
      if (!saved) return;
      const res = await teacherTestService.patchReviewStatus(detail.id, reviewStatus);
      if (res.code === 1000) {
        updateCurrentGroup(res.result);
        await loadGroups(detail.id);
      } else {
        setErrorMsg(res.message || 'Không thể cập nhật trạng thái review.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể cập nhật trạng thái review.'));
    } finally {
      setSaving(false);
    }
  };

  const markAllReviewed = async () => {
    if (!reviewableGroups.length) return;
    try {
      setSaving(true);
      setErrorMsg('');
      const saved = await saveDirtyDetail();
      if (!saved) return;

      for (const group of reviewableGroups) {
        const res = await teacherTestService.patchReviewStatus(group.id, 'reviewed');
        if (res.code !== 1000) throw new Error(res.message || `Không thể đánh dấu group ${group.id} là đã review.`);
      }

      await loadGroups(selectedGroupId || reviewableGroups[0].id);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể đánh dấu tất cả nhóm là đã review.'));
    } finally {
      setSaving(false);
    }
  };

  const goPrevStep = async () => {
    const saved = await saveDirtyDetail();
    if (saved) prevStep();
  };

  const goNextStep = async () => {
    const saved = await saveDirtyDetail();
    if (saved) nextStep();
  };

  const selectGroup = async (groupId: number) => {
    const saved = await saveDirtyDetail();
    if (!saved) return;
    setSelectedGroupId(groupId);
    await loadGroupDetail(groupId);
  };

  const selectPart = async (partNumber: number) => {
    const saved = await saveDirtyDetail();
    if (!saved) return;
    setActivePart(partNumber);
    const firstGroup = groups.find((group) => group.part_number === partNumber);
    if (firstGroup) {
      setSelectedGroupId(firstGroup.id);
      await loadGroupDetail(firstGroup.id);
    } else {
      setSelectedGroupId(null);
      setDetail(null);
      detailRef.current = null;
      lastSavedDetailRef.current = null;
    }
  };

  const setDetailValue = (updater: (current: QuestionGroupDetail) => QuestionGroupDetail, dirtyPatch: DirtyPatch) => {
    setDetail((current) => {
      if (!current) return current;
      const nextDetail = updater(current);
      detailRef.current = nextDetail;
      return nextDetail;
    });
    markDirty(dirtyPatch);
  };

  const setQuestionValue = (questionId: number, field: keyof GroupQuestion, value: string | null) => {
    setDetailValue((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      ),
    }), { questionIds: [questionId] });
  };

  const setAnswerValue = (answerId: number, field: keyof GroupAnswer, value: string | boolean | null) => {
    setDetailValue((current) => ({
      ...current,
      questions: current.questions.map((question) => ({
        ...question,
        answers: question.answers.map((answer) =>
          answer.id === answerId ? { ...answer, [field]: value } : answer
        ),
      })),
    }), { answerIds: [answerId] });
  };

  const setCorrectAnswer = (questionId: number, answerId: number) => {
    setDetailValue((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) => ({
                ...answer,
                is_correct: answer.id === answerId,
              })),
            }
          : question
      ),
    }), {
      answerIds: detailRef.current?.questions.find((question) => question.id === questionId)?.answers.map((answer) => answer.id) || [],
    });
  };

  const addImage = () => {
    const firstImage = imageAssets[0];
    if (!firstImage) return;
    setDetailValue((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          media_asset_id: firstImage.id,
          label: firstImage.label,
          url: firstImage.url,
          order_index: current.images.length,
        },
      ],
    }), { images: true });
  };

  const addImagePassage = () => {
    const firstImage = imageAssets[0];
    if (!firstImage) return;
    setDetailValue((current) => ({
      ...current,
      passages: [
        ...current.passages,
        {
          media_asset_id: firstImage.id,
          label: firstImage.label,
          url: firstImage.url,
          title: getPassageTitleFromLabel(firstImage.label),
          passage_type: 'image',
          content_format: 'image',
          content_en: null,
          content_vi: null,
          vocab_hints: null,
          order_index: current.passages.length,
        },
      ],
    }), { passages: true });
  };

  const hasBlockingFlags = Boolean(
    detail?.missing_flags?.some((flag) => BLOCKING_REVIEW_FLAGS.includes(flag))
  );
  const saveStatusText =
    saveStatus === 'saving'
      ? 'Đang lưu thay đổi...'
      : saveStatus === 'dirty'
        ? 'Có thay đổi chưa lưu'
        : saveStatus === 'error'
          ? 'Lưu thất bại'
          : saveStatus === 'saved'
            ? 'Đã lưu'
            : 'Không có thay đổi';
  const saveStatusClass =
    saveStatus === 'error'
      ? 'text-[#b42318]'
      : saveStatus === 'dirty'
        ? 'text-[#b25e00]'
        : saveStatus === 'saving'
          ? 'text-[#004ac6]'
          : 'text-[#027a48]';

  if (loadingList) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải nhóm câu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-semibold text-[#b42318]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <div className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              {availableParts.map((partNumber) => (
                <button
                  key={partNumber}
                  onClick={() => void selectPart(partNumber)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    activePart === partNumber
                      ? 'border-[#004ac6] bg-[#eaf0ff] text-[#004ac6]'
                      : 'border-[#d8dced] bg-white text-[#505f76]'
                  }`}
                >
                  Part {partNumber}
                </button>
              ))}
            </div>

            <button
              onClick={() => void markAllReviewed()}
              disabled={saving || !reviewableGroups.length}
              className="mb-3 w-full rounded-lg bg-[#027a48] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
              title={
                blockedReviewCount
                  ? `${blockedReviewCount} nhóm còn thiếu dữ liệu và sẽ được bỏ qua.`
                  : undefined
              }
            >
              Đánh dấu tất cả đã review ({reviewableGroups.length})
            </button>
            {blockedReviewCount > 0 && (
              <p className="mb-3 text-[10px] font-semibold text-[#b25e00]">
                {blockedReviewCount} nhóm cần bổ sung dữ liệu trước khi review.
              </p>
            )}

            <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => void selectGroup(group.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedGroupId === group.id
                      ? 'border-[#004ac6] bg-[#eaf0ff]'
                      : 'border-[#e4e7ec] bg-white hover:bg-[#f9fafb]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#111827]">
                      Part {group.part_number} - {formatQuestionRange(group.question_numbers)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        group.review_status === 'reviewed'
                          ? 'bg-[#edfcf2] text-[#027a48]'
                          : 'bg-[#fff4e5] text-[#b25e00]'
                      }`}
                    >
                      {getReviewStatusLabel(group.review_status)}
                    </span>
                  </div>
                  {group.missing_flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.missing_flags.map((flag) => (
                        <span key={flag} className="rounded bg-[#fef3f2] px-1.5 py-0.5 text-[10px] font-bold text-[#b42318]">
                          {getMissingFlagLabel(flag)}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="min-h-[640px] rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm">
            {loadingDetail ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
                <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải chi tiết nhóm câu...</p>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                {detail.missing_flags && detail.missing_flags.length > 0 && (
                  <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-3">
                    <p className="text-xs font-bold uppercase text-[#b42318]">Thiếu dữ liệu</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detail.missing_flags.map((flag) => (
                        <span key={flag} className="rounded bg-white px-2 py-1 text-xs font-bold text-[#b42318]">
                          {getMissingFlagLabel(flag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(detail.part_number === 1 || detail.images.length > 0) && (
                  <div className="rounded-2xl border border-[#e4e7ec] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                        <ImageIcon className="h-4 w-4 text-[#004ac6]" />
                        Images
                      </h4>
                      <div className="flex gap-2">
                        <button onClick={addImage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
                          Thêm image
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {detail.images.map((image, index) => (
                        <div key={`${image.media_asset_id}-${index}`} className="grid grid-cols-1 gap-3 rounded-xl bg-[#f9fafb] p-3 md:grid-cols-[1fr_auto]">
                          <select
                            value={image.media_asset_id}
                            onChange={(event) => {
                              const mediaId = Number(event.target.value);
                              const media = imageAssets.find((asset) => asset.id === mediaId);
                              setDetailValue((current) => ({
                                ...current,
                                images: current.images.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, media_asset_id: mediaId, label: media?.label, url: media?.url }
                                    : item
                                ),
                              }), { images: true });
                            }}
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                          >
                            {imageAssets.map((asset) => (
                              <option key={asset.id} value={asset.id}>
                                {asset.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() =>
                              setDetailValue((current) => ({
                                ...current,
                                images: current.images.filter((_, itemIndex) => itemIndex !== index),
                              }), { images: true })
                            }
                            className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
                          >
                            Xóa
                          </button>
                          {image.url && <img src={image.url} alt={image.label || 'group image'} className="max-h-52 rounded-lg border border-[#e4e7ec] object-contain" />}
                        </div>
                      ))}
                      {detail.images.length === 0 && <p className="text-xs font-semibold text-[#667085]">Chưa gắn image nào.</p>}
                    </div>
                  </div>
                )}

                {detail.part_number <= 4 && (
                  <div className="rounded-2xl border border-[#e4e7ec] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                        <Headphones className="h-4 w-4 text-[#004ac6]" />
                        Audio và Transcript
                      </h4>
                      {detail.audio && (
                        <button
                          onClick={() =>
                            setDetailValue((current) => ({
                              ...current,
                              audio: null,
                            }), { audio: true })
                          }
                          className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
                        >
                          Xóa
                        </button>
                      )}
                      {!detail.audio && (
                        <button
                          onClick={() => {
                            const firstAudio = audioAssets[0];
                            if (!firstAudio) return;
                            setDetailValue((current) => ({
                              ...current,
                              audio: {
                                media_asset_id: firstAudio.id,
                                label: firstAudio.label,
                                url: firstAudio.url,
                                start_ms: null,
                                end_ms: null,
                                transcript_en: '',
                                transcript_vi: '',
                              },
                            }), { audio: true });
                          }}
                          className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold"
                        >
                          Gắn Audio
                        </button>
                      )}
                    </div>
                    {!detail.audio ? (
                      <p className="text-xs font-semibold text-[#667085]">Chưa gắn Audio.</p>
                    ) : (
                      <div className="space-y-3">
                        <select
                          value={detail.audio.media_asset_id}
                          onChange={(event) => {
                            const mediaId = Number(event.target.value);
                            const media = audioAssets.find((asset) => asset.id === mediaId);
                            setDetailValue((current) => ({
                              ...current,
                            audio: current.audio
                                ? { ...current.audio, media_asset_id: mediaId, label: media?.label, url: media?.url, start_ms: null, end_ms: null }
                                : current.audio,
                            }), { audio: true });
                          }}
                          className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        >
                          {audioAssets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.label}
                            </option>
                          ))}
                        </select>
                        {detail.audio.url && <audio controls src={detail.audio.url} className="w-full" />}
                        <AutoResizeTextarea
                          value={detail.audio.transcript_en ?? ''}
                          onChange={(event) =>
                            setDetailValue((current) => ({
                              ...current,
                              audio: current.audio ? { ...current.audio, transcript_en: event.target.value } : current.audio,
                            }), { audio: true })
                          }
                          placeholder="Transcript EN"
                        />
                        <AutoResizeTextarea
                          value={detail.audio.transcript_vi ?? ''}
                          onChange={(event) =>
                            setDetailValue((current) => ({
                              ...current,
                              audio: current.audio ? { ...current.audio, transcript_vi: event.target.value } : current.audio,
                            }), { audio: true })
                          }
                          placeholder="Transcript VI"
                        />
                      </div>
                    )}
                  </div>
                )}

                {detail.part_number >= 6 && (
                  <PassagesEditor
                    detail={detail}
                    imageAssets={imageAssets}
                    setDetailValue={setDetailValue}
                    addImagePassage={addImagePassage}
                  />
                )}

                <div className="space-y-4">
                  {detail.questions.map((question) => (
                    <div key={question.id} className="rounded-2xl border border-[#e4e7ec] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#111827]">Question {question.question_number}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <AutoResizeTextarea
                          value={question.question_text_en ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'question_text_en', event.target.value)}
                          placeholder="Question text EN"
                          rows={1}
                        />
                        <AutoResizeTextarea
                          value={question.question_text_vi ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'question_text_vi', event.target.value)}
                          placeholder="Question text VI"
                          rows={1}
                        />
                        <AutoResizeTextarea
                          value={question.explanation_vi ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'explanation_vi', event.target.value)}
                          placeholder="Explanation VI"
                          rows={1}
                        />
                      </div>
                      <div className="mt-4 space-y-3">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="rounded-xl bg-[#f9fafb] p-3">
                            <div className="mb-2 flex items-center gap-3">
                              <label className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                                <input
                                  type="radio"
                                  checked={answer.is_correct}
                                  onChange={() => setCorrectAnswer(question.id, answer.id)}
                                />
                                Answer {answer.label}
                              </label>
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <AutoResizeTextarea
                                value={answer.answer_text_en ?? ''}
                                onChange={(event) => setAnswerValue(answer.id, 'answer_text_en', event.target.value)}
                                placeholder="Answer EN"
                                rows={1}
                              />
                              <AutoResizeTextarea
                                value={answer.answer_text_vi ?? ''}
                                onChange={(event) => setAnswerValue(answer.id, 'answer_text_vi', event.target.value)}
                                placeholder="Answer VI"
                                rows={1}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f5fb] pt-4">
                  <span className={`text-xs font-bold ${saveStatusClass}`}>{saveStatusText}</span>
                  <button
                    onClick={() => void patchReviewStatus(detail.review_status === 'reviewed' ? 'needs_review' : 'reviewed')}
                    disabled={saving || (detail.review_status !== 'reviewed' && hasBlockingFlags)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40 ${
                      detail.review_status === 'reviewed'
                        ? 'border border-[#d8dced] text-[#344054]'
                        : 'bg-[#027a48] text-white'
                    }`}
                    title={
                      detail.review_status !== 'reviewed' && hasBlockingFlags
                        ? 'Bổ sung dữ liệu thiếu trước khi đánh dấu đã review.'
                        : undefined
                    }
                  >
                    {detail.review_status === 'reviewed' ? 'Chuyển về cần review' : 'Đánh dấu đã review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-sm font-semibold text-[#667085]">Chưa chọn nhóm câu.</div>
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={() => void goPrevStep()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-[#f9fafb] disabled:opacity-40"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
        <button
          onClick={() => void goNextStep()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

interface PassagesEditorProps {
  detail: QuestionGroupDetail;
  imageAssets: MediaAsset[];
  setDetailValue: (updater: (current: QuestionGroupDetail) => QuestionGroupDetail, dirtyPatch: DirtyPatch) => void;
  addImagePassage: () => void;
}

interface AutoResizeTextareaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  minHeightClassName?: string;
}

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  minHeightClassName,
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`max-h-none ${minHeightClassName ?? ''} w-full resize-none overflow-hidden rounded-lg border border-[#d8dced] px-3 py-2 text-sm leading-6`}
    />
  );
};

const PassagesEditor = ({
  detail,
  imageAssets,
  setDetailValue,
  addImagePassage,
}: PassagesEditorProps) => {
  const updatePassage = (index: number, patch: Partial<GroupPassage>) => {
    setDetailValue((current) => ({
      ...current,
      passages: current.passages.map((passage, itemIndex) =>
        itemIndex === index ? { ...passage, ...patch } : passage
      ),
    }), { passages: true });
  };

  return (
    <div className="rounded-2xl border border-[#e4e7ec] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <FileText className="h-4 w-4 text-[#004ac6]" />
          Passages
        </h4>
        <div className="flex gap-2">
          <button onClick={addImagePassage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
            Thêm image
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {detail.passages.map((passage, index) => (
          <div key={`${passage.id || 'new'}-${index}`} className="rounded-xl bg-[#f9fafb] p-3">
            <div className="mb-3 grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_auto]">
              <select
                value={passage.content_format}
                onChange={(event) => {
                  const contentFormat = event.target.value as 'image' | 'text';
                  updatePassage(index, {
                    content_format: contentFormat,
                    passage_type: contentFormat,
                    media_asset_id: contentFormat === 'text' ? null : imageAssets[0]?.id || null,
                    title:
                      contentFormat === 'text'
                        ? passage.title || ''
                        : passage.title || getPassageTitleFromLabel(imageAssets[0]?.label),
                  });
                }}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
              >
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
              {passage.content_format === 'image' ? (
                <select
                  value={passage.media_asset_id || ''}
                  onChange={(event) => {
                    const mediaId = Number(event.target.value);
                    const media = imageAssets.find((asset) => asset.id === mediaId);
                    updatePassage(index, {
                      media_asset_id: mediaId,
                      label: media?.label,
                      url: media?.url,
                      title: passage.title || getPassageTitleFromLabel(media?.label),
                    });
                  }}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                >
                  {imageAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {getMediaName(imageAssets, asset.id)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={passage.title ?? ''}
                  onChange={(event) => updatePassage(index, { title: event.target.value })}
                  placeholder="Tiêu đề"
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
              )}
              <button
                onClick={() =>
                  setDetailValue((current) => ({
                    ...current,
                    passages: current.passages.filter((_, itemIndex) => itemIndex !== index),
                  }), { passages: true })
                }
                className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
              >
                Xóa
              </button>
            </div>

            {passage.content_format === 'image' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[3.5rem_1fr]">
                  <label className="text-sm font-semibold text-[#344054]">Title</label>
                  <input
                    value={passage.title ?? ''}
                    onChange={(event) => updatePassage(index, { title: event.target.value })}
                    placeholder="Ví dụ: brochure article"
                    className="h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#dbe7ff]"
                  />
                </div>
                {passage.url && <img src={passage.url} alt={passage.label || 'passage'} className="max-h-80 rounded-lg border border-[#e4e7ec] object-contain" />}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={passage.content_en ?? ''}
                  onChange={(event) => updatePassage(index, { content_en: event.target.value })}
                  placeholder="Content EN"
                  rows={4}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
                <textarea
                  value={passage.content_vi ?? ''}
                  onChange={(event) => updatePassage(index, { content_vi: event.target.value })}
                  placeholder="Content VI"
                  rows={4}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
                <textarea
                  value={passage.vocab_hints ?? ''}
                  onChange={(event) => updatePassage(index, { vocab_hints: event.target.value })}
                  placeholder="Vocab hints"
                  rows={2}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        ))}
        {detail.passages.length === 0 && <p className="text-xs font-semibold text-[#667085]">Chưa gắn passage nào.</p>}
      </div>
    </div>
  );
};
