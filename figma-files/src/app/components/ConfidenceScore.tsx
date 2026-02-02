interface ConfidenceScoreProps {
  score: number;
  size?: "sm" | "lg";
}

export function ConfidenceScore({ score, size = "sm" }: ConfidenceScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-24 h-24 rounded-full ${getBgColor(score)} flex items-center justify-center`}
        >
          <span className={`text-3xl font-semibold ${getColor(score)}`}>{score}%</span>
        </div>
        <span className="text-sm text-gray-600">Confidence</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={`px-2 py-0.5 rounded ${getBgColor(score)}`}>
        <span className={`text-sm font-medium ${getColor(score)}`}>{score}%</span>
      </div>
    </div>
  );
}
