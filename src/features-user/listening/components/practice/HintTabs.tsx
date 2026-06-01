import type { ListeningHintLevel } from '../../types';

const hintLevels: ListeningHintLevel[] = [30, 50, 100];

interface HintTabsProps {
  value: ListeningHintLevel;
  onChange: (value: ListeningHintLevel) => void;
  compact?: boolean;
}

export const HintTabs = ({ value, onChange, compact = false }: HintTabsProps) => (
  <div className={`inline-flex rounded-lg bg-[#f1f5f9] p-0.5 ${compact ? '' : 'mt-3'}`}>
    {hintLevels.map((level) => (
      <button
        key={level}
        onClick={() => onChange(level)}
        className={`rounded-md px-3 py-1.5 text-xs font-bold leading-4 ${
          value === level ? 'bg-[#173b68] text-white' : 'text-[#526985]'
        }`}
      >
        {level}%
      </button>
    ))}
  </div>
);
