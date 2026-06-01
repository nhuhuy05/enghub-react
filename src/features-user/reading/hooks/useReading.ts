import { useEffect, useMemo, useState } from 'react';
import { readingService } from '../services/readingService';
import type { ReadingLessonListItem, ReadingLessonType } from '../types';

export type ReadingLessonTypeFilter = ReadingLessonType | 'All';

export const useReading = () => {
  const [lessons, setLessons] = useState<ReadingLessonListItem[]>([]);
  const [activeReadingType, setActiveReadingType] = useState<ReadingLessonTypeFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await readingService.getReadingLessons();
        if (!ignore) setLessons(data);
      } catch {
        if (!ignore) setError('Không thể tải danh sách bài đọc.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    void fetchLessons();

    return () => {
      ignore = true;
    };
  }, []);

  const readingTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(lessons.map((lesson) => lesson.readingType)))] as ReadingLessonTypeFilter[];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => activeReadingType === 'All' || lesson.readingType === activeReadingType);
  }, [activeReadingType, lessons]);

  return {
    filteredLessons,
    readingTypes,
    activeReadingType,
    setActiveReadingType,
    isLoading,
    error,
  };
};
