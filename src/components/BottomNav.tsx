import { Home, Plus, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="하단 내비게이션"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(15,23,42,0.05)]"
    >
      <div className="grid grid-cols-3 items-end h-[66px] px-4 pb-2">
        {/* Left: Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.4 : 2} />
          <span className="text-[11px] font-bold">홈</span>
        </button>

        {/* Center: Floating Royal Blue "+" Sell Button */}
        <div className="flex flex-col items-center justify-end relative">
          <button
            type="button"
            aria-label="판매하기"
            onClick={() => onSelectTab('sell')}
            className={`w-13 h-13 -mt-6 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.42)] ring-4 ring-white active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-[#1D4ED8]'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span
            className={`text-[11px] font-bold mt-1 ${
              activeTab === 'sell' ? 'text-[#2563EB]' : 'text-slate-600'
            }`}
          >
            판매하기
          </span>
        </div>

        {/* Right: My Page */}
        <button
          type="button"
          onClick={() => onSelectTab('mypage')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer ${
            activeTab === 'mypage' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" strokeWidth={activeTab === 'mypage' ? 2.4 : 2} />
          <span className="text-[11px] font-bold">마이페이지</span>
        </button>
      </div>
    </nav>
  );
}
