import { useState, useEffect } from 'react';
import type { GrammarTopic } from '../types';
import { grammarService } from '../services/grammarService';

export const useGrammar = () => {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const data = await grammarService.getTopics();
        setTopics(data);
      } catch (err) {
        setError('Không thể tải danh sách chủ điểm ngữ pháp.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  return { topics, isLoading, error };
};
