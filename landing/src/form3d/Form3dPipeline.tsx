import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Terminal, CaretRight, Sparkle, Camera, Cube, Cpu, ShieldCheck } from '@phosphor-icons/react';

interface StepDetail {
  number: string;
  shortTitle: string;
  fullTitle: string;
  badge: string;
  cmd: string;
  desc: string;
  image: string;
  imageAlt: string;
  highlights: { label: string; val: string }[];
}

const STEPS: StepDetail[] = [
  {
    number: '01',
    shortTitle: 'Tối ưu Prompt',
    fullTitle: 'Tối ưu hóa Prompt & Đặc tả nhân vật JSON',
    badge: 'agy CLI + JSON Schema',
    cmd: 'form3d step1 --prompt "A cute baby dragon" --schema character_spec.json',
    desc: 'Antigravity CLI phân tích ý tưởng văn bản, ép kiểu cấu trúc JSON Schema nghiêm ngặt: định nghĩa màu sắc, trang phục, tỷ lệ cơ thể và từ khóa orthographic cho 4 góc nhìn đồng bộ.',
    image: '/images/form3d/02_step1_spec_ready.png',
    imageAlt: 'Đặc tả JSON nhân vật 3D chi tiết sinh bởi agy CLI',
    highlights: [
      { label: 'Cấu trúc Schema:', val: 'JSON Schema nghiêm ngặt' },
      { label: 'Góc nhìn chuẩn:', val: 'Orthographic White BG' },
      { label: 'Bộ mở rộng:', val: 'Antigravity CLI (agy)' },
      { label: 'Trạng thái:', val: '100% Xác thực trường' },
    ],
  },
  {
    number: '02',
    shortTitle: 'Turnaround Sheet',
    fullTitle: 'Sinh Sheet 4 góc nhìn chuẩn Turnaround (1024x1024)',
    badge: '2x2 Orthographic Sheet',
    cmd: 'form3d step2 --turnaround --resolution 1024x1024 --grid 2x2',
    desc: 'Sinh ra 1 bảng ảnh duy nhất kích thước 1024x1024 chứa đủ 4 góc chụp nhân vật đồng nhất về ánh sáng và kích thước: Trước (0°), Trái (90°), Sau (180°) và Phải (270°).',
    image: '/images/form3d/03_step2_turnaround_sheet.png',
    imageAlt: 'Turnaround sheet 4 góc nhìn nhân vật chú rồng',
    highlights: [
      { label: 'Độ phân giải:', val: '1024 x 1024 px PNG' },
      { label: 'Phân bố lưới:', val: '4 ô góc phần tư đồng trục' },
      { label: 'Độ nhất quán:', val: 'Giữ nguyên trang phục & dáng' },
      { label: 'Góc chụp:', val: '0°, 90°, 180°, 270°' },
    ],
  },
  {
    number: '03',
    shortTitle: 'Bóc tách Alpha',
    fullTitle: 'Chia 4 góc phần tư & Xóa nền trong suốt (rembg + CV2)',
    badge: 'rembg + OpenCV RGBA',
    cmd: 'form3d step3 --slice-quadrants --remove-bg --auto-center',
    desc: 'Cắt chính xác 4 góc phần tư TL, TR, BL, BR, chạy thuật toán bóc tách phông nền trong suốt RGBA không bị lem viền và tự động căn chỉnh trọng tâm hình học về giữa khung hình.',
    image: '/images/form3d/04_step3_sliced_rgba_views.png',
    imageAlt: '4 góc nhìn sau khi chia lát và tách nền trong suốt',
    highlights: [
      { label: 'Kênh màu:', val: 'RGBA 32-bit trong suốt' },
      { label: 'Thuật toán tách:', val: 'rembg AI Masking' },
      { label: 'Căn trọng tâm:', val: 'Center of Mass Alignment' },
      { label: 'Độ sạch viền:', val: 'Khử viền trắng 100%' },
    ],
  },
  {
    number: '04',
    shortTitle: 'Cân chỉnh 3D',
    fullTitle: 'Khớp Camera 3D & Kiểm tra Scanline đa góc',
    badge: 'Multi-View Camera Rig',
    cmd: 'form3d step4 --verify-camera --align-normals --scanline-check',
    desc: 'Gán ma trận camera 3D tương ứng cho từng góc nhìn, quét scanline ngang để xác thực chiều cao của đỉnh đầu, mắt, cánh và chân khớp chuẩn xác trước khi đưa vào mô hình tái tạo mesh.',
    image: '/images/form3d/05_step4_mesh_reconstructing_scanline.png',
    imageAlt: 'Quét scanline kiểm tra độ đồng trục của 4 góc nhìn',
    highlights: [
      { label: 'Góc Azimuth:', val: '0° | 90° | 180° | 270°' },
      { label: 'Độ cao mắt & cánh:', val: 'Sai lệch < 1.2%' },
      { label: 'Kiểm tra Scanline:', val: 'Tự động hiệu chỉnh độ lệch' },
      { label: 'Ma trận chiếu:', val: 'Orthographic Projection' },
    ],
  },
  {
    number: '05',
    shortTitle: 'Dựng Mesh & In 3D',
    fullTitle: 'Tái tạo Mesh 3D kín nước & Tối ưu in 3D (Hunyuan3D-2)',
    badge: 'Watertight .STL & .GLB',
    cmd: 'form3d step5 --engine mps --taubin-smoothing --base-flatten --output-stl',
    desc: 'Thuật toán Hunyuan3D-2 dựng mô hình 3D hoàn chỉnh, tự động loại bỏ mảnh vỡ trôi nổi, làm mịn Taubin bảo toàn khối tích, vát phẳng đáy Z = 0 để bám chặt bàn in PEI.',
    image: '/images/form3d/06_step5_3d_studio_initial.png',
    imageAlt: 'Mô hình 3D trong Studio Three.js sau khi tái tạo hoàn chỉnh',
    highlights: [
      { label: 'Định dạng xuất:', val: '.STL (in 3D) + .GLB (màu)' },
      { label: 'Làm mịn bề mặt:', val: 'Taubin Smoothing' },
      { label: 'Tiếp xúc bàn in:', val: 'Vát phẳng Z = 0 bám PEI' },
      { label: 'Độ kín nước:', val: '100% Watertight Mesh' },
    ],
  },
];

export const Form3dPipeline: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = STEPS[selectedIdx];

  return (
    <section id="pipeline" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <span>Kiến trúc 5 bước độc lập</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
          Quy trình giải phẫu Text-to-3D từng khâu
        </h2>
        <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
          Không phải "hộp đen" bí ẩn: mỗi bước trong Form3D đều lưu lại file trung gian, có thể can thiệp, chạy lại từ bước bất kỳ hoặc thay đổi thông số trực tiếp.
        </p>
      </div>

      {/* Step Buttons Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {STEPS.map((step, idx) => (
          <button
            key={step.number}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-mono transition-all shrink-0 border ${
              selectedIdx === idx
                ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-md shadow-[#0071E3]/20 font-bold'
                : 'bg-white dark:bg-[#18181B] text-[#515154] dark:text-zinc-400 border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                selectedIdx === idx
                  ? 'bg-white/20 text-white'
                  : 'bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-zinc-300'
              }`}
            >
              {step.number}
            </span>
            <span className="whitespace-nowrap">{step.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Main Showcase Card */}
      <div className="rounded-3xl bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Explanations & Terminal Command */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold mb-3">
                <span>{current.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
                {current.fullTitle}
              </h3>
              <p className="text-sm sm:text-base text-[#6E6E73] dark:text-zinc-300 leading-relaxed">
                {current.desc}
              </p>
            </div>

            {/* Terminal Command Snippet */}
            <div className="rounded-2xl bg-[#0F0F12] border border-white/10 p-3.5 sm:p-4 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] pb-2 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Terminal size={14} />
                  <span>terminal / CLI</span>
                </div>
                <span>Step {current.number}/05</span>
              </div>
              <div className="text-emerald-400 select-all overflow-x-auto whitespace-pre">
                <span className="text-zinc-500">$ </span>
                {current.cmd}
              </div>
            </div>

            {/* Highlighting metrics grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {current.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono"
                >
                  <span className="text-[#6E6E73] dark:text-zinc-400 block text-[10.5px]">
                    {h.label}
                  </span>
                  <span className="font-bold text-[#1D1D1F] dark:text-zinc-100 mt-0.5 block truncate">
                    {h.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: High-Res Screenshot Canvas */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-[#1C1C1F] to-[#0E0E10] border border-black/10 dark:border-white/10 shadow-lg flex items-center justify-center p-2">
              <img
                src={current.image}
                alt={current.imageAlt}
                width="1024"
                height="768"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[11px] border border-white/10">
                Ảnh chụp thực tế pipeline
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
