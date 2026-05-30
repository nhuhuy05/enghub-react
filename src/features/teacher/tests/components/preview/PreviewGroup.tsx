import { Image as ImageIcon } from 'lucide-react';
import type { QuestionGroupDetail } from '../../types/teacherTestTypes';
import { formatExplanationBlocks, getGroupTitle, getReviewStatusLabel } from './previewUtils';

const ExplanationPreview = ({ value }: { value: string }) => {
  const blocks = formatExplanationBlocks(value);

  return (
    <details className="mt-3 rounded-lg bg-[#f0f4ff] p-3 text-xs text-[#344054]">
      <summary className="cursor-pointer font-bold text-[#004ac6]">Giải thích</summary>
      <div className="mt-3 space-y-2 font-medium leading-5">
        {blocks.map((block, index) => (
          <p key={`${block.slice(0, 24)}-${index}`} className="whitespace-pre-wrap">
            {block}
          </p>
        ))}
      </div>
    </details>
  );
};

export const PreviewGroup = ({ group }: { group: QuestionGroupDetail }) => (
  <article className="rounded-2xl border border-[#e4e7ec] bg-white p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-[#111827]">{getGroupTitle(group)}</p>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
          group.review_status === 'reviewed' ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fff4e5] text-[#b25e00]'
        }`}
      >
        {getReviewStatusLabel(group.review_status)}
      </span>
    </div>

    {group.audio?.url && (
      <div className="mb-4 rounded-xl bg-[#f9fafb] p-3">
        <audio controls src={group.audio.url} className="w-full" />
        {(group.audio.transcript_en || group.audio.transcript_vi) && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-[#004ac6]">Transcript</summary>
            <div className="mt-2 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
              <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-[#344054]">{group.audio.transcript_en}</p>
              <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-[#344054]">{group.audio.transcript_vi}</p>
            </div>
          </details>
        )}
      </div>
    )}

    {group.images.length > 0 && (
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {group.images
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((image, index) => (
            <div key={`${image.media_asset_id}-${index}`} className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-2">
              {image.url ? (
                <img src={image.url} alt={image.label || 'group image'} className="max-h-80 w-full object-contain" />
              ) : (
                <div className="flex h-32 items-center justify-center text-xs font-semibold text-[#667085]">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Thiếu URL image
                </div>
              )}
            </div>
          ))}
      </div>
    )}

    {group.passages.length > 0 && (
      <div className="mb-4 space-y-3">
        {group.passages
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((passage, index) => (
            <div key={`${passage.id || passage.media_asset_id || index}`} className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-3">
              {passage.content_format === 'image' ? (
                <div className="space-y-2">
                  {passage.title && <h5 className="text-sm font-bold text-[#111827]">{passage.title}</h5>}
                  {passage.url ? (
                    <img src={passage.url} alt={passage.title || passage.label || 'passage'} className="max-h-[520px] w-full object-contain" />
                  ) : (
                    <p className="text-xs font-semibold text-[#667085]">Thiếu URL image của passage.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm text-[#344054]">
                  {passage.title && <h5 className="text-sm font-bold text-[#111827]">{passage.title}</h5>}
                  {passage.content_en && <p className="whitespace-pre-wrap">{passage.content_en}</p>}
                  {passage.content_vi && <p className="whitespace-pre-wrap text-[#667085]">{passage.content_vi}</p>}
                  {passage.vocab_hints && <p className="rounded-lg bg-white p-2 text-xs">{passage.vocab_hints}</p>}
                </div>
              )}
            </div>
          ))}
      </div>
    )}

    <div className="space-y-4">
      {group.questions.map((question) => (
        <div key={question.id} className="rounded-xl border border-[#e4e7ec] p-4">
          <p className="mb-2 text-xs font-bold text-[#004ac6]">Question {question.question_number}</p>
          {question.question_text_en && <p className="text-sm font-medium leading-6 text-[#111827]">{question.question_text_en}</p>}
          {question.question_text_vi && <p className="mt-1 text-xs leading-5 text-[#667085]">{question.question_text_vi}</p>}
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  answer.is_correct ? 'border-[#027a48] bg-[#edfcf2]' : 'border-[#e4e7ec] bg-white'
                }`}
              >
                <p className="font-semibold leading-5 text-[#111827]">
                  {answer.label}. {answer.answer_text_en}
                </p>
                {answer.answer_text_vi && <p className="mt-0.5 text-xs leading-4 text-[#667085]">{answer.answer_text_vi}</p>}
              </div>
            ))}
          </div>
          {question.explanation_vi && <ExplanationPreview value={question.explanation_vi} />}
        </div>
      ))}
    </div>
  </article>
);
