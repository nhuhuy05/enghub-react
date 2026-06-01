import type { ReadingLessonStatus, ReadingLessonType } from '../types';

export const READING_LESSON_TYPE_LABELS: Record<ReadingLessonType, string> = {
  SINGLE: 'Đoạn đơn',
  DOUBLE: 'Đoạn đôi',
  TRIPLE: 'Đoạn ba',
};

export const READING_LESSON_STATUS_LABELS: Record<ReadingLessonStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã publish',
};

export const READING_LESSON_TYPES: ReadingLessonType[] = ['SINGLE', 'DOUBLE', 'TRIPLE'];

export const READING_LESSON_STATUSES: ReadingLessonStatus[] = ['DRAFT', 'PUBLISHED'];
