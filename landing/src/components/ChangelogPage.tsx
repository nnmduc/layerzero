import React, { useEffect } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { Navbar } from './Navbar';
import { CHANGELOG, ChangelogVersion } from '../data/changelog';

/**
 * /changelog — user-facing release history in Vietnamese, newest first,
 * with download links for every version that shipped installers.
 */

interface ChangelogPageProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const VersionCard: React.FC<{ entry: ChangelogVersion }> = ({ entry }) => (
  <article
    id={`v${entry.version}`}
    className="scroll-mt-24 flex flex-wrap gap-x-8 gap-y-2 p-6 sm:p-7 rounded-[20px] bg-white dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.08] dark:border-white/[0.08]"
  >
    <div className="flex-[1_1_160px] sm:max-w-[200px] flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
          <a href={`#v${entry.version}`} className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors">
            v{entry.version}
          </a>
        </h2>
        {entry.badge === 'latest' && (
          <span className="text-[11px] font-semibold text-white bg-[#0071E3] px-2 py-0.5 rounded-full">Mới nhất</span>
        )}
        {entry.badge === 'launch' && (
          <span className="text-[11px] font-semibold text-[#515154] dark:text-zinc-300 bg-[#F5F5F7] dark:bg-white/[0.08] border border-[#1D1D1F]/10 dark:border-white/10 px-2 py-0.5 rounded-full">
            Ra mắt
          </span>
        )}
      </div>
      <time className="text-sm text-[#6E6E73] dark:text-zinc-400">{entry.date}</time>
    </div>

    <div className="flex-[999_1_480px] min-w-0 flex flex-col gap-[18px]">
      <p className="text-[17px] leading-normal font-semibold text-[#1D1D1F] dark:text-zinc-100">{entry.summary}</p>

      {entry.sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold text-[#6E6E73] dark:text-zinc-400">{section.title}</h3>
          <ul className="list-disc pl-[18px] flex flex-col gap-1.5 text-[15px] leading-relaxed text-[#1D1D1F] dark:text-zinc-200 marker:text-[#6E6E73]">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {entry.downloads.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1D1D1F]/[0.08] dark:border-white/[0.08]">
          {entry.downloads.map((d) => (
            <a
              key={d.url}
              href={d.url}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#1D1D1F] dark:text-zinc-100 bg-[#F5F5F7] dark:bg-white/[0.06] border border-[#1D1D1F]/10 dark:border-white/10 hover:border-[#0071E3]/50 dark:hover:border-[#2997FF]/50 px-3 py-2 rounded-[10px] transition-colors"
            >
              <DownloadSimple size={14} weight="bold" className="text-[#0071E3] dark:text-[#2997FF]" aria-hidden="true" />
              <span>{d.label}</span>
              <span className="text-[#6E6E73] dark:text-zinc-400">{d.ext}</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="pt-4 border-t border-[#1D1D1F]/[0.08] dark:border-white/[0.08] text-[13px] leading-normal text-[#6E6E73] dark:text-zinc-400">
          Bản cập nhật này không có bộ cài riêng. Các thay đổi đã có trong{' '}
          <a href={`#v${entry.noDownloadNote}`} className="text-[#0066CC] dark:text-[#2997FF] hover:underline">
            v{entry.noDownloadNote}
          </a>
          .
        </p>
      )}
    </div>
  </article>
);

export const ChangelogPage: React.FC<ChangelogPageProps> = ({ darkMode, onToggleTheme }) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Nhật ký thay đổi · LayerZero Studio';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} isSubpage={true} />
      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-5 pt-16 pb-24">
        <p className="text-[12px] font-mono font-semibold tracking-[0.16em] text-[#0066CC] dark:text-[#2997FF] mb-3">
          CHANGELOG
        </p>
        <h1 className="text-[34px] sm:text-[40px] leading-[1.12] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
          Nhật ký thay đổi
        </h1>
        <p className="max-w-[56ch] text-[17px] leading-relaxed text-[#515154] dark:text-zinc-300 mb-12">
          Mọi cập nhật của LayerZero Studio, mới nhất ở trên cùng. Mỗi phiên bản đều có link tải cho macOS, Windows và
          Linux.
        </p>

        <div className="flex flex-col gap-5">
          {CHANGELOG.map((entry) => (
            <VersionCard key={entry.version} entry={entry} />
          ))}
        </div>

        <p className="mt-10 text-[13px] text-[#6E6E73] dark:text-zinc-400">
          Bản đầy đủ cho lập trình viên:{' '}
          <a
            href="https://github.com/nnmduc/layerzero/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0066CC] dark:text-[#2997FF] hover:underline"
          >
            CHANGELOG.md trên GitHub
          </a>
        </p>
      </main>
    </div>
  );
};
