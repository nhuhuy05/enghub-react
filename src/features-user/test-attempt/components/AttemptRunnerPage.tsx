import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Menu,
  Send,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { EngHubLogo } from '@/components/brand/EngHubLogo';
import { useAttemptRunner } from '../hooks/useAttemptRunner';
import type { AttemptGroup, AttemptPart, AttemptQuestion, SaveAnswerResult } from '../types';
import { AudioRangePlayer } from './AudioRangePlayer';

interface QuestionRef {
  partNumber: number;
  groupId: number;
  questionId: number;
  questionNumber: number;
}

interface GroupRef {
  partNumber: number;
  groupId: number;
  firstQuestionId: number;
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  return [hours, minutes, secs].map((value) => value.toString().padStart(2, '0')).join(':');
};

const flattenQuestions = (parts: AttemptPart[]): QuestionRef[] =>
  parts.flatMap((part) =>
    part.groups.flatMap((group) =>
      group.questions.map((question) => ({
        partNumber: part.partNumber,
        groupId: group.id,
        questionId: question.id,
        questionNumber: question.questionNumber,
      }))
    )
  );

const flattenGroups = (parts: AttemptPart[]): GroupRef[] =>
  parts.flatMap((part) =>
    part.groups.flatMap((group) => {
      const firstQuestion = group.questions[0];
      return firstQuestion
        ? [
            {
              partNumber: part.partNumber,
              groupId: group.id,
              firstQuestionId: firstQuestion.id,
            },
          ]
        : [];
    })
  );

const getFirstUnansweredQuestionId = (parts: AttemptPart[]) => {
  for (const part of parts) {
    for (const group of part.groups) {
      const question = group.questions.find((item) => typeof item.selectedAnswerId !== 'number');
      if (question) return question.id;
    }
  }
  return parts[0]?.groups[0]?.questions[0]?.id ?? null;
};

const getSectionLabel = (partNumber: number) => (partNumber <= 4 ? 'Listening' : 'Reading');

const getGroupQuestionLabel = (part: AttemptPart | null, group: AttemptGroup | null, totalQuestions: number) => {
  if (!part || !group || group.questions.length === 0) return `Questions 0 of ${totalQuestions}`;
  const numbers = group.questions.map((question) => question.questionNumber).sort((a, b) => a - b);
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  const range = first === last ? `${first}` : `${first} - ${last}`;
  return `${getSectionLabel(part.partNumber)}: Questions ${range} of ${totalQuestions}`;
};

const getInstruction = (partNumber: number) => {
  if (partNumber === 1) return 'Select the one statement that best describes what you see in the picture.';
  if (partNumber === 2) return 'Select the best response to the question.';
  if (partNumber <= 4) return 'Select the best response to each question.';
  if (partNumber === 5) return 'Select the best answer to complete the sentence.';
  if (partNumber === 6) return 'Select the best answer to complete the text.';
  return 'Select the best answer to each question.';
};

export const AttemptRunnerPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const numericAttemptId = Number(attemptId);
  const isFreshStart = Boolean((location.state as { freshStart?: boolean } | null)?.freshStart);
  const {
    answers,
    answeredCount,
    content,
    errorMsg,
    feedbacks,
    loading,
    remainingSeconds,
    saveAnswer,
    savingQuestionId,
    submitAttempt,
    submitting,
  } = useAttemptRunner(numericAttemptId, { hydratePracticeFeedbacks: !isFreshStart });
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [markedQuestions, setMarkedQuestions] = useState<Record<number, boolean>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [volume, setVolume] = useState(1);

  const questionRefs = useMemo(() => (content ? flattenQuestions(content.parts) : []), [content]);
  const groupRefs = useMemo(() => (content ? flattenGroups(content.parts) : []), [content]);
  const resumeQuestionId = useMemo(() => (content ? getFirstUnansweredQuestionId(content.parts) : null), [content]);
  const activeRef = questionRefs.find((item) => item.questionId === activeQuestionId) || questionRefs[0];
  const activePart = content?.parts.find((part) => part.partNumber === activeRef?.partNumber) || null;
  const activeGroup = activePart?.groups.find((group) => group.id === activeRef?.groupId) || null;
  const activeGroupIndex = activeRef
    ? groupRefs.findIndex((item) => item.partNumber === activeRef.partNumber && item.groupId === activeRef.groupId)
    : -1;
  const hasGroupAudio = Boolean(activeGroup?.audio?.url);

  useEffect(() => {
    if (!activeQuestionId && resumeQuestionId) {
      setActiveQuestionId(resumeQuestionId);
    }
  }, [activeQuestionId, resumeQuestionId]);

  useEffect(() => {
    document.querySelectorAll('audio').forEach((audio) => {
      audio.volume = volume;
    });
  }, [volume, activeGroup?.id]);

  const goGroupByOffset = (offset: number) => {
    const nextGroup = groupRefs[activeGroupIndex + offset];
    if (nextGroup) setActiveQuestionId(nextGroup.firstQuestionId);
  };

  const handleListeningAudioEnded = () => {
    const nextGroup = groupRefs[activeGroupIndex + 1];
    if (nextGroup && nextGroup.partNumber <= 4) {
      setActiveQuestionId(nextGroup.firstQuestionId);
    }
  };

  const handleSubmit = () => {
    const confirmed = window.confirm('Submit this attempt? You cannot edit answers after submitting.');
    if (confirmed) void submitAttempt();
  };

  const toggleMarked = () => {
    if (!activeQuestionId) return;
    setMarkedQuestions((current) => ({ ...current, [activeQuestionId]: !current[activeQuestionId] }));
  };

  if (!Number.isFinite(numericAttemptId)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7fc] p-4">
        <p className="rounded-xl border border-[#fee4e2] bg-white p-5 text-sm font-bold text-[#b42318]">
          Invalid attempt id.
        </p>
      </main>
    );
  }

  if (loading || !content) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f7fc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="text-sm font-bold text-[#667085]">Loading attempt...</p>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f7fc] text-[#191b23]">
      <header className="relative z-40 flex h-16 shrink-0 items-center bg-[#004ac6] px-4 text-white shadow-sm">
        <div className="flex w-full items-center gap-4">
          <div className="flex w-[260px] shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/tests')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-white/90 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
              <EngHubLogo markClassName="h-7 w-10" textClassName="hidden" />
            </div>
          </div>

          <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold">
            {getGroupQuestionLabel(activePart, activeGroup, content.attempt.totalQuestions)}
          </h1>

          <div className="flex w-[360px] shrink-0 items-center justify-end gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVolumeOpen((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f86ff] text-white shadow-sm transition hover:bg-[#1673db]"
                title={hasGroupAudio ? 'Audio volume' : 'Audio volume'}
              >
                <Volume2 className="h-4 w-4" />
              </button>
              {isVolumeOpen && (
                <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-[#d8dced] bg-white p-3 text-[#111827] shadow-xl">
                  <label className="text-xs font-bold text-[#667085]" htmlFor="attempt-volume">
                    Volume {Math.round(volume * 100)}%
                  </label>
                  <input
                    id="attempt-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    className="mt-2 w-full accent-[#004ac6]"
                  />
                </div>
              )}
            </div>
            <span className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-black text-[#004ac6] shadow-sm">
              {answeredCount}/{content.attempt.totalQuestions}
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1f86ff] px-3 text-xs font-black text-white shadow-sm">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(remainingSeconds)}
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#ff8a1f] px-3 text-xs font-black text-white shadow-sm transition hover:bg-[#ea760b] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit
            </button>
          </div>
        </div>
      </header>

      {errorMsg && (
        <div className="mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-[1440px] items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-3 text-sm font-bold text-[#b42318]">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <main className="grid min-h-0 w-full flex-1 grid-cols-1 lg:grid-cols-2">
        {activePart && activeGroup ? (
          <>
            <ContextPanel
              group={activeGroup}
              onAudioEnded={handleListeningAudioEnded}
              part={activePart}
              mode={content.attempt.mode}
              feedbacks={feedbacks}
            />
            <QuestionPanel
              activeQuestionId={activeQuestionId}
              answers={answers}
              feedbacks={feedbacks}
              group={activeGroup}
              mode={content.attempt.mode}
              onSaveAnswer={saveAnswer}
              savingQuestionId={savingQuestionId}
              partNumber={activePart.partNumber}
            />
          </>
        ) : (
          <div className="col-span-full rounded-sm border border-[#d8dced] bg-white p-10 text-center text-sm font-bold text-[#667085]">
            No question selected.
          </div>
        )}
      </main>

      <QuestionPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        activeQuestionId={activeQuestionId}
        answers={answers}
        markedQuestions={markedQuestions}
        onSelect={(questionId) => {
          setActiveQuestionId(questionId);
          setIsPaletteOpen(false);
        }}
        parts={content.parts}
      />

      {activePart?.partNumber && activePart.partNumber >= 5 && (
      <footer className="relative h-14 shrink-0 border-t border-[#d8dced] bg-white">
        <label className="absolute left-8 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center gap-2 text-sm font-semibold text-[#344054]">
          <input
            type="checkbox"
            checked={Boolean(activeQuestionId && markedQuestions[activeQuestionId])}
            onChange={toggleMarked}
            className="h-4 w-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
          />
          Mark item for review
        </label>

        <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="flex h-10 w-12 items-center justify-center rounded-md bg-[#004ac6] text-white shadow-sm transition hover:bg-[#003da3]"
            aria-label="Question navigator"
            title="Question navigator"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goGroupByOffset(-1)}
            disabled={activeGroupIndex <= 0}
            className="flex h-10 w-12 items-center justify-center rounded-md bg-[#4b9f3a] text-white shadow-sm transition hover:bg-[#3f872f] disabled:bg-[#d0d5dd]"
            aria-label="Previous group"
            title="Previous group"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goGroupByOffset(1)}
            disabled={activeGroupIndex >= groupRefs.length - 1}
            className="flex h-10 w-12 items-center justify-center rounded-md bg-[#4b9f3a] text-white shadow-sm transition hover:bg-[#3f872f] disabled:bg-[#d0d5dd]"
            aria-label="Next group"
            title="Next group"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </footer>
      )}
    </div>
  );
};

const ContextPanel = ({ 
  group, 
  onAudioEnded,
  part,
  mode,
  feedbacks,
}: { 
  group: AttemptGroup; 
  onAudioEnded: () => void;
  part: AttemptPart;
  mode: 'MOCK' | 'PRACTICE';
  feedbacks: Record<number, SaveAnswerResult>;
}) => {
  const isListeningPart = [1, 2, 3, 4].includes(part.partNumber);
  const isMockListening = mode === 'MOCK' && isListeningPart;
  const canRevealGroupFeedback =
    mode === 'PRACTICE' && group.questions.length > 0 && group.questions.every((question) => feedbacks[question.id]);
  const feedbackTranscript = group.questions
    .map((question) => feedbacks[question.id])
    .find((feedback) => feedback?.transcriptEn || feedback?.transcriptVi);
  const transcriptEn = group.transcriptEn ?? feedbackTranscript?.transcriptEn ?? null;
  const transcriptVi = group.transcriptVi ?? feedbackTranscript?.transcriptVi ?? null;
  const showTranscript = isListeningPart && canRevealGroupFeedback && (transcriptEn || transcriptVi);

  return (
  <section className="min-h-0 overflow-y-auto border-b border-[#d8dced] bg-white p-4 lg:border-b-0 lg:border-r">
    <p className="mb-3 text-sm font-bold leading-6 text-[#2b6475]">{getInstruction(part.partNumber)}</p>

    {group.audio && (
      <AudioRangePlayer
        audio={group.audio}
        autoPlay={true}
        hiddenControls={isMockListening}
        onEnded={isMockListening ? onAudioEnded : undefined}
      />
    )}

    {group.images.length > 0 && (
      <div className="mt-3 grid gap-3">
        {group.images.map((image) =>
          image.url ? (
            <img
              key={`${image.id}-${image.orderIndex ?? 0}`}
              src={image.url}
              alt={image.label || 'Question image'}
              className="mx-auto max-h-[650px] w-full object-contain"
            />
          ) : null
        )}
      </div>
    )}

    {showTranscript && (
      <div className="mt-4 rounded-sm border border-[#d8dced] bg-[#f8fbff] p-4 text-[#344054]">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#004ac6]">
          <BookOpen className="h-4 w-4" />
          <span>Audio Transcript</span>
        </div>
        {transcriptEn && (
          <div className="whitespace-pre-wrap text-sm leading-6">{transcriptEn}</div>
        )}
        {transcriptVi && (
          <div className={`whitespace-pre-wrap text-sm leading-6 opacity-80 ${transcriptEn ? 'mt-3 border-t border-[#d8dced] pt-3' : ''}`}>
            {transcriptVi}
          </div>
        )}
      </div>
    )}

    {group.passages.length > 0 && (
      <div className="mt-3 space-y-4">
        {group.passages.map((passage, index) => (
          <article key={`${passage.id ?? index}-${passage.orderIndex ?? index}`} className="space-y-3">
            {passage.title && <h2 className="text-sm font-bold text-[#2b6475]">{passage.title}</h2>}
            {passage.url && (
              <img
                src={passage.url}
                alt={passage.title || 'Passage'}
                className="mx-auto max-h-[520px] w-full object-contain"
              />
            )}
            {passage.contentEn && (
              <div className="whitespace-pre-wrap rounded-sm border border-[#d8dced] bg-white p-4 text-sm leading-7 text-[#111827]">
                {passage.contentEn}
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
  );
};

const QuestionTranslationPanel = ({ question }: { question: AttemptQuestion }) => (
  <div className="rounded-sm border border-[#d8dced] bg-[#f4f7fb] p-4 text-[#344054]">
    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#004ac6]">
      <BookOpen className="h-4 w-4" />
      <span>Question translation</span>
    </div>

    {question.questionTextVi && (
      <p className="mb-3 whitespace-pre-wrap text-sm font-medium leading-6">
        {question.questionTextVi}
      </p>
    )}

    <div className="space-y-2 px-1">
      {question.answers.map((answer) => (
        <div key={answer.id} className="text-sm leading-6 text-[#344054]">
          ({answer.label}) {answer.answerTextVi || ''}
        </div>
      ))}
    </div>
  </div>
);

const QuestionPanel = ({
  activeQuestionId,
  answers,
  feedbacks,
  group,
  mode,
  onSaveAnswer,
  savingQuestionId,
  partNumber,
}: {
  activeQuestionId: number | null;
  answers: Record<number, number | null>;
  feedbacks: Record<number, SaveAnswerResult>;
  group: AttemptGroup;
  mode: 'MOCK' | 'PRACTICE';
  onSaveAnswer: (questionId: number, selectedAnswerId: number | null) => Promise<void>;
  savingQuestionId: number | null;
  partNumber: number;
}) => {
  const canRevealGroupFeedback =
    mode === 'PRACTICE' && group.questions.length > 0 && group.questions.every((question) => feedbacks[question.id]);

  return (
    <section className="min-h-0 overflow-y-auto bg-white p-4">
      <h2 className="mb-3 text-base font-bold text-[#2b6475]">Question</h2>
      <div className="space-y-5">
        {group.questions.map((question) => (
          <QuestionCard
            key={question.id}
            active={question.id === activeQuestionId}
            canRevealFeedback={canRevealGroupFeedback}
            feedback={feedbacks[question.id]}
            mode={mode}
            onSaveAnswer={onSaveAnswer}
            question={question}
            saving={savingQuestionId === question.id}
            selectedAnswerId={answers[question.id] ?? null}
            partNumber={partNumber}
          />
        ))}
      </div>
    </section>
  );
};

const QuestionCard = ({
  active,
  canRevealFeedback,
  feedback,
  mode,
  onSaveAnswer,
  question,
  saving,
  selectedAnswerId,
  partNumber,
}: {
  active: boolean;
  canRevealFeedback: boolean;
  feedback?: SaveAnswerResult;
  mode: 'MOCK' | 'PRACTICE';
  onSaveAnswer: (questionId: number, selectedAnswerId: number | null) => Promise<void>;
  question: AttemptQuestion;
  saving: boolean;
  selectedAnswerId: number | null;
  partNumber: number;
}) => {
  const shouldHideText = partNumber === 1 || (partNumber === 2 && !canRevealFeedback);
  const showInlineTranslation = canRevealFeedback && Boolean(feedback);

  return (
  <section className={active ? 'rounded-sm bg-[#f8fbff] p-2 ring-1 ring-[#b7cdf8]' : 'rounded-sm p-2'}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-[#111827]">
          {question.questionNumber}. {question.questionTextEn || `Question ${question.questionNumber}`}
        </p>
      </div>
      {saving && <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />}
    </div>

    <div className="space-y-2">
      {question.answers.map((answer) => {
        const selected = selectedAnswerId === answer.id;
        const revealedCorrect = canRevealFeedback && feedback?.correctAnswerId === answer.id;
        const revealedIncorrect = canRevealFeedback && feedback && !feedback.correct && selected;
        const hasFeedback = mode === 'PRACTICE' && Boolean(feedback);
        return (
          <button
            key={answer.id}
            type="button"
            onClick={() => void onSaveAnswer(question.id, answer.id)}
            disabled={saving || hasFeedback}
            className={`flex min-h-10 w-full items-center gap-3 rounded-sm border px-3 py-2 text-left text-sm transition disabled:cursor-default ${
              saving ? 'opacity-60' : ''
            } ${
              revealedIncorrect
                ? 'border-[#fca5a5] bg-[#fef2f2]'
                : revealedCorrect
                  ? 'border-[#12b76a] bg-[#ecfdf3]'
                  : selected
                    ? 'border-[#004ac6] bg-[#eaf0ff]'
                    : `border-[#d8dced] bg-white ${hasFeedback ? '' : 'hover:border-[#004ac6]'}`
            }`}
          >
            {revealedIncorrect ? (
              <XCircle className="h-4 w-4 shrink-0 text-[#ef4444]" />
            ) : revealedCorrect ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#12b76a]" />
            ) : (
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-[#004ac6]' : 'border-[#98a2b3]'
                }`}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-[#004ac6]" />}
              </span>
            )}
            <span className={`font-semibold ${revealedIncorrect ? 'text-[#b91c1c]' : revealedCorrect ? 'text-[#065f46]' : 'text-[#344054]'}`}>
              ({answer.label}){shouldHideText ? '' : ` ${answer.answerTextEn || ''}`}
            </span>
          </button>
        );
      })}
    </div>

    {showInlineTranslation && (
      <div className="mt-4">
        <QuestionTranslationPanel question={question} />
      </div>
    )}

    {canRevealFeedback && feedback?.explanationVi && (
      <div className="mt-3 rounded-sm border border-[#d8dced] bg-[#f4f7fb] p-3 text-sm text-[#344054]">
        <p className="mb-1.5 font-bold text-[#004ac6]">Detailed explanation:</p>
        <p className="leading-6">{feedback.explanationVi}</p>
      </div>
    )}
  </section>
  );
};

const QuestionPalette = ({
  isOpen,
  onClose,
  activeQuestionId,
  answers,
  markedQuestions,
  onSelect,
  parts,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeQuestionId: number | null;
  answers: Record<number, number | null>;
  markedQuestions: Record<number, boolean>;
  onSelect: (questionId: number) => void;
  parts: AttemptPart[];
}) => (
  <>
    {/* Overlay */}
    <div 
      className={`fixed inset-0 z-40 bg-[#1e293b]/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose} 
    />
    
    {/* Sidebar */}
    <div 
      className={`fixed right-0 top-0 z-50 flex h-screen w-[340px] flex-col bg-[#f8f9fa] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex shrink-0 items-center justify-between bg-[#1e293b] px-5 py-4 text-white">
        <h2 className="text-lg font-bold">Question Navigator</h2>
        <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="shrink-0 border-b border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-y-3 text-sm font-medium text-[#374151]">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-[#1d4ed8] bg-[#3b82f6]"></div>
            Current
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-white"></div>
            Unanswered
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-[#ecfdf3]"></div>
            Answered
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border-2 border-[#f59e0b] bg-white"></div>
            Marked
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="space-y-6">
          {parts.map((part) => (
            <div key={part.partNumber}>
              <p className="mb-3 font-bold text-[#374151]">
                Part {part.partNumber} ({part.groups.reduce((acc, g) => acc + g.questions.length, 0)} questions)
              </p>
              <div className="flex flex-wrap gap-2">
                {part.groups.flatMap((group) =>
                  group.questions.map((question) => {
                    const selected = typeof answers[question.id] === 'number';
                    const marked = Boolean(markedQuestions[question.id]);
                    const active = activeQuestionId === question.id;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onSelect(question.id)}
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-all ${
                          marked ? 'border-[#f59e0b]' : active ? 'border-[#1d4ed8]' : 'border-gray-300'
                        } ${
                          active ? 'bg-[#3b82f6] text-white' : selected ? 'bg-[#ecfdf3] text-[#374151]' : 'bg-white text-[#374151] hover:bg-gray-50'
                        }`}
                      >
                        {question.questionNumber}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);
