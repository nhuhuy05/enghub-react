import { useState, useEffect } from 'react';
import type { Exam } from '../types';
import { examService } from '../services/examService';

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const data = await examService.getExams();
        setExams(data);
      } catch (err) {
        setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  return { exams, isLoading, error };
};
