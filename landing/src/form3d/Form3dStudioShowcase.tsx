import React, { useState } from 'react';
import { Eye, ArrowsClockwise, Lightning, ShieldCheck, Sparkle } from '@phosphor-icons/react';

type StudioMode = 'clay' | 'wireframe' | 'dark' | 'studio';

export const Form3dStudioShowcase: React.FC = () => {
  const [activeMode, setActiveMode] = useState<StudioMode>('clay');

  const modes = {
    clay: {
      image: '/images/form3d/10_step5_3d_clay_shading.png',
      title: 'Chế độ Đất sét (Clay Shading Mode)',
      badge: 'Kiểm tra Khối & Bề mặt',
      desc: 'Giúp điêu khắc gia và người in 3D đánh giá chuẩn xác từng nếp nhăn, vảy rồng, độ cong gân và kiểm tra xem có góc hẫng (overhang) nguy hiểm nào cần bọc support hay không.',
      features: ['Không bị đánh lừa bởi màu sắc', 'Nhìn rõ nếp cong và gờ nổi', 'Đánh giá góc hẫng overhang', 'Phát hiện sớm lỗi bề mặt'],
    },
    wireframe: {
      image: '/images/form3d/11_step5_3d_wire_topology.png',
      title: 'Chế độ Khung dây (Wireframe Topology)',
      badge: 'Kiểm tra Lưới & Watertight',
      desc: 'Hiển thị mật độ đa giác tam giác đồng đều của mô hình. Tự động xác thực không có tam giác bị lật mặt (flipped normals), không có đỉnh trùng lặp và không có mảnh vỡ bay tự do.',
      features: ['Lưới tam giác đồng nhất', 'Không có flipped normals', '100% Watertight kín nước', 'Sạch mảnh vụn lơ lửng'],
    },
    dark: {
      image: '/images/form3d/13_step5_3d_dark_mode_orbit.png',
      title: 'Giao diện Tối & Điều hướng 3D Xoay Quanh',
      badge: 'Three.js Orbit Controls',
      desc: 'Môi trường làm việc tối màu bảo vệ mắt, hỗ trợ xoay orbit 360° mượt mà 60fps trên trackpad hoặc chuột, chuyển nhanh giữa các góc nhìn trực giao Top/Front/Side chỉ với một phím tắt.',
      features: ['Xoay 360° mượt 60fps', 'Chụp góc chiếu Ortho tức thì', 'Đồng bộ chiều sáng tự nhiên', 'Theme tối Apple đẳng cấp'],
    },
    studio: {
      image: '/images/form3d/00_initial_studio.png',
      title: 'Studio Tinh gọn & Stream SSE Thời gian thực',
      badge: 'FastAPI + Server-Sent Events',
      desc: 'Giao diện kết nối trực tiếp với backend Python cục bộ. Mọi tiến trình từ mở rộng prompt, tải trọng số đến dựng mesh đều được truyền dòng thời gian thực qua SSE.',
      features: ['Theo dõi tiến trình SSE theo giây', 'Chạy hoàn toàn local offline', 'Tải sẵn file mẫu để thử ngay', 'Xuất .STL & .GLB tải về máy'],
    },
  };

  const current = modes[activeMode];

  return (
    <section id="studio" className="py-20 sm:py-28 bg-[#FBFBFD] dark:bg-[#0E0E10] border-t border-b border-[#1D1D1F]/[0.06] dark:border-white/[0.07] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Eye size={14} weight="bold" />
            <span>Studio Three.js WebGL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
            Soi kỹ từng nếp đa giác trước khi bấm in
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
            Form3D Studio tích hợp bộ renderer Three.js chạy mượt mà ngay trên trình duyệt và ứng dụng Desktop Tauri macOS.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveMode('clay')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-semibold transition-all ${
              activeMode === 'clay'
                ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/20'
                : 'bg-white dark:bg-[#18181B] text-[#515154] dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40'
            }`}
          >
            Clay Shading (Đất sét)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('wireframe')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-semibold transition-all ${
              activeMode === 'wireframe'
                ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/20'
                : 'bg-white dark:bg-[#18181B] text-[#515154] dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40'
            }`}
          >
            Wireframe Topology (Khung dây)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('dark')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-semibold transition-all ${
              activeMode === 'dark'
                ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/20'
                : 'bg-white dark:bg-[#18181B] text-[#515154] dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40'
            }`}
          >
            Dark Mode & 360° Orbit
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('studio')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-semibold transition-all ${
              activeMode === 'studio'
                ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/20'
                : 'bg-white dark:bg-[#18181B] text-[#515154] dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40'
            }`}
          >
            Studio & SSE Streaming
          </button>
        </div>

        {/* Display Canvas Frame */}
        <div className="rounded-3xl bg-[#161618] border border-white/10 shadow-2xl overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left: Big Preview Image */}
            <div className="lg:col-span-8">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-black/60 border border-white/10 flex items-center justify-center group">
                <img
                  src={current.image}
                  alt={current.title}
                  width="1280"
                  height="800"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[11px] border border-white/10">
                  {current.badge}
                </div>
              </div>
            </div>

            {/* Right: Mode Description & Feature Checklist */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-5 text-white">
              <div>
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                  Chế độ hiển thị
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
                  {current.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {current.desc}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10">
                {current.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2997FF] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-400">
                💡 <span className="text-zinc-200">Tip:</span> Dùng phím số 1, 2, 3 để đổi chế độ đổ bóng trong Studio.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
