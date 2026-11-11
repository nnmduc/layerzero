import React from 'react';
import { Cpu, Printer, GitBranch, CloudArrowUp, ShieldCheck, Sparkle } from '@phosphor-icons/react';

export const Form3dBento: React.FC = () => {
  return (
    <section id="dac-diem" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <span>Ưu thế cốt lõi</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
          Tối ưu Native cho Apple Silicon & Maker
        </h2>
        <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
          Chạy hoàn toàn riêng tư trên máy Mac của bạn, tận dụng sức mạnh Metal Performance Shaders (MPS) với chi phí 0đ.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        {/* Cell 1: Local Metal MPS Engine */}
        <div className="md:col-span-7 rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl mb-6">
              <Cpu size={26} weight="bold" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Inference cục bộ qua Metal Performance Shaders (MPS)
            </h3>
            <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-6">
              Tận dụng tối đa kiến trúc bộ nhớ hợp nhất (Unified Memory) và nhân đồ họa GPU tích hợp trên các dòng chip Apple Silicon (M1/M2/M3/M4). Mô hình chạy trực tiếp offline trên máy Mac của bạn, không gửi dữ liệu ra ngoài, không phát sinh chi phí điện toán đám mây.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Apple Silicon MPS</div>
              <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-1">PyTorch Metal 0đ</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="font-bold text-purple-600 dark:text-purple-400">100% Offline</div>
              <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-1">Bảo mật dữ liệu trên máy</div>
            </div>
          </div>
        </div>

        {/* Cell 2: 3D-Print Ready Geometry */}
        <div className="md:col-span-5 rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-6">
              <Printer size={26} weight="bold" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Hình học tối ưu sẵn sàng in 3D
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-6">
              Khác với các công cụ text-to-3D thông thường xuất file lỗi hỏng, Form3D áp dụng pipeline xử lý hình học chuyên sâu cho máy in 3D FDM / SLA.
            </p>
          </div>

          <ul className="space-y-2.5 text-xs font-mono text-[#515154] dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Cắt phẳng đáy Z = 0 bám dính bàn PEI</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Taubin smoothing không co ngót kích thước</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Tự động khử sạch mảnh vỡ bay lơ lửng</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Chuyển trục Y-up sang Z-up chuẩn Bambu</span>
            </li>
          </ul>
        </div>

        {/* Cell 3: Full Ecosystem Integration */}
        <div className="md:col-span-12 rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center text-2xl mb-6">
                <GitBranch size={26} weight="bold" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
                100% Mã nguồn mở & Đóng gói Desktop macOS
              </h3>
              <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[55ch] mb-6">
                Phát triển với triết lý của LayerZero: tự chủ, minh bạch và cộng đồng. Không thu thập dữ liệu cá nhân, tích hợp sẵn script đóng gói ứng dụng macOS `.dmg` độc lập chạy offline qua Tauri v2.
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">MIT License</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Tự do tùy biến</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Tauri v2 Shell</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Siêu nhẹ & Native</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">PegForge Ready</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Bóc tách & Tạo khớp</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#1E1E24] to-[#121214] border border-white/10 p-3 flex items-center justify-center">
                <img
                  src="/images/form3d/cute_robot_mesh_preview.png"
                  alt="Mô hình Cute Robot sinh bởi Form3D"
                  width="600"
                  height="450"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
