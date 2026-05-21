import { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { ImportResult, ImportError } from '../../types/teacherTestTypes';

interface StepQuestionImportProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepQuestionImport = ({
  testId,
  nextStep,
  prevStep,
}: StepQuestionImportProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setImportResult(null);
      setErrorMsg('');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn file Excel');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setImportResult(null);
      
      const res = await teacherTestService.importExcel(testId, selectedFile, replaceExisting);
      if (res.code === 1000) {
        setImportResult(res.result);
      } else {
        setErrorMsg(res.message || 'Import thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi file lên server');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-xl text-sm font-semibold text-[#b42318] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Excel Sheet Guidance Card */}
      <div className="bg-[#f0f4ff] border border-[#004ac6]/10 p-5 rounded-2xl flex gap-3">
        <Info className="h-5 w-5 text-[#004ac6] shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#111827]">Quy định định dạng file Excel</h4>
          <p className="text-xs text-[#505f76] leading-relaxed">
            File Excel của bạn phải chứa sheet có tên là <strong className="text-[#111827]">questions</strong> và chứa các cột tiêu đề bắt buộc sau:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[10px] text-left border border-[#d8dced] bg-white rounded-lg overflow-hidden">
              <thead className="bg-[#f9fafb] text-[#344054] font-bold">
                <tr>
                  <th className="px-3 py-1.5 border-b border-[#e4e7ec]">Cột</th>
                  <th className="px-3 py-1.5 border-b border-[#e4e7ec]">Yêu cầu</th>
                  <th className="px-3 py-1.5 border-b border-[#e4e7ec]">Giá trị / Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e7ec] text-[#344054]">
                <tr>
                  <td className="px-3 py-1.5 font-semibold">`part`</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                  <td className="px-3 py-1.5">Số từ 1 đến 7 đại diện cho 7 phần thi TOEIC</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">`group_order`</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                  <td className="px-3 py-1.5">Số thứ tự câu đầu tiên trong nhóm (Part 1,2,5: = q_number)</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">`q_number`</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                  <td className="px-3 py-1.5">Số câu hỏi từ 1 đến 200 (không trùng lặp)</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">`correct`</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                  <td className="px-3 py-1.5">Đáp án đúng viết hoa (A/B/C/D. Riêng Part 2: A/B/C)</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">`option_a, b, c, d`</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Bắt buộc</td>
                  <td className="px-3 py-1.5">Các lựa chọn đáp án (Part 2 cột option_d để trống)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleImport} className="lg:col-span-5 bg-[#f9fafb] p-6 rounded-2xl border border-[#e4e7ec] space-y-5">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <FileSpreadsheet className="h-4.5 w-4.5 text-[#004ac6]" />
            Tải lên file câu hỏi
          </h3>

          <div className="border-2 border-dashed border-[#d8dced] hover:border-[#004ac6] rounded-xl p-8 text-center cursor-pointer transition-all bg-white relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-[#98a2b3] mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-[#004ac6] line-clamp-1">{selectedFile.name}</p>
                  <p className="text-xs text-[#667085] mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-[#344054]">Chọn file Excel câu hỏi</p>
                  <p className="text-xs text-[#667085] mt-1">Chấp nhận định dạng file .xlsx hoặc .xls</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="replace"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="h-4 w-4 rounded border-[#d8dced] text-[#004ac6] focus:ring-[#004ac6]"
            />
            <label htmlFor="replace" className="text-xs font-semibold text-[#344054] cursor-pointer">
              Ghi đè câu hỏi cũ nếu đã tồn tại trong đề thi này
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#004ac6] text-white text-sm font-bold shadow-md hover:bg-[#003da3] transition-all"
            disabled={importing}
          >
            {importing ? 'Đang import dữ liệu...' : 'Nhập câu hỏi'}
          </button>
        </form>

        {/* Results Area */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#d8dced] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#f3f5fb] mb-4">
              Kết quả Import dữ liệu
            </h3>

            {!importResult ? (
              <div className="py-16 text-center text-xs text-[#667085]">
                Chưa có tệp tin nào được import. Hãy tải lên tệp tin và nhấn "Nhập câu hỏi".
              </div>
            ) : importResult.success ? (
              <div className="space-y-5">
                <div className="p-4 bg-[#edfcf2] border border-[#d3f5d5] rounded-xl flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-[#027a48] shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[#027a48]">Nhập dữ liệu thành công!</h4>
                    <p className="text-xs text-[#027a48]/90 mt-0.5">Tất cả các dòng câu hỏi đã được nạp vào cơ sở dữ liệu.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[#f9fafb] p-3.5 border border-[#e4e7ec] rounded-xl">
                    <span className="text-[10px] text-[#667085] font-semibold block uppercase">Tổng số hàng</span>
                    <span className="text-xl font-black text-[#111827] mt-1 block">{importResult.summary.total_rows}</span>
                  </div>
                  <div className="bg-[#edfcf2] p-3.5 border border-[#d3f5d5] rounded-xl">
                    <span className="text-[10px] text-[#027a48] font-semibold block uppercase">Hàng hợp lệ</span>
                    <span className="text-xl font-black text-[#027a48] mt-1 block">{importResult.summary.valid_rows}</span>
                  </div>
                  <div className="bg-[#fef3f2] p-3.5 border border-[#fee4e2] rounded-xl">
                    <span className="text-[10px] text-[#b42318] font-semibold block uppercase">Số hàng lỗi</span>
                    <span className="text-xl font-black text-[#b42318] mt-1 block">{importResult.summary.error_count}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-[#b42318] shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[#b42318]">Nhập dữ liệu thất bại!</h4>
                    <p className="text-xs text-[#b42318]/90 mt-0.5">Phát hiện {importResult.summary.error_count} lỗi cấu trúc hoặc kiểu dữ liệu.</p>
                  </div>
                </div>

                <div className="border border-[#e4e7ec] rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-[#f9fafb] text-[#344054] font-bold border-b border-[#e4e7ec] sticky top-0">
                      <tr>
                        <th className="px-4 py-2">Dòng</th>
                        <th className="px-4 py-2">Trường</th>
                        <th className="px-4 py-2">Nội dung lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e7ec] text-[#344054]">
                      {importResult.errors.map((err, idx) => (
                        <tr key={idx} className="hover:bg-[#fef3f2]/30 transition-all">
                          <td className="px-4 py-2 font-bold text-[#b42318]">Hàng {err.row}</td>
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
          disabled={!importResult?.success}
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};
