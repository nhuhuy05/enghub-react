import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Headphones, Loader2, RotateCcw } from 'lucide-react';
import type { ListeningMode, RevealAmount } from '../types';
import { useListeningSession } from '../hooks/useListeningSession';
import { getHiddenWordIndexes, getIndexedTokens, normalizeWords, splitSentence } from '../utils/listeningText';
import {
  AnswerTokens,
  AudioToolbar,
  DictationInlineSentence,
  FullModePanel,
  HintTabs,
  SentenceTokens,
  ShortcutHint,
} from './practice';

const modes: Array<{ id: ListeningMode; label: string }> = [
  { id: 'check', label: 'Nghe Check' },
  { id: 'dictation', label: 'Nghe Chép' },
  { id: 'full', label: 'Nghe Full' },
];

const revealOptions: Array<{ value: RevealAmount; label: string }> = [
  { value: 1, label: '1 từ' },
  { value: 2, label: '2 từ' },
  { value: 3, label: '3 từ' },
  { value: 'all', label: 'Tất cả' },
];

export const ListeningPracticePage = () => {
  const { testId = 'ets-2026-test-1', partId = 'part-1' } = useParams<{
    testId: string;
    partId: string;
  }>();
  const navigate = useNavigate();
  const {
    session,
    isLoading,
    error,
    mode,
    setMode,
    activeGroupId,
    activeSentenceId,
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
    goPrev,
    goNext,
    setDictationWordAnswer,
    setDictationFullAnswer,
  } = useListeningSession(testId, partId);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-[#505f76]">Đang chuẩn bị bài nghe...</p>
      </div>
    );
  }

  if (error || !session || !activeSentence) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-500">{error || 'Không tìm thấy bài nghe'}</h2>
        <button onClick={() => navigate('/listening')} className="rounded-xl bg-[#004ac6] px-6 py-2 font-bold text-white">
          Quay lại
        </button>
      </div>
    );
  }

  const indexedTokens = getIndexedTokens(activeSentence.text);
  const sentenceWords = indexedTokens
    .filter((item) => item.wordIndex !== null && item.normalized)
    .map((item) => item.normalized as string);
  const wordIndexesToHide = getHiddenWordIndexes(sentenceWords, hintLevel);
  const revealedIndexes = new Set(revealedWordIndexes);
  const revealedAll = Array.from(wordIndexesToHide).every((wordIndex) => revealedIndexes.has(wordIndex));
  const dictationAnswers = dictationWordAnswers[activeSentence.id] || {};
  const dictationFullAnswer = dictationFullAnswers[activeSentence.id] || '';
  const dictationTargetIndexes = hintLevel === 100
    ? sentenceWords.map((_, index) => index)
    : Array.from(wordIndexesToHide).sort((a, b) => a - b);
  const fullAnswerWords = normalizeWords(dictationFullAnswer);
  const dictationCorrectWords = dictationTargetIndexes.reduce((count, wordIndex, targetIndex) => {
    const answer = hintLevel === 100
      ? fullAnswerWords[targetIndex] || ''
      : normalizeWords(dictationAnswers[wordIndex] || '')[0] || '';
    return count + (answer === (sentenceWords[wordIndex] || '') ? 1 : 0);
  }, 0);
  const dictationAccuracy = dictationTargetIndexes.length
    ? Math.round((dictationCorrectWords / dictationTargetIndexes.length) * 100)
    : 0;
  const dictationResultWords = dictationTargetIndexes.map((wordIndex) => sentenceWords[wordIndex] || '');
  const answerTokens = splitSentence(activeSentence.text);
  const totalSessionSentences = session.groups.reduce((total, group) => total + group.sentences.length, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 flex flex-col overflow-hidden bg-[#f6f8fb] text-[#0f172a]">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-[#dbe3ef] bg-white/90">
        <div className="rounded-lg bg-[#f1f5f9] p-0.5">
          {modes.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                mode === item.id ? 'bg-[#173b68] text-white shadow' : 'text-[#526985] hover:text-[#173b68]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto grid min-h-0 w-full max-w-[1120px] flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-[#dbe3ef] bg-white/70 px-3.5 py-3.5">
          <div className="mb-3">
            <h1 className="truncate text-base font-black">{session.title}</h1>
            <p className="mt-1 text-sm text-[#526985]">{session.groups.length} bài • {totalSessionSentences} câu</p>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain border-t border-[#e5edf6] pt-3 pr-1">
            {session.groups.map((group) => {
              const isOpen = group.id === activeGroupId;
              const groupDone = group.sentences.filter((sentence) => sentence.completed).length;
              return (
                <div key={group.id}>
                  <button
                    onClick={() => selectSentence(group.id, group.sentences[0].id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                      isOpen ? 'bg-[#18bd84] text-white' : 'text-[#0f172a] hover:bg-[#eef6fb]'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-black">
                      <ChevronRight className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-90' : ''}`} />
                      <Headphones className="h-4 w-4" />
                      {group.title}
                    </span>
                    <span className="text-xs font-bold">{isOpen ? completedCount : groupDone}/{group.sentences.length}</span>
                  </button>

                  {isOpen && (
                    <div className="ml-4 border-l-2 border-[#dbeafe] py-1 pl-2">
                      {group.sentences.map((sentence, index) => {
                        const isActive = sentence.id === activeSentenceId;
                        return (
                          <button
                            key={sentence.id}
                            onClick={() => selectSentence(group.id, sentence.id)}
                            className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                              isActive ? 'bg-[#dff1fb] text-[#0ea5e9]' : 'text-[#526985] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                              isActive ? 'bg-[#0ea5e9] text-white' : 'bg-white text-[#526985]'
                            }`}>
                              {index + 1}
                            </span>
                            {session.partId === 'part-1' || session.partId === 'part-2' ? `Câu nói ${index + 1}` : `Câu ${index + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="h-full min-h-0 overflow-y-auto overscroll-contain px-3 py-3 lg:px-4">
          {mode !== 'full' ? (
            <section className="max-w-[820px] rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
              <AudioToolbar
                current={currentSentenceNumber}
                total={totalSentencesInGroup}
                onPrev={goPrev}
                onNext={goNext}
              />

              {mode === 'check' && (
                <>
                  <HintTabs value={hintLevel} onChange={setHintLevel} />
                  <div className="mt-3 rounded-xl bg-[#f7f9fc] px-3.5 py-3 text-[15px] leading-6">
                    <SentenceTokens
                      tokens={indexedTokens}
                      hiddenWordIndexes={wordIndexesToHide}
                      revealedWordIndexes={revealedIndexes}
                      onRevealWord={revealWord}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {revealOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => revealWords(option.value, dictationTargetIndexes)}
                        className="rounded-lg border border-[#dbe3ef] px-3 py-1.5 text-xs font-bold text-[#526985] hover:border-[#0ea5e9] hover:text-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={revealedAll}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button onClick={resetReveal} className="ml-1 flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold">
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                  {revealedAll && <AnswerTokens tokens={answerTokens} translation={activeSentence.translation} />}
                  <ShortcutHint text="Ctrl phát lại • Tab lật từ • Enter câu tiếp theo" />
                </>
              )}

              {mode === 'dictation' && (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#526985]">Ẩn từ:</span>
                    <HintTabs value={hintLevel} onChange={setHintLevel} compact />
                  </div>
                  <DictationInlineSentence
                    tokens={indexedTokens}
                    hiddenWordIndexes={wordIndexesToHide}
                    answers={dictationAnswers}
                    fullAnswer={dictationFullAnswer}
                    isFullHidden={hintLevel === 100}
                    onChange={(wordIndex, value) => setDictationWordAnswer(activeSentence.id, wordIndex, value)}
                    onFullChange={(value) => setDictationFullAnswer(activeSentence.id, value)}
                  />
                  <div className="mt-3 flex justify-between text-sm font-semibold text-[#526985]">
                    <span>{dictationCorrectWords} / {dictationTargetIndexes.length} từ đúng</span>
                    <span>{dictationAccuracy}%</span>
                  </div>
                  <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3">
                    {dictationResultWords.map((word, index) => (
                      <span key={`${word}-${index}`} className="mr-1.5 inline-flex rounded-md bg-[#eef2f7] px-2.5 py-1.5 text-sm font-bold tracking-widest text-[#526985]">
                        {'•'.repeat(Math.max(2, word.length))}
                      </span>
                    ))}
                  </div>
                  {dictationAccuracy === 100 && (
                    <>
                      <p className="mt-3 text-sm font-bold text-emerald-600">✓ Độ chính xác: 100%</p>
                      <AnswerTokens tokens={answerTokens} translation={activeSentence.translation} />
                    </>
                  )}
                  <ShortcutHint text="Ctrl phát lại • Tab gợi ý từ • Enter kiểm tra" />
                </>
              )}
            </section>
          ) : (
            <FullModePanel
              text={activeSentence.text}
              translation={activeSentence.translation}
              current={currentSentenceNumber}
              total={totalSentencesInGroup}
              visible={isTranscriptVisible}
              onToggleVisible={() => setIsTranscriptVisible(!isTranscriptVisible)}
              onPrev={goPrev}
              onNext={goNext}
              sentences={session.groups.find((group) => group.id === activeGroupId)?.sentences || []}
              activeSentenceId={activeSentence.id}
              onSelect={(sentenceId) => activeGroupId && selectSentence(activeGroupId, sentenceId)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

