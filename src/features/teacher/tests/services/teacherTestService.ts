import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  ImportResult,
  MediaAsset,
  PatchAnswerInput,
  PatchGroupAudioInput,
  PatchGroupImageInput,
  PatchGroupPassageInput,
  PatchGroupTranscriptInput,
  PatchQuestionInput,
  PreviewContent,
  PreviewResult,
  PublishResult,
  QuestionGroupDetail,
  QuestionGroupSummary,
  ReviewStatus,
  Test,
  TestCollection,
} from '../types/teacherTestTypes';

export const teacherTestService = {
  getCollections: async (): Promise<ApiResponse<TestCollection[]>> => {
    const response = await apiClient.get<ApiResponse<TestCollection[]>>('/admin/test-collections');
    return response.data;
  },

  createCollection: async (data: { name: string; description: string }): Promise<ApiResponse<TestCollection>> => {
    const response = await apiClient.post<ApiResponse<TestCollection>>('/admin/test-collections', data);
    return response.data;
  },

  getTestsInCollection: async (collectionId: number): Promise<ApiResponse<Test[]>> => {
    const response = await apiClient.get<ApiResponse<Test[]>>(`/admin/test-collections/${collectionId}/tests`);
    return response.data;
  },

  createTest: async (data: {
    collection_id: number | null;
    test_number: number | null;
    title: string;
    description: string;
    duration_minutes: number;
  }): Promise<ApiResponse<Test>> => {
    const response = await apiClient.post<ApiResponse<Test>>('/admin/tests', data);
    return response.data;
  },

  getTestById: async (testId: number): Promise<ApiResponse<Test>> => {
    const response = await apiClient.get<ApiResponse<Test>>(`/admin/tests/${testId}`);
    return response.data;
  },

  getTestMedia: async (testId: number): Promise<ApiResponse<MediaAsset[]>> => {
    const response = await apiClient.get<ApiResponse<MediaAsset[]>>(`/admin/tests/${testId}/media`);
    return response.data;
  },

  uploadMedia: async (
    testId: number,
    file: File,
    label: string,
    type: 'image' | 'audio'
  ): Promise<ApiResponse<MediaAsset>> => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/admin/tests/${testId}/media?label=${encodeURIComponent(label)}&type=${type}&mediaType=${type}`;
    const response = await apiClient.post<ApiResponse<MediaAsset>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMedia: async (testId: number, mediaAssetId: number, file: File): Promise<ApiResponse<MediaAsset>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put<ApiResponse<MediaAsset>>(
      `/admin/tests/${testId}/media/${mediaAssetId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteMedia: async (testId: number, mediaAssetId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/tests/${testId}/media/${mediaAssetId}`);
    return response.data;
  },

  importExcel: async (testId: number, file: File, replace: boolean = false): Promise<ApiResponse<ImportResult>> => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/admin/tests/${testId}/import?replace=${replace ? 'true' : 'false'}`;
    const response = await apiClient.post<ApiResponse<ImportResult>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getQuestionGroups: async (testId: number): Promise<ApiResponse<QuestionGroupSummary[]>> => {
    const response = await apiClient.get<ApiResponse<QuestionGroupSummary[]>>(
      `/admin/tests/${testId}/question-groups`
    );
    return response.data;
  },

  getQuestionGroupDetail: async (groupId: number): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.get<ApiResponse<QuestionGroupDetail>>(`/admin/question-groups/${groupId}`);
    return response.data;
  },

  patchGroupImages: async (
    groupId: number,
    images: PatchGroupImageInput[]
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/images`,
      { images }
    );
    return response.data;
  },

  patchGroupAudio: async (
    groupId: number,
    data: PatchGroupAudioInput
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/audio`,
      data
    );
    return response.data;
  },

  patchGroupTranscript: async (
    groupId: number,
    data: PatchGroupTranscriptInput
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/transcript`,
      data
    );
    return response.data;
  },

  patchGroupPassages: async (
    groupId: number,
    passages: PatchGroupPassageInput[]
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/passages`,
      { passages }
    );
    return response.data;
  },

  patchQuestion: async (
    questionId: number,
    data: PatchQuestionInput
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/questions/${questionId}`,
      data
    );
    return response.data;
  },

  patchAnswer: async (answerId: number, data: PatchAnswerInput): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(`/admin/answers/${answerId}`, data);
    return response.data;
  },

  patchReviewStatus: async (
    groupId: number,
    review_status: ReviewStatus
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.patch<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/review-status`,
      { review_status }
    );
    return response.data;
  },

  previewTest: async (testId: number): Promise<ApiResponse<PreviewResult>> => {
    const response = await apiClient.get<ApiResponse<PreviewResult>>(`/admin/tests/${testId}/preview`);
    return response.data;
  },

  getPreviewContent: async (testId: number): Promise<ApiResponse<PreviewContent>> => {
    const response = await apiClient.get<ApiResponse<PreviewContent>>(`/admin/tests/${testId}/preview-content`);
    return response.data;
  },

  publishTest: async (testId: number): Promise<ApiResponse<PublishResult>> => {
    const response = await apiClient.patch<ApiResponse<PublishResult>>(`/admin/tests/${testId}/publish`);
    return response.data;
  },

  unpublishTest: async (testId: number): Promise<ApiResponse<PublishResult>> => {
    const response = await apiClient.patch<ApiResponse<PublishResult>>(`/admin/tests/${testId}/unpublish`);
    return response.data;
  },
};
