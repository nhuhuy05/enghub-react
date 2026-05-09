import { useState, useEffect } from 'react';
import type { VocabularyDetailData } from '../types';
import { vocabularyService } from '../services/vocabularyService';

export const useVocabularyDetail = (id: string) => {
  const [data, setData] = useState<VocabularyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const detail = await vocabularyService.getTopicDetail(id);
        setData(detail);
      } catch (err) {
        setError('Không thể tải chi tiết bộ từ vựng.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { data, isLoading, error };
};
