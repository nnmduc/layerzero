import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { PegforgeHero } from './PegforgeHero';
import { PegforgeDemoVideo } from './PegforgeDemoVideo';
import { PegforgePipeline } from './PegforgePipeline';
import { PegforgeSeamDiff } from './PegforgeSeamDiff';
import { PegforgeJointWorkbench } from './PegforgeJointWorkbench';
import { PegforgeBento } from './PegforgeBento';
import { EcosystemSection } from '../components/EcosystemSection';
import { PegforgeRegistration } from './PegforgeRegistration';
import { PegforgeFooter } from './PegforgeFooter';

interface PegforgePageProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const PegforgePage: React.FC<PegforgePageProps> = ({ darkMode, onToggleTheme }) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'PegForge - Bóc tách mô hình & Tạo khớp in 3D cho Bambu Lab | LayerZero Studio';

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.href;
    if (canonical) {
      canonical.href = 'https://layerzero.io.vn/pegforge';
    }

    return () => {
      document.title = prevTitle;
      if (canonical && prevCanonical) {
        canonical.href = prevCanonical;
      }
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-apple-bg dark:bg-[#0D0D0F] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300">
      {/* Top Banner */}
      <aside className="w-full bg-[#1D1D1F] text-white py-2 px-4 text-xs font-medium text-center border-b border-white/10 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#2997FF] font-mono text-[11px] font-semibold">
          DỰ ÁN MỚI
        </span>
        <span>
          PegForge là công cụ mã nguồn mở đồng hành cùng LayerZero Studio, chuyên biệt bóc tách mô hình và tạo khớp in 3D.
        </span>
      </aside>

      {/* LayerZero Identical Navbar */}
      <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} isPegforge={true} />

      <main className="flex-1">
        <PegforgeHero />
        <PegforgeDemoVideo />
        <PegforgePipeline />
        <PegforgeSeamDiff />
        <PegforgeJointWorkbench />
        <PegforgeBento />
        <EcosystemSection currentProduct="pegforge" />
        <PegforgeRegistration />
      </main>

      <PegforgeFooter />
    </div>
  );
};
