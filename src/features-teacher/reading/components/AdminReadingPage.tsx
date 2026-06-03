import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Loader2,
  Menu,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  READING_LESSON_STATUSES,
  READING_LESSON_STATUS_LABELS,
  READING_LESSON_TYPES,
  READING_LESSON_TYPE_LABELS,
} from '@/features-user/reading/constants/labels';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminReadingService, getReadingErrorMessage } from '@/features-user/reading/services/readingService';
import { testCollectionService } from '@/features-teacher/tests/services/testCollectionService';
import type { Test, TestCollection } from '@/features-teacher/tests/types/teacherTestTypes';
import type {
  ReadingLessonDetail,
  ReadingLessonListItem,
  ReadingLessonStatus,
  ReadingLessonType,
  ReadingPart7Candidate,
  ReadingPassage,
  ReadingVocabularyHint,
} from '@/features-user/reading/types';

type LessonFilters = {
  status: ReadingLessonStatus | '';
  readingType: ReadingLessonType | '';
};

type AiMode = 'translation' | 'vocabulary' | 'support';

const emptyFilters: LessonFilters = { status: '', readingType: '' };

const toPassagePayload = (passage: ReadingPassage) => ({
  mediaAssetId: passage.mediaAssetId,
  title: passage.title,
  passageType: passage.passageType,
  contentFormat: passage.contentFormat,
  contentEn: passage.contentEn,
  contentVi: passage.contentVi,
  orderIndex: passage.orderIndex,
});

const toVocabularyPayload = (hint: ReadingVocabularyHint, passages: ReadingPassage[]) => ({
  passageId: undefined,
  passageOrderIndex: hint.passageOrderIndex ?? passages.find((passage) => passage.id === hint.passageId)?.orderIndex ?? 0,
  word: hint.word,
  partOfSpeech: hint.partOfSpeech,
  meaningVi: hint.meaningVi,
  orderIndex: hint.orderIndex,
});

const getErrorText = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'apiCode' in error) {
    return getReadingErrorMessage((error as { apiCode?: number }).apiCode, fallback);
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

const AutoGrowingTextarea = ({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) => {
  const resize = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.max(120, element.scrollHeight)}px`;
  };

  return (
    <textarea
      ref={resize}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
        resize(event.target);
      }}
      onBlur={onBlur}
      className="mt-1 w-full resize-none overflow-hidden rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-medium leading-6 outline-none focus:border-[#004ac6]"
    />
  );
};

export const AdminReadingPage = () => {
  const [lessons, setLessons] = useState<ReadingLessonListItem[]>([]);
  const [candidates, setCandidates] = useState<ReadingPart7Candidate[]>([]);
  const [collections, setCollections] = useState<TestCollection[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<ReadingLessonDetail | null>(null);
  const [filters, setFilters] = useState<LessonFilters>(emptyFilters);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [overwriteEnabled, setOverwriteEnabled] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<AiMode | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedLessonId = selectedLesson?.id;

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      setError('');
      const data = await adminReadingService.getAdminReadingLessons({
        status: filters.status || undefined,
        readingType: filters.readingType || undefined,
      });
      setLessons(data);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải danh sách bài luyện đọc.'));
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadCandidates = async () => {
    const testId = Number(selectedTestId);
    if (!Number.isFinite(testId) || testId <= 0) {
      setCandidates([]);
      return;
    }

    try {
      setLoadingCandidates(true);
      setError('');
      const data = await adminReadingService.getPart7ReadingCandidates(testId);
      setCandidates(data);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải Part 7 candidates.'));
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    void loadLessons();
  }, [filters.status, filters.readingType]);

  useEffect(() => {
    let ignore = false;
    const loadCollections = async () => {
      try {
        setLoadingCollections(true);
        const response = await testCollectionService.getCollections();
        if (!ignore && response.code === 1000) setCollections(response.result);
      } catch {
        if (!ignore) setError('Không thể tải danh sách bộ đề.');
      } finally {
        if (!ignore) setLoadingCollections(false);
      }
    };

    void loadCollections();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const collectionId = Number(selectedCollectionId);
    if (!Number.isFinite(collectionId) || collectionId <= 0) {
      setTests([]);
      setSelectedTestId('');
      setCandidates([]);
      return;
    }

    let ignore = false;
    const loadTests = async () => {
      try {
        setLoadingTests(true);
        const response = await testCollectionService.getTestsInCollection(collectionId);
        if (!ignore && response.code === 1000) setTests(response.result);
      } catch {
        if (!ignore) setError('Không thể tải danh sách test.');
      } finally {
        if (!ignore) setLoadingTests(false);
      }
    };

    void loadTests();
    return () => {
      ignore = true;
    };
  }, [selectedCollectionId]);

  useEffect(() => {
    void loadCandidates();
  }, [selectedTestId]);

  const selectLesson = async (lessonId: number) => {
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const detail = await adminReadingService.getAdminReadingLesson(lessonId);
      setSelectedLesson(detail);
      setIsLessonDrawerOpen(false);
    } catch (err) {
      setError(getErrorText(err, 'Không thể tải chi tiết bài luyện đọc.'));
    } finally {
      setSaving(false);
    }
  };

  const createFromCandidate = async (candidate: ReadingPart7Candidate) => {
    if (candidate.existingLessonId) {
      await selectLesson(candidate.existingLessonId);
      setIsLessonDrawerOpen(false);
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');
      const detail = await adminReadingService.createReadingLesson({
        questionGroupId: candidate.questionGroupId,
        title: candidate.title,
        readingType: candidate.suggestedReadingType,
      });
      setSelectedLesson(detail);
      setIsLessonDrawerOpen(false);
      setMessage('Đã tạo lesson từ Part 7 candidate.');
      await loadLessons();
      await loadCandidates();
    } catch (err) {
      setError(getErrorText(err, 'Không thể tạo bài luyện đọc.'));
    } finally {
      setSaving(false);
    }
  };

  const updateLesson = (patch: Partial<ReadingLessonDetail>) => {
    setSelectedLesson((current) => current ? { ...current, ...patch } : current);
  };

  const updatePassage = (index: number, patch: Partial<ReadingPassage>) => {
    setSelectedLesson((current) => {
      if (!current) return current;
      const passages = current.passages.map((passage, itemIndex) => (
        itemIndex === index ? { ...passage, ...patch } : passage
      ));
      return { ...current, passages };
    });
  };

  const updateVocabularyHint = (index: number, patch: Partial<ReadingVocabularyHint>) => {
    setSelectedLesson((current) => {
      if (!current) return current;
      const vocabularyHints = current.vocabularyHints.map((hint, itemIndex) => (
        itemIndex === index ? { ...hint, ...patch } : hint
      ));
      return { ...current, vocabularyHints };
    });
  };

  const addVocabularyHint = () => {
    setSelectedLesson((current) => {
      if (!current) return current;
      const nextIndex = current.vocabularyHints.length;
      return {
        ...current,
        vocabularyHints: [
          ...current.vocabularyHints,
          {
            id: -Date.now(),
            passageId: null,
            passageOrderIndex: 0,
            word: '',
            partOfSpeech: '',
            meaningVi: '',
            orderIndex: nextIndex,
          },
        ],
      };
    });
  };

  const deleteVocabularyHint = (index: number) => {
    setSelectedLesson((current) => {
      if (!current) return current;
      return {
        ...current,
        vocabularyHints: current.vocabularyHints
          .filter((_, itemIndex) => itemIndex !== index)
          .map((hint, orderIndex) => ({ ...hint, orderIndex })),
      };
    });
  };

  const validationError = useMemo(() => {
    if (!selectedLesson) return '';
    if (!selectedLesson.titleVi?.trim()) return 'Title tiếng Việt không được để trống.';
    if (!selectedLesson.passages.length) return 'Lesson phải có ít nhất 1 passage.';
    if (selectedLesson.status === 'PUBLISHED') {
      const missingPassage = selectedLesson.passages.find((passage) => !passage.contentEn.trim() || !passage.contentVi.trim());
      if (missingPassage) return 'Publish yêu cầu mọi passage có content EN và VI.';
    }
    const invalidHint = selectedLesson.vocabularyHints.find((hint) => !hint.word.trim() || !hint.meaningVi.trim());
    if (invalidHint) return 'Từ vựng gợi ý phải có word và meaning_vi.';
    return '';
  }, [selectedLesson]);

  const saveLesson = async () => {
    if (!selectedLesson || validationError) {
      setError(validationError || 'Chưa chọn lesson để lưu.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');
      const detail = await adminReadingService.updateReadingLesson(selectedLesson.id, {
        title: selectedLesson.titleVi || selectedLesson.title,
        titleVi: selectedLesson.titleVi,
        readingType: selectedLesson.readingType,
        passages: selectedLesson.passages.map(toPassagePayload),
        vocabularyHints: selectedLesson.vocabularyHints.map((hint) => toVocabularyPayload(hint, selectedLesson.passages)),
      });
      setSelectedLesson(detail);
      setMessage('Đã lưu lesson.');
      await loadLessons();
    } catch (err) {
      setError(getErrorText(err, 'Không thể lưu bài luyện đọc.'));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status: ReadingLessonStatus) => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const detail = await adminReadingService.updateReadingLessonStatus(selectedLesson.id, status);
      setSelectedLesson(detail);
      setMessage(status === 'PUBLISHED' ? 'Đã publish lesson.' : 'Đã chuyển lesson về draft.');
      await loadLessons();
    } catch (err) {
      setError(getErrorText(err, 'Không thể cập nhật trạng thái bài đọc.'));
    } finally {
      setSaving(false);
    }
  };

  const runAi = async (mode: AiMode) => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setAiLoading(mode);
      setMessage('');
      setError('');
      const detail = mode === 'translation'
        ? await adminReadingService.generateReadingTranslation(selectedLesson.id, overwriteEnabled)
        : mode === 'vocabulary'
          ? await adminReadingService.generateReadingVocabulary(selectedLesson.id, overwriteEnabled)
          : await adminReadingService.generateReadingAiSupport(selectedLesson.id, overwriteEnabled);
      setSelectedLesson(detail);
      setMessage('AI đã cập nhật lesson.');
      await loadLessons();
    } catch (err) {
      setError(getErrorText(err, 'Không thể chạy AI cho bài luyện đọc.'));
    } finally {
      setAiLoading(null);
      setSaving(false);
    }
  };

  const deleteLesson = async () => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await adminReadingService.deleteReadingLesson(selectedLesson.id);
      setSelectedLesson(null);
      setMessage('Đã xóa lesson.');
      await loadLessons();
      await loadCandidates();
    } catch (err) {
      setError(getErrorText(err, 'Không thể xóa bài luyện đọc.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-[#101828] lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#004ac6]">
              <BookOpenText className="h-5 w-5" />
              Luyện đọc song ngữ
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#111827]">Quản lý Reading Lessons</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsLessonDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004ac6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#003a99]"
            >
              <Menu className="h-4 w-4" />
              Danh sách lesson
            </button>
            <button
              type="button"
              onClick={() => void loadLessons()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8dced] bg-white px-4 py-2 text-sm font-bold text-[#505f76] transition hover:border-[#004ac6] hover:text-[#004ac6]"
            >
              <RefreshCcw className="h-4 w-4" />
              Tải lại
            </button>
          </div>
        </header>

        {(message || error || validationError) && (
          <div className={`mb-4 rounded-xl border p-3 text-sm font-bold ${
            error || validationError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            {error || validationError || message}
          </div>
        )}

        <div className="space-y-4">
          {isLessonDrawerOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                aria-label="Đóng danh sách lesson"
                onClick={() => setIsLessonDrawerOpen(false)}
                className="absolute inset-0 bg-[#101828]/40"
              />
              <aside className="relative z-10 flex h-full w-[min(420px,calc(100vw-24px))] flex-col bg-[#f5f7fb] p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#004ac6]">Reading lessons</p>
                    <h2 className="text-lg font-black text-[#111827]">Chọn hoặc tạo lesson</h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Đóng"
                    onClick={() => setIsLessonDrawerOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8dced] bg-white text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <section className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-black">Lessons</h2>
                {loadingLessons && <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />}
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <select
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as LessonFilters['status'] }))}
                  className="rounded-lg border border-[#d8dced] px-2 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                >
                  <option value="">Mọi trạng thái</option>
                  {READING_LESSON_STATUSES.map((status) => <option key={status} value={status}>{READING_LESSON_STATUS_LABELS[status]}</option>)}
                </select>
                <select
                  value={filters.readingType}
                  onChange={(event) => setFilters((current) => ({ ...current, readingType: event.target.value as LessonFilters['readingType'] }))}
                  className="rounded-lg border border-[#d8dced] px-2 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                >
                  <option value="">Mọi type</option>
                  {READING_LESSON_TYPES.map((type) => <option key={type} value={type}>{READING_LESSON_TYPE_LABELS[type]}</option>)}
                </select>
              </div>
              <div className="mb-3 hidden gap-2">
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  disabled={loadingCollections}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingCollections ? 'Đang tải bộ đề...' : 'Chọn bộ đề'}</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTestId}
                  onChange={(event) => setSelectedTestId(event.target.value)}
                  disabled={!selectedCollectionId || loadingTests}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingTests ? 'Đang tải test...' : 'Chọn test'}</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.test_number ? `Test ${test.test_number} - ` : ''}{test.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden">
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  disabled={loadingCollections}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingCollections ? 'Đang tải bộ đề...' : 'Chọn bộ đề'}</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTestId}
                  onChange={(event) => setSelectedTestId(event.target.value)}
                  disabled={!selectedCollectionId || loadingTests}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingTests ? 'Đang tải test...' : 'Chọn test'}</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.test_number ? `Test ${test.test_number} - ` : ''}{test.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => void selectLesson(lesson.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedLessonId === lesson.id
                        ? 'border-[#004ac6] bg-[#eaf0ff]'
                        : 'border-[#d8dced] bg-white hover:border-[#004ac6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-black text-[#111827]">{lesson.titleVi}</h3>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-black ${
                        lesson.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f2f4f7] text-[#667085]'
                      }`}>
                        {READING_LESSON_STATUS_LABELS[lesson.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#667085]">
                      {READING_LESSON_TYPE_LABELS[lesson.readingType]} • {lesson.passageCount} passage • {lesson.vocabularyCount} từ
                    </p>
                  </button>
                ))}
                {!loadingLessons && lessons.length === 0 && (
                  <p className="rounded-xl bg-[#f9fafb] p-4 text-sm font-semibold text-[#667085]">Chưa có lesson phù hợp.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-black">Part 7 Candidates</h2>
                {loadingCandidates && <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />}
              </div>
              <div className="mb-3 grid gap-2">
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  disabled={loadingCollections}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingCollections ? 'Đang tải bộ đề...' : 'Chọn bộ đề'}</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTestId}
                  onChange={(event) => setSelectedTestId(event.target.value)}
                  disabled={!selectedCollectionId || loadingTests}
                  className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6] disabled:opacity-60"
                >
                  <option value="">{loadingTests ? 'Đang tải test...' : 'Chọn test'}</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.test_number ? `Test ${test.test_number} - ` : ''}{test.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3 hidden gap-2">
                <input
                  value=""
                  onChange={() => undefined}
                  placeholder="test_id"
                  className="min-w-0 flex-1 rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                />
                <button
                  type="button"
                  onClick={() => void loadCandidates()}
                  className="rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-bold text-white"
                >
                  Lấy
                </button>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.questionGroupId}
                    type="button"
                    onClick={() => void createFromCandidate(candidate)}
                    className="w-full rounded-xl border border-[#d8dced] bg-white p-3 text-left transition hover:border-[#004ac6]"
                  >
                    <h3 className="line-clamp-2 text-sm font-black text-[#111827]">{candidate.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#667085]">
                      Test {candidate.testId} • Group {candidate.groupOrder} • Q{candidate.questionNumbers.join(', ')}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#004ac6]">
                      {candidate.existingLessonId ? `Mở lesson #${candidate.existingLessonId}` : `Tạo ${READING_LESSON_TYPE_LABELS[candidate.suggestedReadingType]}`}
                    </p>
                  </button>
                ))}
                {false && !loadingCandidates && candidates.length === 0 && (
                  <p className="rounded-xl bg-[#f9fafb] p-4 text-sm font-semibold text-[#667085]">Nhập test_id rồi bấm Lấy để tải candidates.</p>
                )}
                {!loadingCandidates && candidates.length === 0 && (
                  <p className="rounded-xl bg-[#f9fafb] p-4 text-sm font-semibold text-[#667085]">
                    {selectedTestId ? 'Test này chưa có Part 7 candidate phù hợp.' : 'Chọn bộ đề và test để tải candidates.'}
                  </p>
                )}
              </div>
            </section>
                </div>
              </aside>
            </div>
          )}

          <section className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
            {!selectedLesson ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <BookOpenText className="h-12 w-12 text-[#98a2b3]" />
                <h2 className="mt-4 text-xl font-black text-[#111827]">Chọn hoặc tạo lesson</h2>
                <p className="mt-2 max-w-md text-sm font-semibold text-[#667085]">
                  Mở danh sách để chọn lesson đã có hoặc tạo lesson mới từ Part 7 candidate.
                </p>
                <button
                  type="button"
                  onClick={() => setIsLessonDrawerOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#004ac6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#003a99]"
                >
                  <Menu className="h-4 w-4" />
                  Danh sách lesson
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e7ec] pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#667085]">
                      Lesson #{selectedLesson.id} • Question group #{selectedLesson.questionGroupId}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#111827]">{selectedLesson.titleVi || selectedLesson.title || 'Untitled lesson'}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void updateStatus(selectedLesson.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                      className="rounded-xl border border-[#d8dced] bg-white px-4 py-2 text-sm font-bold text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6] disabled:opacity-50"
                    >
                      {selectedLesson.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                  <label className="text-sm font-bold text-[#344054]">
                    Title tiếng Việt
                    <input
                      value={selectedLesson.titleVi || ''}
                      onChange={(event) => updateLesson({ titleVi: event.target.value || null })}
                      onBlur={() => void saveLesson()}
                      className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 font-semibold outline-none focus:border-[#004ac6]"
                    />
                  </label>
                  <label className="text-sm font-bold text-[#344054]">
                    Type
                    <select
                      value={selectedLesson.readingType}
                      onChange={(event) => updateLesson({ readingType: event.target.value as ReadingLessonType })}
                      onBlur={() => void saveLesson()}
                      className="mt-1 w-full rounded-lg border border-[#d8dced] px-3 py-2 font-semibold outline-none focus:border-[#004ac6]"
                    >
                      {READING_LESSON_TYPES.map((type) => <option key={type} value={type}>{READING_LESSON_TYPE_LABELS[type]}</option>)}
                    </select>
                  </label>
                </div>

                <div className="rounded-xl border border-[#d8dced] bg-[#fbfcff] p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-black text-[#111827]">
                      <Sparkles className="h-4 w-4 text-[#004ac6]" />
                      AI hỗ trợ
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-[#667085]">
                      <input
                        type="checkbox"
                        checked={overwriteEnabled}
                        onChange={(event) => setOverwriteEnabled(event.target.checked)}
                      />
                      Ghi đè dữ liệu cũ
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={saving || aiLoading !== null} onClick={() => void runAi('translation')} className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6] disabled:cursor-wait disabled:opacity-60">
                      {aiLoading === 'translation' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {aiLoading === 'translation' ? 'Đang dịch...' : 'Dịch bài đọc'}
                    </button>
                    <button type="button" disabled={saving || aiLoading !== null} onClick={() => void runAi('vocabulary')} className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6] disabled:cursor-wait disabled:opacity-60">
                      {aiLoading === 'vocabulary' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {aiLoading === 'vocabulary' ? 'Đang sinh...' : 'Sinh từ vựng'}
                    </button>
                    {false && <button type="button" disabled={saving} onClick={() => void runAi('support')} className="hidden">
                      Dịch + từ vựng
                    </button>}
                  </div>
                </div>

                <section>
                  <h3 className="mb-3 text-base font-black text-[#111827]">Passages</h3>
                  <div className="space-y-3">
                    {selectedLesson.passages.map((passage, index) => (
                      <article key={passage.id} className="rounded-xl border border-[#d8dced] p-3">
                        {passage.mediaUrl ? (
                          <div className="mb-3 rounded-xl border border-[#d8dced] bg-[#f9fafb] p-3">
                            <img
                              src={passage.mediaUrl}
                              alt={passage.mediaLabel || passage.title || `Passage ${index + 1}`}
                              className="max-h-[420px] w-full rounded-lg border border-[#e4e7ec] bg-white object-contain"
                            />
                          </div>
                        ) : null}
                        {false && (
                          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                            Passage có media_asset_id #{passage.mediaAssetId} nhưng BE chưa trả media_url để preview ảnh.
                          </div>
                        )}
                        <div className="grid gap-3 lg:grid-cols-2">
                          <label className="text-sm font-bold text-[#344054]">
                            Content EN
                            <AutoGrowingTextarea
                              value={passage.contentEn}
                              onChange={(value) => updatePassage(index, { contentEn: value })}
                              onBlur={() => void saveLesson()}
                            />
                          </label>
                          <label className="text-sm font-bold text-[#344054]">
                            Content VI
                            <AutoGrowingTextarea
                              value={passage.contentVi}
                              onChange={(value) => updatePassage(index, { contentVi: value })}
                              onBlur={() => void saveLesson()}
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-[#111827]">Vocabulary hints</h3>
                    <button
                      type="button"
                      onClick={addVocabularyHint}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-bold text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6]"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm từ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedLesson.vocabularyHints.map((hint, index) => (
                      <article key={`${hint.id}-${index}`} className="rounded-xl border border-[#d8dced] p-3">
                        <div className="grid gap-2 md:grid-cols-[180px_150px_minmax(0,1fr)_auto]">
                          <input
                            value={hint.word}
                            onChange={(event) => updateVocabularyHint(index, { word: event.target.value })}
                            onBlur={() => void saveLesson()}
                            placeholder="word"
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                          />
                          <input
                            value={hint.partOfSpeech}
                            onChange={(event) => updateVocabularyHint(index, { partOfSpeech: event.target.value })}
                            onBlur={() => void saveLesson()}
                            placeholder="type"
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                          />
                          <input
                            value={hint.meaningVi}
                            onChange={(event) => updateVocabularyHint(index, { meaningVi: event.target.value })}
                            onBlur={() => void saveLesson()}
                            placeholder="meaning_vi"
                            className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm font-semibold outline-none focus:border-[#004ac6]"
                          />
                          <button
                            type="button"
                            onClick={() => deleteVocabularyHint(index)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                            aria-label="Xóa từ vựng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))}
                    {selectedLesson.vocabularyHints.length === 0 && (
                      <p className="rounded-xl bg-[#f9fafb] p-4 text-sm font-semibold text-[#667085]">Chưa có từ vựng gợi ý.</p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xóa lesson?"
        message="Lesson này sẽ bị xóa khỏi danh sách bài luyện đọc."
        confirmLabel="Xóa"
        loading={saving}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          void deleteLesson();
        }}
      />
    </main>
  );
};
