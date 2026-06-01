import { useEffect, useState } from 'react';
import type { Vocabulary, VocabularyTopic } from '../types';
import { vocabularyService } from '../services/vocabularyService';

export const useVocabularyDetail = (id: number | null) => {
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [topics, nextWords] = await Promise.all([
          vocabularyService.getTopics(),
          vocabularyService.getTopicWords(id),
        ]);
        setTopic(topics.find((item) => item.id === id) ?? null);
        setWords(nextWords);
      } catch {
        setError('Không thể tải chi tiết chủ đề từ vựng.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [id]);

  return { topic, words, setWords, isLoading, error };
};
