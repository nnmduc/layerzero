import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AppleLogo,
  ArrowDownRight,
  CheckCircle,
  Cpu,
  CubeTransparent,
  Eye,
  Moon,
  Sparkle,
  Stack,
} from '@phosphor-icons/react';

const APP_SCREENSHOT_TABS = [
  {
    id: 'full-audit',
    label: 'Chẩn đoán 3D & Diff',
    icon: Stack,
    src: '/images/screenshot-app-full-audit.png',
    alt: 'Giao diện thực tế của LayerZero Studio hiển thị Chẩn đoán Morphology, lưới 3D khớp cầu và bảng đối chiếu 17 thông số Slicer',
    caption:
      'Giao diện thực tế: Quét 9 chi tiết Triceratops (33.85 MB), tự động phát hiện đáy khớp cầu Z = 0 và đối chiếu 17 thông số Slicer.',
  },
  {
    id: 'xray-bottom',
    label: 'Soi xuyên đáy Z = 0',
    icon: Eye,
    src: '/images/screenshot-app-xray.png',
    alt: 'Chế độ X-Ray của LayerZero Studio nhìn xuyên từ mặt bàn PEI lên đáy chi tiết để kiểm tra tiết diện bám bàn Z = 0 và vành Support',
    caption:
      'Chế độ X-Ray: Xoay camera nhìn xuyên từ mặt bàn PEI lên đáy mô hình để kiểm tra trực quan vùng cắt phẳng Z = 0.80mm (màu xanh lá) và đài đỡ Support 360 độ.',
  },
  {
    id: 'ai-stream',
    label: 'Luồng suy luận agy AI',
    icon: Sparkle,
    src: '/images/screenshot-app-ai-stream.png',
    alt: 'Tiến trình suy luận trực tiếp của agy AI bên trong LayerZero Studio',
    caption:
      'Unleashed AI Mode: Kết nối trực tiếp gói AI cá nhân trên máy Mac để đọc sâu cấu hình XML/JSON và giải thích từng quyết định kỹ thuật.',
  },
  {
    id: 'dark-mode',
    label: 'Chế độ Tối',
    icon: Moon,
    src: '/images/screenshot-app-dark-mode.png',
    alt: 'Giao diện Dark Mode của phần mềm LayerZero Studio trên macOS',
    caption:
      'Giao diện Dark Mode đồng bộ chuẩn macOS giúp làm việc dịu mắt trong các phiên tinh chỉnh mô hình ban đêm.',
  },
];

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const activeShot = APP_SCREENSHOT_TABS[activeTabIdx];

  return (
    <>
      <section className="relative min-h-[calc(100dvh-4rem)] pt-10 md:pt-14 pb-16 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
            {/* Left Column: Strictly 4 Text Elements per Hero Stack Discipline */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start text-left"
            >
              {/* Element 1: Eyebrow (1 of 3 allowed across the entire page) */}
              <p className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF] font-semibold mb-4">
                LAYERZERO STUDIO CHO MACOS
              </p>

              {/* Element 2: Headline (max 2 lines on desktop) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08] mb-5">
                In 3D đẹp ngay từ đầu. Vừa làm vừa hiểu sâu.
              </h1>

              {/* Element 3: Subtext (<= 20 words, <= 3 lines) */}
              <p className="text-lg sm:text-[18.5px] text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[48ch] mb-8">
                Giải phẫu file .3mf bằng toán học 3D và AI cá nhân của bạn để tối ưu đúng máy, đúng nhựa.
              </p>

              {/* Element 4: CTAs (1 Primary + 1 Secondary, single line labels) */}
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href="#tai-ve-macos"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15px] font-semibold whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
                >
                  <AppleLogo size={18} weight="fill" />
                  <span>Tải cho macOS</span>
                </a>
                <a
                  href="#cau-chuyen"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1D1D1F]/[0.06] dark:bg-white/[0.08] hover:bg-[#1D1D1F]/[0.11] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#1D1D1F]/10 dark:border-white/15 text-[15px] font-semibold whitespace-nowrap active:scale-[0.98] transition-all"
                >
                  <span>Câu chuyện ra đời</span>
                  <ArrowDownRight size={17} weight="bold" />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Interactive Live App Screenshot Showcase */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col gap-3.5"
            >
              {/* Mode Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-[12.5px] font-medium text-[#6E6E73] dark:text-zinc-400">
                  Ảnh chụp trực tiếp từ ứng dụng LayerZero Studio v2.0:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {APP_SCREENSHOT_TABS.map((tab, idx) => {
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTabIdx(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-[0.98] whitespace-nowrap ${
                          activeTabIdx === idx
                            ? 'bg-[#0071E3] text-white shadow-sm'
                            : 'bg-white dark:bg-zinc-800 text-[#1D1D1F]/80 dark:text-zinc-300 border border-[#1D1D1F]/10 dark:border-white/10 hover:bg-[#1D1D1F]/[0.05]'
                        }`}
                      >
                        <IconComp size={14} weight={activeTabIdx === idx ? 'fill' : 'regular'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* macOS Window Frame around Real Live Screenshot */}
              <div className="rounded-3xl overflow-hidden apple-card-elevated p-2 sm:p-3">
                <div className="rounded-2xl overflow-hidden border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] bg-[#F5F5F7] dark:bg-[#0D0D0F]">
                  <img
                    key={activeShot.src}
                    src={activeShot.src}
                    alt={activeShot.alt}
                    className="w-full h-auto block object-cover"
                  />
                </div>
                <p className="text-[12.5px] text-[#6E6E73] dark:text-zinc-400 px-3 pt-2.5 pb-1">
                  {activeShot.caption}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Architectural Pipeline Bar under Hero */}
      <section className="py-8 border-y border-[#1D1D1F]/[0.07] dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-[#1D1D1F]/[0.08] dark:divide-white/[0.08]">
            <div className="flex items-start gap-3.5 md:pr-6">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center shrink-0">
                <CubeTransparent size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-[14.5px] font-semibold text-[#1D1D1F] dark:text-zinc-100">
                  Đọc sâu mọi file .3mf tải từ Internet
                </h2>
                <p className="text-[13px] text-[#6E6E73] dark:text-zinc-400 leading-relaxed mt-0.5">
                  Tương thích cả chuẩn Bambu Studio Production Extension lẫn PrusaSlicer / Cura.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 md:px-6">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center shrink-0">
                <Cpu size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-[14.5px] font-semibold text-[#1D1D1F] dark:text-zinc-100">
                  Kết hợp AI Subscription sẵn có của bạn
                </h2>
                <p className="text-[13px] text-[#6E6E73] dark:text-zinc-400 leading-relaxed mt-0.5">
                  Không thu phí thuê bao chồng chéo. Tận dụng trực tiếp gói AI cá nhân kết hợp lõi toán học NumPy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center shrink-0">
                <CheckCircle size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-[14.5px] font-semibold text-[#1D1D1F] dark:text-zinc-100">
                  Xuất file chuẩn & Mở thẳng Bambu Studio
                </h2>
                <p className="text-[13px] text-[#6E6E73] dark:text-zinc-400 leading-relaxed mt-0.5">
                  Giữ nguyên màu sơn đa sắc, tự động gán Per-Object Settings và mở ngay trên macOS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
