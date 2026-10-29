function ScoreRing({ score = 0 }) {
  const radius = 26;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset =
    circumference - (Math.min(score, 100) / 100) * circumference;

  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
      ? "#eab308"
      : "#ef4444";

  return (
    <div className="flex items-center gap-3">
      {/* Circular Score */}
      <div className="relative w-[60px] h-[60px] flex items-center justify-center">
        <svg
          width="60"
          height="60"
          className="-rotate-90 absolute inset-0"
        >
          <circle
            cx="30"
            cy="30"
            r={normalizedRadius}
            fill="none"
            stroke="#374151"
            strokeWidth={stroke}
          />

          <circle
            cx="30"
            cy="30"
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <span className="text-lg font-bold text-white">
          {score}
        </span>
      </div>

      {/* Text */}
      <div>
        <p className="text-xs text-gray-400">AI Lead Score</p>
        <p
          className={`font-semibold ${
            score >= 80
              ? "text-green-400"
              : score >= 60
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {score >= 80
            ? "High Lead"
            : score >= 60
            ? "Medium Lead"
            : "Low Lead"}
        </p>
      </div>
    </div>
  );
}

export default ScoreRing;