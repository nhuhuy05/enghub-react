import { useState, useEffect } from 'react';
import type { GrammarDetailData } from '../types';
import { grammarService } from '../services/grammarService';

export const useGrammarDetail = (topicId: string) => {
  const [data, setData] = useState<GrammarDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const detail = await grammarService.getTopicDetail(topicId);
        setData(detail);
        if (detail.lessons.length > 0) {
          setActiveLessonId(detail.lessons[0].id);
        }
      } catch (err) {
        setError('Không thể tải chi tiết chủ điểm ngữ pháp.');
      } finally {
        setIsLoading(false);
      }
    };
    if (topicId) fetchDetail();
  }, [topicId]);

  const activeLesson = data?.lessons.find(l => l.id === activeLessonId) || null;

  return {
    data,
    isLoading,
    error,
    activeLesson,
    activeLessonId,
    setActiveLessonId,
    activeTab,
    setActiveTab
  };
};
