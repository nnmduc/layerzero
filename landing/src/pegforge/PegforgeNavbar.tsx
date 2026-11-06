import React from 'react';
import { ArrowLeft, Scissors } from '@phosphor-icons/react';

interface PegforgeNavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const PegforgeNavbar: React.FC<PegforgeNavbarProps> = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 w-full apple-nav-glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs font-mono text-[#6E6E73] dark:text-[#98989D] hover:text-[#0071E3] transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>LayerZero.io.vn</span>
          </a>
          <span className="text-[#6E6E73]/30 dark:text-[#98989D]/30">/</span>
          <a href="#hero" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm shadow-[#0071E3]/30 group-hover:scale-105 transition-transform">
              <Scissors size={18} weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-none">
                PegForge
              </span>
              <span className="text-[10px] font-mono text-[#6E6E73] dark:text-[#98989D] leading-none mt-1">
                Studio MVP
              </span>
            </div>
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E6E73] dark:text-[#98989D]">
          <a href="#pipeline" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
            Quy trình giải phẫu
          </a>
          <a href="#highlights" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
            Đặc điểm kỹ thuật
          </a>
          <a href="#register" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
            Đăng ký trải nghiệm
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Chuyển chế độ giao diện"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {darkMode ? (
              <span className="text-base">☀️</span>
            ) : (
              <span className="text-base">🌙</span>
            )}
          </button>

          <a
            href="#register"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all active:scale-95"
          >
            Tham gia cộng đồng
          </a>
        </div>
      </div>
    </header>
  );
};
