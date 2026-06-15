import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import { testCollectionService } from '@/features-admin/tests/services/testCollectionService';
import type {
  AdminListeningCollection,
  AdminListeningGroupDetail,
  AdminListeningGroupSummary,
  AdminListeningPartNumber,
  AdminListeningTest,
  TranscriptLine,
} from '../types';

const unwrapResult = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (response.code !== 1000) {
    const error = new Error(getAdminListeningErrorMessage(response.code, response.message || fallback));
    throw error;
  }
  return response.result;
};

export const getAdminListeningErrorMessage = (code?: number, fallback = 'Không thể xử lý dữ liệu luyện nghe.') => {
  if (code === 1001) return 'Dữ liệu transcript line không hợp lệ. Kiểm tra text_en, order_index và time range.';
  if (code === 1009) return 'Không tìm thấy test hoặc group tương ứng.';
  if (code === 1034) return 'Group cần có audio trước khi cập nhật transcript lines.';
  return fallback;
};

export const adminListeningService = {
  getCollections: async (): Promise<AdminListeningCollection[]> => {
    const response = await testCollectionService.getCollections();
    return unwrapResult(response, 'Không thể tải bộ đề.');
  },

  getTestsInCollection: async (collectionId: number): Promise<AdminListeningTest[]> => {
    const response = await testCollectionService.getTestsInCollection(collectionId);
    return unwrapResult(response, 'Không thể tải danh sách test.');
  },

  getGroups: async (testId: number, partNumber: AdminListeningPartNumber): Promise<AdminListeningGroupSummary[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AdminListeningGroupSummary[]>>(
        `/admin/tests/${testId}/parts/${partNumber}/question-groups`
      );
      return unwrapResult(response.data, 'Không thể tải group luyện nghe.');
    } catch {
      const response = await apiClient.get<ApiResponse<AdminListeningGroupSummary[]>>(
        `/admin/tests/${testId}/question-groups`
      );
      return unwrapResult(response.data, 'Không thể tải group luyện nghe.').filter(
        (group) => group.part_number === partNumber
      );
    }
  },

  getGroupDetail: async (groupId: number): Promise<AdminListeningGroupDetail> => {
    const response = await apiClient.get<ApiResponse<AdminListeningGroupDetail>>(`/admin/question-groups/${groupId}`);
    return unwrapResult(response.data, 'Không thể tải chi tiết group.');
  },

  updateTranscriptLines: async (groupId: number, lines: TranscriptLine[]): Promise<AdminListeningGroupDetail> => {
    const response = await apiClient.put<ApiResponse<AdminListeningGroupDetail>>(
      `/admin/question-groups/${groupId}/transcript-lines`,
      { lines }
    );
    return unwrapResult(response.data, 'Không thể lưu transcript lines.');
  },
};

