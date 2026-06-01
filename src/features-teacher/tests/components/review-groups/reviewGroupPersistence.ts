import { teacherTestService } from '../../services/teacherTestService';
import type { PatchGroupPassageInput, QuestionGroupDetail } from '../../types/teacherTestTypes';
import { normalizePassageTitle, type DirtyState } from './reviewGroupUtils';

export const persistDirtyReviewGroupDetail = async (
  snapshot: QuestionGroupDetail,
  dirtySnapshot: DirtyState
) => {
  let latestDetail = snapshot;

  if (dirtySnapshot.images) {
    const res = await teacherTestService.patchGroupImages(
      snapshot.id,
      snapshot.images.map((image, index) => ({
        media_asset_id: image.media_asset_id,
        order_index: index,
      }))
    );
    if (res.code !== 1000) throw new Error(res.message || 'Lưu image thất bại.');
    latestDetail = res.result;
  }

  if (dirtySnapshot.audio) {
    const res = await teacherTestService.patchGroupAudio(snapshot.id, {
      media_asset_id: snapshot.audio?.media_asset_id || null,
      start_ms: null,
      end_ms: null,
      transcript_en: snapshot.audio?.transcript_en ?? null,
      transcript_vi: snapshot.audio?.transcript_vi ?? null,
    });
    if (res.code !== 1000) throw new Error(res.message || 'Lưu Audio thất bại.');
    latestDetail = res.result;
  }

  if (dirtySnapshot.passages) {
    const passages: PatchGroupPassageInput[] = snapshot.passages.map((passage, index) => ({
      media_asset_id: passage.media_asset_id,
      title: passage.content_format === 'image' ? normalizePassageTitle(passage.title) : passage.title,
      passage_type: passage.passage_type,
      content_format: passage.content_format,
      content_en: passage.content_en,
      content_vi: passage.content_vi,
      vocab_hints: passage.vocab_hints,
      order_index: index,
    }));
    const res = await teacherTestService.patchGroupPassages(snapshot.id, passages);
    if (res.code !== 1000) throw new Error(res.message || 'Lưu passage thất bại.');
    latestDetail = res.result;
  }

  for (const questionId of dirtySnapshot.questionIds) {
    const question = snapshot.questions.find((item) => item.id === questionId);
    if (!question) continue;
    const res = await teacherTestService.patchQuestion(question.id, {
      question_text_en: question.question_text_en,
      question_text_vi: question.question_text_vi,
      explanation_vi: question.explanation_vi,
    });
    if (res.code !== 1000) throw new Error(res.message || 'Lưu Question thất bại.');
    latestDetail = res.result;
  }

  for (const answerId of dirtySnapshot.answerIds) {
    const answer = snapshot.questions.flatMap((question) => question.answers).find((item) => item.id === answerId);
    if (!answer) continue;
    const res = await teacherTestService.patchAnswer(answer.id, {
      answer_text_en: answer.answer_text_en,
      answer_text_vi: answer.answer_text_vi,
      is_correct: answer.is_correct,
    });
    if (res.code !== 1000) throw new Error(res.message || 'Lưu Answer thất bại.');
    latestDetail = res.result;
  }

  if (snapshot.review_status === 'reviewed') {
    const res = await teacherTestService.patchReviewStatus(snapshot.id, 'needs_review');
    if (res.code === 1000) latestDetail = res.result;
  }

  return latestDetail;
};
