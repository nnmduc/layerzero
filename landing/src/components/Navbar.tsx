import React from 'react';
import { AppleLogo, Moon, Sun } from '@phosphor-icons/react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 h-16 w-full apple-nav-glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <a
          href="#"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="LayerZero Studio Trang chủ"
        >
          <img
            src="/app-icon.png"
            alt="Biểu tượng ứng dụng LayerZero Studio"
            className="w-8 h-8 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
            LayerZero <span className="font-normal text-[#6E6E73] dark:text-zinc-400">Studio</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#1D1D1F]/80 dark:text-zinc-300 whitespace-nowrap">
          <a
            href="#cau-chuyen"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Câu chuyện
          </a>
          <a
            href="#tinh-nang"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Tính năng
          </a>
          <a
            href="#xu-ly-loi-in"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Xử lý lỗi in 3D
          </a>
          <a
            href="#hoc-thong-so"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Vừa in vừa học
          </a>
          <a
            href="#gop-y"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Góp ý
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-zinc-200 bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.1] dark:hover:bg-white/[0.14] active:scale-[0.98] transition-all"
          >
            {darkMode ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
          </button>

          <a
            href="#tai-ve-macos"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
          >
            <AppleLogo size={15} weight="fill" />
            <span>Tải cho macOS</span>
          </a>
        </div>
      </div>
    </header>
  );
};
