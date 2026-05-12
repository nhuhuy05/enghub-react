import { useEffect, useState } from 'react';
import { readingService } from '../services/readingService';
import type { ReadingAnswerOption, ReadingPassageDetail } from '../types';

export const useReadingSession = (passageId: string) => {
  const [passage, setPassage] = useState<ReadingPassageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, ReadingAnswerOption['id']>>({});
  const [isBilingual, setIsBilingual] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPassage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await readingService.getPassage(passageId, controller.signal);
        if (controller.signal.aborted) return;
        setPassage(data);
        setSelectedAnswers({});
      } catch {
        if (controller.signal.aborted) return;
        setPassage(null);
        setError('Không tìm thấy bài đọc.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    if (passageId) fetchPassage();

    return () => {
      controller.abort();
    };
  }, [passageId]);

  const selectAnswer = (questionId: string, answerId: ReadingAnswerOption['id']) => {
    setSelectedAnswers((prev) => {
      if (prev[questionId]) return prev;

      return {
        ...prev,
        [questionId]: answerId,
      };
    });
  };

  return {
    passage,
    isLoading,
    error,
    selectedAnswers,
    isBilingual,
    setIsBilingual,
    showVocabulary,
    setShowVocabulary,
    selectAnswer,
  };
};
