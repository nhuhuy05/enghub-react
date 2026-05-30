import type { GroupQuestion } from '../../types/teacherTestTypes';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface QuestionsEditorProps {
  questions: GroupQuestion[];
  setQuestionValue: (questionId: number, field: keyof GroupQuestion, value: string | null) => void;
  setAnswerValue: (answerId: number, field: 'answer_text_en' | 'answer_text_vi', value: string | null) => void;
  setCorrectAnswer: (questionId: number, answerId: number) => void;
}

export const QuestionsEditor = ({
  questions,
  setQuestionValue,
  setAnswerValue,
  setCorrectAnswer,
}: QuestionsEditorProps) => (
  <div className="space-y-4">
    {questions.map((question) => (
      <div key={question.id} className="rounded-2xl border border-[#e4e7ec] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#111827]">Question {question.question_number}</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <AutoResizeTextarea
            value={question.question_text_en ?? ''}
            onChange={(event) => setQuestionValue(question.id, 'question_text_en', event.target.value)}
            placeholder="Question text EN"
            rows={1}
          />
          <AutoResizeTextarea
            value={question.question_text_vi ?? ''}
            onChange={(event) => setQuestionValue(question.id, 'question_text_vi', event.target.value)}
            placeholder="Question text VI"
            rows={1}
          />
          <AutoResizeTextarea
            value={question.explanation_vi ?? ''}
            onChange={(event) => setQuestionValue(question.id, 'explanation_vi', event.target.value)}
            placeholder="Explanation VI"
            rows={1}
          />
        </div>
        <div className="mt-4 space-y-3">
          {question.answers.map((answer) => (
            <div key={answer.id} className="rounded-xl bg-[#f9fafb] p-3">
              <div className="mb-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                  <input
                    type="radio"
                    checked={answer.is_correct}
                    onChange={() => setCorrectAnswer(question.id, answer.id)}
                  />
                  Answer {answer.label}
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <AutoResizeTextarea
                  value={answer.answer_text_en ?? ''}
                  onChange={(event) => setAnswerValue(answer.id, 'answer_text_en', event.target.value)}
                  placeholder="Answer EN"
                  rows={1}
                />
                <AutoResizeTextarea
                  value={answer.answer_text_vi ?? ''}
                  onChange={(event) => setAnswerValue(answer.id, 'answer_text_vi', event.target.value)}
                  placeholder="Answer VI"
                  rows={1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
