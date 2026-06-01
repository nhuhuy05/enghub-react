import { useRef } from 'react';
import type { IndexedToken } from '../../utils/listeningText';

interface DictationInlineSentenceProps {
  tokens: IndexedToken[];
  hiddenWordIndexes: Set<number>;
  answers: Record<number, string>;
  fullAnswer: string;
  isFullHidden: boolean;
  onChange: (wordIndex: number, value: string) => void;
  onFullChange: (value: string) => void;
}

export const DictationInlineSentence = ({
  tokens,
  hiddenWordIndexes,
  answers,
  fullAnswer,
  isFullHidden,
  onChange,
  onFullChange,
}: DictationInlineSentenceProps) => {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const hiddenIndexes = Array.from(hiddenWordIndexes).sort((a, b) => a - b);

  if (isFullHidden) {
    return (
      <div className="mt-3 rounded-xl bg-[#f7f9fc] px-3 py-2.5">
        <textarea
          value={fullAnswer}
          onChange={(event) => onFullChange(event.target.value)}
          className="min-h-[78px] w-full resize-none rounded-lg bg-[#dfe5ee] px-3 py-2.5 font-mono text-sm outline-none transition placeholder:text-[#94a3b8] focus:ring-2 focus:ring-cyan-100"
          placeholder="Nhập toàn bộ câu nghe được..."
          aria-label="Full dictation answer"
        />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f9fc] px-3 py-2.5 text-sm">
      {tokens.map(({ token, tokenIndex, wordIndex }) => {
        if (wordIndex === null) {
          return <span key={`${token}-${tokenIndex}`}>{token}</span>;
        }

        const currentWordIndex = wordIndex;
        const isHidden = hiddenWordIndexes.has(currentWordIndex);
        const currentHiddenPosition = hiddenIndexes.indexOf(currentWordIndex);
        const nextHiddenIndex = hiddenIndexes[currentHiddenPosition + 1];

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
              if (event.key !== ' ') return;
              event.preventDefault();
              if (nextHiddenIndex === undefined) return;
              inputRefs.current[nextHiddenIndex]?.focus();
            }}
            className="h-8 max-w-[124px] min-w-[72px] rounded-md bg-white px-2 text-center font-mono text-sm outline-none transition focus:ring-2 focus:ring-cyan-100"
            placeholder={'•'.repeat(Math.min(8, Math.max(3, token.length)))}
            aria-label={`Word ${currentWordIndex + 1}`}
          />
        );
      })}
    </div>
  );
};
