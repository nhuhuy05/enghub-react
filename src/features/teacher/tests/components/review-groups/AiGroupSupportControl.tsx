import { useState } from 'react';
import type { GenerateGroupAiSupportInput } from '../../types/teacherTestTypes';
import { AiGenerateButton } from './AiGenerateButton';
import type { AiGenerateAction } from './reviewGroupUtils';

interface AiGroupSupportControlProps {
  generatingAction: AiGenerateAction | null;
  saving: boolean;
  onGenerate: (input: GenerateGroupAiSupportInput) => void;
}

export const AiGroupSupportControl = ({
  generatingAction,
  saving,
  onGenerate,
}: AiGroupSupportControlProps) => {
  const [overwrite, setOverwrite] = useState(false);
  const disabled = saving || Boolean(generatingAction);

  const submit = () => {
    if (disabled) return;
    onGenerate({
      transcript: true,
      question_translation: true,
      explanation: true,
      overwrite,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-3">
      
      <AiGenerateButton
        action="group"
        label="Tạo toàn bộ nội dung"
        generatingAction={generatingAction}
        saving={saving}
        onClick={submit}
      />
      <label className="flex items-center gap-2 text-xs font-semibold text-[#344054]">
        <input
          type="checkbox"
          checked={overwrite}
          disabled={disabled}
          onChange={(event) => setOverwrite(event.target.checked)}
          className="h-4 w-4 rounded border-[#d8dced] text-[#004ac6]"
        />
        Ghi đè đã tồn tại
      </label>
    </div>
  );
};
