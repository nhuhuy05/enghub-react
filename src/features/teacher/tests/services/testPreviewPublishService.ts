import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type { PreviewContent, PreviewResult, PublishResult } from '../types/teacherTestTypes';

export const testPreviewPublishService = {
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
