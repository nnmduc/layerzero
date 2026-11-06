import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FacebookLogo, LinkedinLogo, GithubLogo, Heart, Code } from '@phosphor-icons/react';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-title"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#0071E3]/15 dark:bg-[#0071E3]/25 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#6E6E73] dark:text-zinc-400 hover:text-[#1D1D1F] dark:hover:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all"
              aria-label="Đóng cửa sổ"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Header / Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center shadow-sm">
                <Code size={22} weight="bold" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center">
                  <Heart size={8} weight="fill" className="text-white" />
                </span>
              </div>
              <div>
                <h3 id="author-title" className="text-lg font-bold tracking-tight">
                  Đôi lời từ tác giả
                </h3>
                <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                  Software Engineer · Đam mê nghiên cứu & in 3D
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 text-sm text-[#1D1D1F] dark:text-zinc-200 leading-relaxed mb-6 space-y-2.5">
              <p>
                Chào bạn! Mình là một Software Engineer, mới tập tành chơi &quot;ba đê&quot; (in 3D) gần đây.
              </p>
              <p>
                Mình phát triển <strong>LayerZero</strong> và <strong>PegForge</strong> chủ yếu để tự nghiên cứu, giải quyết các bài toán kỹ thuật thú vị và phục vụ sở thích cá nhân là chính.
              </p>
              <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
                Dự án hoàn toàn không có ý định thương mại hóa, chia sẻ mã nguồn mở cho cộng đồng cùng dùng, cùng học hỏi và vọc vạch cho vui vẻ.
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-2">
                Kết nối cùng mình:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="https://www.facebook.com/socthaovat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#1877F2]/10 hover:text-[#1877F2] dark:hover:bg-[#1877F2]/20 dark:hover:text-[#4599FF] text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-[#1877F2]/20"
                >
                  <FacebookLogo size={16} weight="fill" />
                  <span>Facebook</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/nnmduc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] dark:hover:bg-[#0A66C2]/20 dark:hover:text-[#378FE9] text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-[#0A66C2]/20"
                >
                  <LinkedinLogo size={16} weight="fill" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://github.com/nnmduc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-black/10 dark:hover:border-white/10"
                >
                  <GithubLogo size={16} weight="fill" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#98989D]">
              <span className="font-mono text-[11px]">LayerZero · PegForge</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7] transition-all"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
