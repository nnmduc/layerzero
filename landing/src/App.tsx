import React, { useEffect, useState, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { FeaturesBento } from './components/FeaturesBento';
import { FilamentSupportSection } from './components/FilamentSupportSection';
import { ProblemsWorkbench } from './components/ProblemsWorkbench';
import { LearningDiffSection } from './components/LearningDiffSection';
import { DownloadSection } from './components/DownloadSection';
import { ContactSection } from './components/ContactSection';
import { ChangelogPage } from './components/ChangelogPage';

// Code-splitting PegforgePage to optimize initial bundle size
const PegforgePage = React.lazy(() =>
  import('./pegforge/PegforgePage').then((m) => ({ default: m.PegforgePage }))
);

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const saved = localStorage.getItem('layerzero-landing-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('layerzero-landing-theme', next ? 'dark' : 'light');
  };

  const isPegforge =
    currentPath.startsWith('/pegforge') ||
    (typeof window !== 'undefined' &&
      (window.location.hash.startsWith('#/pegforge') ||
        window.location.search.includes('page=pegforge')));

  if (currentPath.replace(/\/+$/, '') === '/changelog') {
    return <ChangelogPage darkMode={darkMode} onToggleTheme={handleToggleTheme} />;
  }

  if (isPegforge) {
    return (
      <Suspense
        fallback={
          <div className="min-h-[100dvh] flex items-center justify-center bg-apple-bg dark:bg-[#0D0D0F] text-[#6E6E73] dark:text-zinc-400 font-mono text-sm">
            Đang tải PegForge Studio...
          </div>
        }
      >
        <PegforgePage darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      <main className="flex-1">
        <HeroSection />
        <StorySection />
        <FeaturesBento />
        <FilamentSupportSection />
        <ProblemsWorkbench />
        <LearningDiffSection />
        <DownloadSection />
        <ContactSection />
      </main>
    </div>
  );
};
