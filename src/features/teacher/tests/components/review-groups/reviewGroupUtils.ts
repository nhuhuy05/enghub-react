import type { MediaAsset, ReviewStatus } from '../../types/teacherTestTypes';

export type DirtyPatch = {
  images?: boolean;
  audio?: boolean;
  passages?: boolean;
  questionIds?: number[];
  answerIds?: number[];
};

export type DirtyState = {
  images: boolean;
  audio: boolean;
  passages: boolean;
  questionIds: Set<number>;
  answerIds: Set<number>;
};

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export const BLOCKING_REVIEW_FLAGS = ['missing_questions', 'missing_image', 'missing_audio', 'missing_passage'];

export const createDirtyState = (): DirtyState => ({
  images: false,
  audio: false,
  passages: false,
  questionIds: new Set<number>(),
  answerIds: new Set<number>(),
});

export const cloneDirtyState = (dirty: DirtyState): DirtyState => ({
  images: dirty.images,
  audio: dirty.audio,
  passages: dirty.passages,
  questionIds: new Set(dirty.questionIds),
  answerIds: new Set(dirty.answerIds),
});

export const hasDirtyState = (dirty: DirtyState) =>
  dirty.images || dirty.audio || dirty.passages || dirty.questionIds.size > 0 || dirty.answerIds.size > 0;

export const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const getMediaName = (media: MediaAsset[], mediaAssetId?: number | null) => {
  if (!mediaAssetId) return 'Chưa chọn';
  const item = media.find((asset) => asset.id === mediaAssetId);
  return item ? item.label : `Media #${mediaAssetId}`;
};

export const getReviewStatusLabel = (status: ReviewStatus) => {
  if (status === 'reviewed') return 'Đã review';
  return 'Cần review';
};

export const getMissingFlagLabel = (flag: string) => {
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

export const normalizePassageTitle = (value?: string | null) => {
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

export const getPassageTitleFromLabel = (label?: string | null) => {
  if (!label || !label.includes('_')) return null;
  return normalizePassageTitle(label.split('_').slice(1).join('-'));
};

export const formatQuestionRange = (value: unknown) => {
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
