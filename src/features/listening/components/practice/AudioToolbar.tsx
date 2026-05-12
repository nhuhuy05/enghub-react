import { ChevronLeft, ChevronRight, FileText, Flag, Play, RotateCcw } from 'lucide-react';

interface AudioToolbarProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export const AudioToolbar = ({ current, total, onPrev, onNext }: AudioToolbarProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3.5 text-[#0f172a]">
      <button onClick={onPrev} className="text-[#94a3b8] hover:text-[#173b68]">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button className="hover:text-[#0ea5e9]">
        <Play className="h-4 w-4" />
      </button>
      <button onClick={onNext} className="hover:text-[#173b68]">
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="text-sm text-[#526985]">{current} / {total}</span>
      <span className="text-sm font-bold">1x</span>
      <RotateCcw className="h-4 w-4" />
    </div>
    <div className="flex items-center gap-4 text-[#0f172a]">
      <Flag className="h-4 w-4" />
      <FileText className="h-4 w-4" />
    </div>
  </div>
);
