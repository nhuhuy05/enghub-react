import { useState, useEffect } from 'react';
import type { VocabularyTopic } from '../types';
import { vocabularyService } from '../services/vocabularyService';

export const useVocabulary = () => {
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const data = await vocabularyService.getTopics();
        setTopics(data);
      } catch (err) {
        setError('Không thể tải danh sách từ vựng.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  return { topics, isLoading, error };
};
