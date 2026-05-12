interface ShortcutHintProps {
  text: string;
}

export const ShortcutHint = ({ text }: ShortcutHintProps) => (
  <p className="mt-4 text-center text-sm text-[#64748b]">
    {text.split('•').map((part, index) => (
      <span key={part}>
        {index > 0 && ' • '}
        {part.trim().replace(/^(Ctrl|Tab|Enter)/, '') && (
          <>
            {part.trim().startsWith('Ctrl') && <kbd className="rounded bg-[#eef2f7] px-2 py-1">Ctrl</kbd>}
            {part.trim().startsWith('Tab') && <kbd className="rounded bg-[#eef2f7] px-2 py-1">Tab</kbd>}
            {part.trim().startsWith('Enter') && <kbd className="rounded bg-[#eef2f7] px-2 py-1">Enter</kbd>}
            {' '}
            {part.trim().replace(/^(Ctrl|Tab|Enter)\s*/, '')}
          </>
        )}
      </span>
    ))}
  </p>
);
