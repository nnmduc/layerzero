import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle,
  Clock,
  Code,
  CubeTransparent,
  Heart,
  Sparkle,
  Stack,
  TerminalWindow,
  Warning,
} from '@phosphor-icons/react';

export const StorySection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [bridgeActive, setBridgeActive] = useState<boolean>(true);

  return (
    <section id="cau-chuyen" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Concise Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
            Từ một kỹ sư phần mềm mới chơi in 3D, viết tặng cộng đồng.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[60ch]">
            Mới bước vào in 3D, ai cũng muốn bản in đẹp ngay từ đầu nhưng lại ngợp giữa hàng trăm thông số và những file .3mf tải trên mạng không khớp với máy của mình.
          </p>
        </div>

        {/* Meaning of the Name "LayerZero" - Visual Layer Stack Banner */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 rounded-3xl apple-card-elevated p-6 sm:p-7 border-l-4 border-l-[#0071E3]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-mono font-bold text-[#0071E3] dark:text-[#2997FF] mb-1.5">
                <Stack size={16} weight="duotone" />
                <span>Ý NGHĨA TÊN GỌI LAYERZERO</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight mb-2">
                Lớp in số 0: Sự chuẩn bị kỹ lưỡng trước khi in.
              </h3>
              <p className="text-[14.5px] text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[58ch]">
                Trong in 3D, máy in luôn bắt đầu đếm từ <strong className="text-[#1D1D1F] dark:text-white">Layer 1</strong>. Nhưng một bản in thành công hay thất bại lại được quyết định ở <strong className="text-[#0071E3] dark:text-[#2997FF]">Layer 0 (LayerZero)</strong>, bước kiểm tra hình học và chuẩn bị thông số kỹ lưỡng trước khi đầu phun chạm xuống bàn in.
              </p>
            </div>

            {/* Animated 3D Layer Stack Graphic */}
            <div className="lg:col-span-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1F] p-4 border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] flex flex-col gap-2 font-mono text-[12px]">
              <div className="px-3.5 py-2 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-[#1D1D1F]/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[#6E6E73] dark:text-zinc-400">
                <span>Layer 2 .. N</span>
                <span>Thân & Đỉnh mô hình (0.16mm)</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-[#1D1D1F]/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[#1D1D1F] dark:text-zinc-200">
                <span>Layer 1</span>
                <span>Lớp nhựa đầu tiên chạm bàn PEI</span>
              </div>
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : { boxShadow: ['0 0 0px rgba(0,113,227,0)', '0 0 18px rgba(0,113,227,0.35)', '0 0 0px rgba(0,113,227,0)'] }
                }
                transition={{ duration: 2.4, repeat: Infinity }}
                className="px-3.5 py-2.5 rounded-xl bg-[#0071E3] text-white font-bold flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkle size={14} weight="fill" />
                  <span>Layer 0 (LayerZero)</span>
                </span>
                <span>Chuẩn bị hình học & AI trước khi in</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Cols: Interactive Visual Mismatch & AI Bridge Animation */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-3xl apple-card-elevated p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white">
                  Vì sao file .3mf tải trên mạng hay in lỗi?
                </h3>
                <p className="text-[13.5px] text-[#6E6E73] dark:text-zinc-400 mt-0.5">
                  Bấm chuyển đổi để xem cách LayerZero đồng bộ file .3mf với phần cứng của bạn
                </p>
              </div>

              <div className="inline-flex rounded-full p-1 bg-[#F5F5F7] dark:bg-zinc-900 border border-[#1D1D1F]/[0.08] dark:border-white/[0.1]">
                <button
                  type="button"
                  onClick={() => setBridgeActive(false)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    !bridgeActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-zinc-400'
                  }`}
                >
                  In trực tiếp (Lệch chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => setBridgeActive(true)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    bridgeActive
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-zinc-400'
                  }`}
                >
                  Qua LayerZero AI
                </button>
              </div>
            </div>

            {/* Animated Visual Pipeline Diagram */}
            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
                {/* Node 1: Internet .3mf */}
                <div className="sm:col-span-4 rounded-2xl bg-white dark:bg-[#141416] p-4 border border-[#1D1D1F]/[0.07] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2 text-[12px] font-mono text-[#6E6E73] dark:text-zinc-400 mb-2">
                    <CubeTransparent size={16} className="text-[#0071E3]" />
                    <span>FILE .3MF TRÊN MẠNG</span>
                  </div>
                  <div className="space-y-1.5 text-[12.5px]">
                    <div className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] dark:bg-zinc-900 font-mono text-[#1D1D1F] dark:text-zinc-200">
                      Máy tác giả: X1C (CoreXY)
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] dark:bg-zinc-900 font-mono text-[#1D1D1F] dark:text-zinc-200">
                      Nhựa: PETG 255°C · No Brim
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono">
                      Đáy cầu Z=0 chỉ 2.1 mm²
                    </div>
                  </div>
                </div>

                {/* Animated Connector Center */}
                <div className="sm:col-span-3 flex flex-col items-center justify-center py-2">
                  <div className="relative w-full flex items-center justify-center">
                    <div className="h-[2px] w-full bg-[#1D1D1F]/10 dark:bg-white/15 relative overflow-hidden rounded-full">
                      {!shouldReduceMotion && (
                        <motion.div
                          className={`absolute inset-y-0 w-1/2 rounded-full ${
                            bridgeActive ? 'bg-[#0071E3]' : 'bg-amber-500'
                          }`}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                    </div>
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? {}
                          : { scale: bridgeActive ? [1, 1.08, 1] : [1, 0.95, 1] }
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute px-3 py-1.5 rounded-full text-[11px] font-mono font-bold shadow-sm flex items-center gap-1 whitespace-nowrap ${
                        bridgeActive
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {bridgeActive ? (
                        <>
                          <Sparkle size={12} weight="fill" />
                          <span>Layer 0</span>
                        </>
                      ) : (
                        <>
                          <Warning size={12} weight="fill" />
                          <span>Xung đột</span>
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Node 2: Your Actual Setup Outcome */}
                <motion.div
                  key={bridgeActive ? 'ok' : 'fail'}
                  initial={shouldReduceMotion ? false : { opacity: 0.6, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`sm:col-span-4 rounded-2xl p-4 border ${
                    bridgeActive
                      ? 'bg-[#0071E3]/[0.07] dark:bg-[#0071E3]/[0.15] border-[#0071E3]/30'
                      : 'bg-amber-500/[0.07] border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[12px] font-mono mb-2">
                    <span className="font-semibold text-[#1D1D1F] dark:text-white">
                      MÁY CỦA BẠN (A1 · PLA)
                    </span>
                    {bridgeActive ? (
                      <CheckCircle size={16} weight="fill" className="text-[#0071E3] dark:text-[#2997FF]" />
                    ) : (
                      <Warning size={16} weight="fill" className="text-amber-500" />
                    )}
                  </div>
                  {bridgeActive ? (
                    <div className="space-y-1.5 text-[12.5px]">
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                        Hạ gia tốc Y: 4000 mm/s²
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 font-mono text-[#0071E3] dark:text-[#2997FF] font-semibold">
                        Cắt đáy Z=0.8mm + Brim 8mm
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-[#1D1D1F] dark:text-zinc-200 font-medium">
                        In đẹp ngay · Kèm giải thích
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[12.5px]">
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 font-medium">
                        Bàn trượt Y giật đổ chi tiết
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 font-medium">
                        Bung khớp cầu khỏi bàn PEI
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-[#6E6E73] dark:text-zinc-400">
                        Tốn hàng giờ mò từng setting
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Concept Artwork Strip */}
            <div className="relative rounded-2xl overflow-hidden border border-[#1D1D1F]/[0.06] dark:border-white/[0.08] bg-[#F5F5F7] dark:bg-zinc-900 h-44 sm:h-48">
              <img
                src="/images/artwork-ai-bridge.jpg"
                alt="Minh họa lăng kính LayerZero chuyển hóa lưới 3D thành bản in hoàn thiện"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/60 via-black/25 to-transparent text-white text-[13px] font-medium flex items-center justify-between">
                <span>Vừa có sản phẩm đẹp ngay từ lần in đầu, vừa tự học Best Practices qua từng thông số.</span>
              </div>
            </div>
          </motion.div>

          {/* Right 5 Cols: Software Engineer + AI CLI Ecosystem Visual Card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-3xl apple-card-elevated p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div>
              {/* Visual Formula Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D1D1F]/[0.06] dark:bg-white/[0.08] text-[12px] font-semibold text-[#1D1D1F] dark:text-zinc-200">
                  <Code size={15} className="text-[#0071E3]" />
                  <span>Kỹ sư phần mềm</span>
                </span>
                <span className="text-[#6E6E73] font-bold">+</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF]">
                  <Sparkle size={15} weight="fill" />
                  <span>AI CLI sẵn có</span>
                </span>
                <span className="text-[#6E6E73] font-bold">=</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071E3] text-[12px] font-semibold text-white">
                  <Heart size={14} weight="fill" />
                  <span>Cho cộng đồng</span>
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight leading-snug mb-3">
                Kết hợp kỹ năng lập trình và AI hàng ngày để giúp người mới bớt vất vả.
              </h3>
              <p className="text-[14.5px] text-[#6E6E73] dark:text-zinc-300 leading-relaxed">
                Là một kỹ sư phần mềm và là người sử dụng AI mỗi ngày, tôi kết hợp thuật toán giải tích hình học 3D với chính công cụ AI CLI trên máy tính cá nhân để tạo ra LayerZero.
              </p>
            </div>

            {/* AI CLI Support Visual Roadmap */}
            <div className="rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between text-[12px] font-mono text-[#6E6E73] dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <TerminalWindow size={16} className="text-[#0071E3]" />
                  <span>HỆ SINH THÁI AI CLI KẾT NỐI</span>
                </span>
                <span>BYO-AI</span>
              </div>

              {/* Active: Google Antigravity (agy CLI) */}
              <div className="rounded-xl bg-white dark:bg-[#141416] border-2 border-[#0071E3] p-3.5 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-mono font-bold text-[13px]">
                    agy
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#1D1D1F] dark:text-white">
                      Google Antigravity (agy CLI)
                    </div>
                    <div className="text-[12px] text-[#6E6E73] dark:text-zinc-400">
                      Unleashed Stream · Đọc sâu XML/JSON & Mesh
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-[11px] font-semibold whitespace-nowrap">
                  Đang hỗ trợ
                </span>
              </div>

              {/* Claude CLI - Now Supported */}
              <div className="rounded-xl bg-white/70 dark:bg-[#141416]/70 border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center font-mono font-semibold text-[12px]">
                    CLI
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1D1D1F] dark:text-zinc-200">
                      Claude Code (Anthropic)
                    </div>
                    <div className="text-[11.5px] text-[#6E6E73] dark:text-zinc-400">
                      Kết nối thuê bao Claude Pro / Max có sẵn · stream-json
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#D97706]/10 text-[#D97706] text-[11px] font-semibold whitespace-nowrap">
                  Đang hỗ trợ
                </span>
              </div>

              {/* Coming Soon: OpenAI Codex CLI */}
              <div className="rounded-xl bg-white/70 dark:bg-[#141416]/70 border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1D1D1F]/[0.06] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-zinc-300 flex items-center justify-center font-mono font-semibold text-[12px]">
                    CLI
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1D1D1F] dark:text-zinc-200">
                      Codex CLI (OpenAI)
                    </div>
                    <div className="text-[11.5px] text-[#6E6E73] dark:text-zinc-400">
                      Kết nối thuê bao ChatGPT Plus / Pro có sẵn
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1D1D1F]/[0.06] dark:bg-white/[0.08] text-[#6E6E73] dark:text-zinc-300 text-[11px] font-medium whitespace-nowrap">
                  <Clock size={12} />
                  <span>Sắp hỗ trợ</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
