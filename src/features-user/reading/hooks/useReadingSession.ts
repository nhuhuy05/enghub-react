import { useEffect, useState } from 'react';
import { readingService } from '../services/readingService';
import type { ReadingLessonDetail } from '../types';

export const useReadingSession = (lessonId: string) => {
  const [lesson, setLesson] = useState<ReadingLessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBilingual, setIsBilingual] = useState(true);
  const [showVocabulary, setShowVocabulary] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await readingService.getReadingLesson(lessonId);
        if (!ignore) setLesson(data);
      } catch {
        if (!ignore) {
          setLesson(null);
          setError('Không tìm thấy bài đọc hoặc bài chưa được publish.');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    if (lessonId) {
      void fetchLesson();
    } else {
      setIsLoading(false);
      setError('Thiếu thông tin bài đọc.');
    }

    return () => {
      ignore = true;
    };
  }, [lessonId]);

  return {
    lesson,
    isLoading,
    error,
    isBilingual,
    setIsBilingual,
    showVocabulary,
    setShowVocabulary,
  };
};
