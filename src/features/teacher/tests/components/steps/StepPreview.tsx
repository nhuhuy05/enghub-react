import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PreviewContent, PreviewResult } from '../../types/teacherTestTypes';
import { PreviewGroup } from '../preview/PreviewGroup';
import { ValidationPanel } from '../preview/ValidationPanel';
import { getErrorMessage } from '../preview/previewUtils';

interface StepPreviewProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepPreview = ({ testId, nextStep, prevStep }: StepPreviewProps) => {
  const [validation, setValidation] = useState<PreviewResult | null>(null);
  const [content, setContent] = useState<PreviewContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activePart, setActivePart] = useState<number | null>(null);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [validationRes, contentRes] = await Promise.all([
        teacherTestService.previewTest(testId),
        teacherTestService.getPreviewContent(testId),
      ]);

      if (validationRes.code === 1000) {
        setValidation(validationRes.result);
      } else {
        setErrorMsg(validationRes.message || 'Không thể tải validation của Preview.');
      }

      if (contentRes.code === 1000) {
        setContent(contentRes.result);
      } else {
        setErrorMsg(contentRes.message || 'Không thể tải nội dung Preview.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải Preview.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPreview();
  }, [testId]);

  useEffect(() => {
    if (!content?.parts.length) return;
    setActivePart((currentPart) =>
      currentPart && content.parts.some((part) => part.part_number === currentPart)
        ? currentPart
        : content.parts[0].part_number
    );
  }, [content]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải Preview...</p>
      </div>
    );
  }

  if (errorMsg || !validation || !content) {
    return (
      <div className="rounded-2xl border border-[#d8dced] bg-white py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#d92d20]" />
        <h4 className="text-base font-bold text-[#111827]">Preview thất bại</h4>
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-[#667085]">{errorMsg || 'Không có dữ liệu Preview.'}</p>
        <button
          onClick={() => void fetchPreview()}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Thử lại
        </button>
      </div>
    );
  }

  const selectedPart = activePart ?? content.parts[0]?.part_number ?? null;
  const visibleParts = selectedPart
    ? content.parts.filter((part) => part.part_number === selectedPart)
    : content.parts;

  return (
    <div className="space-y-6">
      <ValidationPanel validation={validation} onRefresh={fetchPreview} />

      <div className="rounded-2xl border border-[#d8dced] bg-white shadow-sm">
        <div className="border-b border-[#f3f5fb] px-5 py-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#111827]">{content.title}</h3>
              <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                {content.description || 'Không có mô tả'} | {content.duration_minutes} phút
              </p>
            </div>
            <div className="flex max-w-full shrink-0 overflow-x-auto rounded-lg border border-[#d8dced] bg-[#f9fafb] p-1 xl:w-auto">
              {content.parts.map((part) => (
                <button
                  key={part.part_number}
                  onClick={() => setActivePart(part.part_number)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    selectedPart === part.part_number
                      ? 'bg-white text-[#004ac6] shadow-sm'
                      : 'text-[#505f76] hover:bg-white/80'
                  }`}
                >
                  Part {part.part_number}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6">
          {visibleParts.map((part) => (
            <section key={part.part_number} className="space-y-4">
              {part.groups.length === 0 ? (
                <p className="rounded-xl border border-[#e4e7ec] p-4 text-xs font-semibold text-[#667085]">
                  Part này chưa có nhóm câu.
                </p>
              ) : (
                part.groups.map((group) => <PreviewGroup key={group.id} group={group} />)
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại Review
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
