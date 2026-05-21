import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  TestCollection,
  Test,
  MediaAsset,
  AudioRange,
  ImportResult,
  PreviewResult,
  PublishResult,
} from '../types/teacherTestTypes';

export const teacherTestService = {
  // 1. Collections
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

  // 2. Tests
  createTest: async (data: {
    collection_id: number | null;
    test_number: number | null;
    title: string;
    description: string;
    duration_minutes: number;
  }): Promise<ApiResponse<Test>> => {
    const response = await apiClient.post<ApiResponse<Test>>('/admin/tests', data);
    if (response.data.code === 1000 && response.data.result) {
      localStorage.setItem(`enghub_test_${response.data.result.id}`, JSON.stringify(response.data.result));
      if (data.collection_id) {
        localStorage.setItem(`enghub_test_collection_${response.data.result.id}`, data.collection_id.toString());
      }
    }
    return response.data;
  },

  getTestById: async (testId: number, collectionId?: number | null): Promise<ApiResponse<Test>> => {
    // 1. Check local storage
    const cached = localStorage.getItem(`enghub_test_${testId}`);
    if (cached) {
      try {
        return {
          code: 1000,
          message: null,
          result: JSON.parse(cached)
        };
      } catch (e) {
        console.error('Failed to parse cached test:', e);
      }
    }

    // 2. Try fetching from collection if collectionId is provided
    if (collectionId) {
      try {
        const res = await teacherTestService.getTestsInCollection(collectionId);
        if (res.code === 1000 && res.result) {
          const found = res.result.find((t) => t.id === testId);
          if (found) {
            localStorage.setItem(`enghub_test_${testId}`, JSON.stringify(found));
            return {
              code: 1000,
              message: null,
              result: found
            };
          }
        }
      } catch (e) {
        console.error('Failed to fallback fetch test from collection:', e);
      }
    }

    // 3. Fallback: Return error response
    return {
      code: 1009,
      message: 'Không tìm thấy thông tin đề thi trong bộ nhớ tạm',
      result: null as any
    };
  },

  getTestMedia: async (testId: number): Promise<ApiResponse<MediaAsset[]>> => {
    const cached = localStorage.getItem(`enghub_test_media_${testId}`);
    const media = cached ? JSON.parse(cached) : [];
    return {
      code: 1000,
      message: null,
      result: media
    };
  },

  // 3. Media Assets
  uploadMedia: async (
    testId: number,
    file: File,
    label: string,
    type: 'image' | 'audio'
  ): Promise<ApiResponse<MediaAsset>> => {
    const formData = new FormData();
    formData.append('file', file);

    // Gửi tham số qua query string để đảm bảo Spring Boot @RequestParam có thể nhận dạng đúng.
    // Tránh gửi kèm trong FormData để không bị trùng lặp tham số (Spring Boot sẽ nhận dạng thành chuỗi ghép "audio,audio" và báo lỗi).
    const url = `/admin/tests/${testId}/media?label=${encodeURIComponent(label)}&type=${type}&mediaType=${type}`;

    const response = await apiClient.post<ApiResponse<MediaAsset>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.code === 1000 && response.data.result) {
      const cached = localStorage.getItem(`enghub_test_media_${testId}`);
      const mediaList: MediaAsset[] = cached ? JSON.parse(cached) : [];
      // Xóa các asset cũ trùng label + type để tránh bị trùng lặp trong cache
      const updated = mediaList.filter(
        (m) => !(m.label === label && m.media_type === type)
      );
      updated.push(response.data.result);
      localStorage.setItem(`enghub_test_media_${testId}`, JSON.stringify(updated));
    }

    return response.data;
  },

  deleteMedia: async (testId: number, mediaAssetId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/tests/${testId}/media/${mediaAssetId}`);
    if (response.data.code === 1000) {
      const cached = localStorage.getItem(`enghub_test_media_${testId}`);
      if (cached) {
        const mediaList: MediaAsset[] = JSON.parse(cached);
        const updated = mediaList.filter((m) => m.id !== mediaAssetId);
        localStorage.setItem(`enghub_test_media_${testId}`, JSON.stringify(updated));
      }
    }
    return response.data;
  },

  // 4. Excel Import
  importExcel: async (testId: number, file: File, replace: boolean = false): Promise<ApiResponse<ImportResult>> => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/admin/tests/${testId}/import${replace ? '?replace=true' : ''}`;
    const response = await apiClient.post<ApiResponse<ImportResult>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 5. Audio Ranges
  getAudioRanges: async (testId: number): Promise<ApiResponse<AudioRange[]>> => {
    const cached = localStorage.getItem(`enghub_test_audio_ranges_${testId}`);
    const ranges = cached ? JSON.parse(cached) : [];
    return {
      code: 1000,
      message: null,
      result: ranges
    };
  },

  patchAudioRanges: async (
    testId: number,
    ranges: Array<{
      part_number: number;
      group_order: number;
      start_ms: number;
      end_ms: number | null;
    }>
  ): Promise<ApiResponse<AudioRange[]>> => {
    const response = await apiClient.patch<ApiResponse<AudioRange[]>>(`/admin/tests/${testId}/audio-ranges`, ranges);
    if (response.data.code === 1000 && response.data.result) {
      const cached = localStorage.getItem(`enghub_test_audio_ranges_${testId}`);
      const currentRanges: AudioRange[] = cached ? JSON.parse(cached) : [];
      
      const newRanges: AudioRange[] = response.data.result || [];
      newRanges.forEach((newR) => {
        const index = currentRanges.findIndex(
          (r) => r.part_number === newR.part_number && r.group_order === newR.group_order
        );
        if (index > -1) {
          currentRanges[index] = newR;
        } else {
          currentRanges.push(newR);
        }
      });
      
      localStorage.setItem(`enghub_test_audio_ranges_${testId}`, JSON.stringify(currentRanges));
    }
    return response.data;
  },

  // 6. Preview
  previewTest: async (testId: number): Promise<ApiResponse<PreviewResult>> => {
    const response = await apiClient.get<ApiResponse<PreviewResult>>(`/admin/tests/${testId}/preview`);
    return response.data;
  },

  // 7. Publish
  publishTest: async (testId: number): Promise<ApiResponse<PublishResult>> => {
    const response = await apiClient.patch<ApiResponse<PublishResult>>(`/admin/tests/${testId}/publish`);
    return response.data;
  },
};
