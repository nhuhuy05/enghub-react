import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../../types';

interface RightPanelProps {
  question: Question;
  selectedAnswers: Record<number, string>;
  onSelectAnswer: (questionId: number, answer: string) => void;
  shouldShowFeedback: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  question, 
  selectedAnswers, 
  onSelectAnswer,
  shouldShowFeedback,
}) => {
  const renderFeedback = (qId: number, correctAnswer?: string, explanation?: string) => {
    const selectedAnswer = selectedAnswers[qId];
    if (!shouldShowFeedback || !selectedAnswer || !correctAnswer) return null;

    const isCorrect = selectedAnswer === correctAnswer;

    return (
      <div className={`mt-3 rounded-lg border p-3 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <p className={`flex items-center gap-2 text-sm font-black ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
          {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {isCorrect ? 'Chính xác' : `Chưa đúng. Đáp án đúng là ${correctAnswer}`}
        </p>
        {explanation && <p className="mt-1.5 text-xs leading-5 text-[#334155]">{explanation}</p>}
      </div>
    );
  };

  const renderOptions = (qId: number, options: string[], correctAnswer?: string, explanation?: string) => {
    const selectedAnswer = selectedAnswers[qId];
    const showQuestionFeedback = shouldShowFeedback && Boolean(selectedAnswer);

    return (
      <div>
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = showQuestionFeedback && option === correctAnswer;

            return (
              <button
                key={option}
                onClick={() => onSelectAnswer(qId, option)}
                disabled={showQuestionFeedback}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  isCorrectOption
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : isSelected
                      ? 'border-[#004ac6] bg-blue-50 text-[#004ac6] ring-1 ring-[#004ac6]'
                      : 'border-gray-200 text-gray-600 hover:border-[#004ac6] hover:bg-gray-50'
                } disabled:cursor-default`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCorrectOption
                    ? 'border-emerald-500 bg-emerald-500'
                    : isSelected
                      ? 'border-[#004ac6] bg-[#004ac6]'
                      : 'border-gray-300'
                }`}>
                  {(isSelected || isCorrectOption) && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                {option}
              </button>
            );
          })}
        </div>
        {renderFeedback(qId, correctAnswer, explanation)}
      </div>
    );
  };

  return (
    <div className="flex w-1/2 flex-col overflow-hidden rounded-xl border border-[#d1d5db] bg-white shadow-sm">
      <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-6 py-3">
        <h3 className="text-base font-bold text-gray-700">Question</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-10">
          {!question.subQuestions ? (
            <div className="space-y-6">
              {question.type === 'text_only' ? (
                <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                   <p className="text-[17px] font-medium leading-relaxed text-gray-800">
                    <span className="font-bold text-[#004ac6] mr-2">{question.id}.</span>
                    {question.text}
                  </p>
                </div>
              ) : (
                <p className="text-[15px] font-bold text-gray-800">{question.id}. Choose the best answer</p>
              )}
              {renderOptions(question.id, question.options || [], question.correctAnswer, question.explanation)}
            </div>
          ) : (
            question.subQuestions.map((sq) => (
              <div key={sq.id} className="space-y-4 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <p className="text-[15px] font-bold text-gray-800">{sq.id}. {sq.text}</p>
                {renderOptions(sq.id, sq.options, sq.correctAnswer, sq.explanation)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
