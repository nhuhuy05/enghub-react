import { useState, useEffect, useMemo } from 'react';
import type { ExamDetail } from '../types';
import { examService } from '../services/examService';

export const useExamSession = (examId: string) => {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200); // Default 120m
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      const data = await examService.getExamDetail(examId);
      setExam(data);
      setIsLoading(false);
    };
    if (examId) fetchDetail();
  }, [examId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPart = exam?.parts[currentPartIndex];
  const currentQuestion = currentPart?.questions[currentQuestionIndex];

  const totalQuestionsCount = useMemo(() => {
    if (!exam) return 0;
    return exam.parts.reduce((acc, part) => {
      return acc + part.questions.reduce((qAcc, q) => {
        return qAcc + (q.subQuestions?.length || 1);
      }, 0);
    }, 0);
  }, [exam]);

  const answeredCount = Object.keys(selectedAnswers).length;

  const answerKey = useMemo(() => {
    if (!exam) return {};

    return exam.parts.reduce<Record<number, string>>((acc, part) => {
      part.questions.forEach((question) => {
        if (question.subQuestions) {
          question.subQuestions.forEach((subQuestion) => {
            acc[subQuestion.id] = subQuestion.correctAnswer;
          });
          return;
        }

        if (question.correctAnswer) {
          acc[question.id] = question.correctAnswer;
        }
      });

      return acc;
    }, {});
  }, [exam]);

  const correctCount = useMemo(() => {
    return Object.entries(answerKey).reduce((count, [questionId, correctAnswer]) => {
      return count + (selectedAnswers[Number(questionId)] === correctAnswer ? 1 : 0);
    }, 0);
  }, [answerKey, selectedAnswers]);

  const handleNext = () => {
    if (!exam || !currentPart) return;
    if (currentQuestionIndex < currentPart.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentPartIndex < exam.parts.length - 1) {
      setCurrentPartIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrev = () => {
    if (!exam) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentPartIndex > 0) {
      const prevPartIndex = currentPartIndex - 1;
      setCurrentPartIndex(prevPartIndex);
      setCurrentQuestionIndex(exam.parts[prevPartIndex].questions.length - 1);
    }
  };

  const jumpToQuestion = (partIndex: number, questionIndex: number) => {
    setCurrentPartIndex(partIndex);
    setCurrentQuestionIndex(questionIndex);
    setIsPaletteOpen(false);
  };

  const setAnswer = (questionId: number, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleReview = (questionId: number) => {
    setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const togglePalette = () => setIsPaletteOpen(prev => !prev);
  const submitExam = () => setIsSubmitted(true);

  return {
    exam,
    isLoading,
    currentPart,
    currentQuestion,
    currentPartIndex,
    currentQuestionIndex,
    timeLeft,
    selectedAnswers,
    markedForReview,
    totalQuestionsCount,
    answeredCount,
    correctCount,
    isPaletteOpen,
    isSubmitted,
    handleNext,
    handlePrev,
    jumpToQuestion,
    setAnswer,
    toggleReview,
    togglePalette,
    submitExam,
    isFirst: currentPartIndex === 0 && currentQuestionIndex === 0,
    isLast: exam ? (currentPartIndex === exam.parts.length - 1 && currentQuestionIndex === (exam.parts[currentPartIndex]?.questions.length - 1)) : false
  };
};
