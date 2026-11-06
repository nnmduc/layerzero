import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Pause, ArrowsOut, ArrowsIn, Sparkle, Cube, CheckCircle } from '@phosphor-icons/react';

interface Chapter {
  time: number;
  label: string;
  tag: string;
  desc: string;
}

const chapters: Chapter[] = [
  {
    time: 0,
    label: 'Nạp mô hình & Phân cụm AI',
    tag: '00:00',
    desc: 'PartField nhận diện 10 cụm giải phẫu tự động không tốn GPU rời',
  },
  {
    time: 16,
    label: 'Bung đa chi tiết (Exploded)',
    tag: '00:16',
    desc: 'Thanh trượt mở rộng không gian 360° kiểm tra từng bề mặt cắt',
  },
  {
    time: 33,
    label: 'Tạo chốt lục giác & đường keo',
    tag: '00:33',
    desc: 'Tự sinh ngàm chốt định vị âm dương và rãnh dán keo giấu sẹo',
  },
];

export const PegforgeDemoVideo: React.FC = () => {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(52.2);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Determine active chapter
      if (video.currentTime >= 33) {
        setActiveChapterIndex(2);
      } else if (video.currentTime >= 16) {
        setActiveChapterIndex(1);
      } else {
        setActiveChapterIndex(0);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const jumpToChapter = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    if (video.paused) {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = parseFloat(e.target.value);
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="demo" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header (Max 2 lines desktop, subtext max 20 words, no em-dashes) */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-mono font-semibold uppercase tracking-wider mb-4"
        >
          <Sparkle size={13} className="text-[#0071E3]" />
          <span>Trải nghiệm thực tế · 52 giây</span>
        </motion.div>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-4"
        >
          Studio trong chuyển động.
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
          className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-[48ch] mx-auto"
        >
          Theo dõi trực tiếp PegForge Studio nạp mô hình, phân cụm AI và tự động sinh chốt ngàm in 3D.
        </motion.p>
      </div>

      {/* 2. Interactive macOS Studio Frame */}
      <motion.div
        ref={containerRef}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden apple-card-elevated border border-black/10 dark:border-white/10 shadow-2xl bg-[#121214] text-white"
      >
        {/* macOS Window Title Bar */}
        <div className="px-4 py-3 bg-[#1E1E22]/90 border-b border-white/10 flex items-center justify-between text-xs font-mono select-none">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block" />
            <span className="ml-2 text-zinc-400 font-sans hidden sm:inline text-[13px] font-medium">
              PegForge Studio
            </span>
          </div>

          {/* Model info pill */}
          <div className="flex items-center gap-2 text-zinc-300 bg-white/5 px-2.5 py-1 rounded-md text-[11px]">
            <Cube size={13} className="text-[#2997FF]" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              DeadOrAlive_Rigged.obj · 28,722 faces
            </span>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline">PartField Local</span>
          </div>
        </div>

        {/* Video Surface */}
        <div className="relative w-full aspect-[16/10] bg-black flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src="/videos/pegforge-demo.mp4"
            poster="/videos/pegforge-demo-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
          />

          {/* Center Play Overlay Icon when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-[#0071E3] backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 transform scale-100 hover:scale-110 shadow-2xl"
              aria-label="Tiếp tục phát video"
            >
              <Play size={28} className="translate-x-0.5" fill="currentColor" />
            </button>
          )}

          {/* Floating live step indicator */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-200 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-ping" />
              <span>{chapters[activeChapterIndex].label}</span>
            </div>
          </div>

          {/* Bottom Floating Video Control Bar */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 flex flex-col gap-2 z-20">
            {/* Scrubber Range */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={duration || 52.2}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2997FF]"
                aria-label="Tua video"
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors"
                  aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                </button>

                <span className="font-mono text-zinc-300 text-[11px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                aria-label={isFullscreen ? 'Thu nhỏ video' : 'Toàn màn hình'}
              >
                {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Chapter Jump Rail */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#161619] border-t border-white/10">
          {chapters.map((ch, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <button
                key={ch.tag}
                type="button"
                onClick={() => jumpToChapter(ch.time)}
                className={`p-4 text-left transition-all duration-200 flex flex-col gap-1 hover:bg-white/[0.04] focus:outline-none ${
                  isActive ? 'bg-white/[0.06] border-l-2 md:border-l-0 md:border-t-2 border-[#2997FF]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isActive ? 'bg-[#0071E3] text-white' : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    {ch.tag}
                  </span>
                  {isActive && <CheckCircle size={14} weight="fill" className="text-[#2997FF]" />}
                </div>
                <div
                  className={`text-sm font-semibold tracking-tight ${
                    isActive ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {ch.label}
                </div>
                <p className="text-xs text-zinc-400 leading-snug line-clamp-2">
                  {ch.desc}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Three Micro Specs underneath */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
          <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Tách khối tức thì
          </div>
          <div className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
            PartField gom 10 cụm chi tiết tự động chỉ trong vài giây ngay trên CPU máy tính cá nhân.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
          <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Kiểm tra 3D đa hướng
          </div>
          <div className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
            Xoay lật 360 độ và kéo giãn độ bung part trực quan để kiểm soát vị trí ngàm trước khi in.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
          <div className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Tự sinh chốt lục giác
          </div>
          <div className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
            Ngàm chốt định vị âm dương tự bù trừ dung sai 0.2mm, tối ưu cho tấm in PEI của Bambu Lab.
          </div>
        </div>
      </div>
    </section>
  );
};
