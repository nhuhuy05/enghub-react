import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Save,
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

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

const getMediaName = (media: MediaAsset[], mediaAssetId?: number | null) => {
  if (!mediaAssetId) return 'None';
  const item = media.find((asset) => asset.id === mediaAssetId);
  return item ? item.label : `Media #${mediaAssetId}`;
};

const BLOCKING_REVIEW_FLAGS = ['missing_questions', 'missing_image', 'missing_audio', 'missing_passage'];

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
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        setErrorMsg(groupsRes.message || 'Cannot load question groups.');
      }

      if (mediaRes.code === 1000) {
        setMediaAssets(mediaRes.result || []);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot load review data.'));
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
      } else {
        setErrorMsg(res.message || 'Cannot load group detail.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot load group detail.'));
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
    setGroups((prev) =>
      prev.map((group) =>
        group.id === nextDetail.id
          ? {
              ...group,
              review_status: nextDetail.review_status,
              missing_flags: nextDetail.missing_flags || group.missing_flags,
            }
          : group
      )
    );
  };

  const markDirtyIfReviewed = async (currentDetail = detail) => {
    if (!currentDetail || currentDetail.review_status !== 'reviewed') return currentDetail;
    const res = await teacherTestService.patchReviewStatus(currentDetail.id, 'needs_review');
    if (res.code === 1000) {
      updateCurrentGroup(res.result);
      return res.result;
    }
    return currentDetail;
  };

  const runSave = async (action: () => Promise<QuestionGroupDetail>, message: string) => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const nextDetail = await action();
      updateCurrentGroup(nextDetail);
      await markDirtyIfReviewed(nextDetail);
      setSuccessMsg(message);
      await loadGroups(nextDetail.id);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = (question: GroupQuestion) => {
    void runSave(async () => {
      const res = await teacherTestService.patchQuestion(question.id, {
        question_text_en: question.question_text_en,
        question_text_vi: question.question_text_vi,
        explanation_vi: question.explanation_vi,
      });
      if (res.code !== 1000) throw new Error(res.message || 'Question save failed.');
      return res.result;
    }, `Saved question ${question.question_number}.`);
  };

  const saveImages = () => {
    if (!detail) return;
    void runSave(async () => {
      const res = await teacherTestService.patchGroupImages(
        detail.id,
        detail.images.map((image, index) => ({
          media_asset_id: image.media_asset_id,
          order_index: index,
        }))
      );
      if (res.code !== 1000) throw new Error(res.message || 'Image save failed.');
      return res.result;
    }, 'Saved group images.');
  };

  const saveAudio = () => {
    if (!detail || !detail.audio) return;
    void runSave(async () => {
      const res = await teacherTestService.patchGroupAudio(detail.id, {
        media_asset_id: detail.audio?.media_asset_id || null,
        start_ms: detail.audio?.start_ms ?? null,
        end_ms: detail.audio?.end_ms ?? null,
        transcript_en: detail.audio?.transcript_en ?? null,
        transcript_vi: detail.audio?.transcript_vi ?? null,
      });
      if (res.code !== 1000) throw new Error(res.message || 'Audio save failed.');
      return res.result;
    }, 'Saved group audio.');
  };

  const savePassages = () => {
    if (!detail) return;
    void runSave(async () => {
      const passages: PatchGroupPassageInput[] = detail.passages.map((passage, index) => ({
        media_asset_id: passage.media_asset_id,
        title: passage.title,
        passage_type: passage.passage_type,
        content_format: passage.content_format,
        content_en: passage.content_en,
        content_vi: passage.content_vi,
        vocab_hints: passage.vocab_hints,
        order_index: index,
      }));
      const res = await teacherTestService.patchGroupPassages(detail.id, passages);
      if (res.code !== 1000) throw new Error(res.message || 'Passage save failed.');
      return res.result;
    }, 'Saved group passages.');
  };

  const patchReviewStatus = async (reviewStatus: ReviewStatus) => {
    if (!detail) return;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await teacherTestService.patchReviewStatus(detail.id, reviewStatus);
      if (res.code === 1000) {
        updateCurrentGroup(res.result);
        setSuccessMsg(reviewStatus === 'reviewed' ? 'Group marked reviewed.' : 'Group reopened for review.');
        await loadGroups(detail.id);
      } else {
        setErrorMsg(res.message || 'Cannot update review status.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot update review status.'));
    } finally {
      setSaving(false);
    }
  };

  const markAllReviewed = async () => {
    if (!reviewableGroups.length) return;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      for (const group of reviewableGroups) {
        const res = await teacherTestService.patchReviewStatus(group.id, 'reviewed');
        if (res.code !== 1000) throw new Error(res.message || `Cannot mark group ${group.id} reviewed.`);
      }

      const skippedText = blockedReviewCount ? ` ${blockedReviewCount} group(s) skipped because of missing flags.` : '';
      setSuccessMsg(`Marked ${reviewableGroups.length} group(s) reviewed.${skippedText}`);
      await loadGroups(selectedGroupId || reviewableGroups[0].id);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot mark all groups reviewed.'));
    } finally {
      setSaving(false);
    }
  };

  const selectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    void loadGroupDetail(groupId);
  };

  const selectPart = (partNumber: number) => {
    setActivePart(partNumber);
    const firstGroup = groups.find((group) => group.part_number === partNumber);
    if (firstGroup) {
      selectGroup(firstGroup.id);
    } else {
      setSelectedGroupId(null);
      setDetail(null);
    }
  };

  const setDetailValue = (updater: (current: QuestionGroupDetail) => QuestionGroupDetail) => {
    setDetail((current) => (current ? updater(current) : current));
  };

  const setQuestionValue = (questionId: number, field: keyof GroupQuestion, value: string | null) => {
    setDetailValue((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      ),
    }));
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
    }));
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
    }));
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
    }));
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
          title: null,
          passage_type: 'image',
          content_format: 'image',
          content_en: null,
          content_vi: null,
          vocab_hints: null,
          order_index: current.passages.length,
        },
      ],
    }));
  };

  const addTextPassage = () => {
    setDetailValue((current) => ({
      ...current,
      passages: [
        ...current.passages,
        {
          media_asset_id: null,
          title: '',
          passage_type: 'text',
          content_format: 'text',
          content_en: '',
          content_vi: '',
          vocab_hints: '',
          order_index: current.passages.length,
        },
      ],
    }));
  };

  const hasBlockingFlags = Boolean(
    detail?.missing_flags?.some((flag) => BLOCKING_REVIEW_FLAGS.includes(flag))
  );

  if (loadingList) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Loading review groups...</p>
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
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-4 text-sm font-semibold text-[#027a48]">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <div className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              {availableParts.map((partNumber) => (
                <button
                  key={partNumber}
                  onClick={() => selectPart(partNumber)}
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
                  ? `${blockedReviewCount} group(s) still have missing flags and will be skipped.`
                  : undefined
              }
            >
              Mark all reviewed ({reviewableGroups.length})
            </button>
            {blockedReviewCount > 0 && (
              <p className="mb-3 text-[10px] font-semibold text-[#b25e00]">
                {blockedReviewCount} group(s) still need missing flags fixed before review.
              </p>
            )}

            <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => selectGroup(group.id)}
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
                      {group.review_status}
                    </span>
                  </div>
                  {group.missing_flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.missing_flags.map((flag) => (
                        <span key={flag} className="rounded bg-[#fef3f2] px-1.5 py-0.5 text-[10px] font-bold text-[#b42318]">
                          {flag}
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
                <p className="mt-4 text-sm font-semibold text-[#667085]">Loading group detail...</p>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                {detail.missing_flags && detail.missing_flags.length > 0 && (
                  <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-3">
                    <p className="text-xs font-black uppercase text-[#b42318]">Missing flags</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detail.missing_flags.map((flag) => (
                        <span key={flag} className="rounded bg-white px-2 py-1 text-xs font-bold text-[#b42318]">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(detail.part_number === 1 || detail.images.length > 0) && (
                  <div className="rounded-2xl border border-[#e4e7ec] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-black text-[#111827]">
                        <ImageIcon className="h-4 w-4 text-[#004ac6]" />
                        Images
                      </h4>
                      <div className="flex gap-2">
                        <button onClick={addImage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
                          Add image
                        </button>
                        <button onClick={saveImages} disabled={saving} className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-bold text-white">
                          Save images
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
                              }));
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
                              }))
                            }
                            className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
                          >
                            Remove
                          </button>
                          {image.url && <img src={image.url} alt={image.label || 'group image'} className="max-h-52 rounded-lg border border-[#e4e7ec] object-contain" />}
                        </div>
                      ))}
                      {detail.images.length === 0 && <p className="text-xs font-semibold text-[#667085]">No images attached.</p>}
                    </div>
                  </div>
                )}

                {detail.part_number <= 4 && (
                  <div className="rounded-2xl border border-[#e4e7ec] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-black text-[#111827]">
                        <Headphones className="h-4 w-4 text-[#004ac6]" />
                        Audio and transcript
                      </h4>
                      <button onClick={saveAudio} disabled={saving || !detail.audio} className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">
                        Save audio
                      </button>
                    </div>
                    {!detail.audio ? (
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
                          }));
                        }}
                        className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold"
                      >
                        Attach audio
                      </button>
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
                                ? { ...current.audio, media_asset_id: mediaId, label: media?.label, url: media?.url }
                                : current.audio,
                            }));
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
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <input
                            type="number"
                            value={detail.audio.start_ms ?? ''}
                            onChange={(event) =>
                              setDetailValue((current) => ({
                                ...current,
                                audio: current.audio
                                  ? { ...current.audio, start_ms: event.target.value === '' ? null : Number(event.target.value) }
                                  : current.audio,
                              }))
                            }
                            placeholder="Start ms"
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            value={detail.audio.end_ms ?? ''}
                            onChange={(event) =>
                              setDetailValue((current) => ({
                                ...current,
                                audio: current.audio
                                  ? { ...current.audio, end_ms: event.target.value === '' ? null : Number(event.target.value) }
                                  : current.audio,
                              }))
                            }
                            placeholder="End ms"
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                          />
                        </div>
                        <textarea
                          value={detail.audio.transcript_en ?? ''}
                          onChange={(event) =>
                            setDetailValue((current) => ({
                              ...current,
                              audio: current.audio ? { ...current.audio, transcript_en: event.target.value } : current.audio,
                            }))
                          }
                          placeholder="Transcript EN"
                          rows={3}
                          className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        />
                        <textarea
                          value={detail.audio.transcript_vi ?? ''}
                          onChange={(event) =>
                            setDetailValue((current) => ({
                              ...current,
                              audio: current.audio ? { ...current.audio, transcript_vi: event.target.value } : current.audio,
                            }))
                          }
                          placeholder="Transcript VI"
                          rows={3}
                          className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
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
                    savePassages={savePassages}
                    addImagePassage={addImagePassage}
                    addTextPassage={addTextPassage}
                    saving={saving}
                  />
                )}

                <div className="space-y-4">
                  {detail.questions.map((question) => (
                    <div key={question.id} className="rounded-2xl border border-[#e4e7ec] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-black text-[#111827]">Question {question.question_number}</h4>
                        <button
                          onClick={() => saveQuestion(question)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save question
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <textarea
                          value={question.question_text_en ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'question_text_en', event.target.value)}
                          placeholder="Question text EN"
                          rows={2}
                          className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        />
                        <textarea
                          value={question.question_text_vi ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'question_text_vi', event.target.value)}
                          placeholder="Question text VI"
                          rows={2}
                          className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        />
                        <textarea
                          value={question.explanation_vi ?? ''}
                          onChange={(event) => setQuestionValue(question.id, 'explanation_vi', event.target.value)}
                          placeholder="Explanation VI"
                          rows={2}
                          className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="mt-4 space-y-3">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="rounded-xl bg-[#f9fafb] p-3">
                            <div className="mb-2 flex items-center gap-3">
                              <label className="flex items-center gap-2 text-xs font-black text-[#111827]">
                                <input
                                  type="radio"
                                  checked={answer.is_correct}
                                  onChange={() => setCorrectAnswer(question.id, answer.id)}
                                />
                                Answer {answer.label}
                              </label>
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <input
                                value={answer.answer_text_en ?? ''}
                                onChange={(event) => setAnswerValue(answer.id, 'answer_text_en', event.target.value)}
                                placeholder="Answer EN"
                                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                              />
                              <input
                                value={answer.answer_text_vi ?? ''}
                                onChange={(event) => setAnswerValue(answer.id, 'answer_text_vi', event.target.value)}
                                placeholder="Answer VI"
                                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f5fb] pt-4">
                  <button
                    onClick={() => void patchReviewStatus('needs_review')}
                    disabled={saving || detail.review_status === 'needs_review'}
                    className="rounded-lg border border-[#d8dced] px-4 py-2 text-sm font-bold text-[#344054] disabled:opacity-40"
                  >
                    Back to needs review
                  </button>
                  <button
                    onClick={() => void patchReviewStatus('reviewed')}
                    disabled={saving || hasBlockingFlags}
                    className="rounded-lg bg-[#027a48] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                    title={hasBlockingFlags ? 'Fix missing flags before marking reviewed.' : undefined}
                  >
                    Mark reviewed
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-sm font-semibold text-[#667085]">No group selected.</div>
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#003da3]"
        >
          Continue
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

interface PassagesEditorProps {
  detail: QuestionGroupDetail;
  imageAssets: MediaAsset[];
  setDetailValue: (updater: (current: QuestionGroupDetail) => QuestionGroupDetail) => void;
  savePassages: () => void;
  addImagePassage: () => void;
  addTextPassage: () => void;
  saving: boolean;
}

const PassagesEditor = ({
  detail,
  imageAssets,
  setDetailValue,
  savePassages,
  addImagePassage,
  addTextPassage,
  saving,
}: PassagesEditorProps) => {
  const updatePassage = (index: number, patch: Partial<GroupPassage>) => {
    setDetailValue((current) => ({
      ...current,
      passages: current.passages.map((passage, itemIndex) =>
        itemIndex === index ? { ...passage, ...patch } : passage
      ),
    }));
  };

  return (
    <div className="rounded-2xl border border-[#e4e7ec] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-black text-[#111827]">
          <FileText className="h-4 w-4 text-[#004ac6]" />
          Passages
        </h4>
        <div className="flex gap-2">
          <button onClick={addImagePassage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
            Add image
          </button>
          <button onClick={addTextPassage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
            Add text
          </button>
          <button onClick={savePassages} disabled={saving} className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-bold text-white">
            Save passages
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
                    updatePassage(index, { media_asset_id: mediaId, label: media?.label, url: media?.url });
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
                  placeholder="Title"
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
              )}
              <button
                onClick={() =>
                  setDetailValue((current) => ({
                    ...current,
                    passages: current.passages.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
              >
                Remove
              </button>
            </div>

            {passage.content_format === 'image' ? (
              <div className="space-y-3">
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
        {detail.passages.length === 0 && <p className="text-xs font-semibold text-[#667085]">No passages attached.</p>}
      </div>
    </div>
  );
};
