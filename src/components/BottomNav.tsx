import { Home, BarChart2, User, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'analytics' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenMeasurer: () => void;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onOpenMeasurer,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto bg-[#1e1e1e] text-white rounded-3xl p-2.5 shadow-2xl flex items-center justify-around border border-white/10 backdrop-blur-md"
      >
        {/* Dashboard / Home Tab */}
        <button
          onClick={() => onTabChange('dashboard')}
          aria-label="Home"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-pastel-primary font-bold bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Center Floating Action: Measure & Log */}
        <button
          onClick={onOpenMeasurer}
          aria-label="Measure Food"
          className="relative -top-4 w-12 h-12 rounded-full bg-pastel-primary text-white flex items-center justify-center shadow-lg shadow-pastel-primary/50 hover:scale-105 active:scale-95 transition-all border-3 border-[#faf9f6]"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => onTabChange('analytics')}
          aria-label="Analytics"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'analytics'
              ? 'text-pastel-primary font-bold bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Analytics</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          aria-label="Profile"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all ${
            activeTab === 'profile'
              ? 'text-pastel-primary font-bold bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
