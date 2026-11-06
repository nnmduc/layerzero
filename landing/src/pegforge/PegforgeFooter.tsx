import React, { useState } from 'react';
import { AuthorModal } from '../components/AuthorModal';

export const PegforgeFooter: React.FC = () => {
  const [isAuthorOpen, setIsAuthorOpen] = useState(false);

  return (
    <>
      <footer className="py-12 border-t border-apple-border dark:border-[rgba(255,255,255,0.09)] bg-apple-bg dark:bg-[#0D0D0F] text-xs text-[#6E6E73] dark:text-[#98989D] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">PegForge Studio</span>
            <span>Một dự án mã nguồn mở trong hệ sinh thái LayerZero</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setIsAuthorOpen(true)}
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors text-left font-medium underline-offset-4 hover:underline"
            >
              Về tác giả
            </button>
            <a href="/" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
              Trang chủ LayerZero
            </a>
            <a href="mailto:hello@layerzero.io.vn" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
              hello@layerzero.io.vn
            </a>
            <span>Giấy phép MIT</span>
          </div>
        </div>
      </footer>

      <AuthorModal isOpen={isAuthorOpen} onClose={() => setIsAuthorOpen(false)} />
    </>
  );
};
