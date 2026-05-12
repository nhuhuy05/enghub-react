import type { ListeningHintLevel } from '../../types';

const hintLevels: ListeningHintLevel[] = [30, 50, 100];

interface HintTabsProps {
  value: ListeningHintLevel;
  onChange: (value: ListeningHintLevel) => void;
  compact?: boolean;
}

export const HintTabs = ({ value, onChange, compact = false }: HintTabsProps) => (
  <div className={`inline-flex rounded-xl bg-[#f1f5f9] p-1 ${compact ? '' : 'mt-5'}`}>
    {hintLevels.map((level) => (
      <button
        key={level}
        onClick={() => onChange(level)}
        className={`rounded-lg px-3.5 py-1.5 text-[15px] font-bold leading-5 ${
          value === level ? 'bg-[#173b68] text-white' : 'text-[#526985]'
        }`}
      >
        {level}%
      </button>
    ))}
  </div>
);
