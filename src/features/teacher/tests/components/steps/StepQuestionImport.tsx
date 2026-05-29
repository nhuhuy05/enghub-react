import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Info,
  Upload,
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { ImportResult } from '../../types/teacherTestTypes';

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
      setErrorMsg('Please choose an Excel file.');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setImportResult(null);
      const res = await teacherTestService.importExcel(testId, selectedFile, replaceExisting);
      if (res.code !== 1000) {
        setErrorMsg(res.message || 'Import failed.');
        return;
      }

      setImportResult(res.result);
      if (res.result.success) {
        window.setTimeout(nextStep, 700);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Could not upload Excel file.'));
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

      <div className="flex gap-3 rounded-2xl border border-[#004ac6]/10 bg-[#f0f4ff] p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#004ac6]" />
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#111827]">Excel import rules</h4>
          <p className="text-xs leading-relaxed text-[#505f76]">
            The workbook must contain a <strong className="text-[#111827]">questions</strong> sheet. For Part 1
            and Part 2, question text and answer option text can be blank when the original TOEIC item does not show
            printed text.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg border border-[#d8dced] bg-white text-left text-[10px]">
              <thead className="bg-[#f9fafb] font-bold text-[#344054]">
                <tr>
                  <th className="border-b border-[#e4e7ec] px-3 py-1.5">Column</th>
                  <th className="border-b border-[#e4e7ec] px-3 py-1.5">Requirement</th>
                  <th className="border-b border-[#e4e7ec] px-3 py-1.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e7ec] text-[#344054]">
                <tr>
                  <td className="px-3 py-1.5 font-semibold">part</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Required</td>
                  <td className="px-3 py-1.5">Number from 1 to 7.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">group_order</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Required</td>
                  <td className="px-3 py-1.5">Groups rows into one question group inside each part.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">q_number</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Required</td>
                  <td className="px-3 py-1.5">Question number from 1 to 200, no duplicate.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">question_text</td>
                  <td className="px-3 py-1.5 text-[#b25e00]">Can be blank</td>
                  <td className="px-3 py-1.5">Part 1-4 can leave blank if the original item has no printed question.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">option_a, option_b, option_c</td>
                  <td className="px-3 py-1.5 text-[#b25e00]">Part dependent</td>
                  <td className="px-3 py-1.5">Part 1/2 can leave blank. Part 3-7 should include visible answer text when available.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">option_d</td>
                  <td className="px-3 py-1.5 text-[#b25e00]">Part dependent</td>
                  <td className="px-3 py-1.5">Part 1/2 can leave blank. Part 2 usually has no D option.</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-semibold">correct</td>
                  <td className="px-3 py-1.5 text-[#027a48]">Required</td>
                  <td className="px-3 py-1.5">A/B/C/D. For Part 2, use A/B/C when there is no D option.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form onSubmit={handleImport} className="space-y-5 rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-6 lg:col-span-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <FileSpreadsheet className="h-4.5 w-4.5 text-[#004ac6]" />
            Upload question Excel
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
                <p className="text-sm font-bold text-[#344054]">Choose Excel file</p>
                <p className="mt-1 text-xs text-[#667085]">Accepts .xlsx or .xls</p>
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
            Replace previous imported data
          </label>

          {replaceExisting && (
            <div className="rounded-xl border border-[#fecdca] bg-[#fff1f0] p-3 text-xs font-semibold text-[#b42318]">
              Replace mode rebuilds imported questions, groups, and media mapping for this test.
            </div>
          )}

          <button
            type="submit"
            disabled={importing}
            className="w-full rounded-lg bg-[#004ac6] py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
          >
            {importing ? 'Importing...' : 'Import questions'}
          </button>
        </form>

        <div className="flex flex-col justify-between rounded-2xl border border-[#d8dced] bg-white p-6 shadow-sm lg:col-span-7">
          <div>
            <h3 className="mb-4 border-b border-[#f3f5fb] pb-3 text-sm font-bold text-[#111827]">Import result</h3>

            {!importResult ? (
              <div className="py-16 text-center text-xs text-[#667085]">
                No file has been imported yet.
              </div>
            ) : importResult.success ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-4">
                  <CheckCircle className="h-6 w-6 shrink-0 text-[#027a48]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#027a48]">Import successful</h4>
                    <p className="mt-0.5 text-xs text-[#027a48]/90">Questions were imported. Moving to Review Groups...</p>
                  </div>
                </div>
                <ImportSummary result={importResult} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-[#b42318]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#b42318]">Import failed</h4>
                    <p className="mt-0.5 text-xs text-[#b42318]/90">Found {importResult.summary.error_count} errors.</p>
                  </div>
                </div>
                <ImportSummary result={importResult} />
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#e4e7ec]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="sticky top-0 border-b border-[#e4e7ec] bg-[#f9fafb] font-bold text-[#344054]">
                      <tr>
                        <th className="px-4 py-2">Row</th>
                        <th className="px-4 py-2">Field</th>
                        <th className="px-4 py-2">Message</th>
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
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!importResult?.success}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#003da3] disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

const ImportSummary = ({ result }: { result: ImportResult }) => (
  <div className="grid grid-cols-3 gap-4 text-center">
    <div className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#667085]">Total rows</span>
      <span className="mt-1 block text-xl font-black text-[#111827]">{result.summary.total_rows}</span>
    </div>
    <div className="rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#027a48]">Valid rows</span>
      <span className="mt-1 block text-xl font-black text-[#027a48]">{result.summary.valid_rows}</span>
    </div>
    <div className="rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-3.5">
      <span className="block text-[10px] font-semibold uppercase text-[#b42318]">Errors</span>
      <span className="mt-1 block text-xl font-black text-[#b42318]">{result.summary.error_count}</span>
    </div>
  </div>
);
