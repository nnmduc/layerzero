import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkle, WarningCircle } from '@phosphor-icons/react';

export const PegforgeSeamDiff: React.FC = () => {
  const reduce = useReducedMotion();
  const [usePegforge, setUsePegforge] = useState<boolean>(true);

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
            Đường cắt vô hình.
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#98989D]">
            Thuật toán Graph-Cut nắn vết cắt tự trượt theo nếp vải và đai trang phục.
          </p>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#F0F0F3] dark:bg-[#202024] shrink-0">
          <button
            type="button"
            onClick={() => setUsePegforge(false)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              !usePegforge
                ? 'bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            Cắt phẳng thông thường
          </button>
          <button
            type="button"
            onClick={() => setUsePegforge(true)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              usePegforge
                ? 'bg-[#0071E3] text-white shadow-sm'
                : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            PegForge Seam Hiding
          </button>
        </div>
      </div>

      {/* Visual Canvas Card */}
      <div className="apple-card-elevated rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Animated SVG Simulation */}
          <div className="lg:col-span-8 bg-[#F5F5F7] dark:bg-[#0D0D0F] rounded-2xl p-6 border border-apple-border dark:border-[rgba(255,255,255,0.08)] flex items-center justify-center">
            <svg viewBox="0 0 540 280" className="w-full h-64 sm:h-72">
              {/* Torso & Head Silhouette */}
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8E8E93" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8E8E93" stopOpacity="0.45" />
                </linearGradient>
              </defs>

              {/* Character Upper Body Outline */}
              <path
                d="M 210 50 Q 270 20 330 50 L 320 100 Q 380 120 420 190 L 370 210 L 340 170 L 340 260 L 200 260 L 200 170 L 170 210 L 120 190 Q 160 120 220 100 Z"
                className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600"
                strokeWidth="2"
              />

              {/* Collar Line */}
              <path
                d="M 240 105 Q 270 135 300 105"
                fill="none"
                className="stroke-zinc-400 dark:stroke-zinc-500"
                strokeWidth="2"
              />

              {/* Belt Line */}
              <path
                d="M 200 210 Q 270 220 340 210 L 340 230 Q 270 240 200 230 Z"
                className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500"
                strokeWidth="1.5"
              />

              {usePegforge ? (
                /* PegForge Smart Contoured Cut */
                <g>
                  {/* Seam line hugging collar */}
                  <motion.path
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                    d="M 235 103 Q 270 133 305 103"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Seam line hugging belt */}
                  <motion.path
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    d="M 195 210 Q 270 220 345 210"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Arm seam hidden at sleeve cuffs */}
                  <motion.path
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    d="M 180 155 L 205 175"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <motion.path
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    d="M 360 155 L 335 175"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Micro Indicators */}
                  <circle cx="270" cy="118" r="4" fill="#10B981" />
                  <line x1="270" y1="118" x2="270" y2="70" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" />
                  <rect x="215" y="55" width="110" height="20" rx="10" fill="#10B981" fillOpacity="0.15" />
                  <text x="270" y="69" textAnchor="middle" className="fill-[#10B981] font-mono text-[10px] font-bold">
                    Giấu viền cổ áo
                  </text>

                  <circle cx="270" cy="215" r="4" fill="#10B981" />
                  <line x1="270" y1="215" x2="270" y2="255" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" />
                  <rect x="210" y="245" width="120" height="20" rx="10" fill="#10B981" fillOpacity="0.15" />
                  <text x="270" y="259" textAnchor="middle" className="fill-[#10B981] font-mono text-[10px] font-bold">
                    Trượt mép thắt lưng
                  </text>
                </g>
              ) : (
                /* Planar arbitrary cut */
                <g>
                  {/* Ugly straight horizontal cut across chest */}
                  <motion.line
                    initial={reduce ? false : { x2: 100 }}
                    animate={{ x2: 440 }}
                    transition={{ duration: 0.4 }}
                    x1="100"
                    y1="160"
                    y2="160"
                    stroke="#EF4444"
                    strokeWidth="4"
                    strokeDasharray="6,4"
                  />
                  <circle cx="270" cy="160" r="5" fill="#EF4444" />
                  <rect x="180" y="172" width="180" height="24" rx="12" fill="#EF4444" fillOpacity="0.15" />
                  <text x="270" y="188" textAnchor="middle" className="fill-red-500 font-mono text-[11px] font-bold">
                    Vết sẹo phẳng cắt ngang ngực
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Right: Technical Explanation */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            {usePegforge ? (
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-4">
                  <Sparkle size={20} weight="fill" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Tự động giấu sẹo
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-6">
                  Vết cắt ôm sát đường biên giải phẫu tự nhiên kèm rãnh vát viền 0.3mm. Không lộ sẹo, không tốn công chà bả trét, sơn đa màu không cần dán băng dính.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <span>Độ sâu vát rãnh viền:</span>
                    <span className="text-emerald-600 font-bold">0.30mm (V-groove)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <span>Công chà nhám hậu kỳ:</span>
                    <span className="text-emerald-600 font-bold">Giảm 85%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl mb-4">
                  <WarningCircle size={20} weight="fill" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  Cắt phẳng thô sơ
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-6">
                  Mặt phẳng cắt thẳng xuyên qua ngực hoặc giữa mặt tạo vết hở lớn lộ thiên, phá hủy chi tiết vải và đòi hỏi nhiều giờ chà nhám, bả bột trét.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <span>Vết cắt bề mặt:</span>
                    <span className="text-red-500 font-bold">Lộ thiên</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
                    <span>Xử lý hậu kỳ:</span>
                    <span className="text-red-500 font-bold">Tốn nhiều công</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
