import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type { Test, TestCollection } from '../types/adminTestTypes';

export const testCollectionService = {
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
};
