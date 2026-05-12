interface AnswerTokensProps {
  tokens: string[];
  translation: string;
}

export const AnswerTokens = ({ tokens, translation }: AnswerTokensProps) => (
  <div className="mt-4 rounded-2xl bg-[#f7f9fc] p-4">
    <p className="mb-3 text-sm font-black uppercase tracking-wide text-[#526985]">Đáp án</p>
    {tokens.map((token, index) => (
      <span key={`${token}-${index}`} className="mr-2 inline-flex rounded-md bg-yellow-100 px-3 py-2 font-medium text-orange-700">
        {token}
      </span>
    ))}
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
      <p className="font-bold">Dịch nghĩa:</p>
      <p className="mt-1">{translation}</p>
    </div>
  </div>
);
