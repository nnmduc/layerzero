import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { FeaturesBento } from './components/FeaturesBento';
import { ProblemsWorkbench } from './components/ProblemsWorkbench';
import { LearningDiffSection } from './components/LearningDiffSection';
import { DownloadSection } from './components/DownloadSection';
import { ContactSection } from './components/ContactSection';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

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

  const handleToggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('layerzero-landing-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      <main className="flex-1">
        <HeroSection />
        <StorySection />
        <FeaturesBento />
        <ProblemsWorkbench />
        <LearningDiffSection />
        <DownloadSection />
        <ContactSection />
      </main>
    </div>
  );
};
