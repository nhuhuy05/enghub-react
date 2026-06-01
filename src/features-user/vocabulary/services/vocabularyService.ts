import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  TopicPayload,
  Vocabulary,
  VocabularyEnrichPayload,
  VocabularyEnrichResult,
  VocabularyLookup,
  VocabularyPayload,
  VocabularyImportResult,
  VocabularyProgress,
  VocabularyReviewRating,
  VocabularyStatus,
  VocabularyTopic,
  VocabularyReviewOption,
} from '../types';

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord => (typeof value === 'object' && value !== null ? (value as RawRecord) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asNullableString = (value: unknown) => (typeof value === 'string' ? value : null);
const asBoolean = (value: unknown) => (typeof value === 'boolean' ? value : false);
const get = (item: RawRecord, camel: string, snake: string = camel) => item[camel] ?? item[snake];

const unwrapResult = <T>(response: ApiResponse<T>): T => {
  if (response.code !== 1000) {
    const error = new Error(response.message || 'Request failed') as Error & { apiCode?: number };
    error.apiCode = response.code;
    throw error;
  }
  return response.result;
};

export const getVocabularyErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message || fallback : fallback;
};

export const normalizeTopic = (value: unknown): VocabularyTopic => {
  const item = asRecord(value);
  return {
    id: asNumber(item.id),
    name: asString(item.name),
    description: asNullableString(item.description),
    wordCount: asNumber(get(item, 'wordCount', 'word_count')),
    createdAt: asNullableString(get(item, 'createdAt', 'created_at')),
    updatedAt: asNullableString(get(item, 'updatedAt', 'updated_at')),
  };
};

const normalizeProgress = (value: unknown): VocabularyProgress | null => {
  if (!value) return null;
  const item = asRecord(value);
  return {
    id: asNumber(item.id),
    vocabularyId: asNumber(get(item, 'vocabularyId', 'vocabulary_id')),
    level: asNumber(item.level),
    learnedAt: asNullableString(get(item, 'learnedAt', 'learned_at')),
    lastReviewedAt: asNullableString(get(item, 'lastReviewedAt', 'last_reviewed_at')),
    nextReviewAt: asNullableString(get(item, 'nextReviewAt', 'next_review_at')),
    reviewCount: asNumber(get(item, 'reviewCount', 'review_count')),
    correctCount: asNumber(get(item, 'correctCount', 'correct_count')),
    intervalDays: asNumber(get(item, 'intervalDays', 'interval_days')),
    easeFactor: asNumber(get(item, 'easeFactor', 'ease_factor'), 2.5),
    mastered: asBoolean(item.mastered),
  };
};

const normalizeReviewOption = (value: unknown): VocabularyReviewOption => {
  const item = asRecord(value);
  return {
    rating: asString(item.rating) as VocabularyReviewRating,
    label: asString(item.label),
    delayLabel: asString(get(item, 'delayLabel', 'delay_label')),
    nextReviewAt: asNullableString(get(item, 'nextReviewAt', 'next_review_at')),
  };
};

export const normalizeVocabulary = (value: unknown): Vocabulary => {
  const item = asRecord(value);
  return {
    id: asNumber(item.id),
    word: asString(item.word),
    meaningVi: asNullableString(get(item, 'meaningVi', 'meaning_vi')),
    meaningEn: asNullableString(get(item, 'meaningEn', 'meaning_en')),
    partOfSpeech: asNullableString(get(item, 'partOfSpeech', 'part_of_speech')),
    pronunciation: asNullableString(item.pronunciation),
    exampleSentenceEn: asNullableString(get(item, 'exampleSentenceEn', 'example_sentence_en')),
    exampleSentenceVi: asNullableString(get(item, 'exampleSentenceVi', 'example_sentence_vi')),
    audioUrl: asNullableString(get(item, 'audioUrl', 'audio_url')),
    topics: asArray(item.topics).map(normalizeTopic),
    progress: normalizeProgress(item.progress),
    reviewOptions: asArray(get(item, 'reviewOptions', 'review_options')).map(normalizeReviewOption),
    createdAt: asNullableString(get(item, 'createdAt', 'created_at')),
    updatedAt: asNullableString(get(item, 'updatedAt', 'updated_at')),
  };
};

const normalizeLookup = (value: unknown): VocabularyLookup => {
  const item = asRecord(value);
  return {
    word: asString(item.word),
    meaningEn: asNullableString(get(item, 'meaningEn', 'meaning_en')),
    meaningVi: asNullableString(get(item, 'meaningVi', 'meaning_vi')),
    partOfSpeech: asNullableString(get(item, 'partOfSpeech', 'part_of_speech')),
    pronunciation: asNullableString(item.pronunciation),
    exampleSentenceEn: asNullableString(get(item, 'exampleSentenceEn', 'example_sentence_en')),
    exampleSentenceVi: asNullableString(get(item, 'exampleSentenceVi', 'example_sentence_vi')),
    audioUrl: asNullableString(get(item, 'audioUrl', 'audio_url')),
  };
};

const normalizeImportResult = (value: unknown): VocabularyImportResult => {
  const item = asRecord(value);
  return {
    success: asBoolean(item.success),
    topicId: asNumber(get(item, 'topicId', 'topic_id')),
    totalRows: asNumber(get(item, 'totalRows', 'total_rows')),
    createdCount: asNumber(get(item, 'createdCount', 'created_count')),
    updatedCount: asNumber(get(item, 'updatedCount', 'updated_count')),
    skippedCount: asNumber(get(item, 'skippedCount', 'skipped_count')),
    errors: asArray(item.errors).map((error) => {
      if (typeof error === 'string') return error;
      const record = asRecord(error);
      return asString(record.message, JSON.stringify(error));
    }),
  };
};

const normalizeEnrichResult = (value: unknown): VocabularyEnrichResult => {
  const item = asRecord(value);
  return {
    vocabularyId: typeof get(item, 'vocabularyId', 'vocabulary_id') === 'number' ? asNumber(get(item, 'vocabularyId', 'vocabulary_id')) : null,
    topicId: typeof get(item, 'topicId', 'topic_id') === 'number' ? asNumber(get(item, 'topicId', 'topic_id')) : null,
    totalWords: asNumber(get(item, 'totalWords', 'total_words')),
    updatedCount: asNumber(get(item, 'updatedCount', 'updated_count')),
    skippedCount: asNumber(get(item, 'skippedCount', 'skipped_count')),
    errors: asArray(item.errors).map((error) => {
      const record = asRecord(error);
      return {
        vocabularyId: typeof get(record, 'vocabularyId', 'vocabulary_id') === 'number' ? asNumber(get(record, 'vocabularyId', 'vocabulary_id')) : null,
        word: asNullableString(record.word),
        message: asString(record.message, 'Enrich failed'),
      };
    }),
    words: asArray(item.words).map(normalizeVocabulary),
  };
};

const compactPayload = <T extends object>(payload: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  ) as Partial<T>;

export const getVocabularyStatus = (vocabulary: Vocabulary): VocabularyStatus => {
  if (!vocabulary.progress) return 'not_started';
  if (vocabulary.progress.mastered) return 'mastered';
  if (vocabulary.progress.nextReviewAt && new Date(vocabulary.progress.nextReviewAt) <= new Date()) return 'due';
  return 'learning';
};

export const vocabularyService = {
  getTopics: async (): Promise<VocabularyTopic[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/vocabulary/topics');
    return asArray(unwrapResult(response.data)).map(normalizeTopic);
  },

  getTopicWords: async (topicId: number): Promise<Vocabulary[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`/vocabulary/topics/${topicId}/words`);
    return asArray(unwrapResult(response.data)).map(normalizeVocabulary);
  },

  getWord: async (vocabularyId: number): Promise<Vocabulary> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/vocabulary/${vocabularyId}`);
    return normalizeVocabulary(unwrapResult(response.data));
  },

  learn: async (vocabularyId: number): Promise<Vocabulary> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/vocabulary/${vocabularyId}/learn`);
    return normalizeVocabulary(unwrapResult(response.data));
  },

  getProgress: async (): Promise<Vocabulary[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/vocabulary/progress');
    return asArray(unwrapResult(response.data)).map(normalizeVocabulary);
  },

  getDue: async (topicId?: number): Promise<Vocabulary[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/vocabulary/due', {
      params: topicId ? { topicId } : undefined,
    });
    return asArray(unwrapResult(response.data)).map(normalizeVocabulary);
  },

  review: async (vocabularyId: number, rating: VocabularyReviewRating): Promise<Vocabulary> => {
    const response = await apiClient.post<ApiResponse<unknown>>(`/vocabulary/${vocabularyId}/review`, { rating });
    return normalizeVocabulary(unwrapResult(response.data));
  },
};

export const adminVocabularyService = {
  getTopics: async (): Promise<VocabularyTopic[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/admin/vocabulary/topics');
    return asArray(unwrapResult(response.data)).map(normalizeTopic);
  },

  createTopic: async (body: TopicPayload): Promise<VocabularyTopic> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/admin/vocabulary/topics', compactPayload(body));
    return normalizeTopic(unwrapResult(response.data));
  },

  updateTopic: async (topicId: number, body: TopicPayload): Promise<VocabularyTopic> => {
    const response = await apiClient.put<ApiResponse<unknown>>(
      `/admin/vocabulary/topics/${topicId}`,
      compactPayload(body)
    );
    return normalizeTopic(unwrapResult(response.data));
  },

  deleteTopic: async (topicId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<unknown>>(`/admin/vocabulary/topics/${topicId}`);
    unwrapResult(response.data);
  },

  lookup: async (word: string): Promise<VocabularyLookup> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/admin/vocabulary/lookup', { params: { word } });
    return normalizeLookup(unwrapResult(response.data));
  },

  importTopicWords: async (topicId: number, file: File, replace: boolean): Promise<VocabularyImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/admin/vocabulary/topics/${topicId}/import`,
      formData,
      {
        params: { replace },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return normalizeImportResult(unwrapResult(response.data));
  },

  enrichWord: async (vocabularyId: number, body: VocabularyEnrichPayload): Promise<VocabularyEnrichResult> => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/admin/vocabulary/${vocabularyId}/enrich`,
      body
    );
    return normalizeEnrichResult(unwrapResult(response.data));
  },

  enrichTopic: async (topicId: number, body: VocabularyEnrichPayload): Promise<VocabularyEnrichResult> => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/admin/vocabulary/topics/${topicId}/enrich`,
      body
    );
    return normalizeEnrichResult(unwrapResult(response.data));
  },

  searchWords: async (params?: { topicId?: number; keyword?: string }): Promise<Vocabulary[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/admin/vocabulary', { params });
    return asArray(unwrapResult(response.data)).map(normalizeVocabulary);
  },

  getWord: async (vocabularyId: number): Promise<Vocabulary> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/admin/vocabulary/${vocabularyId}`);
    return normalizeVocabulary(unwrapResult(response.data));
  },

  createWord: async (body: VocabularyPayload): Promise<Vocabulary> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/admin/vocabulary', compactPayload(body));
    return normalizeVocabulary(unwrapResult(response.data));
  },

  updateWord: async (vocabularyId: number, body: VocabularyPayload): Promise<Vocabulary> => {
    const response = await apiClient.put<ApiResponse<unknown>>(
      `/admin/vocabulary/${vocabularyId}`,
      compactPayload(body)
    );
    return normalizeVocabulary(unwrapResult(response.data));
  },

  deleteWord: async (vocabularyId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<unknown>>(`/admin/vocabulary/${vocabularyId}`);
    unwrapResult(response.data);
  },
};
