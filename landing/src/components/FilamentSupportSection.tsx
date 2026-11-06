import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Drop, Printer, Stack, Thermometer, Wind } from '@phosphor-icons/react';

/**
 * Filament & printer support showcase (v2.2): which Bambu materials and printers LayerZero
 * understands, the vendor values it starts from, and the material rules it adds on top.
 * Numbers are Bambu Studio's own A1 profile values; no unverified strength figures are shown.
 */

interface MaterialCard {
  name: string;
  tag: string;
  accent: string;
  specs: { icon: React.ReactNode; label: string; value: string }[];
  rules: string[];
}

const MATERIALS: MaterialCard[] = [
  {
    name: 'PLA Lite',
    tag: 'Giá rẻ · Mẫu trưng bày',
    accent: '#FF9F0A',
    specs: [
      { icon: <Thermometer size={15} />, label: 'Đầu phun', value: '220 °C' },
      { icon: <Stack size={15} />, label: 'Textured PEI', value: '65 °C (A1) · 55 °C (P1S/X1C)' },
      { icon: <Wind size={15} />, label: 'Quạt làm mát', value: '60–80 %' },
      { icon: <Drop size={15} />, label: 'Lưu lượng tối đa', value: '16 mm³/s' },
    ],
    rules: [
      'Bám lớp yếu hơn PLA Basic: ốc vít, khớp nối được tăng tường và +5 °C đầu phun.',
      'Máy kín P1S/X1C: nhắc mở cửa để tránh kẹt nhựa do buồng in nóng.',
    ],
  },
  {
    name: 'PLA Basic',
    tag: 'Đa dụng · Bền hơn',
    accent: '#0071E3',
    specs: [
      { icon: <Thermometer size={15} />, label: 'Đầu phun', value: '220 °C' },
      { icon: <Stack size={15} />, label: 'Textured PEI', value: '65 °C (A1) · 55 °C (P1S/X1C)' },
      { icon: <Wind size={15} />, label: 'Quạt làm mát', value: '60–80 % (A1) · 100 % (X1C)' },
      { icon: <Drop size={15} />, label: 'Lưu lượng tối đa', value: '21 mm³/s' },
    ],
    rules: [
      'Khe hở Support 0.14 mm ôm sát, Brim gap 0 cho đế khớp cầu nhỏ.',
      'Ironing 12 % / 30 mm/s cho mặt đỉnh phẳng.',
    ],
  },
  {
    name: 'PETG HF',
    tag: 'Chịu nhiệt · Dẻo dai',
    accent: '#30B0C7',
    specs: [
      { icon: <Thermometer size={15} />, label: 'Đầu phun', value: '230 °C lớp 1 · 240 °C' },
      { icon: <Stack size={15} />, label: 'Textured PEI', value: '70 °C · không dùng Cool Plate' },
      { icon: <Wind size={15} />, label: 'Quạt làm mát', value: '30–50 %, tắt 3 lớp đầu' },
      { icon: <Drop size={15} />, label: 'Lưu lượng tối đa', value: '18 mm³/s' },
    ],
    rules: [
      'Khe hở Support ≥ 0.2 mm và Brim gap ≥ 0.1 mm để không hàn dính vào mẫu.',
      'Z-Hop Spiral Lift thay vì nhấc cao, giảm kéo tơ. Nhắc sấy 65 °C · 8 giờ.',
      'Smooth PEI: nhắc bôi keo làm lớp tách để không rách mặt bàn.',
    ],
  },
];

const PRINTERS = ['Bambu Lab A1', 'A1 mini', 'P1S', 'X1C'];

export const FilamentSupportSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="vat-lieu" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#0071E3] dark:text-[#2997FF] font-semibold mb-3">
            MỚI TRONG V2.2
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12] mb-3">
            Hiểu đúng vật liệu, đúng máy in, đúng mặt bàn.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-zinc-300 leading-relaxed max-w-[60ch]">
            LayerZero lấy thông số gốc từ chính profile Bambu Studio cho từng cặp máy in và nhựa, đọc loại mặt bàn
            trong file, rồi áp thêm quy tắc riêng cho từng vật liệu. Slot AMS Support của tác giả luôn được giữ nguyên.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6E6E73] dark:text-zinc-400 mr-1">
            <Printer size={16} />
            Máy in hỗ trợ:
          </span>
          {PRINTERS.map((p) => (
            <span
              key={p}
              className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-[#1D1D1F]/10 dark:border-white/10 text-[12.5px] font-semibold text-[#1D1D1F] dark:text-zinc-100"
            >
              {p}
            </span>
          ))}
          <span className="text-[12px] text-[#6E6E73] dark:text-zinc-500">· đầu phun 0.4 mm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MATERIALS.map((m, idx) => (
            <motion.div
              key={m.name}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl bg-white dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: m.accent }}></span>
                  <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Bambu {m.name}</h3>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#1D1D1F]/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-zinc-300 whitespace-nowrap">
                  {m.tag}
                </span>
              </div>

              <dl className="space-y-2">
                {m.specs.map((s) => (
                  <div key={s.label} className="flex items-start justify-between gap-3 text-[13px]">
                    <dt className="inline-flex items-center gap-1.5 text-[#6E6E73] dark:text-zinc-400 shrink-0">
                      {s.icon}
                      {s.label}
                    </dt>
                    <dd className="font-mono text-right text-[12.5px] text-[#1D1D1F] dark:text-zinc-100">{s.value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="pt-4 border-t border-[#1D1D1F]/[0.07] dark:border-white/[0.08] space-y-2 text-[13px] leading-relaxed text-[#1D1D1F] dark:text-zinc-200">
                {m.rules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.accent }}></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-[#6E6E73] dark:text-zinc-500">
          Thông số lấy từ profile hệ thống Bambu Studio cho Bambu Lab A1 trừ khi ghi chú khác. LayerZero tự chọn đúng
          preset cho từng máy (ví dụ <span className="font-mono">Bambu PLA Basic @BBL P1S 0.4 nozzle</span>).
        </p>
      </div>
    </section>
  );
};
