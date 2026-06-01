export type VocabularyReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface VocabularyTopic {
  id: number;
  name: string;
  description: string | null;
  wordCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VocabularyProgress {
  id: number;
  vocabularyId: number;
  level: number;
  learnedAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewCount: number;
  correctCount: number;
  intervalDays: number;
  easeFactor: number;
  mastered: boolean;
}

export interface VocabularyReviewOption {
  rating: VocabularyReviewRating;
  label: string;
  delayLabel: string;
  nextReviewAt: string | null;
}

export interface Vocabulary {
  id: number;
  word: string;
  meaningVi: string | null;
  meaningEn: string | null;
  partOfSpeech: string | null;
  pronunciation: string | null;
  exampleSentenceEn: string | null;
  exampleSentenceVi: string | null;
  audioUrl: string | null;
  topics: VocabularyTopic[];
  progress: VocabularyProgress | null;
  reviewOptions: VocabularyReviewOption[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VocabularyLookup {
  word: string;
  meaningEn: string | null;
  meaningVi: string | null;
  partOfSpeech: string | null;
  pronunciation: string | null;
  exampleSentenceEn: string | null;
  exampleSentenceVi: string | null;
  audioUrl: string | null;
}

export interface TopicPayload {
  name: string;
  description?: string;
}

export interface VocabularyPayload {
  word: string;
  meaning_vi?: string;
  meaning_en?: string;
  part_of_speech?: string;
  pronunciation?: string;
  example_sentence_en?: string;
  example_sentence_vi?: string;
  audio_url?: string;
  topic_ids?: number[];
}

export interface VocabularyImportResult {
  success: boolean;
  topicId: number;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface VocabularyEnrichError {
  vocabularyId?: number | null;
  word?: string | null;
  message: string;
}

export interface VocabularyEnrichResult {
  vocabularyId?: number | null;
  topicId?: number | null;
  totalWords: number;
  updatedCount: number;
  skippedCount: number;
  errors: VocabularyEnrichError[];
  words: Vocabulary[];
}

export interface VocabularyEnrichPayload {
  lookup_en: boolean;
  translate_vi: boolean;
  overwrite: boolean;
}

export type VocabularyStatus = 'not_started' | 'learning' | 'due' | 'mastered';
