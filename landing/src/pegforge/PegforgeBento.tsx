import React from 'react';
import { GitBranch, Cpu, Printer } from '@phosphor-icons/react';

export const PegforgeBento: React.FC = () => {
  return (
    <section id="highlights" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
          Kiến trúc mở trên máy tính của bạn
        </h2>
        <p className="text-base text-[#6E6E73] dark:text-[#98989D]">
          Không đăng ký thuê bao, không lưu trữ đám mây ép buộc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Cell 1: 100% Free & Open Source MIT */}
        <div className="md:col-span-7 apple-card-elevated rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-6">
              <GitBranch size={26} weight="bold" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
              Luôn miễn phí và Mã nguồn mở MIT
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[45ch] mb-6">
              Toàn bộ thuật toán cắt, Command Core và Studio Three.js sẽ được mở công khai trên GitHub khi bản beta hoàn tất.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)] flex items-center justify-between text-xs font-mono">
            <span>Giấy phép: MIT License</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tự do chỉnh sửa và Phân phối</span>
          </div>
        </div>

        {/* Cell 2: Local AI 0đ & Bring Your Own AI */}
        <div className="md:col-span-5 apple-card-elevated rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center text-2xl mb-6">
              <Cpu size={26} weight="bold" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
              Local AI 0đ và Kết nối AI có sẵn
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-[#98989D] leading-relaxed mb-6">
              SAM 2 chạy siêu nhẹ trên Apple Silicon. Tận dụng trực tiếp Antigravity hoặc Claude có sẵn trên máy, không tốn phí token.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#6E6E73] dark:text-[#98989D]">
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">Apple Silicon MPS</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">agy CLI</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">claude CLI</span>
          </div>
        </div>

        {/* Cell 3: Flatlay Export */}
        <div className="md:col-span-12 apple-card-elevated rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mb-6">
                <Printer size={26} weight="bold" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
                Tự động lật phẳng và Đóng gói khay in .3MF
              </h3>
              <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[55ch] mb-6">
                Mỗi chi tiết tự tìm mặt phẳng tiếp xúc lớn nhất để áp sát mặt bàn PEI, loại bỏ nguy cơ bung bàn khi in. Xuất trực tiếp file .3MF đa vật thể tương thích 100% với Bambu Studio và PrusaSlicer.
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Lay-flat Auto</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Áp đáy Z = 0</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">256x256 Bed</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Xếp gọn 1 khay</div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-apple-border dark:border-[rgba(255,255,255,0.09)]">
                  <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Bambu & Prusa</div>
                  <div className="text-[#6E6E73] dark:text-[#98989D] text-[11px] mt-0.5">Mở in ngay</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <img
                src="/images/pegforge/parts-flatlay.webp"
                alt="Các chi tiết tượng anime sau khi cắt và tạo chốt được xếp gọn trên khay in"
                width="1024"
                height="680"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover rounded-2xl border border-apple-border dark:border-[rgba(255,255,255,0.09)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
