import React from 'react';
import type { Question } from '../../types';

interface RightPanelProps {
  question: Question;
  selectedAnswers: Record<number, string>;
  onSelectAnswer: (questionId: number, answer: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  question, 
  selectedAnswers, 
  onSelectAnswer 
}) => {
  const renderOptions = (qId: number, options: string[]) => (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelectAnswer(qId, option)}
          className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
            selectedAnswers[qId] === option
              ? 'border-[#004ac6] bg-blue-50 text-[#004ac6] ring-1 ring-[#004ac6]'
              : 'border-gray-200 hover:border-[#004ac6] hover:bg-gray-50 text-gray-600'
          }`}
        >
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selectedAnswers[qId] === option ? 'border-[#004ac6] bg-[#004ac6]' : 'border-gray-300'
          }`}>
            {selectedAnswers[qId] === option && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          {option}
        </button>
      ))}
    </div>
  );

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
              {renderOptions(question.id, question.options || [])}
            </div>
          ) : (
            question.subQuestions.map((sq) => (
              <div key={sq.id} className="space-y-4 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <p className="text-[15px] font-bold text-gray-800">{sq.id}. {sq.text}</p>
                {renderOptions(sq.id, sq.options)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
