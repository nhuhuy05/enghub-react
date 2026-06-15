import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type { ImportResult } from '../types/adminTestTypes';

export const testImportService = {
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
};
