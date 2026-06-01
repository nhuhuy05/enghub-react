export type ReadingLessonType = 'SINGLE' | 'DOUBLE' | 'TRIPLE';

export type ReadingLessonStatus = 'DRAFT' | 'PUBLISHED';

export interface ReadingLessonListItemRaw {
  id: number;
  question_group_id: number;
  test_id: number;
  test_title: string;
  group_order: number;
  title: string;
  title_vi: string | null;
  reading_type: ReadingLessonType;
  status: ReadingLessonStatus;
  difficulty: string | null;
  passage_count: number;
  vocabulary_count: number;
  updated_at: string;
}

export interface ReadingPassageRaw {
  id: number;
  question_group_id: number;
  part_number: number;
  group_order: number;
  title: string | null;
  passage_type: string | null;
  content_format: string | null;
  content_en: string | null;
  content_vi: string | null;
  vocab_hints: string | null;
  media_asset_id: number | null;
  media_label: string | null;
  media_url: string | null;
  order_index: number;
}

export interface ReadingVocabularyHintRaw {
  id: number;
  passage_id: number | null;
  passage_order_index: number | null;
  word: string;
  part_of_speech: string | null;
  meaning_vi: string;
  order_index: number;
}

export interface ReadingLessonDetailRaw extends ReadingLessonListItemRaw {
  passages: ReadingPassageRaw[];
  vocabulary_hints: ReadingVocabularyHintRaw[];
  created_at: string;
}

export interface ReadingLessonListItem {
  id: number;
  questionGroupId: number;
  testId: number;
  testTitle: string;
  groupOrder: number;
  title: string;
  titleVi: string | null;
  readingType: ReadingLessonType;
  status: ReadingLessonStatus;
  difficulty: string | null;
  passageCount: number;
  vocabularyCount: number;
  updatedAt: string;
}

export interface ReadingPassage {
  id: number;
  questionGroupId: number;
  partNumber: number;
  groupOrder: number;
  title: string | null;
  passageType: string | null;
  contentFormat: string | null;
  contentEn: string;
  contentVi: string;
  vocabHints: string | null;
  mediaAssetId: number | null;
  mediaLabel: string | null;
  mediaUrl: string | null;
  orderIndex: number;
}

export interface ReadingVocabularyHint {
  id: number;
  passageId: number | null;
  passageOrderIndex: number | null;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  orderIndex: number;
}

export interface ReadingLessonDetail extends ReadingLessonListItem {
  passages: ReadingPassage[];
  vocabularyHints: ReadingVocabularyHint[];
  createdAt: string;
}

export interface ReadingPart7CandidateRaw {
  question_group_id: number;
  test_id: number;
  test_title: string;
  group_order: number;
  question_numbers: number[];
  passage_count: number;
  suggested_reading_type: ReadingLessonType;
  existing_lesson_id: number | null;
  title: string;
}

export interface ReadingPart7Candidate {
  questionGroupId: number;
  testId: number;
  testTitle: string;
  groupOrder: number;
  questionNumbers: number[];
  passageCount: number;
  suggestedReadingType: ReadingLessonType;
  existingLessonId: number | null;
  title: string;
}

export interface ReadingLessonCreatePayload {
  questionGroupId: number;
  title?: string;
  titleVi?: string | null;
  readingType?: ReadingLessonType;
  status?: ReadingLessonStatus;
  difficulty?: string | null;
}

export interface ReadingPassagePayload {
  mediaAssetId?: number | null;
  title?: string | null;
  passageType?: string | null;
  contentFormat?: string | null;
  contentEn?: string | null;
  contentVi?: string | null;
  orderIndex: number;
}

export interface ReadingVocabularyHintPayload {
  passageId?: number | null;
  passageOrderIndex?: number | null;
  word: string;
  partOfSpeech?: string | null;
  meaningVi: string;
  orderIndex: number;
}

export interface ReadingLessonUpdatePayload {
  title?: string;
  titleVi?: string | null;
  readingType?: ReadingLessonType;
  status?: ReadingLessonStatus;
  difficulty?: string | null;
  passages?: ReadingPassagePayload[];
  vocabularyHints?: ReadingVocabularyHintPayload[];
}
