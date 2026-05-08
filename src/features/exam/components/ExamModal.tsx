import React, { useState } from 'react';
import { X, Check, FileText, NotebookText, Clock4, Info } from 'lucide-react';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle: string;
}

type ExamMode = 'exam' | 'practice';

export const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, examTitle }) => {
  const [activeMode, setActiveMode] = useState<ExamMode>('exam');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  if (!isOpen) return null;

  const togglePart = (part: string) => {
    setSelectedParts(prev => 
      prev.includes(part) 
        ? prev.filter(p => p !== part) 
        : [...prev, part]
    );
  };

  const toggleAll = () => {
    if (selectedParts.length === 7) {
      setSelectedParts([]);
    } else {
      setSelectedParts(['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5', 'Part 6', 'Part 7']);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-white shadow-2xl transition-all duration-300 transform scale-100">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-5 shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#191b23]">Chọn chế độ luyện tập</h2>
            <p className="mt-0.5 flex items-center gap-2 text-[13px] font-medium text-[#505f76]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#004ac6]"></span>
              {examTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#737686] transition-all hover:bg-red-50 hover:text-red-500"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="px-6 pb-5 overflow-y-auto custom-scrollbar">
          {/* Mode Switcher */}
          <div className="mb-4 flex rounded-2xl bg-[#f3f3fe] p-1 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('exam')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${
                activeMode === 'exam'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#64748b] hover:bg-white/50 hover:text-[#475569]'
              }`}
            >
              <FileText className={`h-4 w-4 ${activeMode === 'exam' ? 'text-[#004ac6]' : 'text-[#94a3b8]'}`} />
              Luyện thi
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('practice')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${
                activeMode === 'practice'
                  ? 'bg-white text-[#004ac6] shadow-sm'
                  : 'text-[#64748b] hover:bg-white/50 hover:text-[#475569]'
              }`}
            >
              <NotebookText className={`h-4 w-4 ${activeMode === 'practice' ? 'text-[#004ac6]' : 'text-[#94a3b8]'}`} />
              Luyện tập
            </button>
          </div>

          {/* Mode Description */}
          <div className={`mb-4 flex gap-3 rounded-xl border p-3 transition-colors duration-300 shrink-0 ${
            activeMode === 'exam' 
              ? 'border-blue-100 bg-blue-50' 
              : 'border-orange-100 bg-orange-50'
          }`}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              activeMode === 'exam' ? 'bg-blue-200 text-blue-600' : 'bg-orange-200 text-orange-600'
            }`}>
              <Info className="h-3.5 w-3.5" />
            </div>
            <p className={`text-[13px] leading-snug ${activeMode === 'exam' ? 'text-[#2563eb]' : 'text-orange-700'}`}>
              <span className="font-bold">{activeMode === 'exam' ? 'Luyện thi:' : 'Luyện tập:'}</span>{' '}
              {activeMode === 'exam' 
                ? 'Làm bài thi thật 200 câu trong 120 phút.'
                : 'Tùy chọn từng Part, xem giải thích ngay.'}
            </p>
          </div>

          {/* Selection Area */}
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                
                <h3 className="text-base font-bold text-[#191b23]">
                  {activeMode === 'exam' ? 'Thông tin bài thi' : 'Chọn Part'}
                </h3>
              </div>
              <button
                type="button"
                disabled={activeMode === 'practice' && selectedParts.length === 0}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-all ${
                  activeMode === 'practice' && selectedParts.length === 0
                    ? 'cursor-not-allowed bg-[#9ca3af] opacity-60'
                    : 'bg-[#004ac6] shadow-lg shadow-blue-200 hover:bg-[#003896] active:scale-95'
                }`}
              >
                Bắt đầu
              </button>
            </div>

            {activeMode === 'exam' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#fafafa] p-2.5 text-center border border-gray-100">
                    <Clock4 className="mx-auto mb-1 h-4 w-4 text-[#004ac6]" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">Thời gian</p>
                    <p className="text-base font-bold text-[#191b23]">120 phút</p>
                  </div>
                  <div className="rounded-xl bg-[#fafafa] p-2.5 text-center border border-gray-100">
                    <FileText className="mx-auto mb-1 h-4 w-4 text-[#004ac6]" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#9ca3af]">Số câu hỏi</p>
                    <p className="text-base font-bold text-[#191b23]">200 câu</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-[#cbd5e1] p-3">
                  <p className="text-center text-[13px] text-[#505f76] leading-snug">
                    Bài thi gồm 7 phần. Hãy chuẩn bị môi trường yên tĩnh.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label 
                  onClick={toggleAll}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-3 transition-all hover:bg-[#dbeafe]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                      selectedParts.length === 7 ? 'border-[#004ac6] bg-[#004ac6]' : 'border-[#004ac6] bg-white'
                    }`}>
                      {selectedParts.length === 7 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-bold text-[#374151]">Chọn tất cả 7 Part</span>
                  </div>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#004ac6] shadow-sm">200 câu</span>
                </label>

                <div className="mb-4">
                  <h4 className="mb-2 pl-1 text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Listening</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      ['Part 1', '6 câu', 'Hình ảnh'],
                      ['Part 2', '25 câu', 'Hỏi & Đáp'],
                      ['Part 3', '39 câu', 'Hội thoại'],
                      ['Part 4', '30 câu', 'Bài nói'],
                    ].map(([part, count, desc]) => (
                      <label 
                        key={part} 
                        onClick={() => togglePart(part)}
                        className={`group flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-all hover:shadow-sm ${
                          selectedParts.includes(part) ? 'border-[#004ac6] bg-blue-50/50' : 'border-[#e5e7eb] bg-[#fafafa] hover:border-[#004ac6]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                            selectedParts.includes(part) ? 'border-[#004ac6] bg-[#004ac6]' : 'border-[#e5e7eb] group-hover:border-[#004ac6]'
                          }`}>
                            {selectedParts.includes(part) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className={`block text-[13px] font-bold transition-colors ${
                              selectedParts.includes(part) ? 'text-[#004ac6]' : 'text-[#374151] group-hover:text-[#004ac6]'
                            }`}>{part}</span>
                            <span className="text-[9px] text-[#9ca3af]">{desc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-[#9ca3af] group-hover:text-[#505f76]">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 pl-1 text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Reading</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      ['Part 5', '30 câu', 'Hoàn thành câu'],
                      ['Part 6', '16 câu', 'Đoạn văn'],
                      ['Part 7', '54 câu', 'Đọc hiểu'],
                    ].map(([part, count, desc]) => (
                      <label 
                        key={part} 
                        onClick={() => togglePart(part)}
                        className={`group flex cursor-pointer items-center justify-between rounded-lg border p-2.5 transition-all hover:shadow-sm ${
                          selectedParts.includes(part) ? 'border-[#004ac6] bg-blue-50/50' : 'border-[#e5e7eb] bg-[#fafafa] hover:border-[#004ac6]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                            selectedParts.includes(part) ? 'border-[#004ac6] bg-[#004ac6]' : 'border-[#e5e7eb] group-hover:border-[#004ac6]'
                          }`}>
                            {selectedParts.includes(part) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className={`block text-[13px] font-bold transition-colors ${
                              selectedParts.includes(part) ? 'text-[#004ac6]' : 'text-[#374151] group-hover:text-[#004ac6]'
                            }`}>{part}</span>
                            <span className="text-[9px] text-[#9ca3af]">{desc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-[#9ca3af] group-hover:text-[#505f76]">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
