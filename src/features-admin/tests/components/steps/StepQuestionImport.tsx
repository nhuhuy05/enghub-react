import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  FileSpreadsheet,
  Info,
  Upload,
} from 'lucide-react';
import { adminTestService } from '../../services/adminTestService';
import type { ImportResult } from '../../types/adminTestTypes';

interface StepQuestionImportProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const StepQuestionImport = ({ testId, nextStep, prevStep }: StepQuestionImportProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportGuide, setShowImportGuide] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImportResult(null);
    setErrorMsg('');
  };

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn file Excel.');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setImportResult(null);
      const res = await adminTestService.importExcel(testId, selectedFile, replaceExisting);
      if (res.code !== 1000) {
        setErrorMsg(res.message || 'Import thất bại.');
        return;
      }

      setImportResult(res.result);
      if (res.result.success) {
        window.setTimeout(nextStep, 700);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải file Excel.'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-semibold text-[#b42318]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-[#004ac6]/10 bg-[#f0f4ff]">
        <button
          type="button"
          onClick={() => setShowImportGuide((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <Info className="h-4.5 w-4.5 shrink-0 text-[#004ac6]" />
            Hướng dẫn import Excel
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#505f76] transition-transform ${showImportGuide ? 'rotate-180' : ''}`}
          />
        </button>
        {showImportGuide && (
          <div className="space-y-2 border-t border-[#d8dced] px-4 pb-4 pt-3">
            <p className="text-xs leading-relaxed text-[#505f76]">
              File Excel phải có sheet <strong className="text-[#111827]">questions</strong>. Với Part 1 và Part 2,
              question text và answer option có thể để trống khi đề TOEIC gốc không hiển thị text in sẵn.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-lg border border-[#d8dced] bg-white text-left text-[10px]">
                <thead className="bg-[#f9fafb] font-bold text-[#344054]">
                  <tr>
                    <th className="border-b border-[#e4e7ec] px-3 py-1.5">Cột</th>
                    <th className="border-b border-[#e4e7ec] px-3 py-1.5">Yêu cầu</th>
                    <th className="border-b border-[#e4e7ec] px-3 py-1.5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e7ec] text-[#344054]">
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">part</td>
                    <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                    <td className="px-3 py-1.5">Số từ 1 đến 7.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">group_order</td>
                    <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                    <td className="px-3 py-1.5">Gom các dòng vào cùng một question group trong từng Part.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">q_number</td>
                    <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                    <td className="px-3 py-1.5">Số câu từ 1 đến 200, không trùng.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">question_text</td>
                    <td className="px-3 py-1.5 text-[#b25e00]">Có thể trống</td>
                    <td className="px-3 py-1.5">Part 1/2/6 có thể để trống nếu đề gốc không có câu hỏi in sẵn.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">option_a, option_b, option_c</td>
                    <td className="px-3 py-1.5 text-[#b25e00]">Tùy Part</td>
                    <td className="px-3 py-1.5">Part 1/2 có thể để trống. Part 3-7 nên nhập answer text khi có.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">option_d</td>
                    <td className="px-3 py-1.5 text-[#b25e00]">Tùy Part</td>
                    <td className="px-3 py-1.5">Part 1/2 có thể để trống. Part 2 thường không có option D.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5 font-semibold">correct</td>
                    <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                    <td className="px-3 py-1.5">A/B/C/D. Với Part 2, dùng A/B/C nếu không có option D.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form onSubmit={handleImport} className="space-y-5 rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-6 lg:col-span-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <FileSpreadsheet className="h-4.5 w-4.5 text-[#004ac6]" />
            Tải Excel câu hỏi
          </h3>

          <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-[#d8dced] bg-white p-8 text-center transition-all hover:border-[#004ac6]">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={importing}
            />
            <Upload className="mx-auto mb-3 h-10 w-10 text-[#98a2b3]" />
            {selectedFile ? (
              <div>
                <p className="line-clamp-1 text-sm font-bold text-[#004ac6]">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-[#667085]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-[#344054]">Chọn file Excel</p>
                <p className="mt-1 text-xs text-[#667085]">Hỗ trợ .xlsx hoặc .xls</p>
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#344054]">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(event) => setReplaceExisting(event.target.checked)}
              className="h-4 w-4 rounded border-[#d8dced] text-[#004ac6] focus:ring-[#004ac6]"
            />
            Thay thế dữ liệu đã import trước đó
          </label>

          {replaceExisting && (
            <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-3 text-xs font-semibold text-[#b42318]">
              Chế độ thay thế sẽ tạo lại questions, groups và media mapping đã import của đề này.
            </div>
          )}

          <button
            type="submit"
            disabled={importing}
            className="w-full rounded-lg bg-[#004ac6] py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
          >
            {importing ? 'Đang import...' : 'Import câu hỏi'}
          </button>
        </form>

        <div className="flex flex-col justify-between rounded-2xl border border-[#d8dced] bg-white p-6 shadow-sm lg:col-span-7">
          <div>
            <h3 className="mb-4 border-b border-[#f3f5fb] pb-3 text-sm font-bold text-[#111827]">Kết quả import</h3>

            {!importResult ? (
              <div className="py-16 text-center text-xs text-[#667085]">
                Chưa import file nào.
              </div>
            ) : importResult.success ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-4">
                  <CheckCircle className="h-6 w-6 shrink-0 text-[#027a48]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#027a48]">Import thành công</h4>
                    <p className="mt-0.5 text-xs text-[#027a48]/90">Questions đã được import. Đang chuyển sang Review nhóm câu...</p>
                  </div>
                </div>
                <ImportSummary result={importResult} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-[#b42318]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#b42318]">Import thất bại</h4>
                    <p className="mt-0.5 text-xs text-[#b42318]/90">Có {importResult.summary.error_count} lỗi.</p>
                  </div>
                </div>
                <ImportSummary result={importResult} />
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#e4e7ec]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="sticky top-0 border-b border-[#e4e7ec] bg-[#f9fafb] font-bold text-[#344054]">
                      <tr>
                        <th className="px-4 py-2">Dòng</th>
                        <th className="px-4 py-2">Field</th>
                        <th className="px-4 py-2">Thông báo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e7ec] text-[#344054]">
                      {importResult.errors.map((err, index) => (
                        <tr key={`${err.row}-${err.field}-${index}`}>
                          <td className="px-4 py-2 font-bold text-[#b42318]">{err.row}</td>
                          <td className="px-4 py-2 font-semibold">{err.field}</td>
                          <td className="px-4 py-2 text-[#b42318]">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại
        </button>
        <button
          onClick={nextStep}
          disabled={!importResult?.success}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

const ImportSummary = ({ result }: { result: ImportResult }) => (
  <div className="grid grid-cols-3 gap-4 text-center">
    <div className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#667085]">Tổng dòng</span>
      <span className="mt-1 block text-xl font-bold text-[#111827]">{result.summary.total_rows}</span>
    </div>
    <div className="rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#027a48]">Dòng hợp lệ</span>
      <span className="mt-1 block text-xl font-bold text-[#027a48]">{result.summary.valid_rows}</span>
    </div>
    <div className="rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#b42318]">Lỗi</span>
      <span className="mt-1 block text-xl font-bold text-[#b42318]">{result.summary.error_count}</span>
    </div>
  </div>
);
