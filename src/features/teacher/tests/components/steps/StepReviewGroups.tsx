import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { AudioTranscriptEditor } from '../review-groups/AudioTranscriptEditor';
import { GroupSidebar } from '../review-groups/GroupSidebar';
import { ImagesEditor } from '../review-groups/ImagesEditor';
import { PassagesEditor } from '../review-groups/PassagesEditor';
import { QuestionsEditor } from '../review-groups/QuestionsEditor';
import { getMissingFlagLabel } from '../review-groups/reviewGroupUtils';
import { useReviewGroupsController } from '../../hooks/useReviewGroupsController';

interface StepReviewGroupsProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepReviewGroups = ({ testId, nextStep, prevStep }: StepReviewGroupsProps) => {
  const {
    activePart,
    addImage,
    addImagePassage,
    audioAssets,
    availableParts,
    blockedReviewCount,
    detail,
    errorMsg,
    filteredGroups,
    goNextStep,
    goPrevStep,
    hasBlockingFlags,
    imageAssets,
    loadingDetail,
    loadingList,
    markAllReviewed,
    patchReviewStatus,
    reviewableGroups,
    saveStatusClass,
    saveStatusText,
    saving,
    selectGroup,
    selectPart,
    selectedGroupId,
    setAnswerValue,
    setCorrectAnswer,
    setDetailValue,
    setQuestionValue,
  } = useReviewGroupsController({ testId, nextStep, prevStep });

  if (loadingList) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải nhóm câu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-semibold text-[#b42318]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <GroupSidebar
          availableParts={availableParts}
          activePart={activePart}
          filteredGroups={filteredGroups}
          selectedGroupId={selectedGroupId}
          saving={saving}
          reviewableCount={reviewableGroups.length}
          blockedReviewCount={blockedReviewCount}
          onSelectPart={(partNumber) => void selectPart(partNumber)}
          onSelectGroup={(groupId) => void selectGroup(groupId)}
          onMarkAllReviewed={() => void markAllReviewed()}
        />

        <section className="min-w-0">
          <div className="min-h-[640px] rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm">
            {loadingDetail ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
                <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải chi tiết nhóm câu...</p>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                {detail.missing_flags && detail.missing_flags.length > 0 && (
                  <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-3">
                    <p className="text-xs font-bold uppercase text-[#b42318]">Thiếu dữ liệu</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detail.missing_flags.map((flag) => (
                        <span key={flag} className="rounded bg-white px-2 py-1 text-xs font-bold text-[#b42318]">
                          {getMissingFlagLabel(flag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <ImagesEditor
                  detail={detail}
                  imageAssets={imageAssets}
                  setDetailValue={setDetailValue}
                  addImage={addImage}
                />

                <AudioTranscriptEditor
                  detail={detail}
                  audioAssets={audioAssets}
                  setDetailValue={setDetailValue}
                />

                {detail.part_number >= 6 && (
                  <PassagesEditor
                    detail={detail}
                    imageAssets={imageAssets}
                    setDetailValue={setDetailValue}
                    addImagePassage={addImagePassage}
                  />
                )}

                <QuestionsEditor
                  questions={detail.questions}
                  setQuestionValue={setQuestionValue}
                  setAnswerValue={setAnswerValue}
                  setCorrectAnswer={setCorrectAnswer}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f3f5fb] pt-4">
                  <span className={`text-xs font-bold ${saveStatusClass}`}>{saveStatusText}</span>
                  <button
                    onClick={() => void patchReviewStatus(detail.review_status === 'reviewed' ? 'needs_review' : 'reviewed')}
                    disabled={saving || (detail.review_status !== 'reviewed' && hasBlockingFlags)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40 ${
                      detail.review_status === 'reviewed'
                        ? 'border border-[#d8dced] text-[#344054]'
                        : 'bg-[#027a48] text-white'
                    }`}
                    title={
                      detail.review_status !== 'reviewed' && hasBlockingFlags
                        ? 'Bổ sung dữ liệu thiếu trước khi đánh dấu đã review.'
                        : undefined
                    }
                  >
                    {detail.review_status === 'reviewed' ? 'Chuyển về cần review' : 'Đánh dấu đã review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-sm font-semibold text-[#667085]">Chưa chọn nhóm câu.</div>
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={() => void goPrevStep()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-[#f9fafb] disabled:opacity-40"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
        <button
          onClick={() => void goNextStep()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
