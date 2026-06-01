interface AnswerTokensProps {
  tokens: string[];
  translation: string;
}

export const AnswerTokens = ({ tokens, translation }: AnswerTokensProps) => (
  <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3">
    <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#526985]">Đáp án</p>
    {tokens.map((token, index) => (
      <span key={`${token}-${index}`} className="mr-1.5 inline-flex rounded-md bg-yellow-100 px-2.5 py-1.5 text-sm font-medium text-orange-700">
        {token}
      </span>
    ))}
    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
      <p className="font-bold">Dịch nghĩa:</p>
      <p className="mt-0.5">{translation}</p>
    </div>
  </div>
);
