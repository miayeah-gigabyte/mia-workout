interface ProgressArcProps {
  currentDay: number;
  totalDays: number;
  weeklyCount: number;
  weeklyGoal: number;
}

export function ProgressArc({ currentDay, totalDays, weeklyCount, weeklyGoal }: ProgressArcProps) {
  const size = 280;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress based on weekly goal
  const progress = (weeklyCount / weeklyGoal) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FFD1CC"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FF6B4A"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-800 mb-1">Day {currentDay}</div>
          <div className="text-gray-500">of {totalDays}</div>
          <div className="mt-3 text-[#FF6B4A]">{weeklyCount} / {weeklyGoal} this week</div>
        </div>
      </div>
    </div>
  );
}
