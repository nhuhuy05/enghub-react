import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { StepCollectionTest } from './steps/StepCollectionTest';
import { StepMediaUpload } from './steps/StepMediaUpload';
import { StepQuestionImport } from './steps/StepQuestionImport';
import { StepReviewGroups } from './steps/StepReviewGroups';
import { StepPreview } from './steps/StepPreview';
import { StepPublish } from './steps/StepPublish';
import { adminTestService } from '../services/adminTestService';
import type { Test } from '../types/adminTestTypes';

const STEPS = [
  { id: 1, label: 'Khởi tạo đề' },
  { id: 2, label: 'Tải Media' },
  { id: 3, label: 'Nhập Excel' },
  { id: 4, label: 'Review nhóm câu' },
  { id: 5, label: 'Preview' },
  { id: 6, label: 'Xuất bản' },
];

export const CreateTestPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const testsBasePath = '/admin/tests';

  const urlTestId = searchParams.get('testId');
  const urlCollectionId = searchParams.get('collectionId');
  const urlPublished = searchParams.get('published') === '1';

  const [testId, setTestId] = useState<number | null>(urlTestId ? parseInt(urlTestId, 10) : null);
  const [collectionId] = useState<number | null>(urlCollectionId ? parseInt(urlCollectionId, 10) : null);
  const [activeStep, setActiveStep] = useState<number>(urlPublished ? 6 : 1);
  const [test, setTest] = useState<Test | null>(null);
  const [loadingTest, setLoadingTest] = useState<boolean>(Boolean(urlTestId));
  const isPublished = Boolean(test?.is_published);
  const isEditLocked = loadingTest || isPublished;

  const canVisitStep = (stepId: number) => {
    if (!testId) {
      return stepId === 1;
    }

    if (loadingTest) {
      return activeStep === 6 && stepId === 6;
    }

    return !isPublished || stepId === 6;
  };

  const refreshTest = async (id = testId) => {
    if (!id) return;
    setLoadingTest(true);
    try {
      const res = await adminTestService.getTestById(id);
      if (res.code === 1000) {
        setTest(res.result);
        if (res.result.is_published) {
          setActiveStep(6);
        }
      }
    } catch (err) {
      console.warn('Cannot load test title for wizard header:', err);
    } finally {
      setLoadingTest(false);
    }
  };

  useEffect(() => {
    if (!testId) {
      return;
    }

    void refreshTest(testId);
  }, [testId]);

  useEffect(() => {
    if (isPublished && activeStep !== 6) {
      setActiveStep(6);
    }
  }, [activeStep, isPublished]);

  const handleSetTestId = (id: number) => {
    setTestId(id);
    setLoadingTest(true);
    setSearchParams((prev) => {
      prev.set('testId', id.toString());
      return prev;
    });
  };

  const nextStep = () => {
    const next = activeStep + 1;
    if (next <= STEPS.length && canVisitStep(next)) {
      setActiveStep(next);
    }
  };

  const prevStep = () => {
    const prev = activeStep - 1;
    if (prev >= 1 && canVisitStep(prev)) {
      setActiveStep(prev);
    }
  };

  const goToStep = (stepId: number) => {
    if (canVisitStep(stepId)) {
      setActiveStep(stepId);
    }
  };

  const handlePublishStatusChange = (nextTest: Test) => {
    setTest(nextTest);
    setSearchParams((prev) => {
      if (nextTest.is_published) {
        prev.set('published', '1');
      } else {
        prev.delete('published');
      }
      return prev;
    });
    if (nextTest.is_published) {
      setActiveStep(6);
    }
  };

  const handleComplete = () => {
    navigate(testsBasePath);
  };

  const renderStepComponent = () => {
    if (testId && loadingTest) {
      return (
        <div className="flex min-h-[240px] items-center justify-center text-sm font-semibold text-[#667085]">
          Đang tải dữ liệu đề thi...
        </div>
      );
    }

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
        return testId ? <StepMediaUpload testId={testId} nextStep={nextStep} prevStep={prevStep} /> : null;
      case 3:
        return testId ? <StepQuestionImport testId={testId} nextStep={nextStep} prevStep={prevStep} /> : null;
      case 4:
        return testId ? <StepReviewGroups testId={testId} nextStep={nextStep} prevStep={prevStep} /> : null;
      case 5:
        return testId ? <StepPreview testId={testId} nextStep={nextStep} prevStep={prevStep} /> : null;
      case 6:
        return testId ? (
          <StepPublish
            testId={testId}
            collectionId={collectionId}
            prevStep={prevStep}
            onComplete={handleComplete}
            isEditLocked={isEditLocked}
            onStatusChange={handlePublishStatusChange}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f6f7fc] px-3 py-3 sm:px-4 lg:px-4">
      <div className="mx-auto max-w-[1480px]">
        <button
          onClick={() => navigate(testsBasePath)}
          className="mb-3 inline-flex max-w-full items-center gap-2 text-sm font-semibold text-[#505f76] transition-colors hover:text-[#004ac6]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="truncate">
            {testId && test ? test.title : 'Quay lại danh sách'}
          </span>
        </button>

        <div className="sticky top-0 z-30 rounded-2xl border border-[#d8dced] bg-white px-5 py-3 shadow-sm sm:px-6 lg:top-0">
          <div className="relative flex w-full select-none items-center justify-between gap-2">
            <div className="absolute left-0 right-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[#e4e7ec]" />
            <div
              className="absolute left-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[#004ac6] transition-all duration-300"
              style={{
                width: `${((activeStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />

            {STEPS.map((step) => {
              const isCompleted = activeStep > step.id;
              const isActive = activeStep === step.id;
              const isDisabled = !canVisitStep(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={isDisabled}
                  className={`group relative z-10 flex items-center bg-white focus:outline-none ${
                    step.id === 1 ? 'pr-2' : step.id === STEPS.length ? 'pl-2' : 'px-2'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'border-[#004ac6] bg-[#004ac6] text-white'
                        : isActive
                          ? 'border-[#004ac6] bg-white text-[#004ac6] ring-4 ring-[#004ac6]/10'
                          : 'border-[#d8dced] bg-white text-[#667085] hover:border-[#98a2b3]'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span
                    className={`ml-2 hidden whitespace-nowrap text-xs font-semibold transition-all md:block ${
                      isActive ? 'font-bold text-[#004ac6]' : 'text-[#667085] group-hover:text-[#111827]'
                    } ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#d8dced] bg-white p-3 shadow-sm sm:p-4">
          {renderStepComponent()}
        </div>
      </div>
    </main>
  );
};
