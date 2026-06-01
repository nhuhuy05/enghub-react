import { useEffect, useMemo, useState } from 'react';
import { listeningService } from '../services/listeningService';
import type { ListeningTest } from '../types';

export const useListening = () => {
  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [activeCollection, setActiveCollection] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const data = await listeningService.getTests();
        setTests(data);
      } catch {
        setError('Không thể tải danh sách bài nghe.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const collections = useMemo(() => {
    return ['All', ...Array.from(new Set(tests.map((test) => test.collection)))];
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesCollection = activeCollection === 'All' || test.collection === activeCollection;
      return matchesCollection;
    });
  }, [activeCollection, tests]);

  return {
    tests,
    filteredTests,
    collections,
    activeCollection,
    setActiveCollection,
    isLoading,
    error,
  };
};
