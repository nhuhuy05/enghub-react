import { type ChangeEvent, useEffect, useRef } from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  minHeightClassName?: string;
}

export const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  minHeightClassName,
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`max-h-none ${minHeightClassName ?? ''} w-full resize-none overflow-hidden rounded-lg border border-[#d8dced] px-3 py-2 text-sm leading-6`}
    />
  );
};
