import { useEffect, useMemo, useState } from 'react';
import { listeningService } from '../services/listeningService';
import type { ListeningHintLevel, ListeningMode, ListeningSession, RevealAmount } from '../types';
import { getSentenceWords } from '../utils/listeningText';

export const useListeningSession = (testId: string, partId: string) => {
  const [session, setSession] = useState<ListeningSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ListeningMode>('check');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<ListeningHintLevel>(50);
  const [revealedWordIndexes, setRevealedWordIndexes] = useState<number[]>([]);
  const [dictationWordAnswers, setDictationWordAnswers] = useState<Record<string, Record<number, string>>>({});
  const [dictationFullAnswers, setDictationFullAnswers] = useState<Record<string, string>>({});
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setRevealedWordIndexes([]);
        const data = await listeningService.getSession(testId, partId);
        setSession(data);
        setActiveGroupId(data.groups[0]?.id || null);
        setActiveSentenceId(data.groups[0]?.sentences[0]?.id || null);
      } catch {
        setError('Không thể tải bài luyện nghe.');
      } finally {
        setIsLoading(false);
      }
    };

    if (testId && partId) fetchSession();
  }, [partId, testId]);

  const flatSentences = useMemo(() => {
    if (!session) return [];
    return session.groups.flatMap((group, groupIndex) =>
      group.sentences.map((sentence, sentenceIndex) => ({
        group,
        sentence,
        groupIndex,
        sentenceIndex,
      })),
    );
  }, [session]);

  const activeItem = useMemo(() => {
    return flatSentences.find((item) => item.sentence.id === activeSentenceId) || flatSentences[0] || null;
  }, [activeSentenceId, flatSentences]);

  const activeGroup = activeItem?.group || null;
  const activeSentence = activeItem?.sentence || null;
  const currentSentenceNumber = activeItem ? activeItem.sentenceIndex + 1 : 0;
  const totalSentencesInGroup = activeGroup?.sentences.length || 0;

  const completedCount = useMemo(() => {
    if (!activeGroup) return 0;
    return activeGroup.sentences.filter((sentence) => sentence.completed).length;
  }, [activeGroup]);

  const selectSentence = (groupId: string, sentenceId: string) => {
    setActiveGroupId(groupId);
    setActiveSentenceId(sentenceId);
    setRevealedWordIndexes([]);
  };

  const goToOffset = (offset: number) => {
    if (!activeSentence) return;
    const currentIndex = flatSentences.findIndex((item) => item.sentence.id === activeSentence.id);
    const nextItem = flatSentences[currentIndex + offset];
    if (!nextItem) return;
    selectSentence(nextItem.group.id, nextItem.sentence.id);
  };

  const revealWords = (amount: RevealAmount, candidateIndexes?: number[]) => {
    if (!activeSentence) return;
    const sentenceWords = getSentenceWords(activeSentence.text);
    const sourceIndexes = candidateIndexes || sentenceWords.map((_, index) => index);
    const indexesToReveal =
      amount === 'all' ? sourceIndexes : sourceIndexes.slice(0, amount);
    setRevealedWordIndexes((prev) => Array.from(new Set([...prev, ...indexesToReveal])));
  };

  const revealWord = (wordIndex: number) => {
    setRevealedWordIndexes((prev) => Array.from(new Set([...prev, wordIndex])));
  };

  const resetReveal = () => setRevealedWordIndexes([]);

  const setDictationWordAnswer = (sentenceId: string, wordIndex: number, answer: string) => {
    setDictationWordAnswers((prev) => ({
      ...prev,
      [sentenceId]: {
        ...(prev[sentenceId] || {}),
        [wordIndex]: answer,
      },
    }));
  };

  const setDictationFullAnswer = (sentenceId: string, answer: string) => {
    setDictationFullAnswers((prev) => ({
      ...prev,
      [sentenceId]: answer,
    }));
  };

  return {
    session,
    isLoading,
    error,
    mode,
    setMode,
    activeGroupId,
    activeSentenceId,
    activeGroup,
    activeSentence,
    currentSentenceNumber,
    totalSentencesInGroup,
    completedCount,
    hintLevel,
    setHintLevel,
    revealedWordIndexes,
    revealWords,
    revealWord,
    resetReveal,
    dictationWordAnswers,
    dictationFullAnswers,
    isTranscriptVisible,
    setIsTranscriptVisible,
    selectSentence,
    goPrev: () => goToOffset(-1),
    goNext: () => goToOffset(1),
    setDictationWordAnswer,
    setDictationFullAnswer,
  };
};
