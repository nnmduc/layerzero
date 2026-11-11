import React from 'react';
import { ArrowRight, Sparkle, Scissors, Cube, CheckCircle } from '@phosphor-icons/react';

interface EcosystemSectionProps {
  currentProduct?: 'layerzero' | 'pegforge' | 'form3d';
}

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({ currentProduct = 'layerzero' }) => {
  const products = [
    {
      id: 'layerzero' as const,
      name: 'LayerZero Studio',
      eyebrow: 'CORE SLICER OPTIMIZER',
      badge: 'v2.2.0 Ổn định',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      tagline: 'Trợ lý AI tối ưu in 3D & file .3mf',
      description:
        'Chẩn đoán hình học 3D, tự động vát phẳng Z=0 chống bung bàn PEI, gia cố ốc vít và đối chiếu 17 thông số Slicer cho Bambu Lab & Prusa.',
      url: currentProduct === 'layerzero' ? '#tai-ve' : '/',
      ctaText: currentProduct === 'layerzero' ? 'Xem tải ứng dụng' : 'Khám phá LayerZero',
      logoSrc: '/app-icon.png',
      logoAlt: 'Logo LayerZero Studio',
      isCurrent: currentProduct === 'layerzero',
      features: [
        'Vát phẳng đáy bám bàn Z = 0',
        'Đối chiếu 17 thông số Slicer',
        'Tương thích Bambu Lab & Prusa',
        'Xử lý hoàn toàn Local Offline',
      ],
    },
    {
      id: 'pegforge' as const,
      name: 'PegForge',
      eyebrow: 'MESH ANATOMY & JOINTS',
      badge: 'Bản thử nghiệm Beta',
      badgeColor: 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] border-[#0071E3]/20',
      tagline: 'Bóc tách mô hình & Tạo khớp ngàm cơ khí',
      description:
        'Bóc tách tượng 3D nhiều chi tiết bằng SAM 2 & Raycast, tự động giấu đường cắt vào nếp gập thẩm mỹ và đục chốt ngàm tự định vị (Bächer Ball-Joint & Hex Peg).',
      url: '/pegforge',
      ctaText: currentProduct === 'pegforge' ? 'Đang xem PegForge' : 'Khám phá PegForge',
      logoFallback: (
        <div className="w-14 h-14 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center shadow-md shadow-[#0071E3]/25">
          <Scissors size={28} weight="bold" />
        </div>
      ),
      logoAlt: 'Logo PegForge Studio',
      isCurrent: currentProduct === 'pegforge',
      features: [
        'Giấu sẹo cắt vào nếp trang phục',
        'Khớp Bächer Ball-Joint xoay 200°',
        'Tự động lật phẳng áp khay 256mm',
        'Đóng gói .3MF mở in ngay',
      ],
    },
    {
      id: 'form3d' as const,
      name: 'Form3D',
      eyebrow: 'MODULAR TEXT-TO-3D GENERATOR',
      badge: 'v0.2.0 Mới ra mắt',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      tagline: 'Bộ sinh Text-to-3D kín nước đa góc nhìn',
      description:
        'Pipeline 5 bước modular biến mô tả văn bản thành mesh kín nước .stl & .glb. Tối ưu native cực mượt và hoàn toàn offline trên Apple Silicon Metal MPS.',
      url: '/form3d',
      ctaText: currentProduct === 'form3d' ? 'Đang xem Form3D' : 'Khám phá Form3D',
      logoSrc: '/images/form3d/icon.png',
      logoAlt: 'Logo Form3D',
      logoFallback: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
          <Cube size={28} weight="bold" />
        </div>
      ),
      isCurrent: currentProduct === 'form3d',
      features: [
        '5 bước Modular độc lập & kiểm chứng',
        'Chạy local Apple Silicon MPS (M1+)',
        'Đáy phẳng Z=0 sẵn sàng in 3D',
        'Three.js Studio WebGL tương tác',
      ],
    },
  ];

  return (
    <section
      id="he-sinh-thai"
      className="py-20 sm:py-28 bg-[#FBFBFD] dark:bg-[#0E0E10] border-t border-[#1D1D1F]/[0.06] dark:border-white/[0.07] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkle size={14} weight="fill" />
            <span>Hệ sinh thái LayerZero</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.15] mb-4">
            Bộ ba công cụ độc lập cho quy trình in 3D hiện đại
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-zinc-400 leading-relaxed">
            Mỗi sản phẩm giải quyết một giai đoạn chuyên biệt: từ sinh mô hình 3D bằng AI, bóc tách cơ khí giấu sẹo, đến tối ưu thông số Slicer bám bàn in hoàn hảo.
          </p>
        </div>

        {/* 3 Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                prod.isCurrent
                  ? 'bg-white dark:bg-[#1A1A1E] border-2 border-[#0071E3] dark:border-[#2997FF] shadow-xl shadow-[#0071E3]/10'
                  : 'bg-white/80 dark:bg-[#141417] border border-[#1D1D1F]/[0.08] dark:border-white/[0.08] hover:border-[#0071E3]/40 dark:hover:border-[#2997FF]/40 hover:shadow-lg'
              }`}
            >
              {prod.isCurrent && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#0071E3] text-white text-[11px] font-mono font-bold tracking-wider uppercase shadow-sm">
                  Trang hiện tại
                </div>
              )}

              <div>
                {/* Logo & Status Badge */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  {prod.logoSrc ? (
                    <img
                      src={prod.logoSrc}
                      alt={prod.logoAlt}
                      width="56"
                      height="56"
                      loading="lazy"
                      className="w-14 h-14 rounded-2xl object-cover shadow-md border border-black/5 dark:border-white/10"
                    />
                  ) : (
                    prod.logoFallback
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${prod.badgeColor}`}
                  >
                    {prod.badge}
                  </span>
                </div>

                {/* Eyebrow & Title */}
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-zinc-400 mb-1">
                  {prod.eyebrow}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
                  {prod.name}
                </h3>
                <p className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] mb-3">
                  {prod.tagline}
                </p>
                <p className="text-[13.5px] text-[#6E6E73] dark:text-zinc-300 leading-relaxed mb-6">
                  {prod.description}
                </p>

                {/* Feature checklist */}
                <ul className="space-y-2 mb-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                  {prod.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs font-mono text-[#515154] dark:text-zinc-300"
                    >
                      <CheckCircle
                        size={15}
                        weight="fill"
                        className="text-[#0071E3] dark:text-[#2997FF] shrink-0"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <a
                  href={prod.url}
                  className={`w-full py-3 px-5 rounded-2xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    prod.isCurrent
                      ? 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/20'
                  }`}
                >
                  <span>{prod.ctaText}</span>
                  <ArrowRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
