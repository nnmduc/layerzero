import React, { useRef, useState } from 'react';
import { Play, Pause, SpeakerSimpleHigh, SpeakerSimpleSlash, ArrowUpRight } from '@phosphor-icons/react';

export const Form3dDemoVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section id="demo" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <span>Xem thực tế trải nghiệm</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
          Từ mô tả văn bản đến lưới 3D tương tác
        </h2>
        <p className="text-base text-[#6E6E73] dark:text-[#98989D] max-w-2xl mx-auto leading-relaxed">
          Xem quy trình sinh mô hình chú rồng mini (Cute Dragon) hoàn chỉnh: từ prompt tự nhiên, sheet 4 góc turnaround, bóc tách alpha đến Three.js studio xoay 360°.
        </p>
      </div>

      {/* Mac Window Video Container */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl overflow-hidden bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl">
          {/* macOS Title Bar */}
          <div className="h-11 px-4 bg-[#232326] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>
            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <span>Form 3D Studio</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-300">cute_dragon.stl</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Watertight</span>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative aspect-[16/9] bg-black flex items-center justify-center group">
            <video
              ref={videoRef}
              src="/videos/form3d_demo.mp4"
              poster="/images/form3d/thumbnail.png"
              playsInline
              loop
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Play/Pause Overlay Button */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Phát video demo"
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-md text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
              >
                <Play size={32} weight="fill" className="ml-1" />
              </button>
            )}

            {/* Floating Video Control Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-[#2997FF] transition-colors"
                >
                  {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
                </button>
                <span>5-Step Pipeline</span>
                <span className="text-white/40">·</span>
                <span className="text-purple-300">Apple Silicon MPS</span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  {isMuted ? <SpeakerSimpleSlash size={15} /> : <SpeakerSimpleHigh size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick info footer */}
          <div className="p-4 sm:p-5 bg-[#1F1F23] border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-black/20 text-zinc-300">
              <span className="text-zinc-500 block text-[10px]">ĐẦU VÀO:</span>
              <span className="font-semibold text-white">Văn bản Tiếng Việt / Anh</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 text-zinc-300">
              <span className="text-zinc-500 block text-[10px]">MÔ HÌNH LÕI:</span>
              <span className="font-semibold text-purple-400">Hunyuan3D-2 multi-view</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 text-zinc-300">
              <span className="text-zinc-500 block text-[10px]">ENGINE NATIVE:</span>
              <span className="font-semibold text-emerald-400">Metal MPS (Apple Silicon)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 text-zinc-300">
              <span className="text-zinc-500 block text-[10px]">ĐẦU RA SẴN SÀNG:</span>
              <span className="font-semibold text-sky-400">.STL + .GLB kín nước</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
