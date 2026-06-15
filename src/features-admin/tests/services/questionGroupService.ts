import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  GenerateGroupAiSupportInput,
  PatchAnswerInput,
  PatchGroupAudioInput,
  PatchGroupImageInput,
  PatchGroupPassageInput,
  PatchGroupTranscriptInput,
  PatchQuestionInput,
  QuestionGroupDetail,
  QuestionGroupSummary,
  ReviewStatus,
} from '../types/adminTestTypes';

export const questionGroupService = {
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

  generateGroupTranscript: async (groupId: number): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.post<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/generate-transcript`
    );
    return response.data;
  },

  generateQuestionTranslation: async (groupId: number): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.post<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/generate-question-translation`
    );
    return response.data;
  },

  generateQuestionExplanations: async (groupId: number): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.post<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/generate-explanations`
    );
    return response.data;
  },

  generateGroupAiSupport: async (
    groupId: number,
    data: GenerateGroupAiSupportInput
  ): Promise<ApiResponse<QuestionGroupDetail>> => {
    const response = await apiClient.post<ApiResponse<QuestionGroupDetail>>(
      `/admin/question-groups/${groupId}/generate-ai-support`,
      data
    );
    return response.data;
  },
};
