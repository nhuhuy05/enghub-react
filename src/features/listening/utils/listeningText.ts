import type { ListeningHintLevel } from '../types';

export interface IndexedToken {
  token: string;
  tokenIndex: number;
  wordIndex: number | null;
  normalized: string | null;
}

export const splitSentence = (text: string) => text.match(/[\w']+|[^\w\s]/g) || [];

export const normalizeWords = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

export const getIndexedTokens = (text: string): IndexedToken[] => {
  let wordIndex = 0;

  return splitSentence(text).map((token, tokenIndex) => {
    const normalized = normalizeWords(token)[0] || null;

    if (!normalized) {
      return {
        token,
        tokenIndex,
        wordIndex: null,
        normalized: null,
      };
    }

    const item = {
      token,
      tokenIndex,
      wordIndex,
      normalized,
    };
    wordIndex += 1;
    return item;
  });
};

export const getSentenceWords = (text: string) => {
  return getIndexedTokens(text)
    .filter((item) => item.wordIndex !== null && item.normalized)
    .map((item) => item.normalized as string);
};

export const getHiddenWordIndexes = (words: string[], percent: ListeningHintLevel) => {
  const hiddenCount = Math.ceil((words.length * percent) / 100);

  return new Set(
    words
      .map((word, index) => ({
        index,
        score: ((index + 3) * 17 + word.length * 11) % 97,
      }))
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, hiddenCount)
      .map((item) => item.index),
  );
};
