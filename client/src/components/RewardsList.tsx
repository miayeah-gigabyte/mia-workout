interface Reward {
  id: string;
  title: string;
  unlockedDate: string;
}

interface RewardsListProps {
  rewards: Reward[];
}

export function RewardsList({ rewards }: RewardsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-4">
      {rewards.length === 0 ? (
        <div className="bg-white/70 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-500">No rewards unlocked yet. Keep going!</p>
        </div>
      ) : (
        rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white/70 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h3 className="text-gray-800 mb-1">{reward.title}</h3>
                <p className="text-gray-500 text-sm">Unlocked on {formatDate(reward.unlockedDate)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
