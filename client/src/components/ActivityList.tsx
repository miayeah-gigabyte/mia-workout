// client/src/components/ActivityList.tsx
import { format } from 'date-fns';

interface Session { 
  id: string;
  date: string;
  minutes: number;
}

interface ActivityListProps {
  sessions: Session[]; 
}

export function ActivityList({ sessions }: ActivityListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-gray-700 text-xl font-medium">Recent Activity</h2>
      
      {sessions.length === 0 ? (
        <div className="bg-white/70 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-500">No activities yet. Start today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="bg-white/70 rounded-2xl p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="text-gray-800">{session.minutes} min workout</div>
                <div className="text-gray-500 text-sm mt-1">{formatDate(session.date)}</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
