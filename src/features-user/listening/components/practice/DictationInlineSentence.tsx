import { useRef } from 'react';
import type { IndexedToken } from '../../utils/listeningText';

interface DictationInlineSentenceProps {
  tokens: IndexedToken[];
  hiddenWordIndexes: Set<number>;
  answers: Record<number, string>;
  fullAnswer: string;
  isFullHidden: boolean;
  correctWordIndexes: Set<number>;
  revealedWordIndexes: Set<number>;
  canGoNextOnEnter: boolean;
  onChange: (wordIndex: number, value: string) => void;
  onFullChange: (value: string) => void;
  onRevealNext: () => void;
  onNext: () => void;
}

export const DictationInlineSentence = ({
  tokens,
  hiddenWordIndexes,
  answers,
  fullAnswer,
  isFullHidden,
  correctWordIndexes,
  revealedWordIndexes,
  canGoNextOnEnter,
  onChange,
  onFullChange,
  onRevealNext,
  onNext,
}: DictationInlineSentenceProps) => {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const hiddenIndexes = Array.from(hiddenWordIndexes).sort((a, b) => a - b);

  const handleControlKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      onRevealNext();
      return;
    }

    if (event.key === 'Enter' && canGoNextOnEnter) {
      event.preventDefault();
      onNext();
    }
  };

  if (isFullHidden) {
    return (
      <div className="mt-3 rounded-xl bg-[#f6f7fc] px-3 py-2.5">
        <textarea
          value={fullAnswer}
          onChange={(event) => onFullChange(event.target.value)}
          onKeyDown={handleControlKey}
          className="min-h-[78px] w-full resize-none rounded-lg border border-[#d8dced] bg-white px-3 py-2.5 text-sm font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#004ac6] focus:ring-2 focus:ring-[#eaf0ff]"
          placeholder="Nhập toàn bộ câu nghe được..."
          aria-label="Full dictation answer"
        />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#f6f7fc] px-3 py-2.5 text-sm font-medium text-[#111827]">
      {tokens.map(({ token, tokenIndex, wordIndex }) => {
        if (wordIndex === null) {
          return <span key={`${token}-${tokenIndex}`}>{token}</span>;
        }

        const currentWordIndex = wordIndex;
        const isHidden = hiddenWordIndexes.has(currentWordIndex);
        const currentHiddenPosition = hiddenIndexes.indexOf(currentWordIndex);
        const nextHiddenIndex = hiddenIndexes[currentHiddenPosition + 1];
        const shouldShowWord = correctWordIndexes.has(currentWordIndex) || revealedWordIndexes.has(currentWordIndex);

        if (!isHidden) {
          return <span key={`${token}-${tokenIndex}`}>{token}</span>;
        }

        return (
          <input
            key={`${token}-${tokenIndex}`}
            ref={(element) => {
              inputRefs.current[currentWordIndex] = element;
            }}
            value={answers[currentWordIndex] || ''}
            onChange={(event) => onChange(currentWordIndex, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === ' ') {
                event.preventDefault();
                if (nextHiddenIndex === undefined) return;
                inputRefs.current[nextHiddenIndex]?.focus();
                return;
              }

              handleControlKey(event);
            }}
            className={`h-8 max-w-[124px] min-w-[72px] rounded-md border border-[#d8dced] bg-white px-2 text-center text-sm font-semibold text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#173b68] focus:ring-2 focus:ring-[#e8eef6] ${
              shouldShowWord ? 'border-emerald-300 bg-white' : ''
            }`}
            placeholder={'\u2022'.repeat(Math.max(1, token.length))}
            aria-label={`Word ${currentWordIndex + 1}`}
          />
        );
      })}
    </div>
  );
};
