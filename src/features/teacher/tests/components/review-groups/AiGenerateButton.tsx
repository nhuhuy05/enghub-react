import { Loader2, Sparkles } from 'lucide-react';
import type { AiGenerateAction } from './reviewGroupUtils';

interface AiGenerateButtonProps {
  action: AiGenerateAction;
  label: string;
  generatingAction: AiGenerateAction | null;
  saving: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export const AiGenerateButton = ({
  action,
  label,
  generatingAction,
  saving,
  onClick,
  disabled = false,
  title,
}: AiGenerateButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={saving || Boolean(generatingAction) || disabled}
    title={title}
    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-xs font-bold text-[#344054] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-45"
  >
    {generatingAction === action ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#004ac6]" />
    ) : (
      <Sparkles className="h-3.5 w-3.5 text-[#004ac6]" />
    )}
    {label}
  </button>
);
