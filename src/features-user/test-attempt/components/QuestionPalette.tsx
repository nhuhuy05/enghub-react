import { X } from 'lucide-react';
import type { AttemptPart } from '../types';

interface QuestionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestionId: number | null;
  answers: Record<number, number | null>;
  markedQuestions: Record<number, boolean>;
  onSelect: (questionId: number) => void;
  parts: AttemptPart[];
}

export const QuestionPalette = ({
  isOpen,
  onClose,
  activeQuestionId,
  answers,
  markedQuestions,
  onSelect,
  parts,
}: QuestionPaletteProps) => (
  <>
    <div
      className={`fixed inset-0 z-40 bg-[#1e293b]/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={onClose}
    />

    <div
      className={`fixed right-0 top-0 z-50 flex h-screen w-[340px] flex-col bg-[#f8f9fa] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex shrink-0 items-center justify-between bg-[#1e293b] px-5 py-4 text-white">
        <h2 className="text-lg font-bold">Danh sách câu hỏi</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 transition-colors hover:text-white"
          aria-label="Đóng danh sách câu hỏi"
          title="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="shrink-0 border-b border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-medium text-[#374151]">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-[#1d4ed8] bg-[#3b82f6]"></div>
            Câu hiện tại
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-white"></div>
            Chưa trả lời
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-[#ecfdf3]"></div>
            Đã trả lời
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-[#f59e0b] bg-white"></div>
            Đã đánh dấu
          </div>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        <div className="space-y-6">
          {parts.map((part) => (
            <div key={part.partNumber}>
              <p className="mb-3 font-bold text-[#374151]">
                Part {part.partNumber} ({part.groups.reduce((acc, g) => acc + g.questions.length, 0)} câu)
              </p>
              <div className="flex flex-wrap gap-2">
                {part.groups.flatMap((group) =>
                  group.questions.map((question) => {
                    const selected = typeof answers[question.id] === 'number';
                    const marked = Boolean(markedQuestions[question.id]);
                    const active = activeQuestionId === question.id;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onSelect(question.id)}
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-all ${
                          marked ? 'border-[#f59e0b]' : active ? 'border-[#1d4ed8]' : 'border-gray-300'
                        } ${
                          active ? 'bg-[#3b82f6] text-white' : selected ? 'bg-[#ecfdf3] text-[#374151]' : 'bg-white text-[#374151] hover:bg-gray-50'
                        }`}
                      >
                        {question.questionNumber}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);
