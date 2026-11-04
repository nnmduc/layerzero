import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowsOutCardinal,
  Check,
  Clock,
  CubeFocus,
  DesktopTower,
  GitDiff,
  Sparkle,
} from '@phosphor-icons/react';

export const FeaturesBento: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [flattenMm, setFlattenMm] = useState<number>(0.8);

  const contactGain = Math.round((flattenMm / 0.8) * 310);
  // Visual width of the flattened bottom chord in SVG (from 16px at 0.1mm to 96px at 1.4mm)
  const contactWidthPx = Math.min(104, Math.max(18, Math.round(18 + flattenMm * 62)));
  const sphereDropPx = Math.round(flattenMm * 14);

  return (
    <section
      id="tinh-nang"
      className="py-24 sm:py-32 bg-white dark:bg-[#121214] border-y border-[#1D1D1F]/[0.06] dark:border-white/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Eyebrow #2 (of 3 allowed on page) */}
        <div className="max-w-3xl mb-12">
          <p className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF] font-semibold mb-3">
            KIẾN TRÚC LÕI KÉP
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
            Toán học 3D tốc độ cao kết hợp luồng suy luận AI trực quan.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[56ch]">
            Tương tác trực tiếp với các mô phỏng bên dưới để xem cách LayerZero xử lý file .3mf.
          </p>
        </div>

        {/* 5-Cell Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cell 1 (Span 7): Animated Laser Scan over 3D Layers Artwork */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-3xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between gap-5 overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[12px] font-mono font-semibold text-[#0071E3] dark:text-[#2997FF] mb-1">
                  <CubeFocus size={16} />
                  <span>NUMPY VECTORIZED PROFILER</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                  Quét 1.8 triệu tam giác 3D trong 1.2 giây
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-[#1D1D1F]/10 dark:border-white/10 font-mono text-[12px] font-bold text-[#0071E3] dark:text-[#2997FF]">
                &lt; 1.20s
              </span>
            </div>

            {/* Visual Artwork with Animated Scanning Plane */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-white dark:bg-zinc-900 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08]">
              <img
                src="/images/artwork-3d-layers.jpg"
                alt="Minh họa lát cắt giải tích hình học 3D tại Z = 0.80mm và đỉnh Concentric"
                className="w-full h-full object-cover"
              />
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent shadow-[0_0_16px_#0071E3]"
                  animate={{ top: ['12%', '88%', '12%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full apple-glass text-[11.5px] font-mono font-semibold text-[#1D1D1F] dark:text-white">
                  Z=0 Footprint · Normal_Z · Bridge Area
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0071E3] text-white text-[11.5px] font-mono font-semibold">
                  Support · Surface · X-Ray
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cell 2 (Span 5): AI CLI Hub (agy active + Claude & Codex coming soon) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-3xl bg-[#0071E3]/[0.06] dark:bg-[#0071E3]/[0.12] border border-[#0071E3]/20 p-6 sm:p-7 flex flex-col justify-between gap-5"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3] text-white text-[11.5px] font-semibold">
                  <Sparkle size={13} weight="fill" />
                  <span>AI CLI Cá nhân</span>
                </span>
                <span className="text-[12px] font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                  Zero API Fee
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight mb-1.5">
                Hỗ trợ agy CLI. Sắp có Claude & Codex.
              </h3>
              <p className="text-[13.5px] text-[#6E6E73] dark:text-zinc-300">
                Tận dụng trực tiếp gói AI bạn đang dùng hàng ngày để phân tích sâu file .3mf.
              </p>
            </div>

            {/* Visual Engine Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#0071E3] text-white p-2.5 text-center shadow-sm">
                <div className="font-mono font-bold text-[13px]">agy CLI</div>
                <div className="text-[10.5px] opacity-90 mt-0.5">Đang hỗ trợ</div>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-[#1D1D1F]/10 dark:border-white/10 p-2.5 text-center">
                <div className="font-mono font-semibold text-[13px] text-[#1D1D1F] dark:text-zinc-200">Claude</div>
                <div className="text-[10.5px] text-[#6E6E73] dark:text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={10} />
                  <span>Sắp có</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-[#1D1D1F]/10 dark:border-white/10 p-2.5 text-center">
                <div className="font-mono font-semibold text-[13px] text-[#1D1D1F] dark:text-zinc-200">Codex</div>
                <div className="text-[10.5px] text-[#6E6E73] dark:text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={10} />
                  <span>Sắp có</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#161618] shadow-sm">
              <img
                src="/images/screenshot-app-ai-stream.png"
                alt="Luồng suy luận trực tiếp của agy AI trong LayerZero Studio"
                className="w-full h-36 object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Cell 3 (Span 4): Interactive SVG Ball-Joint Z-Flatten Simulator */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 rounded-3xl apple-card-elevated p-6 flex flex-col justify-between gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                  <ArrowsOutCardinal size={20} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
                  Mô phỏng cắt phẳng đáy Z
                </h3>
              </div>
              <span className="font-mono text-[12px] font-bold text-[#0071E3] dark:text-[#2997FF]">
                +{contactGain}% bám
              </span>
            </div>

            {/* Live Animated SVG Cross-Section of Ball Joint on PEI Bed */}
            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-zinc-900 p-4 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] flex flex-col items-center">
              <svg viewBox="0 0 220 115" className="w-full h-28 overflow-visible">
                <defs>
                  <clipPath id="bed-clip">
                    <rect x="0" y="0" width="220" height="88" />
                  </clipPath>
                </defs>

                {/* Ball Joint Sphere clipped at bed line y=88 */}
                <g clipPath="url(#bed-clip)">
                  <circle
                    cx="110"
                    cy={44 + sphereDropPx}
                    r="44"
                    className="fill-zinc-300 dark:fill-zinc-700 stroke-[#1D1D1F]/20 dark:stroke-white/20"
                    strokeWidth="2"
                  />
                </g>

                {/* Outer Brim Ring */}
                <line
                  x1={110 - contactWidthPx / 2 - 18}
                  y1="88"
                  x2={110 + contactWidthPx / 2 + 18}
                  y2="88"
                  stroke="#0071E3"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.35"
                />

                {/* PEI Build Plate Line */}
                <line
                  x1="16"
                  y1="90"
                  x2="204"
                  y2="90"
                  className="stroke-[#1D1D1F]/30 dark:stroke-white/30"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Active Flattened Contact Footprint at Z = 0 */}
                <line
                  x1={110 - contactWidthPx / 2}
                  y1="88"
                  x2={110 + contactWidthPx / 2}
                  y2="88"
                  stroke="#10B981"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                <text
                  x="110"
                  y="108"
                  textAnchor="middle"
                  className="fill-[#6E6E73] dark:fill-zinc-400 font-mono text-[10px]"
                >
                  Tiết diện chạm bàn PEI (Z = {flattenMm.toFixed(2)}mm)
                </text>
              </svg>

              <input
                type="range"
                min={0.1}
                max={1.4}
                step={0.1}
                value={flattenMm}
                onChange={(e) => setFlattenMm(parseFloat(e.target.value))}
                aria-label="Kéo thử độ cao cắt phẳng đáy Z"
                className="w-full accent-[#0071E3] cursor-pointer mt-1"
              />
            </div>
          </motion.div>

          {/* Cell 4 (Span 4): Visual 3-Way Slicer Diff Gauge */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 rounded-3xl apple-card-elevated p-6 flex flex-col justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <GitDiff size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
                  Đối chiếu 3 cột trực quan
                </h3>
                <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400">
                  Mặc định · Tác giả · LayerZero AI
                </p>
              </div>
            </div>

            {/* Animated Visual Diff Rows */}
            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-zinc-900 p-4 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] space-y-2.5 text-[12px] font-mono">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800">
                <span className="text-[#6E6E73] dark:text-zinc-400">Wall Gen</span>
                <span className="line-through text-zinc-400">classic</span>
                <span className="text-[#0071E3] dark:text-[#2997FF] font-bold">arachne</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800">
                <span className="text-[#6E6E73] dark:text-zinc-400">Brim</span>
                <span className="line-through text-amber-500">no_brim</span>
                <span className="text-[#0071E3] dark:text-[#2997FF] font-bold">8mm (0.08)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800">
                <span className="text-[#6E6E73] dark:text-zinc-400">Top Pattern</span>
                <span className="line-through text-zinc-400">monotonic</span>
                <span className="text-[#0071E3] dark:text-[#2997FF] font-bold">concentric</span>
              </div>
            </div>
          </motion.div>

          {/* Cell 5 (Span 4): Native macOS & 1-Click Bambu Studio Export */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 rounded-3xl apple-card-elevated p-6 flex flex-col justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <DesktopTower size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
                  1-Click sang Bambu Studio
                </h3>
                <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400">
                  Giữ nguyên 100% màu sơn đa sắc
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-zinc-900 p-4 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] space-y-2.5 text-[12.5px]">
              <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-zinc-200">
                <Check size={15} weight="bold" className="text-[#0071E3]" />
                <span>Bảo toàn màu sơn AMS (paint_color)</span>
              </div>
              <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-zinc-200">
                <Check size={15} weight="bold" className="text-[#0071E3]" />
                <span>Quét nhanh file .3mf trong ~/Downloads</span>
              </div>
              <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-zinc-200">
                <Check size={15} weight="bold" className="text-[#0071E3]" />
                <span>Đóng gói độc lập cho macOS (M1-M4 & Intel)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
