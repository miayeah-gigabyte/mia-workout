// client/src/App.tsx
import React, { useState, useEffect } from 'react';
import { isToday } from 'date-fns';
import { Header } from './components/Header';
import { ProgressArc } from './components/ProgressArc';
import { ActivityList } from './components/ActivityList';
import { RewardsList } from './components/RewardsList';
import { BottomNav } from './components/BottomNav';

// --- Interface Definitions (Matching Simplified Backend Models) ---
interface Session {
  id: string;
  date: string;
  minutes: number;
  notes: string | null;
}

interface RewardUnlock {
  id: string;
  rewardName: string;
  unlockedAt: string;
}

interface DashboardMetrics {
  sessions: Session[];
  unlocks: RewardUnlock[];
  currentDay: number;
  weeklyCount: number;
}
// --- End Interfaces ---


// Use the Environment Variable or localhost for local testing
// NOTE: Must be set in .env.production (e.g., REACT_APP_API_URL=https://your-mia-api-name.onrender.com)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'rewards'>('home');
  const [data, setData] = useState<DashboardMetrics>({
    sessions: [],
    unlocks: [],
    currentDay: 1,
    weeklyCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const weeklyGoal = 5; // Static goal: 5 days workout within 7 days
  const totalDays = 31; // Static total days for main progress display

  useEffect(() => {
    fetchData();
    // Run initial setup to ensure the 'user-mia' record exists in DB
    fetch(`${API_URL}/api/setup`).catch(e => console.error("Setup failed", e));
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`);
      if (res.ok) {
        const result: DashboardMetrics = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleLogWorkout = async () => {
    // Prevent double logging on the same day
    const todayLog = data.sessions.find(s => isToday(new Date(s.date)));
    if (todayLog) {
        alert("You have already logged a workout today!");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: 30, // Default to 30 minutes as required
          notes: "Daily workout logged via app."
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        await fetchData(); // Refresh data from API
        
        if (result.newUnlocks && result.newUnlocks.length > 0) {
            alert(`🎉 REWARD UNLOCKED: ${result.newUnlocks[0].rewardName}! Karol has been notified.`);
        }
      } else {
         alert("Error logging session. Check server logs.");
      }
    } catch (e) {
      alert("Network error logging session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-800" style={{
      background: 'linear-gradient(180deg, #FFF0F5 0%, #FFE4E1 100%)'
    }}>
      <div className="flex-1 pb-20">
        {activeScreen === 'home' ? (
          <>
            <Header />
            <main className="max-w-md mx-auto px-6 py-6">
              <ProgressArc 
                currentDay={data.currentDay}
                totalDays={totalDays}
                weeklyCount={data.weeklyCount}
                weeklyGoal={weeklyGoal}
              />
              
              <button
                onClick={handleLogWorkout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full mt-8 font-bold shadow-lg transition disabled:opacity-50"
                style={{ backgroundColor: '#FF6B4A', color: 'white' }}
              >
                {loading ? 'Logging...' : '📅 Log Daily Workout (30 min)'}
              </button>

              {/* ActivityList is passed the sessions data */}
              <ActivityList sessions={data.sessions} />
            </main>
          </>
        ) : (
          <main className="max-w-md mx-auto px-6 py-6">
            <h1 className="text-2xl font-medium mt-8 mb-6 text-center">Unlocked Rewards</h1>
            {/* RewardsList is passed the unlocked rewards data */}
            <RewardsList rewards={data.unlocks} />
          </main>
        )}
      </div>

      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
}
