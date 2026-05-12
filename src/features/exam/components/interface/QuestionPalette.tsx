import React from 'react';
import { X, Flag } from 'lucide-react';
import type { ExamDetail } from '../../types';

interface QuestionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamDetail;
  selectedAnswers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  currentPartIndex: number;
  currentQuestionIndex: number;
  onJump: (partIndex: number, questionIndex: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  isOpen,
  onClose,
  exam,
  selectedAnswers,
  markedForReview,
  currentPartIndex,
  currentQuestionIndex,
  onJump
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm transition-all">
      <div 
        className="h-full w-[400px] bg-white shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <h2 className="text-lg font-bold text-gray-800">Danh sách câu hỏi</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-4 border-b border-gray-50 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#004ac6]" />
            <span className="text-[11px] font-bold text-gray-500">Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-[11px] font-bold text-gray-500">Đánh dấu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
            <span className="text-[11px] font-bold text-gray-500">Chưa làm</span>
          </div>
        </div>

        <div className="h-[calc(100%-8.5rem)] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="space-y-8">
            {exam.parts.map((part, pIdx) => (
              <div key={part.id}>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[#004ac6] flex items-center gap-2">
                  {part.name}
                  <div className="h-px flex-1 bg-blue-50" />
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {part.questions.map((question, qIdx) => {
                    const isCurrent = currentPartIndex === pIdx && currentQuestionIndex === qIdx;
                    
                    // Logic to check if all subquestions or the question itself is answered
                    const qIds = question.subQuestions ? question.subQuestions.map(sq => sq.id) : [question.id];
                    const isAnswered = qIds.every(id => !!selectedAnswers[id]);
                    const isMarked = markedForReview[question.id];

                    return (
                      <button
                        key={question.id}
                        onClick={() => onJump(pIdx, qIdx)}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold transition-all hover:scale-105 active:scale-95 ${
                          isCurrent 
                            ? 'border-[#004ac6] bg-blue-50 text-[#004ac6] ring-2 ring-[#004ac6] ring-offset-1' 
                            : isAnswered
                              ? 'border-[#004ac6] bg-[#004ac6] text-white'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-[#004ac6]'
                        }`}
                      >
                        {question.id}
                        {isMarked && (
                          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500 border border-white shadow-sm flex items-center justify-center">
                            <Flag className="h-1.5 w-1.5 text-white fill-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
