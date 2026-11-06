import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { ArrowRight, Eye, Cube, Play } from '@phosphor-icons/react';

type PreviewMode = 'exploded' | 'video' | 'assembled';

export const PegforgeHero: React.FC = () => {
  const reduce = useReducedMotion();
  const [previewMode, setPreviewMode] = useState<PreviewMode>('exploded');

  return (
    <section id="hero" className="pt-10 md:pt-16 pb-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: Copy and CTAs (Max 4 text elements per rule) */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {/* 1. Eyebrow */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#0071E3] dark:text-sky-400 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span>Mã nguồn mở MIT · Hệ sinh thái LayerZero</span>
          </motion.div>

          {/* 2. Headline (Max 2 lines desktop) */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#1D1D1F] dark:text-[#F5F5F7] mb-5"
          >
            Tách khối tự nhiên.
            <br />
            Khóa khớp chuẩn xác.
          </motion.h1>

          {/* 3. Subtext (Max 20 words) */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[48ch] mb-8"
          >
            Tự động bóc tách tượng 3D, giấu sẹo cắt vào nếp áo và tạo ngàm chốt tự định vị cho máy in Bambu Lab.
          </motion.p>

          {/* 4. CTAs */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#register"
              className="px-7 py-3.5 rounded-full text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Đăng ký tham gia sớm</span>
              <ArrowRight size={16} weight="bold" />
            </a>
            <a
              href="#demo"
              className="px-6 py-3.5 rounded-full text-sm font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7] transition-all active:scale-95 flex items-center gap-2"
            >
              <Play size={15} weight="fill" className="text-[#0071E3] dark:text-[#2997FF]" />
              <span>Xem video demo (52s)</span>
            </a>
          </motion.div>

          {/* Compact hardware specs */}
          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-apple-border dark:border-[rgba(255,255,255,0.1)]">
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">100% Free</div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">Giấy phép MIT khi ổn định</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Local 0đ</div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">SAM 2 & PartField offline</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">.3MF Native</div>
              <div className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">Bambu & Prusa sẵn sàng</div>
            </div>
          </div>
        </div>

        {/* Right: Interactive 3D Exploded-View Canvas & Video Stage */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="relative rounded-3xl overflow-hidden apple-card-elevated p-2 group">
            {/* Interactive Mode Toggle Bar on top of image */}
            <div className="absolute top-5 left-5 z-20 inline-flex p-1 rounded-full apple-glass shadow-md">
              <button
                type="button"
                onClick={() => setPreviewMode('exploded')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  previewMode === 'exploded'
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Eye size={14} weight="bold" />
                <span>Bóc tách</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('video')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  previewMode === 'video'
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Play size={13} weight="fill" />
                <span>Video Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('assembled')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  previewMode === 'assembled'
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Cube size={14} weight="bold" />
                <span>Đã lắp ráp</span>
              </button>
            </div>

            {/* Render Stage */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {previewMode === 'exploded' && (
                  <motion.img
                    key="exploded"
                    src="/images/pegforge/hero-exploded.webp"
                    alt="Mô hình tượng bóc tách đa chi tiết lơ lửng trên mặt bàn in PEI"
                    width="1280"
                    height="800"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                )}
                {previewMode === 'video' && (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full bg-black flex items-center justify-center"
                  >
                    <video
                      src="/videos/pegforge-demo.mp4"
                      poster="/videos/pegforge-demo-poster.jpg"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <a
                      href="#demo"
                      className="absolute bottom-16 right-4 px-3 py-1.5 rounded-full bg-black/70 hover:bg-[#0071E3] text-white text-[11px] font-mono backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 z-10"
                    >
                      <Play size={12} weight="fill" />
                      <span>Xem toàn màn hình</span>
                    </a>
                  </motion.div>
                )}
                {previewMode === 'assembled' && (
                  <motion.img
                    key="assembled"
                    src="/images/pegforge/hero-figurine.webp"
                    alt="Mô hình tượng nguyên bản đã lắp ráp hoàn chỉnh"
                    width="1280"
                    height="800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-contain p-4"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Bottom floating telemetry glass badge */}
            <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl apple-glass flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {previewMode === 'video'
                    ? '52s Studio trực tiếp'
                    : previewMode === 'exploded'
                    ? '7 Part bóc tách tự động'
                    : 'Khối tượng liền mạch'}
                </span>
              </div>
              <span className="text-[#6E6E73] dark:text-[#98989D]">
                {previewMode === 'video'
                  ? 'PartField + Three.js'
                  : previewMode === 'exploded'
                  ? 'Khớp: PEG_HEX + BALL_JOINT'
                  : 'Trạng thái: Hoàn chỉnh'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
