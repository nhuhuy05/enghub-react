import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Volume2 } from 'lucide-react';
import { getVocabularyErrorMessage, vocabularyService } from '../services/vocabularyService';
import type { Vocabulary, VocabularyReviewOption, VocabularyReviewRating } from '../types';

const ratingStyles: Record<VocabularyReviewRating, { label: string; className: string }> = {
  AGAIN: { label: 'Again', className: 'border-[#fca5a5] text-[#b42318] hover:bg-[#fef3f2]' },
  HARD: { label: 'Hard', className: 'border-[#fedf89] text-[#b25e00] hover:bg-[#fffaeb]' },
  GOOD: { label: 'Good', className: 'border-[#b7cdf8] text-[#004ac6] hover:bg-[#eaf0ff]' },
  EASY: { label: 'Easy', className: 'border-[#abefc6] text-[#027a48] hover:bg-[#ecfdf3]' },
};

const ratingOrder: VocabularyReviewRating[] = ['AGAIN', 'HARD', 'GOOD', 'EASY'];

const fallbackReviewOptions: VocabularyReviewOption[] = ratingOrder.map((rating) => ({
  rating,
  label: ratingStyles[rating].label,
  delayLabel: '',
  nextReviewAt: null,
}));

const playAudio = (url: string | null) => {
  if (!url) return;
  void new Audio(url).play();
};

export const VocabularyReviewPage = () => {
  const [searchParams] = useSearchParams();
  const topicIdParam = searchParams.get('topicId');
  const topicId = topicIdParam ? Number(topicIdParam) : undefined;
  const normalizedTopicId = typeof topicId === 'number' && Number.isFinite(topicId) ? topicId : undefined;
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [counts, setCounts] = useState<Record<VocabularyReviewRating, number>>({
    AGAIN: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  });

  useEffect(() => {
    const loadDueWords = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const dueWords = await vocabularyService.getDue(normalizedTopicId);
        setWords(dueWords);
        setCurrentIndex(0);
        setRevealed(false);
        setCounts({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });
      } catch (err) {
        setErrorMsg(getVocabularyErrorMessage(err, 'Không thể tải danh sách từ đến hạn.'));
      } finally {
        setLoading(false);
      }
    };

    void loadDueWords();
  }, [normalizedTopicId]);

  const currentWord = words[currentIndex];
  const reviewedCount = useMemo(() => Object.values(counts).reduce((total, value) => total + value, 0), [counts]);
  const finished = !loading && words.length > 0 && currentIndex >= words.length;

  const submitRating = async (rating: VocabularyReviewRating) => {
    if (!currentWord || saving) return;
    try {
      setSaving(true);
      setErrorMsg('');
      await vocabularyService.review(currentWord.id, rating);
      setCounts((current) => ({ ...current, [rating]: current[rating] + 1 }));
      setCurrentIndex((index) => index + 1);
      setRevealed(false);
    } catch (err) {
      setErrorMsg(getVocabularyErrorMessage(err, 'Không thể lưu kết quả ôn tập.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 bg-[#f6f7fc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="text-sm font-semibold text-[#667085]">Đang tải flashcard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f7fc] px-4 py-4 text-[#191b23] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[760px]">
        <Link
          to={normalizedTopicId ? `/vocabulary/topics/${normalizedTopicId}` : '/vocabulary'}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#505f76] hover:text-[#004ac6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>

        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-black text-[#111827]">Ôn tập flashcard</h1>
          </div>
          <div className="rounded-xl border border-[#d8dced] bg-white px-4 py-3 text-sm font-bold text-[#667085] shadow-sm">
            Đã ôn: {reviewedCount}
          </div>
        </header>

        {errorMsg && (
          <div className="mb-5 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-bold text-[#b42318]">
            {errorMsg}
          </div>
        )}

        {words.length === 0 ? (
          <section className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#d8dced] bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="h-12 w-12 text-[#12b76a]" />
            <h2 className="mt-4 text-xl font-black text-[#111827]">Không có từ đến hạn ôn</h2>
            <p className="mt-2 text-sm font-medium text-[#667085]">Hãy học thêm từ mới hoặc quay lại sau.</p>
          </section>
        ) : finished ? (
          <section className="rounded-2xl border border-[#d8dced] bg-white p-8 shadow-sm">
            <CheckCircle2 className="h-12 w-12 text-[#12b76a]" />
            <h2 className="mt-4 text-2xl font-black text-[#111827]">Đã hoàn thành phiên ôn tập</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {ratingOrder.map((rating) => (
                <div key={rating} className="rounded-xl border border-[#e4e7ec] p-4">
                  <p className="text-xs font-black uppercase text-[#667085]">{ratingStyles[rating].label}</p>
                  <p className="mt-1 text-2xl font-black text-[#111827]">{counts[rating]}</p>
                </div>
              ))}
            </div>
          </section>
        ) : currentWord ? (
          <section>
            <div className="mb-3">
              <div className="mb-2 flex justify-between text-xs font-black text-[#667085]">
                <span>
                  Thẻ {currentIndex + 1}/{words.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e4e7ec]">
                <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
              </div>
            </div>

            <ReviewCard currentWord={currentWord} revealed={revealed} onFlip={() => setRevealed((value) => !value)} />

            {revealed && (
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {(currentWord.reviewOptions.length ? currentWord.reviewOptions : fallbackReviewOptions).map((option) => (
                  <button
                    key={option.rating}
                    type="button"
                    disabled={saving}
                    onClick={() => void submitRating(option.rating)}
                    className={`flex h-14 flex-col items-center justify-center rounded-xl border bg-white text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${ratingStyles[option.rating].className}`}
                  >
                    {saving ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>{option.label || ratingStyles[option.rating].label}</span>
                        {option.delayLabel && <span className="text-xs font-black opacity-70">{option.delayLabel}</span>}
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
};

const ReviewCard = ({
  currentWord,
  onFlip,
  revealed,
}: {
  currentWord: Vocabulary;
  onFlip: () => void;
  revealed: boolean;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onFlip}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onFlip();
      }
    }}
    className="flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#d8dced] bg-white p-6 text-center shadow-sm transition hover:border-[#b7cdf8]"
  >
    {!revealed ? (
      <div className="max-w-2xl">
        <p className="mx-auto inline-flex rounded-lg bg-[#eaf0ff] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#004ac6]">
          {currentWord.partOfSpeech || 'word'}
        </p>
        <h2 className="mt-4 max-w-full break-words text-4xl font-black leading-tight text-[#111827]">{currentWord.word}</h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          {currentWord.pronunciation && <p className="text-base font-semibold text-[#667085]">{currentWord.pronunciation}</p>}
          <AudioButton audioUrl={currentWord.audioUrl} label={`Nghe phát âm ${currentWord.word}`} />
        </div>
      </div>
    ) : (
      <div className="max-w-3xl">
        <h2 className="mt-4 text-2xl font-black leading-tight text-[#111827]">
          {currentWord.meaningVi || currentWord.meaningEn || 'Chưa có nghĩa.'}
        </h2>
        {currentWord.meaningVi && currentWord.meaningEn && <p className="mt-2 text-sm font-bold text-[#667085]">{currentWord.meaningEn}</p>}
        {(currentWord.exampleSentenceEn || currentWord.exampleSentenceVi) && (
          <div className="mt-5 rounded-2xl border border-[#d8dced] bg-[#fbfcff] p-4 text-left">
            {currentWord.exampleSentenceEn && (
              <p className="text-base font-medium italic leading-7 text-[#344054]">"{currentWord.exampleSentenceEn}"</p>
            )}
            {currentWord.exampleSentenceVi && (
              <p className="mt-2 text-sm font-bold leading-6 text-[#004c7a]">{currentWord.exampleSentenceVi}</p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);

const AudioButton = ({ audioUrl, label }: { audioUrl: string | null; label: string }) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      playAudio(audioUrl);
    }}
    disabled={!audioUrl}
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8dced] bg-white text-[#505f76] transition hover:border-[#004ac6] hover:text-[#004ac6] disabled:cursor-not-allowed disabled:opacity-40"
    aria-label={label}
    title={label}
  >
    <Volume2 className="h-4 w-4" />
  </button>
);
