import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AppleLogo,
  CheckCircle,
  Cpu,
  DownloadSimple,
  HardDrives,
  ShieldCheck,
} from '@phosphor-icons/react';

export const DownloadSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [arch, setArch] = useState<'arm64' | 'x64'>('arm64');

  const downloadFile =
    arch === 'arm64'
      ? 'https://dl.layerzero.io.vn/LayerZero_2.0.0_Apple_Silicon_arm64.dmg'
      : 'https://dl.layerzero.io.vn/LayerZero_2.0.0_Intel_x64.dmg';

  const downloadName =
    arch === 'arm64'
      ? 'LayerZero_2.0.0_Apple_Silicon_arm64.dmg'
      : 'LayerZero_2.0.0_Intel_x64.dmg';

  return (
    <section id="tai-ve-macos" className="py-24 sm:py-32">
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
                BẢN PHÁT HÀNH CHÍNH THỨC
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
                Tải miễn phí cho macOS.
              </h2>
              <p className="text-base text-[#6E6E73] dark:text-zinc-300 max-w-[52ch] mb-6">
                Tích hợp sẵn nhân Python độc lập. Kéo vào Applications là dùng ngay cùng Bambu Studio và agy CLI.
              </p>

              <div className="mb-6">
                <div className="inline-flex rounded-full p-1 bg-[#F5F5F7] dark:bg-zinc-900 border border-[#1D1D1F]/[0.08] dark:border-white/[0.1]">
                  <button
                    type="button"
                    onClick={() => setArch('arm64')}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                      arch === 'arm64'
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'text-[#1D1D1F] dark:text-zinc-300'
                    }`}
                  >
                    Apple Silicon (M1 - M4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setArch('x64')}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                      arch === 'x64'
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'text-[#1D1D1F] dark:text-zinc-300'
                    }`}
                  >
                    Mac Intel (x86_64)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={downloadFile}
                  download={downloadName}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15.5px] font-semibold whitespace-nowrap shadow-sm active:scale-[0.98] transition-all"
                >
                  <AppleLogo size={20} weight="fill" />
                  <span>Tải cho macOS</span>
                  <DownloadSimple size={18} weight="bold" />
                </a>

                <div className="text-[12.5px] text-[#6E6E73] dark:text-zinc-400">
                  <div className="font-semibold text-[#1D1D1F] dark:text-zinc-200 font-mono">
                    {downloadName}
                  </div>
                  <div>
                    {arch === 'arm64' ? '~27 MB (arm64)' : '~30 MB (x86_64)'} · Signed Apple Developer ID
                  </div>
                </div>
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
                    LayerZero Studio v2.0
                  </h3>
                  <p className="text-[12px] text-[#6E6E73] dark:text-zinc-400">
                    Độc quyền trên macOS
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center gap-2.5">
                  <Cpu size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">Apple Silicon (M1 - M4) & Intel</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <HardDrives size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">macOS 13.0+ · Không cần cài Python</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">Hỗ trợ agy CLI (Sắp có Claude & Codex)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={17} weight="duotone" className="text-[#0071E3] shrink-0" />
                  <span className="text-[#1D1D1F] dark:text-zinc-200">Xử lý 100% cục bộ trên máy Mac</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
