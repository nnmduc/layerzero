import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle,
  GraduationCap,
  ShieldCheck,
  Sparkle,
  Warning,
} from '@phosphor-icons/react';
import { PROBLEM_CASES, ProblemCase } from '../data/content';

export const ProblemsWorkbench: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [pillarFilter, setPillarFilter] = useState<'all' | 'safety' | 'aesthetics'>('all');
  const [selectedId, setSelectedId] = useState<ProblemCase['id']>('flatten-bottom');
  const [showAfter, setShowAfter] = useState<boolean>(true);

  const filteredCases = PROBLEM_CASES.filter((c) =>
    pillarFilter === 'all' ? true : c.pillar === pillarFilter
  );

  const activeCase: ProblemCase =
    filteredCases.find((c) => c.id === selectedId) || filteredCases[0];

  const renderAnimatedSimulation = (caseId: ProblemCase['id'], optimized: boolean) => {
    switch (caseId) {
      case 'flatten-bottom':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            {/* PEI Build Plate */}
            <line
              x1="40"
              y1="148"
              x2="320"
              y2="148"
              className="stroke-[#1D1D1F]/30 dark:stroke-white/30"
              strokeWidth="3"
            />
            {optimized ? (
              <g>
                {/* Wide Brim */}
                <line
                  x1="105"
                  y1="146"
                  x2="255"
                  y2="146"
                  stroke="#0071E3"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* Flattened Ball Joint */}
                <path
                  d="M 135 146 A 52 52 0 1 1 225 146 Z"
                  className="fill-zinc-300 dark:fill-zinc-700 stroke-[#0071E3]"
                  strokeWidth="2.5"
                />
                {/* Glowing Green Contact Patch */}
                <line
                  x1="135"
                  y1="146"
                  x2="225"
                  y2="146"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-[#10B981] font-mono text-[11px] font-bold"
                >
                  Đáy cắt phẳng Z = 0.80mm (+310% diện tích bám)
                </text>
              </g>
            ) : (
              <g>
                <motion.g
                  animate={shouldReduceMotion ? {} : { rotate: [-7, 7, -7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '180px 146px' }}
                >
                  <circle
                    cx="180"
                    cy="96"
                    r="50"
                    className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500"
                    strokeWidth="2.5"
                  />
                </motion.g>
                <circle cx="180" cy="146" r="5" fill="#F59E0B" />
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Điểm chạm 2.4mm² dễ lắc và bung khỏi bàn PEI
                </text>
              </g>
            )}
          </svg>
        );

      case 'reinforce-supports':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            <line
              x1="40"
              y1="148"
              x2="320"
              y2="148"
              className="stroke-[#1D1D1F]/30 dark:stroke-white/30"
              strokeWidth="3"
            />
            {/* Overhang Arch Model */}
            <path
              d="M 85 148 L 85 62 Q 180 42 275 62 L 275 148 L 240 148 L 240 88 Q 180 76 120 88 L 120 148 Z"
              className="fill-zinc-300 dark:fill-zinc-700 stroke-[#1D1D1F]/25 dark:stroke-white/25"
              strokeWidth="2"
            />
            {optimized ? (
              <g>
                {/* Animated Tree Hybrid Supports */}
                <motion.path
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9 }}
                  d="M 155 146 Q 155 112 140 86 M 155 120 Q 170 102 180 84 M 205 146 Q 205 112 220 86 M 205 120 Q 192 102 180 84"
                  stroke="#0071E3"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <line
                  x1="125"
                  y1="84"
                  x2="235"
                  y2="84"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeDasharray="6 3"
                />
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Đã gỡ Blocker lỗi · Bọc đài đỡ Tree Hybrid 360° (Top Z 0.20mm)
                </text>
              </g>
            ) : (
              <g>
                {/* Accidental Blocker Box */}
                <rect
                  x="130"
                  y="108"
                  width="100"
                  height="38"
                  fill="rgba(239,68,68,0.16)"
                  stroke="#EF4444"
                  strokeDasharray="4 3"
                />
                {/* Drooping Spaghetti Bridge */}
                <motion.path
                  animate={shouldReduceMotion ? {} : { d: ['M 125 86 Q 180 124 235 86', 'M 125 86 Q 180 136 235 86', 'M 125 86 Q 180 124 235 86'] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  d="M 125 86 Q 180 128 235 86"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  fill="none"
                />
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Dính Support Blocker ẩn · Nhịp cầu nối bị võng sập
                </text>
              </g>
            )}
          </svg>
        );

      case 'bed-slinger-inertia':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            <line
              x1="40"
              y1="148"
              x2="320"
              y2="148"
              className="stroke-[#1D1D1F]/30 dark:stroke-white/30"
              strokeWidth="3"
            />
            {optimized ? (
              <g>
                {/* Wide Profile Aligned with Y Axis */}
                <rect
                  x="135"
                  y="42"
                  width="90"
                  height="104"
                  rx="12"
                  className="fill-zinc-300 dark:fill-zinc-700 stroke-[#0071E3]"
                  strokeWidth="2.5"
                />
                <path
                  d="M 90 132 L 270 132"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray="5 4"
                />
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Xoay dọc theo trục trượt Y · Hạ gia tốc 4,000 mm/s² êm ái
                </text>
              </g>
            ) : (
              <g>
                <motion.g
                  animate={shouldReduceMotion ? {} : { rotate: [-9, 9, -9], x: [-8, 8, -8] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  style={{ transformOrigin: '180px 146px' }}
                >
                  <rect
                    x="166"
                    y="34"
                    width="28"
                    height="112"
                    rx="8"
                    className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500"
                    strokeWidth="2.5"
                  />
                </motion.g>
                <text
                  x="180"
                  y="170"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Đặt ngang trục Y + Gia tốc 10,000 mm/s² gây rung lắc đỉnh
                </text>
              </g>
            )}
          </svg>
        );

      case 'screw-tolerance':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            {optimized ? (
              <g>
                {/* 6 Concentric Solid Wall Loops */}
                {[52, 44, 36, 28, 20, 12].map((r, i) => (
                  <circle
                    key={r}
                    cx="180"
                    cy="84"
                    r={r}
                    fill="none"
                    stroke={i === 0 ? '#10B981' : '#0071E3'}
                    strokeWidth="4.5"
                    opacity={1 - i * 0.1}
                  />
                ))}
                <text
                  x="180"
                  y="166"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Per-Object: 6 Walls đồng tâm đặc khít + Bù lỗ +0.06mm
                </text>
              </g>
            ) : (
              <g>
                <circle
                  cx="180"
                  cy="84"
                  r="50"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                />
                <path
                  d="M 145 60 L 215 108 M 145 108 L 215 60 M 180 34 L 180 134"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text
                  x="180"
                  y="166"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  2 Walls mỏng + Infill thưa dễ gãy ngang thân ốc khi vặn
                </text>
              </g>
            )}
          </svg>
        );

      case 'dome-stair-stepping':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            {optimized ? (
              <g>
                {/* Smooth Concentric Dome */}
                <path
                  d="M 70 142 Q 180 28 290 142 Z"
                  className="fill-zinc-300 dark:fill-zinc-700 stroke-[#0071E3]"
                  strokeWidth="3"
                />
                {[128, 114, 100, 86, 72].map((y, idx) => (
                  <line
                    key={y}
                    x1={90 + idx * 16}
                    y1={y}
                    x2={270 - idx * 16}
                    y2={y}
                    stroke="#0071E3"
                    strokeWidth="1.5"
                    opacity="0.55"
                  />
                ))}
                <text
                  x="180"
                  y="168"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Layer 0.16mm Optimal + Concentric Top ôm mượt mặt cầu
                </text>
              </g>
            ) : (
              <g>
                {/* Coarse Stair-Stepped Dome */}
                <rect x="75" y="122" width="210" height="20" className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500" strokeWidth="2" />
                <rect x="98" y="102" width="164" height="20" className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500" strokeWidth="2" />
                <rect x="122" y="82" width="116" height="20" className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500" strokeWidth="2" />
                <rect x="148" y="62" width="64" height="20" className="fill-zinc-300 dark:fill-zinc-700 stroke-amber-500" strokeWidth="2" />
                <text
                  x="180"
                  y="168"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Layer 0.20mm cố định lộ rõ các bậc thang thô ráp
                </text>
              </g>
            )}
          </svg>
        );

      case 'flat-top-ironing':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            <rect
              x="70"
              y="88"
              width="220"
              height="52"
              rx="6"
              className="fill-zinc-300 dark:fill-zinc-700"
            />
            {optimized ? (
              <g>
                {/* Mirror-Smooth Ironed Top Line */}
                <line
                  x1="72"
                  y1="88"
                  x2="288"
                  y2="88"
                  stroke="#0071E3"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Animated Ironing Nozzle Pass */}
                <motion.g
                  animate={shouldReduceMotion ? {} : { x: [0, 170, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <polygon points="85,48 105,48 98,74 92,74" fill="#0071E3" />
                  <polygon points="92,74 98,74 95,85" fill="#10B981" />
                </motion.g>
                <text
                  x="180"
                  y="168"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Per-Object Ironing (12% Flow @ 30mm/s) phẳng mịn như đúc
                </text>
              </g>
            ) : (
              <g>
                {/* Rough Un-ironed Ridges */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={82 + i * 15}
                    cy="86"
                    r="6"
                    className="fill-amber-500/80"
                  />
                ))}
                <text
                  x="180"
                  y="168"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Mặt phẳng đỉnh lộ rãnh sần giữa các sợi nhựa song song
                </text>
              </g>
            )}
          </svg>
        );

      case 'cylinder-scarf-seam':
        return (
          <svg viewBox="0 0 360 180" className="w-full h-44">
            {optimized ? (
              <g>
                <circle
                  cx="180"
                  cy="84"
                  r="52"
                  fill="none"
                  stroke="#0071E3"
                  strokeWidth="7"
                />
                {/* Tapered Scarf Overlap Arc */}
                <path
                  d="M 180 32 A 52 52 0 0 1 224 56"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <text
                  x="180"
                  y="166"
                  textAnchor="middle"
                  className="fill-[#0071E3] font-mono text-[11px] font-bold"
                >
                  Scarf Joint vát chìm mối nối + Nội suy cung tròn G2/G3
                </text>
              </g>
            ) : (
              <g>
                <circle
                  cx="180"
                  cy="84"
                  r="52"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="7"
                />
                {/* Protruding Z-Seam Bump */}
                <circle cx="180" cy="30" r="9" fill="#EF4444" />
                <text
                  x="180"
                  y="166"
                  textAnchor="middle"
                  className="fill-amber-500 font-mono text-[11px] font-bold"
                >
                  Mối nối Butt Joint để lại cục sẹo dọc Z-Seam trên thân trụ
                </text>
              </g>
            )}
          </svg>
        );
    }
  };

  return (
    <section id="xu-ly-loi-in" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Concise Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
              Xử lý tận gốc 7 bài toán thực tế thường làm hỏng bản in 3D.
            </h2>
            <p className="text-base text-[#6E6E73] dark:text-zinc-300">
              Trực quan hóa bằng ảnh chụp 3D macro kết hợp diễn hoạt động học Trước và Sau khi qua Layer 0.
            </p>
          </div>

          {/* Pillar Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPillarFilter('all');
                setSelectedId(PROBLEM_CASES[0].id);
              }}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                pillarFilter === 'all'
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-zinc-300 border border-[#1D1D1F]/10 dark:border-white/10'
              }`}
            >
              Tất cả (7)
            </button>
            <button
              type="button"
              onClick={() => {
                setPillarFilter('safety');
                setSelectedId('flatten-bottom');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                pillarFilter === 'safety'
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-zinc-300 border border-[#1D1D1F]/10 dark:border-white/10'
              }`}
            >
              <ShieldCheck size={15} weight="duotone" />
              <span>An toàn (4)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPillarFilter('aesthetics');
                setSelectedId('dome-stair-stepping');
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                pillarFilter === 'aesthetics'
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-zinc-300 border border-[#1D1D1F]/10 dark:border-white/10'
              }`}
            >
              <Sparkle size={15} weight="duotone" />
              <span>Thẩm mỹ (3)</span>
            </button>
          </div>
        </div>

        {/* Interactive Master-Detail Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 4 Cols: Compact Selector Pills with Macro Thumbnails */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {filteredCases.map((item) => {
              const isSelected = item.id === activeCase.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowAfter(true);
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition-all active:scale-[0.99] border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-sm'
                      : 'apple-card-elevated text-[#1D1D1F] dark:text-zinc-100 hover:border-[#0071E3]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.shortTitle}
                      className={`w-12 h-12 rounded-xl object-cover shrink-0 border ${
                        isSelected
                          ? 'border-white/30'
                          : 'border-[#1D1D1F]/10 dark:border-white/10'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold leading-snug truncate">
                        {item.shortTitle}
                      </div>
                      <div
                        className={`text-[11px] font-mono mt-0.5 truncate ${
                          isSelected ? 'text-white/80' : 'text-[#6E6E73] dark:text-zinc-400'
                        }`}
                      >
                        {item.actionCode}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10.5px] font-mono px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                    }`}
                  >
                    {item.pillar === 'safety' ? 'An toàn' : 'Thẩm mỹ'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right 8 Cols: Dual Artwork + Animated Simulation Stage */}
          <motion.div
            key={activeCase.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 rounded-3xl apple-card-elevated p-6 sm:p-8 flex flex-col justify-between gap-5"
          >
            {/* Top Bar: Title + Before/After Switch */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-lg">
                <span className="text-[11.5px] font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                  {activeCase.actionCode}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight mt-0.5">
                  {activeCase.title}
                </h3>
                <p className="text-[13.5px] text-[#6E6E73] dark:text-zinc-300 mt-1">
                  {activeCase.oneLineSummary}
                </p>
              </div>

              <div className="inline-flex rounded-full p-1 bg-[#F5F5F7] dark:bg-zinc-900 border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAfter(false)}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    !showAfter
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-zinc-400'
                  }`}
                >
                  <Warning size={13} weight="fill" />
                  <span>Trước (Lỗi in)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAfter(true)}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    showAfter
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-zinc-400'
                  }`}
                >
                  <CheckCircle size={13} weight="fill" />
                  <span>Sau (LayerZero)</span>
                </button>
              </div>
            </div>

            {/* Dual Visual Stage: 3D Macro Artwork + Interactive Motion Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left Panel: Generated 3D Macro Artwork with Animated Scan Overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] bg-[#141416] min-h-[210px] group">
                <motion.img
                  key={activeCase.image}
                  src={activeCase.image}
                  alt={activeCase.title}
                  initial={shouldReduceMotion ? false : { scale: 1.04, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                  className="w-full h-full object-cover max-h-[220px]"
                />
                {/* Animated Laser Scan Beam across Artwork */}
                {!shouldReduceMotion && (
                  <motion.div
                    animate={{ top: ['8%', '88%', '8%'] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent shadow-[0_0_12px_#0071E3] pointer-events-none"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/90 font-semibold">
                    Minh họa 3D Macro
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#0071E3]/90 text-white font-mono text-[10px] font-semibold">
                    {activeCase.actionCode}
                  </span>
                </div>
              </div>

              {/* Right Panel: Interactive Before/After Motion Simulation */}
              <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] p-3.5 flex flex-col justify-between min-h-[210px]">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] font-mono font-semibold text-[#6E6E73] dark:text-zinc-400 whitespace-nowrap">
                    Diễn hoạt Động học
                  </span>
                  <span
                    className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                      showAfter
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {showAfter ? 'ĐÃ XỬ LÝ LAYER 0' : 'TRẠNG THÁI LỖI GỐC'}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  {renderAnimatedSimulation(activeCase.id, showAfter)}
                </div>
              </div>
            </div>

            {/* 3 Visual Metric Cards + Slicer Keys Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeCase.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1F] p-3.5 border border-[#1D1D1F]/[0.06] dark:border-white/[0.07]"
                >
                  <div className="text-[11px] text-[#6E6E73] dark:text-zinc-400 mb-1">
                    {m.label}
                  </div>
                  <div className="text-[11.5px] text-[#6E6E73] dark:text-zinc-500 line-through font-mono">
                    {m.before}
                  </div>
                  <div className="text-[13.5px] font-bold font-mono text-[#0071E3] dark:text-[#2997FF] mt-0.5">
                    {m.after}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Takeaway Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1D1D1F]/[0.07] dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-[13px] text-[#1D1D1F] dark:text-zinc-200">
                <GraduationCap size={18} weight="duotone" className="text-[#0071E3] dark:text-[#2997FF] shrink-0" />
                <span>
                  <strong>Bài học:</strong> {activeCase.learnedConcept}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {activeCase.slicerKeys.map((sk) => (
                  <span
                    key={sk.key}
                    className="px-2.5 py-1 rounded-lg bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] font-mono text-[11px] font-semibold"
                  >
                    {sk.key}: {sk.value}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
