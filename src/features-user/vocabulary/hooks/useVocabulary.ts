import { useEffect, useState } from 'react';
import type { VocabularyTopic } from '../types';
import { vocabularyService } from '../services/vocabularyService';

export const useVocabulary = () => {
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [nextTopics, dueWords] = await Promise.all([
          vocabularyService.getTopics(),
          vocabularyService.getDue(),
        ]);
        setTopics(nextTopics);
        setDueCount(dueWords.length);
      } catch {
        setError('Không thể tải danh sách chủ đề từ vựng.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTopics();
  }, []);

  return { topics, dueCount, isLoading, error };
};
