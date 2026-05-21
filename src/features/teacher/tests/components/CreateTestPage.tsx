import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

// Steps imports
import { StepCollectionTest } from './steps/StepCollectionTest';
import { StepMediaUpload } from './steps/StepMediaUpload';
import { StepQuestionImport } from './steps/StepQuestionImport';
import { StepAudioRanges } from './steps/StepAudioRanges';
import { StepPreview } from './steps/StepPreview';
import { StepPublish } from './steps/StepPublish';

const STEPS = [
  { id: 1, label: 'Khởi tạo đề' },
  { id: 2, label: 'Tải Media' },
  { id: 3, label: 'Nhập câu hỏi' },
  { id: 4, label: 'Mốc audio' },
  { id: 5, label: 'Kiểm duyệt' },
  { id: 6, label: 'Xuất bản' },
];

export const CreateTestPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read params
  const urlTestId = searchParams.get('testId');
  const urlCollectionId = searchParams.get('collectionId');

  const [testId, setTestId] = useState<number | null>(
    urlTestId ? parseInt(urlTestId, 10) : null
  );
  const [collectionId] = useState<number | null>(
    urlCollectionId ? parseInt(urlCollectionId, 10) : null
  );

  const [activeStep, setActiveStep] = useState<number>(1);

  // If testId changes, update the URL search params so page refresh works correctly
  const handleSetTestId = (id: number) => {
    setTestId(id);
    setSearchParams((prev) => {
      prev.set('testId', id.toString());
      return prev;
    });
  };

  const nextStep = () => {
    if (activeStep < STEPS.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepId: number) => {
    // Only allow navigation to subsequent steps if test has been created
    if (testId || stepId === 1) {
      setActiveStep(stepId);
    }
  };

  const handleComplete = () => {
    navigate('/teacher/tests');
  };

  // Render step component
  const renderStepComponent = () => {
    switch (activeStep) {
      case 1:
        return (
          <StepCollectionTest
            testId={testId}
            collectionId={collectionId}
            setTestId={handleSetTestId}
            nextStep={nextStep}
          />
        );
      case 2:
        return testId ? (
          <StepMediaUpload testId={testId} nextStep={nextStep} prevStep={prevStep} />
        ) : null;
      case 3:
        return testId ? (
          <StepQuestionImport testId={testId} nextStep={nextStep} prevStep={prevStep} />
        ) : null;
      case 4:
        return testId ? (
          <StepAudioRanges testId={testId} nextStep={nextStep} prevStep={prevStep} />
        ) : null;
      case 5:
        return testId ? (
          <StepPreview testId={testId} nextStep={nextStep} prevStep={prevStep} />
        ) : null;
      case 6:
        return testId ? (
          <StepPublish
            testId={testId}
            collectionId={collectionId}
            prevStep={prevStep}
            onComplete={handleComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 bg-[#f6f7fc] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1120px]">
        {/* Back Link */}
        <button
          onClick={() => navigate('/teacher/tests')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#505f76] hover:text-[#004ac6] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>

        {/* Wizard Header Card */}
        <div className="rounded-2xl border border-[#d8dced] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#111827]">Tạo đề thi TOEIC mới</h1>
            <p className="mt-1 text-sm text-[#667085]">
              {testId ? `Đang chỉnh sửa Đề thi ID: ${testId}` : 'Tạo mới, nhập thông tin, tải lên tài nguyên và xuất bản.'}
            </p>
          </div>

          {/* Premium Stepper */}
          <div className="relative flex items-center justify-between w-full mt-8 select-none">
            {/* Stepper Progress Bar */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#e4e7ec] -translate-y-1/2 z-0 hidden md:block" />
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-[#004ac6] -translate-y-1/2 z-0 transition-all duration-300 hidden md:block"
              style={{
                width: `${((activeStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />

            {STEPS.map((step) => {
              const isCompleted = activeStep > step.id;
              const isActive = activeStep === step.id;
              const isDisabled = !testId && step.id > 1;

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={isDisabled}
                  className="relative z-10 flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#004ac6] border-[#004ac6] text-white'
                        : isActive
                        ? 'bg-white border-[#004ac6] text-[#004ac6] ring-4 ring-[#004ac6]/10'
                        : 'bg-white border-[#d8dced] text-[#667085] hover:border-[#98a2b3]'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold whitespace-nowrap transition-all hidden md:block ${
                      isActive ? 'text-[#004ac6] font-bold' : 'text-[#667085] group-hover:text-[#111827]'
                    } ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Component Container */}
        <div className="mt-8 rounded-2xl border border-[#d8dced] bg-white p-6 sm:p-8 shadow-sm">
          {renderStepComponent()}
        </div>
      </div>
    </main>
  );
};
