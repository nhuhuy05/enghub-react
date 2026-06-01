interface ShortcutHintProps {
  text: string;
}

export const ShortcutHint = ({ text }: ShortcutHintProps) => (
  <p className="mt-3 text-center text-xs text-[#64748b]">
    {text.split('•').map((part, index) => (
      <span key={part}>
        {index > 0 && ' • '}
        {part.trim().replace(/^(Ctrl|Tab|Enter)/, '') && (
          <>
            {part.trim().startsWith('Ctrl') && <kbd className="rounded bg-[#eef2f7] px-1.5 py-0.5">Ctrl</kbd>}
            {part.trim().startsWith('Tab') && <kbd className="rounded bg-[#eef2f7] px-1.5 py-0.5">Tab</kbd>}
            {part.trim().startsWith('Enter') && <kbd className="rounded bg-[#eef2f7] px-1.5 py-0.5">Enter</kbd>}
            {' '}
            {part.trim().replace(/^(Ctrl|Tab|Enter)\s*/, '')}
          </>
        )}
      </span>
    ))}
  </p>
);
