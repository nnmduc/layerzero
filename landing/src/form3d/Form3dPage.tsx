import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Form3dHero } from './Form3dHero';
import { Form3dDemoVideo } from './Form3dDemoVideo';
import { Form3dPipeline } from './Form3dPipeline';
import { Form3dStudioShowcase } from './Form3dStudioShowcase';
import { Form3dBento } from './Form3dBento';
import { EcosystemSection } from '../components/EcosystemSection';
import { Form3dRegistration } from './Form3dRegistration';
import { Form3dFooter } from './Form3dFooter';

interface Form3dPageProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Form3dPage: React.FC<Form3dPageProps> = ({ darkMode, onToggleTheme }) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Form3D - Bộ sinh Text-to-3D Modular (.stl & .glb) cho Apple Silicon | LayerZero Studio';

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.href;
    if (canonical) {
      canonical.href = 'https://layerzero.io.vn/form3d';
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
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold">
          SẢN PHẨM MỚI
        </span>
        <span>
          Form3D là công cụ Text-to-3D 5 bước modular độc lập trong hệ sinh thái LayerZero, tối ưu native cho Apple Silicon.
        </span>
      </aside>

      {/* LayerZero Identical Navbar */}
      <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} isForm3d={true} />

      <main className="flex-1">
        <Form3dHero />
        <Form3dDemoVideo />
        <Form3dPipeline />
        <Form3dStudioShowcase />
        <Form3dBento />
        <EcosystemSection currentProduct="form3d" />
        <Form3dRegistration />
      </main>

      <Form3dFooter />
    </div>
  );
};
