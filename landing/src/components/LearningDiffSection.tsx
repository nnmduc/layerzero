import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle,
  CompassTool,
  GraduationCap,
  Lightbulb,
  Pause,
  Play,
  SlidersHorizontal,
  Sparkle,
  Warning,
} from '@phosphor-icons/react';
import { DIFF_SETTINGS_SHOWCASE, DiffSettingRow } from '../data/content';

export const LearningDiffSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DIFF_SETTINGS_SHOWCASE.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, shouldReduceMotion]);

  const activeItem: DiffSettingRow = DIFF_SETTINGS_SHOWCASE[activeIndex];

  const renderSettingPhysicsAnimation = (settingKey: string) => {
    switch (settingKey) {
      case 'wall_generator':
        return (
          <svg viewBox="0 0 440 116" className="w-full h-28">
            <line x1="220" y1="12" x2="220" y2="104" stroke="#71717A" strokeOpacity="0.2" strokeDasharray="3 3" />
            {/* Left: Classic Fixed Width leaving gap */}
            <g>
              <text x="105" y="20" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-mono text-[10.5px] font-bold">
                CLASSIC (Hở rỗng ruột)
              </text>
              <polygon
                points="35,95 175,52 175,95"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <line x1="48" y1="89" x2="166" y2="60" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
              <line x1="48" y1="92" x2="166" y2="92" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
              <circle cx="150" cy="76" r="6" fill="rgba(239,68,68,0.25)" stroke="#EF4444" strokeWidth="1.5" />
            </g>

            {/* Right: Arachne Adaptive Width */}
            <g>
              <text x="335" y="20" textAnchor="middle" className="fill-[#0071E3] dark:fill-[#2997FF] font-mono text-[10.5px] font-bold">
                ARACHNE (Co giãn đặc khít)
              </text>
              <polygon
                points="265,95 405,52 405,95"
                className="fill-[#0071E3]/15 stroke-[#0071E3]"
                strokeWidth="2"
              />
              <motion.path
                animate={shouldReduceMotion ? {} : { strokeWidth: [5, 11, 5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                d="M 276 90 L 395 73"
                stroke="#0071E3"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="388" cy="74" r="5" fill="#10B981" />
            </g>
          </svg>
        );

      case 'outer_wall_speed':
        return (
          <svg viewBox="0 0 440 116" className="w-full h-28">
            <line x1="220" y1="12" x2="220" y2="104" stroke="#71717A" strokeOpacity="0.2" strokeDasharray="3 3" />
            <text x="105" y="20" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-mono text-[10.5px] font-bold">
              200 mm/s (Bóng/mờ không đều)
            </text>
            {[38, 56, 74, 92].map((y, i) => (
              <line
                key={y}
                x1="38"
                y1={y}
                x2="175"
                y2={y}
                stroke={i % 2 === 0 ? '#F59E0B' : '#FB923C'}
                strokeWidth={i % 2 === 0 ? '7' : '4'}
                strokeLinecap="round"
                opacity={i % 2 === 0 ? 0.95 : 0.45}
              />
            ))}

            <text x="335" y="20" textAnchor="middle" className="fill-[#0071E3] dark:fill-[#2997FF] font-mono text-[10.5px] font-bold">
              120 mm/s (Nhựa chảy đồng nhất)
            </text>
            {[38, 56, 74, 92].map((y) => (
              <line
                key={y}
                x1="265"
                y1={y}
                x2="402"
                y2={y}
                stroke="#0071E3"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
            {!shouldReduceMotion && (
              <motion.circle
                animate={{ cx: [265, 402, 265] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                cy="56"
                r="5"
                fill="#10B981"
              />
            )}
          </svg>
        );

      case 'travel_acceleration':
        return (
          <svg viewBox="0 0 440 116" className="w-full h-28">
            <line x1="220" y1="12" x2="220" y2="104" stroke="#71717A" strokeOpacity="0.2" strokeDasharray="3 3" />
            <text x="105" y="20" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-mono text-[10.5px] font-bold">
              10,000 mm/s² (Giật bàn Y)
            </text>
            <line x1="40" y1="98" x2="170" y2="98" stroke="#71717A" strokeWidth="3" />
            <motion.rect
              animate={shouldReduceMotion ? {} : { rotate: [-8, 8, -8], x: [-5, 5, -5] }}
              transition={{ duration: 0.75, repeat: Infinity }}
              style={{ transformOrigin: '105px 98px' }}
              x="95"
              y="34"
              width="20"
              height="64"
              rx="5"
              fill="rgba(245,158,11,0.25)"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />

            <text x="335" y="20" textAnchor="middle" className="fill-[#0071E3] dark:fill-[#2997FF] font-mono text-[10.5px] font-bold">
              4,000 mm/s² (Trượt êm ái)
            </text>
            <line x1="270" y1="98" x2="400" y2="98" stroke="#71717A" strokeWidth="3" />
            <rect
              x="324"
              y="34"
              width="22"
              height="64"
              rx="5"
              className="fill-[#0071E3]/20 stroke-[#0071E3]"
              strokeWidth="2.5"
            />
            <circle cx="335" cy="98" r="4.5" fill="#10B981" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 440 116" className="w-full h-28">
            <line x1="220" y1="12" x2="220" y2="104" stroke="#71717A" strokeOpacity="0.2" strokeDasharray="3 3" />
            <text x="105" y="20" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-mono text-[10.5px] font-bold">
              0.15mm + No Brim (Dính chặt)
            </text>
            <rect x="65" y="34" width="80" height="24" rx="4" fill="rgba(245,158,11,0.25)" stroke="#F59E0B" strokeWidth="2" />
            <rect x="75" y="58" width="60" height="38" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeDasharray="3 2" />

            <text x="335" y="20" textAnchor="middle" className="fill-[#0071E3] dark:fill-[#2997FF] font-mono text-[10.5px] font-bold">
              Top Z 0.20mm + Brim 8mm
            </text>
            <rect x="295" y="30" width="80" height="24" rx="4" className="fill-[#0071E3]/20 stroke-[#0071E3]" strokeWidth="2" />
            <line x1="295" y1="59" x2="375" y2="59" stroke="#10B981" strokeWidth="3" strokeDasharray="5 3" />
            <rect x="305" y="64" width="60" height="32" className="fill-zinc-300 dark:fill-zinc-700" rx="3" />
            <line x1="275" y1="96" x2="395" y2="96" stroke="#0071E3" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <section
      id="hoc-thong-so"
      className="py-24 sm:py-32 bg-white dark:bg-[#121214] border-t border-[#1D1D1F]/[0.06] dark:border-white/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clear, Purpose-Driven Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
              Không chỉ chỉnh hộ thông số. Giúp bạn hiểu rõ vì sao cần đổi.
            </h2>
            <p className="text-base text-[#6E6E73] dark:text-zinc-300 leading-relaxed">
              Thay vì để người mới tự bơi giữa hàng trăm thiết lập Slicer, phần mềm chỉ lọc ra những thông số thực sự cần can thiệp, giải thích chức năng và lý do thay đổi ngay trên mô hình.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-semibold bg-[#F5F5F7] dark:bg-zinc-900 text-[#1D1D1F] dark:text-zinc-200 border border-[#1D1D1F]/10 dark:border-white/10 hover:border-[#0071E3]/40 transition-all"
          >
            {isAutoPlaying ? (
              <>
                <Pause size={14} weight="fill" className="text-[#0071E3]" />
                <span>Đang tự động trình chiếu (Bấm để dừng)</span>
              </>
            ) : (
              <>
                <Play size={14} weight="fill" className="text-[#0071E3]" />
                <span>Tiếp tục trình chiếu tự động</span>
              </>
            )}
          </button>
        </div>

        {/* Unified Interactive Visual Stage (5 Cols Anatomy + 7 Cols AI Mentor Inspector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 5 Cols: 3D Layer Anatomy Artwork + Interactive Parameter Selector */}
          <div className="lg:col-span-5 rounded-3xl bg-[#F5F5F7] dark:bg-[#1A1A1D] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between gap-5">
            {/* Artwork with Animated Scan Line & Active Parameter Tag */}
            <div className="relative rounded-2xl overflow-hidden border border-[#1D1D1F]/[0.08] dark:border-white/[0.1] bg-[#141416] h-52">
              <img
                src="/images/artwork-3d-layers.webp"
                alt="Minh họa giải phẫu lớp cắt 3D và thông số Slicer"
                width="1440"
                height="800"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ top: ['12%', '86%', '12%'] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0071E3] to-transparent shadow-[0_0_14px_#0071E3] pointer-events-none"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-white/70">
                    VÙNG ĐANG KIỂM TRA TRÊN MÔ HÌNH
                  </div>
                  <div className="text-[13px] font-bold text-white">
                    {activeItem.zoneLabel}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0071E3] text-white font-mono text-[11px] font-semibold">
                  {activeItem.key}
                </span>
              </div>
            </div>

            {/* 4 Interactive Parameter Tabs on the Model */}
            <div className="space-y-2">
              <div className="text-[11.5px] font-mono font-semibold text-[#6E6E73] dark:text-zinc-400 px-1">
                CHỌN THÔNG SỐ ĐỂ XEM PHẦN MỀM GIẢI THÍCH:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DIFF_SETTINGS_SHOWCASE.map((item, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveIndex(idx);
                        setIsAutoPlaying(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-sm'
                          : 'bg-white dark:bg-[#141416] text-[#1D1D1F] dark:text-zinc-200 border-[#1D1D1F]/[0.07] dark:border-white/[0.08] hover:border-[#0071E3]/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] font-mono truncate ${
                            isSelected ? 'text-white/80' : 'text-[#6E6E73] dark:text-zinc-400'
                          }`}
                        >
                          {item.authorVal} → {item.proposedVal}
                        </div>
                      </div>
                      <span
                        className={`text-[10.5px] font-mono px-2.5 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                        }`}
                      >
                        {item.categoryLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Live AI Parameter Coach & Physics Animation (No overflow!) */}
          <motion.div
            key={activeItem.key}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-3xl bg-[#F5F5F7] dark:bg-[#1A1A1D] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between gap-5"
          >
            {/* Header of the Inspector */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#1D1D1F]/[0.07] dark:border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11.5px] font-mono font-semibold text-[#0071E3] dark:text-[#2997FF]">
                  <SlidersHorizontal size={14} weight="bold" />
                  <span>THÔNG SỐ CẦN TỐI ƯU · {activeItem.key}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white mt-1">
                  {activeItem.label}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11.5px] font-mono font-semibold">
                <CheckCircle size={14} weight="fill" />
                <span>{activeItem.impactBadge}</span>
              </span>
            </div>

            {/* Step 1: Spacious 3-Column Value Comparison (Zero Horizontal Overflow) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white dark:bg-[#141416] p-3.5 border border-[#1D1D1F]/[0.06] dark:border-white/[0.07]">
                <div className="text-[10.5px] font-mono text-[#6E6E73] dark:text-zinc-400 mb-1">
                  1. MẶC ĐỊNH SLICER
                </div>
                <div className="text-[14px] font-mono font-semibold text-[#1D1D1F] dark:text-zinc-200 break-words">
                  {activeItem.defaultVal}
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/[0.07] dark:bg-amber-500/[0.1] p-3.5 border border-amber-500/20">
                <div className="flex items-center gap-1 text-[10.5px] font-mono text-amber-700 dark:text-amber-400 mb-1">
                  <Warning size={12} weight="fill" />
                  <span>2. TRONG FILE .3MF GỐC</span>
                </div>
                <div className="text-[14px] font-mono font-semibold text-amber-700 dark:text-amber-400 line-through break-words">
                  {activeItem.authorVal}
                </div>
              </div>

              <div className="rounded-2xl bg-[#0071E3]/10 dark:bg-[#0071E3]/15 p-3.5 border border-[#0071E3]/30">
                <div className="flex items-center gap-1 text-[10.5px] font-mono font-bold text-[#0071E3] dark:text-[#2997FF] mb-1">
                  <Sparkle size={12} weight="fill" />
                  <span>3. LAYERZERO ĐỀ XUẤT</span>
                </div>
                <div className="text-[14px] font-mono font-bold text-[#0071E3] dark:text-[#2997FF] break-words">
                  {activeItem.proposedVal}
                </div>
              </div>
            </div>

            {/* Step 2: Animated Physics Comparison Diagram */}
            <div className="rounded-2xl bg-white dark:bg-[#141416] border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] px-4 py-3">
              {renderSettingPhysicsAnimation(activeItem.key)}
            </div>

            {/* Step 3: Two Clear Educational Callouts (What it does & Why change it) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl bg-white dark:bg-[#141416] p-4 border border-[#1D1D1F]/[0.06] dark:border-white/[0.07]">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#1D1D1F] dark:text-white mb-1.5">
                  <CompassTool size={16} weight="duotone" className="text-[#0071E3]" />
                  <span>Chức năng của thông số này</span>
                </div>
                <p className="text-[13px] text-[#6E6E73] dark:text-zinc-300 leading-relaxed">
                  {activeItem.whatItDoes}
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#141416] p-4 border border-[#0071E3]/25">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#0071E3] dark:text-[#2997FF] mb-1.5">
                  <Lightbulb size={16} weight="duotone" />
                  <span>Tại sao cần đổi trên mẫu in này?</span>
                </div>
                <p className="text-[13px] text-[#1D1D1F] dark:text-zinc-200 leading-relaxed">
                  {activeItem.shortWhy}
                </p>
              </div>
            </div>

            {/* Footer note */}
            <div className="flex items-center gap-2 text-[12.5px] text-[#6E6E73] dark:text-zinc-400 pt-1">
              <GraduationCap size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
              <span>
                Mọi thay đổi đều kèm giải thích trực quan ngay trong ứng dụng để bạn làm chủ kiến thức in 3D sau từng mẫu in.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
