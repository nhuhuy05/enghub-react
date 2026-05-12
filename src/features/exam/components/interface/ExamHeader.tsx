import React from 'react';
import { Volume2, Clock, ChevronLeft } from 'lucide-react';

interface ExamHeaderProps {
  partName: string;
  currentQuestionId: number;
  totalQuestions: number;
  answeredCount: number;
  timeLeft: number;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitted: boolean;
  showSubmit?: boolean;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({ 
  partName, 
  currentQuestionId, 
  totalQuestions, 
  answeredCount, 
  timeLeft,
  onBack,
  onSubmit,
  isSubmitted,
  showSubmit = true,
}) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-[#001529] px-6 text-white shadow-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="mr-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white/70" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-white">
            Eng<span className="text-[#2563eb]">Hub</span>
          </span>
        </div>
        <div className="h-6 w-px bg-white/20 ml-2" />
        <h1 className="text-[15px] font-semibold tracking-tight text-white/90">
          {partName}: Question {currentQuestionId} of {totalQuestions}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
          <Volume2 className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 border border-white/10">
          <span className="text-sm font-bold text-white/90">{answeredCount}/{totalQuestions}</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-[#004ac6] px-4 py-1.5 border border-white/20">
          <Clock className="h-4 w-4 text-blue-200" />
          <span className="font-mono text-lg font-bold tabular-nums text-white">
            {formatTime(timeLeft)}
          </span>
        </div>

        {showSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitted}
            className="rounded-md bg-[#f29d38] px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e08b2a] active:scale-95 disabled:cursor-default disabled:opacity-60"
          >
            {isSubmitted ? 'Submitted' : 'Submit'}
          </button>
        )}
      </div>
    </header>
  );
};
