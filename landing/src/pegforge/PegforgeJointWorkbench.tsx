import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GearSix } from '@phosphor-icons/react';

type JointMode = 'ball-joint' | 'peg-hex' | 'snap-fit' | 'rom-check';

export const PegforgeJointWorkbench: React.FC = () => {
  const reduce = useReducedMotion();
  const [activeJoint, setActiveJoint] = useState<JointMode>('ball-joint');

  const renderSimulationSvg = () => {
    switch (activeJoint) {
      case 'peg-hex':
        return (
          <svg viewBox="0 0 460 200" className="w-full h-48 sm:h-56">
            <path d="M 60 160 L 60 50 L 190 50 L 190 160 Z" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <path d="M 190 75 L 140 75 L 125 105 L 140 135 L 190 135" fill="none" className="stroke-[#0071E3]" strokeWidth="2.5" strokeDasharray="4,2" />
            <motion.g
              animate={reduce ? {} : { x: [-15, 5, -15] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <polygon points="220,105 240,76 280,76 300,105 280,134 240,134" className="fill-[#0071E3] stroke-[#0071E3]" strokeWidth="2" opacity="0.85" />
              <rect x="280" y="60" width="120" height="90" rx="6" className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
            </motion.g>
            <text x="230" y="185" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[11px] font-bold">
              Khe hở cơ khí 0.20mm (Khóa cứng góc xoay)
            </text>
          </svg>
        );

      case 'ball-joint':
        return (
          <svg viewBox="0 0 460 200" className="w-full h-48 sm:h-56">
            <path d="M 120 30 L 170 30 A 55 55 0 1 1 170 170 L 120 170 Z" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <line x1="170" y1="100" x2="135" y2="100" stroke="#EF4444" strokeWidth="2.5" />
            <motion.g
              animate={reduce ? {} : { rotate: [-24, 24, -24] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '215px 100px' }}
            >
              <circle cx="215" cy="100" r="52" className="fill-[#0071E3]/20 stroke-[#0071E3]" strokeWidth="3" />
              <rect x="250" y="86" width="130" height="28" rx="6" className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
              <path d="M 280 55 A 65 65 0 0 1 280 145" fill="none" stroke="#0071E3" strokeWidth="1.5" strokeDasharray="3,3" />
            </motion.g>
            <text x="230" y="185" textAnchor="middle" className="fill-[#0071E3] font-mono text-[11px] font-bold">
              Góc ôm 200° ma sát tự giữ dáng + Xoay 360°
            </text>
          </svg>
        );

      case 'snap-fit':
        return (
          <svg viewBox="0 0 460 200" className="w-full h-48 sm:h-56">
            <path d="M 80 50 L 180 50 L 180 75 L 160 75 L 160 125 L 180 125 L 180 150 L 80 150 Z" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <motion.g
              animate={reduce ? {} : { x: [-20, 0, -20] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 230 82 L 170 82 L 165 76 L 155 76 L 155 86 L 230 86 Z" className="fill-[#10B981] stroke-[#10B981]" strokeWidth="1.5" />
              <path d="M 230 118 L 170 118 L 165 124 L 155 124 L 155 114 L 230 114 Z" className="fill-[#10B981] stroke-[#10B981]" strokeWidth="1.5" />
              <rect x="230" y="65" width="130" height="70" rx="8" className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
            </motion.g>
            <text x="230" y="185" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[11px] font-bold">
              Ngàm búng tự khóa âm dương (Không cần keo dán)
            </text>
          </svg>
        );

      case 'rom-check':
        return (
          <svg viewBox="0 0 460 200" className="w-full h-48 sm:h-56">
            <rect x="70" y="70" width="100" height="80" rx="12" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <circle cx="170" cy="110" r="18" className="fill-[#0071E3]/20 stroke-[#0071E3]" strokeWidth="2" />
            <motion.g
              animate={reduce ? {} : { rotate: [-40, 40, -40] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '170px 110px' }}
            >
              <rect x="170" y="102" width="140" height="16" rx="8" className="fill-[#0071E3] stroke-[#0071E3]" strokeWidth="1" />
              <circle cx="310" cy="110" r="6" fill="#10B981" />
              <line x1="310" y1="80" x2="310" y2="140" stroke="#10B981" strokeWidth="2" strokeDasharray="3,2" opacity="0.6" />
            </motion.g>
            <path d="M 280 25 A 120 120 0 0 1 280 195" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4,4" />
            <text x="230" y="185" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[11px] font-bold">
              Quét va chạm 5° mỗi bước: Khe hở an toàn 0.28mm
            </text>
          </svg>
        );
    }
  };

  const DETAILS: Record<JointMode, { title: string; stat: string }> = {
    'ball-joint': {
      title: 'Khớp cầu ma sát Bächer 200°',
      stat: 'Xoay 360° tự giữ dáng',
    },
    'peg-hex': {
      title: 'Chốt lục giác chống xoay',
      stat: 'Độ rơ góc: 0.0°',
    },
    'snap-fit': {
      title: 'Ngàm búng tự khóa',
      stat: 'Không cần keo dán',
    },
    'rom-check': {
      title: 'Mô phỏng va chạm động ROM',
      stat: 'Khe hở an toàn: > 0.2mm',
    },
  };

  const active = DETAILS[activeJoint];

  return (
    <section id="joints" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
            Khớp cơ khí tự định vị.
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#98989D]">
            Mọi khớp nối được tính toán độ dung sai và mô phỏng va chạm trước khi bấm in.
          </p>
        </div>

        {/* 4-Tab Switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#F0F0F3] dark:bg-[#202024] shrink-0 overflow-x-auto">
          {(['ball-joint', 'peg-hex', 'snap-fit', 'rom-check'] as JointMode[]).map((mode) => {
            const isSelected = activeJoint === mode;
            const labels: Record<JointMode, string> = {
              'ball-joint': 'BALL_JOINT',
              'peg-hex': 'PEG_HEX',
              'snap-fit': 'SNAP_FIT',
              'rom-check': 'ROM CHECK',
            };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveJoint(mode)}
                className={`px-3.5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="apple-card-elevated rounded-3xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Animated Simulation SVG */}
          <div className="lg:col-span-7 bg-[#F5F5F7] dark:bg-[#0D0D0F] rounded-2xl p-6 border border-apple-border dark:border-[rgba(255,255,255,0.08)]">
            {renderSimulationSvg()}
          </div>

          {/* Macro Artwork & Spec Badge */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-zinc-950 border border-apple-border dark:border-[rgba(255,255,255,0.09)]">
              <img
                src="/images/pegforge/macro-joint.jpg"
                alt="Chụp macro cận cảnh khớp cơ khí PEG_HEX và BALL_JOINT resin siêu mịn"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono text-white/90">
                  Dung sai cơ khí chính xác 0.20mm
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)] flex items-center justify-between text-xs font-mono">
              <span className="text-[#6E6E73] dark:text-[#98989D]">{active.title}</span>
              <span className="text-[#0071E3] font-bold">{active.stat}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
