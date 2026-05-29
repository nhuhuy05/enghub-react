import { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { TestCollection } from '../../types/teacherTestTypes';

interface StepCollectionTestProps {
  testId: number | null;
  collectionId: number | null;
  setTestId: (id: number) => void;
  nextStep: () => void;
}

export const StepCollectionTest = ({
  testId,
  collectionId,
  setTestId,
  nextStep,
}: StepCollectionTestProps) => {
  const [collections, setCollections] = useState<TestCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [isStandalone, setIsStandalone] = useState(false);
  const [selectedColId, setSelectedColId] = useState<number | null>(null);
  const [testNumber, setTestNumber] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(120);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = (err as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
  };

  // Fetch collections
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await teacherTestService.getCollections();
        if (res.code === 1000) {
          setCollections(res.result || []);
          
          // Pre-select collection from URL if available
          if (collectionId) {
            setSelectedColId(collectionId);
            setIsStandalone(false);
          } else if (res.result && res.result.length > 0) {
            setSelectedColId(res.result[0].id);
          }
        }
      } catch (err) {
        console.error('Không thể lấy danh sách bộ đề:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [collectionId]);

  // Load existing test details if editing
  useEffect(() => {
    if (testId) {
      const loadTest = async () => {
        try {
          setLoading(true);
          const res = await teacherTestService.getTestById(testId);
          if (res.code === 1000 && res.result) {
            const t = res.result;
            setTitle(t.title);
            setDescription(t.description || '');
            setDuration(t.duration_minutes);
            if (t.collection_id) {
              setSelectedColId(t.collection_id);
              setTestNumber(t.test_number || '');
              setIsStandalone(false);
            } else {
              setIsStandalone(true);
              setSelectedColId(null);
              setTestNumber('');
            }
          }
        } catch (err) {
          console.error('Không thể lấy thông tin đề thi:', err);
        } finally {
          setLoading(false);
        }
      };
      loadTest();
    }
  }, [testId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề đề thi');
      return;
    }

    if (!isStandalone) {
      if (!selectedColId) {
        setErrorMsg('Vui lòng chọn bộ đề thi');
        return;
      }
      if (testNumber === '' || Number(testNumber) <= 0) {
        setErrorMsg('Vui lòng nhập số thứ tự đề thi hợp lệ');
        return;
      }
    }

    // If editing, we can just navigate to the next step
    if (testId) {
      nextStep();
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const res = await teacherTestService.createTest({
        collection_id: isStandalone ? null : selectedColId,
        test_number: isStandalone ? null : Number(testNumber),
        title: title.trim(),
        description: description.trim(),
        duration_minutes: duration,
      });

      if (res.code === 1000) {
        setTestId(res.result.id);
        nextStep();
      } else {
        setErrorMsg(res.message || 'Tạo đề thi thất bại');
      }
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Có lỗi xảy ra khi tạo đề thi'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004ac6] mx-auto"></div>
        <p className="text-sm text-[#667085] mt-4">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-sm font-semibold text-[#b42318] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Collection config */}
        <div className="space-y-5">
          <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#e4e7ec] space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">Loại đề thi</h3>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsStandalone(false);
                  if (collections.length > 0 && !selectedColId) {
                    setSelectedColId(collections[0].id);
                  }
                }}
                className={`flex-1 p-3 text-center text-xs font-bold rounded-xl border transition-all ${
                  !isStandalone
                    ? 'bg-[#eaf0ff] border-[#004ac6] text-[#004ac6] shadow-sm'
                    : 'bg-white border-[#d8dced] text-[#505f76] hover:bg-[#f9fafb]'
                }`}
                disabled={!!testId}
              >
                Thuộc bộ đề
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsStandalone(true);
                  setSelectedColId(null);
                  setTestNumber('');
                }}
                className={`flex-1 p-3 text-center text-xs font-bold rounded-xl border transition-all ${
                  isStandalone
                    ? 'bg-[#eaf0ff] border-[#004ac6] text-[#004ac6] shadow-sm'
                    : 'bg-white border-[#d8dced] text-[#505f76] hover:bg-[#f9fafb]'
                }`}
                disabled={!!testId}
              >
                Đề độc lập
              </button>
            </div>

            {!isStandalone && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344054]">Chọn bộ sưu tập <span className="text-[#b42318]">*</span></label>
                  <select
                    value={selectedColId || ''}
                    onChange={(e) => setSelectedColId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white"
                    disabled={!!testId}
                  >
                    <option value="" disabled>-- Chọn bộ sưu tập --</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344054]">Số thứ tự đề <span className="text-[#b42318]">*</span></label>
                  <input
                    type="number"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ví dụ: 1"
                    min="1"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white"
                    disabled={!!testId}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: General test info */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#344054]">Tiêu đề đề thi <span className="text-[#b42318]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: ETS 2023 - Test 1"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white"
              disabled={!!testId}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#344054]">Mô tả đề thi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả đề thi..."
              rows={3}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white resize-none"
              disabled={!!testId}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#344054]">Thời gian làm bài (Phút) <span className="text-[#b42318]">*</span></label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="120"
              min="1"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#d8dced] focus:outline-none focus:border-[#004ac6] bg-white"
              disabled={!!testId}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#f3f5fb] flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#003da3] transition-all"
          disabled={saving}
        >
          {saving ? 'Đang tạo...' : testId ? 'Tiếp tục' : 'Tạo & Tiếp tục'}
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </form>
  );
};
