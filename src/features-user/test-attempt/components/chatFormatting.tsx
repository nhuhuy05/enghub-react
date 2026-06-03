const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[#0f172a]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={`${part}-${index}`} className="italic text-[#1f2937]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

export const FormattedChatContent = ({ content }: { content: string }) => {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const numberedItems = lines
          .map((line) => line.match(/^(\d+)\.\s+(.*)$/))
          .filter((match): match is RegExpMatchArray => Boolean(match));
        const bulletItems = lines
          .map((line) => line.match(/^[-*]\s*(.*)$/))
          .filter((match): match is RegExpMatchArray => Boolean(match));

        if (numberedItems.length === lines.length && numberedItems.length > 0) {
          return (
            <ol key={`${block}-${blockIndex}`} className="list-decimal space-y-1.5 pl-5">
              {numberedItems.map((match, itemIndex) => (
                <li key={`${match[1]}-${itemIndex}`} className="pl-1">
                  {renderInlineMarkdown(match[2])}
                </li>
              ))}
            </ol>
          );
        }

        if (bulletItems.length === lines.length && bulletItems.length > 0) {
          return (
            <ul key={`${block}-${blockIndex}`} className="list-disc space-y-1.5 pl-5">
              {bulletItems.map((match, itemIndex) => (
                <li key={`${match[1]}-${itemIndex}`} className="pl-1">
                  {renderInlineMarkdown(match[1])}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block}-${blockIndex}`} className="leading-6">
            {lines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
};
