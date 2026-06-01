import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  ReadingLessonCreatePayload,
  ReadingLessonDetail,
  ReadingLessonDetailRaw,
  ReadingLessonListItem,
  ReadingLessonListItemRaw,
  ReadingLessonStatus,
  ReadingLessonType,
  ReadingLessonUpdatePayload,
  ReadingPart7Candidate,
  ReadingPart7CandidateRaw,
  ReadingPassage,
  ReadingPassagePayload,
  ReadingPassageRaw,
  ReadingVocabularyHint,
  ReadingVocabularyHintPayload,
  ReadingVocabularyHintRaw,
} from '../types';

const unwrapResult = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (response.code !== 1000) {
    const error = new Error(getReadingErrorMessage(response.code, response.message || fallback)) as Error & { apiCode?: number };
    error.apiCode = response.code;
    throw error;
  }
  return response.result;
};

export const getReadingErrorMessage = (code?: number, fallback = 'Không thể xử lý dữ liệu luyện đọc.') => {
  if (code === 1001) return 'Dữ liệu bài đọc không hợp lệ. Kiểm tra title, nội dung EN/VI và từ vựng.';
  if (code === 1023) return 'Không tìm thấy question group Part 7.';
  if (code === 1024) return 'Media asset không hợp lệ hoặc không thuộc test này.';
  if (code === 1026) return 'Từ vựng đang tham chiếu passage không thuộc bài đọc.';
  if (code === 1029) return 'Gemini đang bị tắt.';
  if (code === 1030) return 'Chưa cấu hình Gemini API key.';
  if (code === 1032) return 'Gemini sinh dữ liệu thất bại.';
  if (code === 1033) return 'Gemini trả dữ liệu không đúng định dạng.';
  if (code === 1043) return 'Không tìm thấy bài luyện đọc hoặc bài chưa publish.';
  if (code === 1044) return 'Question group này đã có bài luyện đọc.';
  return fallback;
};

const mapListItem = (item: ReadingLessonListItemRaw): ReadingLessonListItem => ({
  id: item.id,
  questionGroupId: item.question_group_id,
  testId: item.test_id,
  testTitle: item.test_title,
  groupOrder: item.group_order,
  title: item.title,
  titleVi: item.title_vi,
  readingType: item.reading_type,
  status: item.status,
  difficulty: item.difficulty,
  passageCount: item.passage_count,
  vocabularyCount: item.vocabulary_count,
  updatedAt: item.updated_at,
});

const mapPassage = (passage: ReadingPassageRaw): ReadingPassage => ({
  id: passage.id,
  questionGroupId: passage.question_group_id,
  partNumber: passage.part_number,
  groupOrder: passage.group_order,
  title: passage.title,
  passageType: passage.passage_type,
  contentFormat: passage.content_format,
  contentEn: passage.content_en ?? '',
  contentVi: passage.content_vi ?? '',
  vocabHints: passage.vocab_hints,
  mediaAssetId: passage.media_asset_id,
  mediaLabel: passage.media_label,
  mediaUrl: passage.media_url,
  orderIndex: passage.order_index,
});

const mapVocabularyHint = (hint: ReadingVocabularyHintRaw): ReadingVocabularyHint => ({
  id: hint.id,
  passageId: hint.passage_id,
  passageOrderIndex: hint.passage_order_index,
  word: hint.word,
  partOfSpeech: hint.part_of_speech ?? '',
  meaningVi: hint.meaning_vi,
  orderIndex: hint.order_index,
});

const mapDetail = (detail: ReadingLessonDetailRaw): ReadingLessonDetail => ({
  ...mapListItem(detail),
  passages: (detail.passages || []).slice().sort((a, b) => a.order_index - b.order_index).map(mapPassage),
  vocabularyHints: (detail.vocabulary_hints || []).slice().sort((a, b) => a.order_index - b.order_index).map(mapVocabularyHint),
  createdAt: detail.created_at,
});

const mapCandidate = (candidate: ReadingPart7CandidateRaw): ReadingPart7Candidate => ({
  questionGroupId: candidate.question_group_id,
  testId: candidate.test_id,
  testTitle: candidate.test_title,
  groupOrder: candidate.group_order,
  questionNumbers: candidate.question_numbers || [],
  passageCount: candidate.passage_count,
  suggestedReadingType: candidate.suggested_reading_type,
  existingLessonId: candidate.existing_lesson_id,
  title: candidate.title,
});

const compactPayload = <T extends object>(payload: T): Partial<T> =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;

const toCreatePayload = (payload: ReadingLessonCreatePayload) => compactPayload({
  question_group_id: payload.questionGroupId,
  title: payload.title,
  title_vi: payload.titleVi,
  reading_type: payload.readingType,
  status: payload.status,
  difficulty: payload.difficulty,
});

const toPassagePayload = (passage: ReadingPassagePayload) => compactPayload({
  media_asset_id: passage.mediaAssetId,
  title: passage.title,
  passage_type: passage.passageType,
  content_format: passage.contentFormat,
  content_en: passage.contentEn,
  content_vi: passage.contentVi,
  order_index: passage.orderIndex,
});

const toVocabularyPayload = (hint: ReadingVocabularyHintPayload) => compactPayload({
  passage_id: hint.passageId,
  passage_order_index: hint.passageOrderIndex,
  word: hint.word,
  part_of_speech: hint.partOfSpeech,
  meaning_vi: hint.meaningVi,
  order_index: hint.orderIndex,
});

const toUpdatePayload = (payload: ReadingLessonUpdatePayload) => compactPayload({
  title: payload.title,
  title_vi: payload.titleVi,
  reading_type: payload.readingType,
  status: payload.status,
  difficulty: payload.difficulty,
  passages: payload.passages?.map(toPassagePayload),
  vocabulary_hints: payload.vocabularyHints?.map(toVocabularyPayload),
});

export const readingService = {
  getReadingLessons: async (readingType?: ReadingLessonType): Promise<ReadingLessonListItem[]> => {
    const response = await apiClient.get<ApiResponse<ReadingLessonListItemRaw[]>>('/reading-lessons', {
      params: readingType ? { reading_type: readingType } : undefined,
    });
    return unwrapResult(response.data, 'Không thể tải danh sách bài đọc.').map(mapListItem);
  },

  getReadingLesson: async (lessonId: number | string): Promise<ReadingLessonDetail> => {
    const response = await apiClient.get<ApiResponse<ReadingLessonDetailRaw>>(`/reading-lessons/${lessonId}`);
    return mapDetail(unwrapResult(response.data, 'Không thể tải bài đọc.'));
  },
};

export const adminReadingService = {
  getPart7ReadingCandidates: async (testId?: number): Promise<ReadingPart7Candidate[]> => {
    const response = await apiClient.get<ApiResponse<ReadingPart7CandidateRaw[]>>('/admin/reading-lessons/part7-candidates', {
      params: testId ? { test_id: testId } : undefined,
    });
    return unwrapResult(response.data, 'Không thể tải danh sách Part 7 candidates.').map(mapCandidate);
  },

  getAdminReadingLessons: async (filters?: { status?: ReadingLessonStatus; readingType?: ReadingLessonType }): Promise<ReadingLessonListItem[]> => {
    const response = await apiClient.get<ApiResponse<ReadingLessonListItemRaw[]>>('/admin/reading-lessons', {
      params: {
        status: filters?.status,
        reading_type: filters?.readingType,
      },
    });
    return unwrapResult(response.data, 'Không thể tải danh sách bài luyện đọc.').map(mapListItem);
  },

  createReadingLesson: async (payload: ReadingLessonCreatePayload): Promise<ReadingLessonDetail> => {
    const response = await apiClient.post<ApiResponse<ReadingLessonDetailRaw>>('/admin/reading-lessons', toCreatePayload(payload));
    return mapDetail(unwrapResult(response.data, 'Không thể tạo bài luyện đọc.'));
  },

  getAdminReadingLesson: async (lessonId: number | string): Promise<ReadingLessonDetail> => {
    const response = await apiClient.get<ApiResponse<ReadingLessonDetailRaw>>(`/admin/reading-lessons/${lessonId}`);
    return mapDetail(unwrapResult(response.data, 'Không thể tải chi tiết bài luyện đọc.'));
  },

  updateReadingLesson: async (lessonId: number | string, payload: ReadingLessonUpdatePayload): Promise<ReadingLessonDetail> => {
    const data = toUpdatePayload(payload);
    const response = await apiClient.patch<ApiResponse<ReadingLessonDetailRaw>>(`/admin/reading-lessons/${lessonId}`, data);
    return mapDetail(unwrapResult(response.data, 'Không thể lưu bài luyện đọc.'));
  },

  updateReadingLessonStatus: async (lessonId: number | string, status: ReadingLessonStatus): Promise<ReadingLessonDetail> => {
    const response = await apiClient.patch<ApiResponse<ReadingLessonDetailRaw>>(`/admin/reading-lessons/${lessonId}/status`, { status });
    return mapDetail(unwrapResult(response.data, 'Không thể cập nhật trạng thái bài đọc.'));
  },

  generateReadingTranslation: async (lessonId: number | string, overwriteEnabled: boolean): Promise<ReadingLessonDetail> => {
    const response = await apiClient.post<ApiResponse<ReadingLessonDetailRaw>>(
      `/admin/reading-lessons/${lessonId}/generate-translation`,
      { overwrite_enabled: overwriteEnabled }
    );
    return mapDetail(unwrapResult(response.data, 'Không thể sinh bản dịch.'));
  },

  generateReadingVocabulary: async (lessonId: number | string, overwriteEnabled: boolean): Promise<ReadingLessonDetail> => {
    const response = await apiClient.post<ApiResponse<ReadingLessonDetailRaw>>(
      `/admin/reading-lessons/${lessonId}/generate-vocabulary`,
      { overwrite_enabled: overwriteEnabled }
    );
    return mapDetail(unwrapResult(response.data, 'Không thể sinh từ vựng.'));
  },

  generateReadingAiSupport: async (lessonId: number | string, overwriteEnabled: boolean): Promise<ReadingLessonDetail> => {
    const response = await apiClient.post<ApiResponse<ReadingLessonDetailRaw>>(
      `/admin/reading-lessons/${lessonId}/generate-ai-support`,
      { overwrite_enabled: overwriteEnabled }
    );
    return mapDetail(unwrapResult(response.data, 'Không thể sinh hỗ trợ AI.'));
  },

  deleteReadingLesson: async (lessonId: number | string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/reading-lessons/${lessonId}`);
    unwrapResult(response.data, 'Không thể xóa bài luyện đọc.');
  },
};
