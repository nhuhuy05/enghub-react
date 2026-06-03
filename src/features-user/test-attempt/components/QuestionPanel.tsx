import { BookOpen, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import type { AttemptGroup, AttemptQuestion, SaveAnswerResult } from '../types';

interface QuestionPanelProps {
  activeQuestionId: number | null;
  answers: Record<number, number | null>;
  canUseAiChat: boolean;
  feedbacks: Record<number, SaveAnswerResult>;
  group: AttemptGroup;
  mode: 'MOCK' | 'PRACTICE';
  onOpenAiChat: (questionId: number) => void;
  onSaveAnswer: (questionId: number, selectedAnswerId: number | null) => Promise<void>;
  savingQuestionId: number | null;
  partNumber: number;
}

export const QuestionPanel = ({
  activeQuestionId,
  answers,
  canUseAiChat,
  feedbacks,
  group,
  mode,
  onOpenAiChat,
  onSaveAnswer,
  savingQuestionId,
  partNumber,
}: QuestionPanelProps) => {
  const canRevealGroupFeedback =
    mode === 'PRACTICE' && group.questions.length > 0 && group.questions.every((question) => feedbacks[question.id]);

  return (
    <section className="min-h-0 overflow-y-auto bg-white p-4">
      <h2 className="mb-3 text-base font-bold text-[#2b6475]">Câu hỏi</h2>
      <div className="space-y-5">
        {group.questions.map((question) => (
          <QuestionCard
            key={question.id}
            active={question.id === activeQuestionId}
            canRevealFeedback={canRevealGroupFeedback}
            canUseAiChat={canUseAiChat && typeof answers[question.id] === 'number'}
            feedback={feedbacks[question.id]}
            mode={mode}
            onOpenAiChat={onOpenAiChat}
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

const QuestionTranslationPanel = ({ question }: { question: AttemptQuestion }) => (
  <div className="rounded-sm border border-[#d8dced] bg-[#f4f7fb] p-4 text-[#344054]">
    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#004ac6]">
      <BookOpen className="h-4 w-4" />
      <span>Bản dịch câu hỏi</span>
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

interface QuestionCardProps {
  active: boolean;
  canRevealFeedback: boolean;
  canUseAiChat: boolean;
  feedback?: SaveAnswerResult;
  mode: 'MOCK' | 'PRACTICE';
  onOpenAiChat: (questionId: number) => void;
  onSaveAnswer: (questionId: number, selectedAnswerId: number | null) => Promise<void>;
  question: AttemptQuestion;
  saving: boolean;
  selectedAnswerId: number | null;
  partNumber: number;
}

const QuestionCard = ({
  active,
  canRevealFeedback,
  canUseAiChat,
  feedback,
  mode,
  onOpenAiChat,
  onSaveAnswer,
  question,
  saving,
  selectedAnswerId,
  partNumber,
}: QuestionCardProps) => {
  const shouldHideText = partNumber === 1 || (partNumber === 2 && !canRevealFeedback);
  const showInlineTranslation = canRevealFeedback && Boolean(feedback);

  return (
    <section className={active ? 'rounded-sm bg-[#f8fbff] p-2 ring-1 ring-[#b7cdf8]' : 'rounded-sm p-2'}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#111827]">
            {question.questionNumber}. {question.questionTextEn || `Câu ${question.questionNumber}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canUseAiChat && (
            <button
              type="button"
              onClick={() => onOpenAiChat(question.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#b7cdf8] bg-white px-2.5 text-xs font-bold text-[#004ac6] transition hover:bg-[#eaf0ff]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Hỏi AI
            </button>
          )}
          {saving && <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />}
        </div>
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
          <p className="mb-1.5 font-bold text-[#004ac6]">Giải thích chi tiết:</p>
          <p className="leading-6">{feedback.explanationVi}</p>
        </div>
      )}
    </section>
  );
};
