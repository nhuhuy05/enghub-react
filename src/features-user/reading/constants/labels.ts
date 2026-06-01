import type { ReadingDocumentType, ReadingPassageGroup } from '../types';

export const READING_PASSAGE_GROUP_LABELS: Record<ReadingPassageGroup, string> = {
  single: 'Đoạn đơn',
  double: 'Đoạn đôi',
  triple: 'Đoạn 3',
};

export const READING_DOCUMENT_TYPE_LABELS: Record<ReadingDocumentType, string> = {
  email: 'E-mail',
  notice: 'Notice',
  schedule: 'Schedule',
  form: 'Form',
};

export const formatReadingDocumentTypes = (documentTypes: ReadingDocumentType[]) => {
  return documentTypes.map((type) => READING_DOCUMENT_TYPE_LABELS[type]).join(' + ');
};
