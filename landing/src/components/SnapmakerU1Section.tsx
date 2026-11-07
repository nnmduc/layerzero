import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowsLeftRight, Cpu, Printer, Warning } from '@phosphor-icons/react';

/**
 * Snapmaker U1 support showcase (v2.3, beta): why MakerWorld files need converting for the U1,
 * and what LayerZero changes. The beta build is shared privately with testers, so this section
 * deliberately has no download link. Facts match the bundled Snapmaker Orca 2.4.1 U1 profiles.
 */

interface FeatureCard {
  title: string;
  icon: React.ReactNode;
  accent: string;
  points: string[];
}

const SPECS = ['CoreXY', '4 đầu in độc lập (SnapSwap)', '270 × 270 × 270 mm', 'Đầu phun 0.2 · 0.4 · 0.6 · 0.8 mm'];

const CARDS: FeatureCard[] = [
  {
    title: 'Chuyển đổi đúng chuẩn U1',
    icon: <ArrowsLeftRight size={20} weight="bold" />,
    accent: '#0071E3',
    points: [
      'Dựng lại project từ profile hệ thống U1 của Snapmaker Orca: mở file không còn hộp thoại "Customized Preset".',
      'Giữ màu, layer, tường, infill, support, brim và seam của tác giả; filament 1–4 chạy đúng đầu in T1–T4.',
      'Bỏ cấu hình AMS và flush của Bambu; giữ prime tower cho bản in nhiều màu và đặt nó gọn trong bàn 270 mm.',
    ],
  },
  {
    title: 'Luật in dành cho máy CoreXY',
    icon: <Cpu size={20} weight="bold" />,
    accent: '#30B0C7',
    points: [
      'Không áp lời khuyên của máy bàn trượt (hạ gia tốc trục Y, xoay mẫu cao): bàn U1 không di chuyển ngang.',
      'Độ dày lớp mịn tính theo đầu phun: 0.08 mm cho đầu 0.2, 0.16 mm cho đầu 0.4, 0.32 mm cho đầu 0.8.',
      'Support chỉ bọc chi tiết đế yếu có đủ khoảng trống, tránh lỗi xung đột đường in giữa các chi tiết đặt sát nhau.',
    ],
  },
  {
    title: 'Cảnh báo riêng cho máy đổi đầu',
    icon: <Warning size={20} weight="bold" />,
    accent: '#FF9F0A',
    points: [
      'File nhiều hơn 4 màu: báo các filament chưa có đầu in để gộp lại trước khi in.',
      'In nhiều màu: nhắc hiệu chỉnh offset XYZ giữa các đầu in sau khi thay hotend.',
      'ABS / ASA: nhắc lắp Top Cover. Mẫu cao hơn 270 mm: nhắc thu nhỏ hoặc cắt đôi.',
    ],
  },
];

export const SnapmakerU1Section: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="snapmaker-u1" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF] font-semibold mb-3">
            Sắp có trong V2.3 · Đang thử nghiệm
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
            File MakerWorld, in thẳng trên Snapmaker U1.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[60ch]">
            MakerWorld chỉ có profile cho máy Bambu. Mở thẳng file đó trong Snapmaker Orca sẽ nạp cấu hình máy và G-code
            của Bambu. LayerZero chuyển project sang U1, tối ưu như mọi máy khác, rồi mở thẳng trong Snapmaker Orca.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6E6E73] dark:text-zinc-400 mr-1">
            <Printer size={16} />
            Snapmaker U1:
          </span>
          {SPECS.map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-[#1D1D1F]/10 dark:border-white/10 text-[12.5px] font-semibold text-[#1D1D1F] dark:text-zinc-100"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((c, idx) => (
            <motion.div
              key={c.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl bg-white dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.accent}1A`, color: c.accent }}
                >
                  {c.icon}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-white">{c.title}</h3>
              </div>
              <ul className="space-y-2.5 text-[13.5px] leading-relaxed text-[#1D1D1F] dark:text-zinc-200">
                {c.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-[8px] w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.accent }}></span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-[#6E6E73] dark:text-zinc-500 leading-relaxed">
          Bản beta đang được nhóm thử nghiệm dùng trước khi phát hành công khai. Profile U1 lấy từ Snapmaker Orca 2.4.1
          (mã nguồn mở, AGPL-3.0). Snapmaker và U1 là thương hiệu của Snapmaker; LayerZero không liên kết với Snapmaker.
        </p>
      </div>
    </section>
  );
};
