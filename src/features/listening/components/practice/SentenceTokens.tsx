import type { IndexedToken } from '../../utils/listeningText';

interface SentenceTokensProps {
  tokens: IndexedToken[];
  hiddenWordIndexes: Set<number>;
  revealedWordIndexes: Set<number>;
  onRevealWord: (wordIndex: number) => void;
}

export const SentenceTokens = ({
  tokens,
  hiddenWordIndexes,
  revealedWordIndexes,
  onRevealWord,
}: SentenceTokensProps) => (
  <div className="flex flex-wrap items-center gap-2.5">
    {tokens.map(({ token, tokenIndex, wordIndex }) => {
      const shouldHide = wordIndex !== null && hiddenWordIndexes.has(wordIndex) && !revealedWordIndexes.has(wordIndex);
      const isRevealed = wordIndex !== null && revealedWordIndexes.has(wordIndex);

      if (wordIndex === null) {
        return <span key={`${token}-${tokenIndex}`}>{token}</span>;
      }

      return shouldHide ? (
        <button
          key={`${token}-${tokenIndex}`}
          type="button"
          onClick={() => onRevealWord(wordIndex)}
          className="inline-flex min-h-9 min-w-[64px] rounded-md bg-[#dfe5ee] transition hover:bg-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
          aria-label={`Reveal ${token}`}
        />
      ) : (
        <span key={`${token}-${tokenIndex}`} className={isRevealed ? 'rounded-md bg-emerald-100 px-3 py-2 text-emerald-800' : ''}>
          {token}
        </span>
      );
    })}
  </div>
);
