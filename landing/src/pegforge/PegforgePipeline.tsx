import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from '@phosphor-icons/react';

interface PipelineStepData {
  title: string;
  badge: string;
  terminalCmd: string;
  visual: React.ReactNode;
}

const PIPELINE_STEPS: PipelineStepData[] = [
  {
    title: 'Phân tách giải phẫu nhân vật',
    badge: 'Local SAM 2 + Raycast',
    terminalCmd: 'pegforge segment compute --method vlm-sam --parts 7',
    visual: (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-950 border border-apple-border dark:border-[rgba(255,255,255,0.09)]">
          <img
            src="/images/pegforge/semantic-anatomy.jpg"
            alt="Mô phỏng phân tách giải phẫu nhân vật AI trên mesh 3D"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-xs font-mono text-white/90 font-medium">
              Phân cụm thông minh: Tóc · Mặt · Thân · Chi · Đế
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
            01. Tóc: Khối vỏ chụp ngoài
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
            02. Mặt: Lồng góc in láng mịn
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Nắn vết cắt giấu sẹo',
    badge: 'Graph-Cut 0.3mm Chamfer',
    terminalCmd: 'pegforge segment to-cuts --chamfer 0.3',
    visual: (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)] space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Cổ áo:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Giấu viền trang phục</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Thắt lưng:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Trượt mép đai quần</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Băng tay & Bốt:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Khóa nếp gấp tự nhiên</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-medium text-center">
          Sơn màu độc lập từng part, không tốn công dán băng keo.
        </div>
      </div>
    ),
  },
  {
    title: 'Sinh ngàm chốt tự định vị',
    badge: 'Bächer Ball-Joint & ROM 5°',
    terminalCmd: 'pegforge joint set C9 BALL_JOINT --rom-check',
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0071E3]/10 border border-[#0071E3]/20 text-xs font-mono">
            <div className="font-bold text-[#0071E3]">PEG_HEX Lục giác</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">Định vị góc lắp 100%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono">
            <div className="font-bold text-emerald-600 dark:text-emerald-400">BALL_JOINT 200°</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">Xoay 360° tự giữ dáng</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)] flex items-center justify-between text-xs font-mono">
          <span className="text-[#6E6E73] dark:text-[#98989D]">Kiểm tra va chạm ROM:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Khe hở an toàn &gt; 0.20mm</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Đặt phẳng & Xuất file .3MF',
    badge: 'Auto Lay-flat & 256mm Bed',
    terminalCmd: 'pegforge export 3mf --lay-flat --plate-size 256',
    visual: (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)] space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Định hướng mặt in:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mặt phẳng Socket Z = 0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Khổ bàn in:</span>
            <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-bold">Bambu Lab 256x256mm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6E6E73] dark:text-[#98989D]">Định dạng:</span>
            <span className="text-[#0071E3] font-bold">Multi-Object .3MF</span>
          </div>
        </div>
      </div>
    ),
  },
];

export const PegforgePipeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = PIPELINE_STEPS[activeStep];

  return (
    <section id="pipeline" className="py-16 md:py-24 bg-apple-surface dark:bg-[#161618] border-y border-apple-border dark:border-[rgba(255,255,255,0.09)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
            Bốn bước giải phẫu mô hình
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#98989D]">
            Thuật toán thị giác máy tính và hình học giải tích chuẩn xác từng layer in.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step Selector Buttons */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {PIPELINE_STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-4 rounded-2xl transition-all duration-200 border ${
                    isActive
                      ? 'border-[#0071E3] bg-[#0071E3]/5 dark:bg-[#0071E3]/10'
                      : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center ${
                        isActive
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-black/10 dark:bg-white/10 text-[#6E6E73] dark:text-[#98989D]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm sm:text-base">
                      {step.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step Detail Visual Card */}
          <div className="lg:col-span-7 apple-card-elevated rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-mono text-xs font-semibold mb-3">
                  {current.badge}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                  {current.title}
                </h3>
                {current.visual}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-apple-border dark:border-[rgba(255,255,255,0.09)] flex items-center justify-between text-xs font-mono text-[#6E6E73] dark:text-[#98989D]">
              <span className="text-[#0071E3] font-semibold">{current.terminalCmd}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={14} weight="fill" />
                <span>Hoàn tất</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
