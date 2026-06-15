import type { QuestionGroupDetail, ReviewStatus } from '../../types/adminTestTypes';

export const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const getReviewStatusLabel = (status: ReviewStatus) => {
  if (status === 'reviewed') return 'Đã review';
  return 'Cần review';
};

export const formatQuestionRange = (value: unknown, fallback: number) => {
  if (value === null || value === undefined) return `Group ${fallback}`;
  const normalized = String(value).trim();
  if (!normalized) return `Group ${fallback}`;

  const commaNumbers = normalized
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  if (commaNumbers.length > 1) {
    return `${commaNumbers[0]} - ${commaNumbers[commaNumbers.length - 1]}`;
  }
  if (commaNumbers.length === 1 && normalized.includes(',')) {
    return String(commaNumbers[0]);
  }

  const rangeMatch = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) return `${Number(rangeMatch[1])} - ${Number(rangeMatch[2])}`;

  if (!/^\d+$/.test(normalized)) return normalized;
  if (normalized.length <= 3) return normalized;

  const chunkSize = normalized.length % 3 === 0 ? 3 : normalized.length % 2 === 0 ? 2 : 0;
  if (!chunkSize) return normalized;

  const numbers = normalized.match(new RegExp(`\\d{${chunkSize}}`, 'g')) || [];
  if (numbers.length <= 1) return normalized;
  return `${Number(numbers[0])} - ${Number(numbers[numbers.length - 1])}`;
};

export const getGroupTitle = (group: QuestionGroupDetail) => {
  if (group.question_numbers) return `Question ${formatQuestionRange(group.question_numbers, group.group_order)}`;

  const questionNumbers = group.questions
    .map((question) => question.question_number)
    .filter((questionNumber) => Number.isFinite(questionNumber))
    .sort((a, b) => a - b);

  if (questionNumbers.length > 1) {
    return `Question ${questionNumbers[0]} - ${questionNumbers[questionNumbers.length - 1]}`;
  }
  if (questionNumbers.length === 1) return `Question ${questionNumbers[0]}`;

  return `Group ${group.group_order}`;
};

export const formatExplanationBlocks = (value: string) =>
  value
    .replace(/\s+(Dẫn chứng\s*\d+\s*(?:\([^)]*\))?\s*:)/gi, '\n$1')
    .replace(/\s+(Suy luận\s*:)/gi, '\n$1')
    .replace(/\s+(Đáp án\s+[A-D]\s+)/gi, '\n$1')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
