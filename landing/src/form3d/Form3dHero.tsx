import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Play, DownloadSimple, Sparkle, Cube, CheckCircle } from '@phosphor-icons/react';

type HeroTab = 'mesh' | 'turnaround' | 'wireframe';

export const Form3dHero: React.FC = () => {
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<HeroTab>('mesh');

  const tabContent = {
    mesh: {
      image: '/images/form3d/cute_dragon_mesh_preview.png',
      alt: 'Mô hình 3D Cute Dragon hoàn chỉnh từ văn bản prompt',
      title: 'Mô hình Watertight .STL & .GLB',
      subtitle: 'Tự động cắt phẳng đáy Z = 0 bám bàn PEI và Taubin smoothing khử gai nhọn.',
      badge: 'Step 5: Hunyuan3D-2 Mesh Synthesis',
    },
    turnaround: {
      image: '/images/form3d/03_step2_turnaround_sheet.png',
      alt: 'Bảng tổng hợp 4 góc nhìn Turnaround 1024x1024',
      title: 'Sheet 4 góc nhìn chuẩn Orthographic',
      subtitle: 'Sinh bởi Antigravity CLI (agy) với 4 góc trực diện: Trước 0°, Trái 90°, Sau 180°, Phải 270°.',
      badge: 'Step 2: 2x2 Orthographic Synthesis',
    },
    wireframe: {
      image: '/images/form3d/11_step5_3d_wire_topology.png',
      alt: 'Lưới đa giác Wireframe topology sạch sẽ',
      title: 'Lưới đa giác Wireframe kín khít',
      subtitle: 'Cấu trúc tam giác đồng nhất, loại bỏ hoàn toàn mảnh vụn lơ lửng và lỗ hổng.',
      badge: 'Step 5: Watertight Topology Check',
    },
  };

  const current = tabContent[activeTab];

  return (
    <section id="hero" className="pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: Copy & CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {/* Eyebrow */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF] mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span>Mã nguồn mở MIT · Hệ sinh thái LayerZero</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08] text-[#1D1D1F] dark:text-[#F5F5F7] mb-5"
          >
            Mô tả tự nhiên.
            <br />
            <span className="bg-gradient-to-r from-[#0071E3] via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Xuất mô hình 3D có thể in ngay.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[48ch] mb-8"
          >
            Pipeline 5 bước modular biến ý tưởng văn bản thành file <code className="font-mono text-[#1D1D1F] dark:text-zinc-200">.stl</code> & <code className="font-mono text-[#1D1D1F] dark:text-zinc-200">.glb</code> kín nước. Chạy native Metal MPS cực mượt và hoàn toàn offline trên chip Apple Silicon (M1/M2/M3/M4).
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3.5 mb-10"
          >
            <a
              href="https://dl.layerzero.io.vn/Form3D_0.2.0_Apple_Silicon_arm64.dmg"
              className="px-7 py-3.5 rounded-full text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <DownloadSimple size={17} weight="bold" />
              <span>Tải bản macOS (arm64 .dmg)</span>
            </a>
            <a
              href="#demo"
              className="px-6 py-3.5 rounded-full text-sm font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7] transition-all active:scale-95 flex items-center gap-2"
            >
              <Play size={15} weight="fill" className="text-[#0071E3] dark:text-[#2997FF]" />
              <span>Xem video demo</span>
            </a>
          </motion.div>

          {/* Quick Hardware Specs */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/[0.08] dark:border-white/[0.1]">
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                5 Bước
              </div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                Modular độc lập & tái lập
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                Apple Silicon
              </div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                PyTorch Metal MPS 0đ
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                Z = 0 Flat
              </div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                Đáy bám PEI & Taubin Smooth
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive 3D Stage Viewer */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-3 sm:p-4 group">
            {/* Tab switchers */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] mb-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('mesh')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'mesh'
                    ? 'bg-white dark:bg-[#27272A] text-[#0071E3] dark:text-[#2997FF] shadow-sm font-semibold'
                    : 'text-[#6E6E73] dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Cube size={14} weight="bold" />
                <span>Mô hình 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('turnaround')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'turnaround'
                    ? 'bg-white dark:bg-[#27272A] text-[#0071E3] dark:text-[#2997FF] shadow-sm font-semibold'
                    : 'text-[#6E6E73] dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Sparkle size={14} weight="bold" />
                <span>4 Góc Turnaround</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wireframe')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'wireframe'
                    ? 'bg-white dark:bg-[#27272A] text-[#0071E3] dark:text-[#2997FF] shadow-sm font-semibold'
                    : 'text-[#6E6E73] dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>Topology Mesh</span>
              </button>
            </div>

            {/* Preview image canvas */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-[#1C1C1F] to-[#0A0A0C] border border-black/10 dark:border-white/10 flex items-center justify-center">
              <img
                src={current.image}
                alt={current.alt}
                width="1024"
                height="768"
                className="w-full h-full object-contain p-2 transition-all duration-300"
              />

              {/* Step Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] font-medium shadow-sm">
                {current.badge}
              </div>

              {/* Ready status pill */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Watertight STL</span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="mt-3.5 px-2 pb-1">
              <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {current.title}
              </div>
              <div className="text-xs text-[#6E6E73] dark:text-zinc-400 mt-0.5 leading-relaxed">
                {current.subtitle}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
