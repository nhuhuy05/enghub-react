import { type ChangeEvent, useEffect, useRef } from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  minHeightClassName?: string;
  isWriting?: boolean;
}

export const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  minHeightClassName,
  isWriting = false,
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`max-h-none ${minHeightClassName ?? ''} w-full resize-none overflow-hidden rounded-lg border border-[#d8dced] px-3 py-2 text-sm leading-6 ${
          isWriting ? 'border-[#b2ccff] bg-[#f8fbff] text-transparent caret-transparent placeholder:text-transparent' : ''
        }`}
      />
      {isWriting && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg border border-[#b2ccff] bg-[#f7faff]/95 px-3 py-2">
          <div className="flex h-full min-h-[40px] flex-col justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7a5af8] [animation-delay:-0.24s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9b8afb] [animation-delay:-0.12s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#84caff]" />
              <span className="ml-1.5 text-xs font-bold text-[#475467]">Đang tạo...</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-[88%] animate-pulse rounded-full bg-[#e4eaf8]" />
              <div className="h-2 w-[58%] animate-pulse rounded-full bg-[#edf2ff]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
