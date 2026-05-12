import React from 'react';
import { List, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ExamFooterProps {
  isMarked: boolean;
  onToggleReview: () => void;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  onTogglePalette: () => void;
}

export const ExamFooter: React.FC<ExamFooterProps> = ({
  isMarked,
  onToggleReview,
  onPrev,
  onNext,
  isFirst,
  isLast,
  onTogglePalette
}) => {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6">
      <label className="flex cursor-pointer items-center gap-3 group select-none">
        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
          isMarked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-500'
        }`}>
          {isMarked && <CheckCircle2 className="h-3 w-3 text-white" />}
        </div>
        <input 
          type="checkbox" 
          className="hidden" 
          checked={isMarked}
          onChange={onToggleReview}
        />
        <span className="text-[13px] font-bold text-gray-600">Mark item for review</span>
      </label>

      <div className="flex items-center gap-4">
        <button 
          onClick={onTogglePalette}
          className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <List className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 bg-[#f0f2f5] p-1 rounded-xl">
          <button 
            onClick={onPrev}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#004ac6] text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#003896] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={isFirst}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={onNext}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#004ac6] text-white shadow-lg shadow-blue-200 active:scale-95 transition-all hover:bg-[#003896] disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={isLast}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
