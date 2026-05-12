import { useEffect, useMemo, useState } from 'react';
import { readingService } from '../services/readingService';
import type { ReadingPassageGroup, ReadingPassageSummary } from '../types';

export type ReadingPassageGroupFilter = ReadingPassageGroup | 'All';

export const useReading = () => {
  const [passages, setPassages] = useState<ReadingPassageSummary[]>([]);
  const [activePassageGroup, setActivePassageGroup] = useState<ReadingPassageGroupFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPassages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await readingService.getPassages(controller.signal);
        if (controller.signal.aborted) return;
        setPassages(data);
      } catch {
        if (controller.signal.aborted) return;
        setError('Không thể tải danh sách bài đọc.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPassages();

    return () => {
      controller.abort();
    };
  }, []);

  const passageGroups = useMemo(() => {
    return ['All', ...Array.from(new Set(passages.map((passage) => passage.passageGroup)))] as ReadingPassageGroupFilter[];
  }, [passages]);

  const filteredPassages = useMemo(() => {
    return passages.filter((passage) => activePassageGroup === 'All' || passage.passageGroup === activePassageGroup);
  }, [activePassageGroup, passages]);

  return {
    filteredPassages,
    passageGroups,
    activePassageGroup,
    setActivePassageGroup,
    isLoading,
    error,
  };
};
