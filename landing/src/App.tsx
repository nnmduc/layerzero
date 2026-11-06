import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { FeaturesBento } from './components/FeaturesBento';
import { FilamentSupportSection } from './components/FilamentSupportSection';
import { ProblemsWorkbench } from './components/ProblemsWorkbench';
import { LearningDiffSection } from './components/LearningDiffSection';
import { DownloadSection } from './components/DownloadSection';
import { ContactSection } from './components/ContactSection';
import { PegforgePage } from './pegforge/PegforgePage';

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

  if (isPegforge) {
    return <PegforgePage darkMode={darkMode} onToggleTheme={handleToggleTheme} />;
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
