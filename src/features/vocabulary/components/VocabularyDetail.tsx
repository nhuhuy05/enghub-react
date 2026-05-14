import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Loader2,
  Search,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useVocabularyDetail } from '../hooks/useVocabularyDetail';
import type { Word } from '../types';

type ViewMode = 'all_words' | 'flashcard';

const normalizeText = (value: string) => value.trim().toLowerCase();

export const VocabularyDetail = () => {
  const { id = 'business' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useVocabularyDetail(id);
  const [viewMode, setViewMode] = useState<ViewMode>('all_words');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>([]);

  const filteredWords = useMemo(() => {
    if (!data) return [];
    const query = normalizeText(searchQuery);
    if (!query) return data.words;

    return data.words.filter((word) => {
      return (
        word.term.toLowerCase().includes(query) ||
        word.definition.toLowerCase().includes(query) ||
        word.example.toLowerCase().includes(query) ||
        word.partOfSpeech.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  const currentWord = data?.words[currentWordIndex];
  const learnedCount = data?.words.filter((word) => learnedWordIds.includes(word.id)).length || 0;
  const learnedPercent = data?.words.length ? Math.round((learnedCount / data.words.length) * 100) : 0;

  const resetCard = () => setIsFlipped(false);

  const goToWord = (nextIndex: number) => {
    if (!data?.words.length) return;
    const normalizedIndex = (nextIndex + data.words.length) % data.words.length;
    setCurrentWordIndex(normalizedIndex);
    resetCard();
  };

  const markCurrentWord = () => {
    if (!currentWord) return;
    setLearnedWordIds((prev) => (prev.includes(currentWord.id) ? prev : [...prev, currentWord.id]));
    goToWord(currentWordIndex + 1);
  };

  const selectFlashcardWord = (word: Word) => {
    if (!data) return;
    const nextIndex = data.words.findIndex((item) => item.id === word.id);
    if (nextIndex < 0) return;
    setCurrentWordIndex(nextIndex);
    setViewMode('flashcard');
    resetCard();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F6F9FC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0057D9]" />
        <p className="font-bold text-[#52657A]">Đang tải bộ từ vựng...</p>
      </div>
    );
  }

  if (error || !data || !currentWord) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F6F9FC] px-4 text-center">
        <h2 className="text-xl font-black text-[#EF4444]">{error || 'Không tìm thấy bộ từ vựng'}</h2>
        <button onClick={() => navigate('/vocabulary')} className="rounded-xl bg-[#0057D9] px-5 py-2.5 text-sm font-black text-white">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#152033]">
      <header className="sticky top-16 z-20 border-b border-[#D8E3EE] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1200px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/vocabulary')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8E3EE] text-[#52657A] transition hover:border-[#0057D9] hover:text-[#0057D9]"
              aria-label="Quay lại danh sách từ vựng"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0057D9]">{data.category}</p>
              <h1 className="truncate text-xl font-black text-[#0F2747]">{data.title}</h1>
            </div>
          </div>

          <div className="flex rounded-xl bg-[#F1F7FB] p-1">
            <button
              type="button"
              onClick={() => setViewMode('all_words')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition ${
                viewMode === 'all_words' ? 'bg-white text-[#003A91] shadow-sm' : 'text-[#52657A] hover:text-[#003A91]'
              }`}
            >
              <LayoutList className="h-4 w-4" />
              Toàn bộ từ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition ${
                viewMode === 'flashcard' ? 'bg-white text-[#003A91] shadow-sm' : 'text-[#52657A] hover:text-[#003A91]'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Flashcard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {viewMode === 'all_words' && (
          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#D8E3EE] bg-white p-5 shadow-sm md:col-span-2">
              <p className="text-sm font-bold text-[#52657A]">Mô tả</p>
              <h2 className="mt-1 text-2xl font-black text-[#0F2747]">{data.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#52657A]">{data.description}</p>
            </article>
            <article className="rounded-2xl border border-[#D8E3EE] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#52657A]">Đã học</p>
                <span className="rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-xs font-black text-[#003A91]">
                  {learnedCount}/{data.words.length}
                </span>
              </div>
              <p className="text-3xl font-black text-[#0F2747]">{learnedPercent}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8EEF6]">
                <div className="h-full rounded-full bg-[#0057D9]" style={{ width: `${learnedPercent}%` }} />
              </div>
            </article>
          </section>
        )}

        {viewMode === 'all_words' ? (
          <section>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#0F2747]">Toàn bộ từ vựng</h2>
                <p className="mt-1 text-sm font-medium text-[#52657A]">
                  {filteredWords.length}/{data.words.length} từ trong bộ này.
                </p>
              </div>
              <div className="relative w-full lg:max-w-[360px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8EA1B5]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm từ, nghĩa, ví dụ..."
                  className="h-11 w-full rounded-xl border border-[#D8E3EE] bg-white pl-10 pr-4 text-sm font-bold text-[#152033] outline-none transition placeholder:text-[#8EA1B5] focus:border-[#0057D9] focus:ring-2 focus:ring-[#EAF2FF]"
                />
              </div>
            </div>

            {filteredWords.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredWords.map((word) => {
                  const isLearned = learnedWordIds.includes(word.id);
                  return (
                    <article key={word.id} className="rounded-2xl border border-[#D8E3EE] bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-black text-[#0F2747]">{word.term}</h3>
                            <span className="rounded-lg bg-[#F1F7FB] px-2 py-0.5 text-xs font-black uppercase text-[#1E4E8C]">
                              {word.partOfSpeech}
                            </span>
                            {isLearned && <CheckCircle2 className="h-5 w-5 text-[#10B981]" />}
                          </div>
                          <p className="mt-1 text-sm font-bold text-[#52657A]">{word.phonetic}</p>
                        </div>
                        <button
                          type="button"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8E3EE] text-[#52657A] transition hover:border-[#0057D9] hover:text-[#0057D9]"
                          aria-label={`Nghe phát âm ${word.term}`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-sm font-black text-[#152033]">{word.definition}</p>
                      <div className="mt-4 rounded-xl border border-[#E8EEF6] bg-[#FBFCFF] p-4">
                        <p className="text-sm font-medium italic leading-6 text-[#52657A]">"{word.example}"</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-[#1E4E8C]">{word.exampleTranslation}</p>
                      </div>

                      {(word.collocations?.length || word.synonyms?.length) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {word.collocations?.map((item) => (
                            <span key={item} className="rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-xs font-black text-[#003A91]">
                              {item}
                            </span>
                          ))}
                          {word.synonyms?.map((item) => (
                            <span key={item} className="rounded-lg bg-[#ECFEFF] px-2.5 py-1 text-xs font-black text-[#0B7991]">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => selectFlashcardWord(word)}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#003A91] px-4 text-sm font-black text-white transition hover:bg-[#0F2747] active:scale-[0.98]"
                      >
                        Học bằng flashcard
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-[#D8E3EE] bg-white text-center shadow-sm">
                <Search className="mb-3 h-9 w-9 text-[#8EA1B5]" />
                <h3 className="text-lg font-black text-[#0F2747]">Không tìm thấy từ phù hợp</h3>
                <p className="mt-1 text-sm font-medium text-[#52657A]">Thử tìm bằng từ khóa khác.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="mx-auto w-full max-w-[860px]">
            <div>
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs font-black text-[#52657A]">
                  <span>
                    Thẻ {currentWordIndex + 1}/{data.words.length}
                  </span>
                  <span>{Math.round(((currentWordIndex + 1) / data.words.length) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E8EEF6]">
                  <div
                    className="h-full rounded-full bg-[#0057D9]"
                    style={{ width: `${((currentWordIndex + 1) / data.words.length) * 100}%` }}
                  />
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsFlipped((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setIsFlipped((value) => !value);
                  }
                }}
                className="group flex min-h-[430px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#D8E3EE] bg-white p-8 text-center shadow-sm outline-none transition hover:border-[#0057D9] focus:ring-2 focus:ring-[#EAF2FF]"
                aria-label="Lật flashcard"
              >
                {!isFlipped ? (
                  <>
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F7FB] text-[#1E4E8C] transition group-hover:bg-[#EAF2FF]">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <p className="mb-3 rounded-lg bg-[#EAF2FF] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#003A91]">
                      {currentWord.partOfSpeech}
                    </p>
                    <h2 className="max-w-full break-words text-5xl font-black text-[#0F2747]">{currentWord.term}</h2>
                    <p className="mt-4 text-lg font-bold text-[#52657A]">{currentWord.phonetic}</p>
                    <p className="mt-12 text-xs font-black uppercase tracking-[0.16em] text-[#8EA1B5]">Nhấn để xem nghĩa</p>
                  </>
                ) : (
                  <div className="flex max-w-2xl flex-col items-center">
                    <p className="mb-4 rounded-lg bg-[#EAF2FF] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#003A91]">
                      Nghĩa và ví dụ
                    </p>
                    <h3 className="text-3xl font-black leading-tight text-[#0F2747]">{currentWord.definition}</h3>
                    <div className="mt-6 rounded-2xl border border-[#D8E3EE] bg-[#FBFCFF] p-5">
                      <p className="text-lg font-medium italic leading-8 text-[#152033]">"{currentWord.example}"</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-[#1E4E8C]">{currentWord.exampleTranslation}</p>
                    </div>
                    {(currentWord.collocations?.length || currentWord.synonyms?.length) && (
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {currentWord.collocations?.map((item) => (
                          <span key={item} className="rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-xs font-black text-[#003A91]">
                            {item}
                          </span>
                        ))}
                        {currentWord.synonyms?.map((item) => (
                          <span key={item} className="rounded-lg bg-[#ECFEFF] px-2.5 py-1 text-xs font-black text-[#0B7991]">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToWord(currentWordIndex - 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D8E3EE] bg-white text-[#52657A] transition hover:border-[#003A91] hover:text-[#003A91] active:scale-[0.98]"
                  aria-label="Từ trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToWord(currentWordIndex + 1)}
                  className="flex h-12 items-center gap-2 rounded-xl border border-[#D8E3EE] bg-white px-4 text-sm font-black text-[#003A91] transition hover:bg-[#EAF2FF] active:scale-[0.98]"
                >
                  Học tiếp
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={markCurrentWord}
                  className="flex h-12 items-center gap-2 rounded-xl bg-[#003A91] px-4 text-sm font-black text-white transition hover:bg-[#0F2747] active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Đã thuộc
                </button>
                <button
                  type="button"
                  onClick={() => goToWord(currentWordIndex + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D8E3EE] bg-white text-[#52657A] transition hover:border-[#003A91] hover:text-[#003A91] active:scale-[0.98]"
                  aria-label="Từ tiếp theo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

    </div>
  );
};
