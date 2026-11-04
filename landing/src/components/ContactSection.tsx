import React, { useState } from 'react';
import {
  Check,
  Copy,
  EnvelopeSimple,
} from '@phosphor-icons/react';

const CONTACT_EMAIL = 'hello@layerzero.io.vn';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard is unavailable
    }
  };

  return (
    <section
      id="gop-y"
      className="pt-20 pb-16 sm:pt-24 sm:pb-20 bg-white dark:bg-[#121214] border-t border-[#1D1D1F]/[0.06] dark:border-white/[0.07]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#F5F5F7] dark:bg-[#1C1C1F] border border-[#1D1D1F]/[0.07] dark:border-white/[0.08] p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mx-auto mb-4">
            <EnvelopeSimple size={26} weight="duotone" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
            Góp ý & Liên hệ
          </h2>

          <p className="text-[15px] text-[#6E6E73] dark:text-zinc-300 max-w-lg mx-auto mb-6 leading-relaxed">
            Mọi ý kiến đóng góp, báo lỗi hoặc chia sẻ file <code className="font-mono text-[#1D1D1F] dark:text-zinc-200">.3mf</code> thực tế của bạn đều giúp LayerZero hoàn thiện hơn. Vui lòng gửi email trực tiếp tới:
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-[#141416] border border-[#1D1D1F]/10 dark:border-white/10 shadow-sm">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=G%C3%B3p%20%C3%BD%20LayerZero%20Studio`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-mono text-[14.5px] font-semibold transition-all active:scale-[0.98]"
            >
              <EnvelopeSimple size={18} weight="fill" />
              <span>{CONTACT_EMAIL}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 text-[#1D1D1F] dark:text-zinc-200 text-[13px] font-medium transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check size={15} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy size={15} weight="duotone" />
                  <span>Sao chép email</span>
                </>
              )}
            </button>
          </div>
        </div>

        <footer className="mt-14 pt-6 border-t border-[#1D1D1F]/[0.07] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-[#6E6E73] dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <img
              src="/app-icon.png"
              alt="Biểu tượng LayerZero Studio"
              className="w-5 h-5 rounded"
            />
            <span className="font-semibold text-[#1D1D1F] dark:text-zinc-200">
              LayerZero Studio
            </span>
            <span>· Hỗ trợ agy CLI (Google Antigravity) · Sắp hỗ trợ Claude & Codex.</span>
          </div>
          <div>
            Hỗ trợ macOS, Windows & Linux ·{' '}
            <a
              href="https://github.com/nnmduc/layerzero/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-medium"
            >
              GitHub Releases
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
};
