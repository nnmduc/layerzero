import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AppleLogo,
  ArrowSquareOut,
  CheckCircle,
  Cpu,
  DownloadSimple,
  GithubLogo,
  HardDrives,
  LinuxLogo,
  Printer,
  ShieldCheck,
  WindowsLogo,
} from '@phosphor-icons/react';

type PlatformKey = 'macos' | 'windows' | 'linux';

interface VariantOption {
  id: string;
  label: string;
  filename: string;
  sizeNote: string;
  url: string;
  isExternalRelease?: boolean;
}

const GITHUB_RELEASES_URL = 'https://github.com/nnmduc/layerzero/releases/latest';

const PLATFORM_CONFIG: Record<
  PlatformKey,
  {
    name: string;
    ctaLabel: string;
    subtitle: string;
    reqText: string;
    variants: VariantOption[];
  }
> = {
  macos: {
    name: 'macOS',
    ctaLabel: 'Tải cho macOS',
    subtitle:
      'Tích hợp sẵn nhân Python độc lập. Kéo vào Applications là dùng ngay cùng Bambu Studio, Claude Code và agy CLI.',
    reqText: 'macOS 13.0+ (Apple Silicon M1–M4 & Intel) · Signed Apple Developer ID',
    variants: [
      {
        id: 'arm64',
        label: 'Apple Silicon (M1 - M4)',
        filename: 'LayerZero_2.2.0_Apple_Silicon_arm64.dmg',
        sizeNote: '~27 MB (arm64) · Signed Apple Developer ID',
        url: 'https://dl.layerzero.io.vn/LayerZero_2.2.0_Apple_Silicon_arm64.dmg',
      },
      {
        id: 'x64',
        label: 'Mac Intel (x86_64)',
        filename: 'LayerZero_2.2.0_Intel_x64.dmg',
        sizeNote: '~30 MB (x86_64) · Signed Apple Developer ID',
        url: 'https://dl.layerzero.io.vn/LayerZero_2.2.0_Intel_x64.dmg',
      },
    ],
  },
  windows: {
    name: 'Windows',
    ctaLabel: 'Tải cho Windows',
    subtitle:
      'Bản cài đặt Native Tauri v2 kèm sẵn nhân Python FastAPI độc lập. Phát hành tự động qua GitHub Releases.',
    reqText: 'Windows 10 / 11 (64-bit x86_64) · Không cần cài đặt Python',
    variants: [
      {
        id: 'exe',
        label: 'Windows Installer (.exe)',
        filename: 'LayerZero_2.2.0_Windows_x64-setup.exe',
        sizeNote: 'NSIS Setup (x86_64) · Tải trực tiếp từ GitHub Releases',
        url: 'https://github.com/nnmduc/layerzero/releases/latest/download/LayerZero_2.2.0_Windows_x64-setup.exe',
        isExternalRelease: true,
      },
      {
        id: 'msi',
        label: 'MSI Package (.msi)',
        filename: 'LayerZero_2.2.0_Windows_x64.msi',
        sizeNote: 'Windows Installer MSI (x86_64) · GitHub Releases',
        url: 'https://github.com/nnmduc/layerzero/releases/latest/download/LayerZero_2.2.0_Windows_x64.msi',
        isExternalRelease: true,
      },
    ],
  },
  linux: {
    name: 'Linux',
    ctaLabel: 'Tải cho Linux',
    subtitle:
      'Hỗ trợ đầy đủ Ubuntu, Debian, Fedora, Arch Linux với gói AppImage chạy ngay hoặc gói cài đặt .deb chuẩn.',
    reqText: 'Linux x86_64 (Ubuntu 22.04+ / Debian / Fedora / Arch) · GitHub Releases',
    variants: [
      {
        id: 'appimage',
        label: 'AppImage (Mọi bản phân phối)',
        filename: 'LayerZero_2.2.0_Linux_x64.AppImage',
        sizeNote: 'Universal AppImage (x86_64) · Tải trực tiếp từ GitHub Releases',
        url: 'https://github.com/nnmduc/layerzero/releases/latest/download/LayerZero_2.2.0_Linux_x64.AppImage',
        isExternalRelease: true,
      },
      {
        id: 'deb',
        label: 'Ubuntu / Debian (.deb)',
        filename: 'LayerZero_2.2.0_Linux_amd64.deb',
        sizeNote: 'Debian Package (amd64) · Tải trực tiếp từ GitHub Releases',
        url: 'https://github.com/nnmduc/layerzero/releases/latest/download/LayerZero_2.2.0_Linux_amd64.deb',
        isExternalRelease: true,
      },
    ],
  },
};

export const DownloadSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [platform, setPlatform] = useState<PlatformKey>('macos');
  const [variantIdx, setVariantIdx] = useState<number>(0);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('win')) {
        setPlatform('windows');
      } else if (ua.includes('linux') && !ua.includes('android')) {
        setPlatform('linux');
      }
    }
  }, []);

  const currentPlatform = PLATFORM_CONFIG[platform];
  const currentVariant = currentPlatform.variants[variantIdx] || currentPlatform.variants[0];

  const handleSelectPlatform = (nextPlatform: PlatformKey) => {
    setPlatform(nextPlatform);
    setVariantIdx(0);
  };

  const renderPlatformIcon = (key: PlatformKey, size = 20) => {
    if (key === 'macos') return <AppleLogo size={size} weight="fill" />;
    if (key === 'windows') return <WindowsLogo size={size} weight="fill" />;
    return <LinuxLogo size={size} weight="fill" />;
  };

  return (
    <section id="tai-ve" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl apple-card-elevated p-8 sm:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF] font-semibold mb-3">
                BẢN PHÁT HÀNH CHÍNH THỨC · ĐA NỀN TẢNG
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
                Tải miễn phí cho macOS, Windows & Linux.
              </h2>
              <p className="text-base text-[#6E6E73] dark:text-zinc-300 max-w-[54ch] mb-6">
                {currentPlatform.subtitle}
              </p>

              {/* Step 1: OS Switcher */}
              <div className="mb-3.5">
                <div className="inline-flex flex-wrap rounded-full p-1 bg-[#F5F5F7] dark:bg-zinc-900 border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] gap-1">
                  {(['macos', 'windows', 'linux'] as PlatformKey[]).map((osKey) => (
                    <button
                      key={osKey}
                      type="button"
                      onClick={() => handleSelectPlatform(osKey)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                        platform === osKey
                          ? 'bg-[#0071E3] text-white shadow-sm'
                          : 'text-[#1D1D1F] dark:text-zinc-300 hover:bg-[#1D1D1F]/[0.05] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      {renderPlatformIcon(osKey, 16)}
                      <span>{PLATFORM_CONFIG[osKey].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Architecture / Package Format Switcher */}
              <div className="mb-6">
                <div className="inline-flex flex-wrap rounded-full p-1 bg-[#F5F5F7]/70 dark:bg-zinc-900/70 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] gap-1">
                  {currentPlatform.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantIdx(idx)}
                      className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all whitespace-nowrap ${
                        variantIdx === idx
                          ? 'bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white shadow-sm border border-[#1D1D1F]/[0.08] dark:border-white/[0.1]'
                          : 'text-[#6E6E73] dark:text-zinc-400 hover:text-[#1D1D1F] dark:hover:text-zinc-200'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Download CTA & GitHub Releases Link */}
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href={currentVariant.url}
                  download={currentVariant.isExternalRelease ? undefined : currentVariant.filename}
                  target={currentVariant.isExternalRelease ? '_blank' : undefined}
                  rel={currentVariant.isExternalRelease ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15.5px] font-semibold whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
                >
                  {renderPlatformIcon(platform, 20)}
                  <span>{currentPlatform.ctaLabel}</span>
                  <DownloadSimple size={18} weight="bold" />
                </a>

                <a
                  href={GITHUB_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-full bg-[#1D1D1F]/[0.06] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.11] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#1D1D1F]/10 dark:border-white/15 text-[14px] font-semibold whitespace-nowrap active:scale-[0.98] transition-all"
                >
                  <GithubLogo size={18} weight="fill" />
                  <span>Tất cả bản build trên GitHub Releases</span>
                  <ArrowSquareOut size={15} weight="bold" />
                </a>
              </div>

              <div className="mt-3.5 text-[12.5px] text-[#6E6E73] dark:text-zinc-400">
                <span className="font-semibold text-[#1D1D1F] dark:text-zinc-200 font-mono">
                  {currentVariant.filename}
                </span>{' '}
                · {currentVariant.sizeNote}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3.5 border-b border-[#1D1D1F]/[0.07] dark:border-white/[0.08]">
                <img
                  src="/app-icon.png"
                  alt="Biểu tượng ứng dụng LayerZero Studio"
                  className="w-11 h-11 rounded-2xl shadow-sm"
                />
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">
                    LayerZero Studio v2.2
                  </h3>
                  <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400">
                    Đa nền tảng: macOS · Windows · Linux
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center gap-2.5">
                  <Cpu size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">
                    macOS (M1–M4 & Intel) · Windows x64 · Linux x64
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <HardDrives size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">
                    Đóng gói sẵn Python Sidecar · Không cần cài đặt phụ thuộc
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Printer size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">
                    PLA Lite · PLA Basic · PETG HF trên A1, A1 mini, P1S, X1C
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">
                    Hỗ trợ agy CLI & chế độ Offline Morphology Engine 100%
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">
                    Mã nguồn mở MIT · Tự động build CI/CD trên GitHub Actions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
