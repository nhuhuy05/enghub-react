import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PublishResult, Test } from '../../types/teacherTestTypes';

interface StepPublishProps {
  testId: number;
  collectionId?: number | null;
  prevStep: () => void;
  onComplete: () => void;
}

export const StepPublish = ({
  testId,
  collectionId: propCollectionId,
  prevStep,
  onComplete,
}: StepPublishProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCollectionId = searchParams.get('collectionId');
  const collectionId = propCollectionId || (urlCollectionId ? parseInt(urlCollectionId, 10) : null);

  const [test, setTest] = useState<Test | null>(null);
  const [isPublishable, setIsPublishable] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        // Load test details
        const testRes = await teacherTestService.getTestById(testId, collectionId);
        if (testRes.code === 1000) {
          setTest(testRes.result);
        }

        // Load preview to check if publishable
        const previewRes = await teacherTestService.previewTest(testId);
        if (previewRes.code === 1000) {
          setIsPublishable(previewRes.result.publishable);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thông tin xác nhận:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [testId]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setErrorMsg('');
      setPublishResult(null);

      const res = await teacherTestService.publishTest(testId);
      if (res.code === 1000) {
        setPublishResult(res.result);
        if (res.result.success) {
          setIsPublishable(false); // Hide the publish button
        }
      } else {
        setErrorMsg(res.message || 'Xuất bản đề thi thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xuất bản.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004ac6] mx-auto"></div>
        <p className="text-sm text-[#667085] mt-4">Đang kiểm tra trạng thái cuối...</p>
      </div>
    );
  }

  // If published successfully
  if (publishResult?.success) {
    return (
      <div className="py-10 text-center space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#edfcf2] text-[#027a48] border border-[#d3f5d5] shadow-md">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#111827]">Xuất bản thành công!</h2>
          <p className="text-sm text-[#667085] leading-relaxed">
            Đề thi <strong className="text-[#111827]">"{test?.title}"</strong> hiện đã ở trạng thái công khai. Học viên có thể tìm thấy và bắt đầu làm bài luyện tập.
          </p>
        </div>

        {test && (
          <div className="bg-[#f9fafb] border border-[#e4e7ec] p-4 rounded-2xl text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-[#e4e7ec] pb-2">
              <span className="text-[#667085] font-semibold">Tên đề thi:</span>
              <span className="font-bold text-[#111827]">{test.title}</span>
            </div>
            <div className="flex justify-between border-b border-[#e4e7ec] pb-2">
              <span className="text-[#667085] font-semibold">Mã ID đề thi:</span>
              <span className="font-mono font-bold text-[#111827]">{test.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#e4e7ec] pb-2">
              <span className="text-[#667085] font-semibold">Thời gian:</span>
              <span className="font-bold text-[#111827]">{test.duration_minutes} phút</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085] font-semibold">Trạng thái:</span>
              <span className="font-bold text-[#027a48] flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Public
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl bg-[#004ac6] text-white text-sm font-bold shadow-md hover:bg-[#003da3] transition-all"
        >
          Quay lại danh sách đề thi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-sm font-semibold text-[#b42318] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Backend errors if publish was rejected */}
      {publishResult && !publishResult.success && (
        <div className="p-5 bg-[#fff1f0] border border-[#fecdca] rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[#d92d20]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h4 className="text-sm font-bold">Lỗi kiểm duyệt từ máy chủ:</h4>
          </div>
          <ul className="list-disc list-inside text-xs text-[#d92d20] space-y-1">
            {publishResult.errors.map((err, idx) => (
              <li key={idx} className="leading-relaxed">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main confirmation card */}
      <div className="bg-white p-8 border border-[#d8dced] rounded-2xl text-center shadow-sm max-w-xl mx-auto space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#004ac6]">
          <Globe className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#111827]">Sẵn sàng xuất bản đề thi?</h3>
          <p className="text-sm text-[#667085] leading-relaxed">
            Hành động này sẽ thay đổi trạng thái của đề thi từ <strong className="text-[#b54708]">Bản nháp</strong> thành <strong className="text-[#027a48]">Đã xuất bản</strong>.
            Học viên sẽ lập tức xem được đề thi này để ôn luyện.
          </p>
        </div>

        {test && (
          <div className="border border-[#e4e7ec] rounded-xl p-4 bg-[#f9fafb] text-left text-xs space-y-2.5">
            <h4 className="font-bold text-[#111827] border-b border-[#e4e7ec] pb-1.5 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#004ac6]" /> Tóm tắt đề thi:
            </h4>
            <p className="flex justify-between"><span className="text-[#667085]">Tiêu đề:</span> <strong className="text-[#111827]">{test.title}</strong></p>
            <p className="flex justify-between"><span className="text-[#667085]">Số câu hỏi:</span> <strong className="text-[#111827]">{test.total_questions} câu</strong></p>
            <p className="flex justify-between"><span className="text-[#667085]">Thời lượng:</span> <strong className="text-[#111827]">{test.duration_minutes} phút</strong></p>
          </div>
        )}

        <div className="pt-2">
          {isPublishable ? (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-3.5 rounded-xl bg-[#004ac6] text-white text-sm font-bold shadow-md hover:bg-[#003da3] transition-all flex items-center justify-center gap-2"
            >
              {publishing ? 'Đang thực hiện xuất bản...' : 'Kích hoạt & Xuất bản ngay'}
            </button>
          ) : (
            <div className="p-3.5 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-xs font-semibold text-[#b42318] flex items-center justify-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              Đề thi chưa đủ điều kiện xuất bản. Vui lòng quay lại Bước 5 để xem các lỗi còn thiếu.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-[#f3f5fb] flex items-center justify-between">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] hover:bg-[#f9fafb] transition-all"
          disabled={publishing}
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
      </div>
    </div>
  );
};
