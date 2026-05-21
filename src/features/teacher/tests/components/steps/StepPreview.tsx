import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PreviewResult } from '../../types/teacherTestTypes';

interface StepPreviewProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepPreview = ({
  testId,
  nextStep,
  prevStep,
}: StepPreviewProps) => {
  const [previewData, setPreviewData] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPreview();
  }, [testId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await teacherTestService.previewTest(testId);
      if (res.code === 1000) {
        setPreviewData(res.result);
      } else {
        setErrorMsg(res.message || 'Không thể lấy thông tin kiểm tra đề thi.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ để kiểm tra đề thi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004ac6] mx-auto"></div>
        <p className="text-sm text-[#667085] mt-4">Đang kiểm duyệt và phân tích đề thi...</p>
      </div>
    );
  }

  if (errorMsg || !previewData) {
    return (
      <div className="py-12 text-center bg-white border border-[#d8dced] rounded-2xl">
        <AlertTriangle className="h-10 w-10 text-[#d92d20] mx-auto mb-3" />
        <h4 className="text-base font-bold text-[#111827]">Đã xảy ra lỗi</h4>
        <p className="text-xs text-[#667085] mt-1.5 max-w-sm mx-auto">{errorMsg || 'Không có dữ liệu'}</p>
        <button
          onClick={fetchPreview}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Thử lại
        </button>
      </div>
    );
  }

  const {
    question_count,
    invalid_correct_answer_count,
    part1_missing_image_count,
    listening_missing_audio_range_count,
    reading_missing_passage_count,
    publishable,
    errors
  } = previewData;

  return (
    <div className="space-y-6">
      {/* Banner status */}
      {publishable ? (
        <div className="p-5 bg-[#edfcf2] border border-[#d3f5d5] rounded-2xl flex gap-4 items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d3f5d5] text-[#027a48]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#027a48]">Đề thi đã sẵn sàng xuất bản!</h4>
            <p className="text-xs text-[#027a48]/90 mt-0.5">Tất cả các tiêu chí kiểm duyệt tối thiểu đều đã được đáp ứng.</p>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-[#fff1f0] border border-[#fecdca] rounded-2xl flex gap-4 items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fecdca] text-[#d92d20]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#d92d20]">Chưa đủ điều kiện xuất bản</h4>
            <p className="text-xs text-[#d92d20]/90 mt-0.5">Một số phần dữ liệu của đề thi còn thiếu hoặc không chính xác. Hãy hoàn thiện trước khi xuất bản.</p>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="bg-white rounded-2xl border border-[#d8dced] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f3f5fb] pb-3 mb-2">
          <h3 className="text-sm font-extrabold text-[#111827]">Tiêu chí kiểm duyệt (Checklist)</h3>
          <button
            onClick={fetchPreview}
            className="inline-flex items-center gap-1 text-xs text-[#667085] hover:text-[#004ac6] transition-all"
          >
            <RefreshCw className="h-3 w-3" /> Làm mới checklist
          </button>
        </div>

        {/* 1. Question count */}
        <div className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl">
          <div className="flex items-center gap-3">
            {question_count === 200 ? (
              <CheckCircle className="h-5 w-5 text-[#027a48] shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#b42318] shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold text-[#111827] block">Số câu hỏi đã nhập</span>
              <span className="text-[10px] text-[#667085] block">Đề thi chuẩn TOEIC cần có đúng 200 câu hỏi</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
            question_count === 200 ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]'
          }`}>
            {question_count} / 200 câu
          </span>
        </div>

        {/* 2. Invalid answers */}
        <div className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl">
          <div className="flex items-center gap-3">
            {invalid_correct_answer_count === 0 ? (
              <CheckCircle className="h-5 w-5 text-[#027a48] shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#b42318] shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold text-[#111827] block">Số đáp án không hợp lệ</span>
              <span className="text-[10px] text-[#667085] block">Các đáp án phải là A, B, C, D (hoặc A, B, C cho Part 2)</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
            invalid_correct_answer_count === 0 ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]'
          }`}>
            {invalid_correct_answer_count} lỗi
          </span>
        </div>

        {/* 3. Part 1 missing images */}
        <div className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl">
          <div className="flex items-center gap-3">
            {part1_missing_image_count === 0 ? (
              <CheckCircle className="h-5 w-5 text-[#027a48] shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#b42318] shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold text-[#111827] block">Số ảnh thiếu ở Part 1</span>
              <span className="text-[10px] text-[#667085] block">Mỗi câu hỏi trong Part 1 (câu 1 - 6) cần có 1 ảnh minh họa</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
            part1_missing_image_count === 0 ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]'
          }`}>
            Thiếu {part1_missing_image_count} ảnh
          </span>
        </div>

        {/* 4. Listening missing audio ranges */}
        <div className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl">
          <div className="flex items-center gap-3">
            {listening_missing_audio_range_count === 0 ? (
              <CheckCircle className="h-5 w-5 text-[#027a48] shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#b42318] shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold text-[#111827] block">Số nhóm thiếu mốc audio (Part 1 - 4)</span>
              <span className="text-[10px] text-[#667085] block">Tất cả các câu/nhóm câu hỏi nghe cần có mốc thời gian audio</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
            listening_missing_audio_range_count === 0 ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]'
          }`}>
            Thiếu {listening_missing_audio_range_count} mốc
          </span>
        </div>

        {/* 5. Reading missing passages */}
        <div className="flex items-center justify-between p-3 border border-[#e4e7ec] rounded-xl">
          <div className="flex items-center gap-3">
            {reading_missing_passage_count === 0 ? (
              <CheckCircle className="h-5 w-5 text-[#027a48] shrink-0" />
            ) : (
              <HelpCircle className="h-5 w-5 text-[#ff9800] shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold text-[#111827] block">Số nhóm thiếu văn bản (Part 6 - 7)</span>
              <span className="text-[10px] text-[#667085] block">Giai đoạn này FE chưa tích hợp giao diện soạn thảo passage (bỏ qua nếu cần thiết)</span>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
            reading_missing_passage_count === 0 ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fff4e5] text-[#b25e00]'
          }`}>
            Thiếu {reading_missing_passage_count} đoạn
          </span>
        </div>
      </div>

      {/* Errors list */}
      {errors && errors.length > 0 && (
        <div className="bg-[#fef3f2] border border-[#fee4e2] p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-extrabold text-[#b42318] uppercase tracking-wider">Danh sách chi tiết lỗi từ hệ thống:</h4>
          <ul className="list-disc list-inside text-xs text-[#b42318] space-y-1">
            {errors.map((err, idx) => (
              <li key={idx} className="leading-relaxed">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-[#f3f5fb] flex items-center justify-between">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#003da3] transition-all"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
