import React, { useState, useRef, useEffect } from 'react';
import {
  DownloadSimple,
  GithubLogo,
  Moon,
  Sun,
  PaperPlaneTilt,
  List,
  X,
  CaretDown,
  Scissors,
  Cube,
  Check,
} from '@phosphor-icons/react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  isPegforge?: boolean;
  isForm3d?: boolean;
  /** Sub-pages (e.g. /changelog) have none of the home sections, so the nav only links back home. */
  isSubpage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  isPegforge,
  isForm3d,
  isSubpage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsDropdownOpen(false);
      }
    };
    if (productsDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [productsDropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProductsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentProductName = isForm3d ? '· Form3D' : isPegforge ? '· PegForge' : 'Studio';
  const brandIcon = isForm3d ? '/images/form3d/icon.png' : '/app-icon.png';
  const isHome = !isPegforge && !isForm3d && !isSubpage;

  return (
    <header className="sticky top-0 z-50 w-full apple-nav-glass transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <a
          href={isHome ? '#' : '/'}
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label={
            isForm3d
              ? 'LayerZero · Form3D - Về trang chủ LayerZero'
              : isPegforge
              ? 'LayerZero · PegForge - Về trang chủ LayerZero'
              : 'LayerZero Studio Trang chủ'
          }
        >
          <img
            src={brandIcon}
            alt="Biểu tượng ứng dụng"
            width="32"
            height="32"
            className="w-8 h-8 rounded-lg shadow-sm object-cover transition-transform duration-200 group-hover:scale-105 border border-black/5 dark:border-white/10"
          />
          <span className="text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
            LayerZero{' '}
            <span className="font-normal text-[#6E6E73] dark:text-zinc-400">
              {currentProductName}
            </span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-[13.5px] font-medium text-[#1D1D1F]/80 dark:text-zinc-300 whitespace-nowrap"
        >
          {/* Dropdown Sản Phẩm */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
              onMouseEnter={() => setProductsDropdownOpen(true)}
              aria-expanded={productsDropdownOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                productsDropdownOpen
                  ? 'bg-black/5 dark:bg-white/10 text-[#0071E3] dark:text-[#2997FF]'
                  : 'hover:text-[#0071E3] dark:hover:text-[#2997FF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <span>Sản phẩm</span>
              <CaretDown
                size={13}
                weight="bold"
                className={`transition-transform duration-200 ${
                  productsDropdownOpen ? 'rotate-180 text-[#0071E3] dark:text-[#2997FF]' : ''
                }`}
              />
            </button>

            {/* Products Dropdown Menu */}
            {productsDropdownOpen && (
              <div
                onMouseLeave={() => setProductsDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#1C1C1F]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 text-[10.5px] font-mono font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-zinc-400 border-b border-black/[0.06] dark:border-white/[0.06] mb-1">
                  Hệ sinh thái LayerZero
                </div>

                {/* 1. LayerZero Studio (Trang chính) */}
                <a
                  href="/"
                  onClick={() => setProductsDropdownOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    isHome
                      ? 'bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF]'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <img
                    src="/app-icon.png"
                    alt="LayerZero Studio"
                    width="32"
                    height="32"
                    className="w-8 h-8 rounded-lg shadow-sm shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[13.5px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                        LayerZero Studio
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Chính
                      </span>
                      {isHome && (
                        <Check
                          size={13}
                          weight="bold"
                          className="text-[#0071E3] dark:text-[#2997FF] ml-auto shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400 leading-normal mt-0.5 truncate">
                      Trợ lý AI tối ưu in 3D & chuẩn hoá .3mf
                    </p>
                  </div>
                </a>

                {/* 2. PegForge */}
                <a
                  href="/pegforge"
                  onClick={() => setProductsDropdownOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    isPegforge
                      ? 'bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF]'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0071E3] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Scissors size={18} weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[13.5px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                        PegForge
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                        Beta
                      </span>
                      {isPegforge && (
                        <Check
                          size={13}
                          weight="bold"
                          className="text-[#0071E3] dark:text-[#2997FF] ml-auto shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400 leading-normal mt-0.5 truncate">
                      Bóc tách mô hình & Tạo khớp cơ khí in 3D
                    </p>
                  </div>
                </a>

                {/* 3. Form3D */}
                <a
                  href="/form3d"
                  onClick={() => setProductsDropdownOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    isForm3d
                      ? 'bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF]'
                      : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <img
                    src="/images/form3d/icon.png"
                    alt="Form3D"
                    width="32"
                    height="32"
                    className="w-8 h-8 rounded-lg shadow-sm shrink-0 mt-0.5 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[13.5px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                        Form3D
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        Mới
                      </span>
                      {isForm3d && (
                        <Check
                          size={13}
                          weight="bold"
                          className="text-[#0071E3] dark:text-[#2997FF] ml-auto shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400 leading-normal mt-0.5 truncate">
                      Bộ sinh Text-to-3D modular cho Apple Silicon (MPS)
                    </p>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Page-Specific Navigation Links */}
          {isForm3d ? (
            <>
              <a href="#demo" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Video Demo
              </a>
              <a href="#pipeline" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                5 Bước Pipeline
              </a>
              <a href="#studio" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Studio WebGL
              </a>
              <a href="#dac-diem" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Đặc điểm
              </a>
              <a href="#he-sinh-thai" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Hệ sinh thái
              </a>
            </>
          ) : isPegforge ? (
            <>
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
              <a href="#he-sinh-thai" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Hệ sinh thái
              </a>
            </>
          ) : isSubpage ? (
            <a href="/" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
              Trang chủ
            </a>
          ) : (
            <>
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
              <a href="#he-sinh-thai" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Hệ sinh thái
              </a>
              <a href="#gop-y" className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
                Góp ý
              </a>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
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
            href={
              isForm3d
                ? 'https://github.com/nnmduc/layerzero'
                : 'https://github.com/nnmduc/layerzero/releases/latest'
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1D1D1F] dark:text-zinc-200 bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.1] dark:hover:bg-white/[0.14] active:scale-[0.98] transition-all"
          >
            <GithubLogo size={18} weight="fill" />
          </a>

          {/* Primary CTA button */}
          {isForm3d ? (
            <a
              href="https://dl.layerzero.io.vn/Form3D_0.2.0_Apple_Silicon_arm64.dmg"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Tải Form3D v0.2.0</span>
            </a>
          ) : isPegforge ? (
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
            {/* Ecosystem Switcher for Mobile */}
            <div className="p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] flex flex-col gap-1.5 mb-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-zinc-400 px-2 py-0.5">
                Sản phẩm trong hệ sinh thái
              </span>
              <a
                href="/"
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                  isHome
                    ? 'bg-[#0071E3] text-white font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>LayerZero Studio (Trang chính)</span>
                {isHome && <Check size={16} weight="bold" />}
              </a>
              <a
                href="/pegforge"
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                  isPegforge
                    ? 'bg-[#0071E3] text-white font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>PegForge (Bóc tách & Tạo khớp)</span>
                {isPegforge && <Check size={16} weight="bold" />}
              </a>
              <a
                href="/form3d"
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                  isForm3d
                    ? 'bg-[#0071E3] text-white font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Form3D (Text-to-3D Generator)</span>
                {isForm3d && <Check size={16} weight="bold" />}
              </a>
            </div>

            {/* Page In-Page Anchors */}
            {isForm3d ? (
              <>
                <a
                  href="#demo"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Video Demo
                </a>
                <a
                  href="#pipeline"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  5 Bước Pipeline Modular
                </a>
                <a
                  href="#studio"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Three.js Studio WebGL
                </a>
                <a
                  href="#dac-diem"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Đặc điểm kỹ thuật
                </a>
                <a
                  href="#he-sinh-thai"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Hệ sinh thái LayerZero
                </a>
                <a
                  href="https://dl.layerzero.io.vn/Form3D_0.2.0_Apple_Silicon_arm64.dmg"
                  onClick={closeMobileMenu}
                  className="mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#0071E3] text-white font-semibold shadow-sm"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>Tải Form3D v0.2.0 (macOS)</span>
                </a>
              </>
            ) : isPegforge ? (
              <>
                <a
                  href="#demo"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Video Demo
                </a>
                <a
                  href="#pipeline"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Giải phẫu & Bóc tách
                </a>
                <a
                  href="#seam"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Giấu sẹo cắt
                </a>
                <a
                  href="#joints"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Khớp cơ khí tự định vị
                </a>
                <a
                  href="#highlights"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Đặc điểm nổi bật
                </a>
                <a
                  href="#he-sinh-thai"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Hệ sinh thái LayerZero
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
              <a
                href="/"
                onClick={closeMobileMenu}
                className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Về trang chủ LayerZero
              </a>
            ) : (
              <>
                <a
                  href="#cau-chuyen"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Câu chuyện ra đời
                </a>
                <a
                  href="#tinh-nang"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Tính năng cốt lõi
                </a>
                <a
                  href="#vat-lieu"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Vật liệu & Định cấu hình
                </a>
                <a
                  href="#xu-ly-loi-in"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  8 Lỗi in 3D thường gặp
                </a>
                <a
                  href="#hoc-thong-so"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Đối chiếu 17 thông số Slicer
                </a>
                <a
                  href="#he-sinh-thai"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Hệ sinh thái LayerZero
                </a>
                <a
                  href="#gop-y"
                  onClick={closeMobileMenu}
                  className="py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Góp ý & Tác giả
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
