import { Home, Gift } from 'lucide-react';

interface BottomNavProps {
  activeScreen: 'home' | 'rewards';
  onNavigate: (screen: 'home' | 'rewards') => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors"
          style={{ color: activeScreen === 'home' ? '#FF6B4A' : '#9CA3AF' }}
        >
          <Home size={24} strokeWidth={2} />
          <span className="text-xs">Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('rewards')}
          className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors"
          style={{ color: activeScreen === 'rewards' ? '#FF6B4A' : '#9CA3AF' }}
        >
          <Gift size={24} strokeWidth={2} />
          <span className="text-xs">Rewards</span>
        </button>
      </div>
    </nav>
  );
}
