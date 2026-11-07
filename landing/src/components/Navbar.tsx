import React, { useState } from 'react';
import { DownloadSimple, GithubLogo, Moon, Sun, PaperPlaneTilt, List, X } from '@phosphor-icons/react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  isPegforge?: boolean;
  /** Sub-pages (e.g. /changelog) have none of the home sections, so the nav only links back home. */
  isSubpage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, onToggleTheme, isPegforge, isSubpage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full apple-nav-glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <a
          href={isPegforge || isSubpage ? '/' : '#'}
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label={isPegforge ? 'LayerZero · PegForge - Về trang chủ LayerZero Studio' : 'LayerZero Studio Trang chủ'}
        >
          <img
            src="/app-icon.png"
            alt="Biểu tượng ứng dụng LayerZero Studio"
            width="32"
            height="32"
            className="w-8 h-8 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
            LayerZero{' '}
            <span className="font-normal text-[#6E6E73] dark:text-zinc-400">
              {isPegforge ? '· PegForge' : 'Studio'}
            </span>
          </span>
        </a>

        {isPegforge ? (
          <nav aria-label="Điều hướng chính PegForge" className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#1D1D1F]/80 dark:text-zinc-300 whitespace-nowrap">
            <a href="/" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Trang chủ
            </a>
            <a href="#demo" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Video Demo
            </a>
            <a href="#pipeline" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Giải phẫu
            </a>
            <a href="#seam" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Giấu sẹo
            </a>
            <a href="#joints" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Khớp cơ khí
            </a>
            <a href="#highlights" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Đặc điểm
            </a>
            <a
              href="#hero"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0071E3]/15 text-[#0071E3] dark:text-[#2997FF] text-[12px] font-semibold"
            >
              <span>PegForge</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
            </a>
          </nav>
        ) : isSubpage ? (
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#1D1D1F]/80 dark:text-zinc-300 whitespace-nowrap">
            <a href="/" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Trang chủ
            </a>
          </nav>
        ) : (
          <nav aria-label="Điều hướng chính LayerZero" className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#1D1D1F]/80 dark:text-zinc-300 whitespace-nowrap">
            <a href="#cau-chuyen" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Câu chuyện
            </a>
            <a href="#tinh-nang" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Tính năng
            </a>
            <a href="#vat-lieu" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Vật liệu
            </a>
            <a href="#xu-ly-loi-in" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Xử lý lỗi in 3D
            </a>
            <a href="#hoc-thong-so" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Vừa in vừa học
            </a>
            <a href="#gop-y" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Góp ý
            </a>
            <a
              href="/pegforge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/15 text-[12px] font-semibold transition-colors"
            >
              <span>PegForge</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-zinc-200 bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.1] dark:hover:bg-white/[0.14] active:scale-[0.98] transition-all"
          >
            {darkMode ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
          </button>

          <a
            href="https://github.com/nnmduc/layerzero/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Releases"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-zinc-200 bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.1] dark:hover:bg-white/[0.14] active:scale-[0.98] transition-all"
          >
            <GithubLogo size={18} weight="fill" />
          </a>

          {isPegforge ? (
            <a
              href="#register"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
            >
              <PaperPlaneTilt size={15} weight="bold" />
              <span>Đăng ký sớm</span>
            </a>
          ) : (
            <a
              href={isSubpage ? '/#tai-ve' : '#tai-ve'}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Tải ứng dụng</span>
            </a>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-zinc-200 bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.1] dark:hover:bg-white/[0.14] active:scale-[0.98] transition-all"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Menu điều hướng di động"
          className="md:hidden border-t border-[#1D1D1F]/10 dark:border-white/10 bg-[#F5F5F7]/95 dark:bg-[#121214]/95 backdrop-blur-xl px-4 py-5 shadow-xl transition-all"
        >
          <div className="flex flex-col gap-3 text-[15px] font-medium text-[#1D1D1F] dark:text-zinc-200">
            {isPegforge ? (
              <>
                <a href="/" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Về trang chủ LayerZero
                </a>
                <a href="#demo" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Video Demo
                </a>
                <a href="#pipeline" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Giải phẫu & Bóc tách
                </a>
                <a href="#seam" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Giấu sẹo cắt
                </a>
                <a href="#joints" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Khớp cơ khí tự định vị
                </a>
                <a href="#highlights" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Đặc điểm nổi bật
                </a>
                <a
                  href="#register"
                  onClick={closeMobileMenu}
                  className="mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#0071E3] text-white font-semibold shadow-sm"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  <span>Đăng ký tham gia sớm PegForge</span>
                </a>
              </>
            ) : isSubpage ? (
                <a href="/" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Về trang chủ LayerZero
                </a>
            ) : (
              <>
                <a href="#cau-chuyen" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Câu chuyện ra đời
                </a>
                <a href="#tinh-nang" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Tính năng cốt lõi
                </a>
                <a href="#vat-lieu" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Vật liệu & Định cấu hình
                </a>
                <a href="#xu-ly-loi-in" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  8 Lỗi in 3D thường gặp
                </a>
                <a href="#hoc-thong-so" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Đối chiếu 17 thông số Slicer
                </a>
                <a href="#gop-y" onClick={closeMobileMenu} className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Góp ý & Tác giả
                </a>
                <a
                  href="/pegforge"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl text-[#0071E3] dark:text-[#2997FF] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
                >
                  <span>Dự án mới: PegForge</span>
                  <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
                </a>
                <a
                  href={isSubpage ? '/#tai-ve' : '#tai-ve'}
                  onClick={closeMobileMenu}
                  className="mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#0071E3] text-white font-semibold shadow-sm"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>Tải cho macOS, Win & Linux</span>
                </a>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
