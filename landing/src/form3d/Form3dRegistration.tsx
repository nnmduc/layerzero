import React, { useState } from 'react';
import { DownloadSimple, PaperPlaneTilt, Info, Check, AppleLogo, Sparkle, ChatCircleDots } from '@phosphor-icons/react';

type RegistrationGroup = 'waiting' | 'testing';

const WORKER_ENDPOINT = 'https://pegforge-registration-worker.sodifarm.workers.dev/api/pegforge-register';
const DIRECT_DOWNLOAD_URL = 'https://dl.layerzero.io.vn/Form3D_0.2.0_Apple_Silicon_arm64.dmg';

export const Form3dRegistration: React.FC = () => {
  const [group, setGroup] = useState<RegistrationGroup>('waiting');
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState('');
  const [contactLink, setContactLink] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const combinedNote = [
        '[Form3D]',
        device.trim() ? `Thiết bị: ${device.trim()}` : null,
        note.trim() ? `Ghi chú: ${note.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        tier: group, // 'waiting' or 'testing'
        email: email.trim(),
        facebook: contactLink.trim() || (group === 'testing' ? 'form3d-tester' : null),
        zalo: null,
        github: null,
        note: combinedNote || '[Form3D] Đăng ký nhận thông tin',
      };

      const res = await fetch(WORKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Đã có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="tai-ve" className="py-20 sm:py-28 bg-[#FBFBFD] dark:bg-[#0E0E10] border-t border-[#1D1D1F]/[0.06] dark:border-white/[0.07] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Direct Download Card */}
        <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#18181B] border-2 border-[#0071E3] dark:border-[#2997FF] shadow-2xl mb-14 sm:mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <DownloadSimple size={14} weight="bold" />
              <span>Bản cài đặt chính thức</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Tải Form3D v0.2.0 cho macOS
            </h2>

            <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#98989D] max-w-xl mx-auto mb-8 leading-relaxed">
              Bản build chạy native độc lập dành riêng cho máy tính Apple Silicon (M1/M2/M3/M4), tích hợp sẵn môi trường Python MPS và WebGL Studio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href={DIRECT_DOWNLOAD_URL}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-lg shadow-[#0071E3]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <AppleLogo size={20} weight="fill" />
                <span>Tải trực tiếp Form3D (macOS arm64 .dmg)</span>
              </a>
            </div>

            {/* System Requirements Notice Box */}
            <div className="rounded-2xl bg-amber-500/[0.08] dark:bg-amber-500/[0.1] border border-amber-500/20 p-5 text-left text-xs font-mono text-[#515154] dark:text-zinc-300 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 text-sm">
                <Info size={18} weight="fill" />
                <span>Lưu ý trước khi sử dụng:</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-[12.5px] leading-relaxed">
                <li>
                  <strong>Phần cứng yêu cầu:</strong> Cần máy tính Mac trang bị chip Apple Silicon (M1 trở lên), khuyến nghị RAM $\ge$ 16GB Unified Memory để suy luận mô hình mượt mà.
                </li>
                <li>
                  <strong>Tải mô hình AI (~9GB):</strong> Để ứng dụng chạy hoàn toàn local offline trên máy bạn, phần mềm sẽ tải trọng số mô hình AI về máy trong lần đầu khởi chạy (dung lượng khoảng 9GB).
                </li>
                <li>
                  <strong>Antigravity CLI (agy):</strong> Quá trình sinh ảnh 2D góc Turnaround ở Bước 1 & 2 được điều phối bằng công cụ <code>agy</code>. Anh em cần có gói AI Pro trở lên và cài đặt agy CLI vào máy.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Updates Registration Form */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF] mb-2">
              <Sparkle size={14} weight="fill" />
              <span>Cộng đồng trải nghiệm</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
              Đăng ký nhận thông tin & Bản cập nhật Form3D
            </h3>
            <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#98989D]">
              Để lại email để nhận thông báo các bản build tiếp theo, mẹo prompt tạo hình đẹp và kinh nghiệm in 3D cùng cộng đồng.
            </p>
          </div>

          <div className="rounded-3xl p-6 sm:p-9 bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.1] shadow-xl">
            {/* Group Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setGroup('waiting');
                  setSubmitted(false);
                  setErrorMessage('');
                }}
                className={`py-3 px-4 rounded-2xl text-xs font-mono font-semibold transition-all border ${
                  group === 'waiting'
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-md shadow-[#0071E3]/20'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#515154] dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.06] hover:border-[#0071E3]/40'
                }`}
              >
                Nhận bản cập nhật mới
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroup('testing');
                  setSubmitted(false);
                  setErrorMessage('');
                }}
                className={`py-3 px-4 rounded-2xl text-xs font-mono font-semibold transition-all border ${
                  group === 'testing'
                    ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-md shadow-[#0071E3]/20'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#515154] dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.06] hover:border-[#0071E3]/40'
                }`}
              >
                Tham gia nhóm thử nghiệm sớm
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={30} weight="bold" />
                </div>
                <h4 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Đã ghi nhận đăng ký!
                </h4>
                <p className="text-sm text-[#6E6E73] dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã quan tâm đến Form3D. Thông tin về các bản cập nhật mới sẽ được gửi trực tiếp tới email của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#1D1D1F] dark:text-white transition-colors"
                >
                  Đăng ký email khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#1D1D1F] dark:text-zinc-300 mb-1.5">
                    Địa chỉ Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ten-ban@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1D1D1F] dark:text-zinc-300 mb-1.5">
                    Dòng máy Mac & Máy in 3D bạn đang dùng <span className="text-[#6E6E73] font-normal">(tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder="Ví dụ: MacBook Pro M2 Max 32GB, Bambu Lab A1..."
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                </div>

                {group === 'testing' && (
                  <div>
                    <label className="block text-xs font-mono font-medium text-[#1D1D1F] dark:text-zinc-300 mb-1.5">
                      Link Facebook cá nhân hoặc Zalo <span className="text-[#6E6E73] font-normal">(tùy chọn - để mời vào nhóm thử nghiệm)</span>
                    </label>
                    <input
                      type="text"
                      value={contactLink}
                      onChange={(e) => setContactLink(e.target.value)}
                      placeholder="https://facebook.com/username hoặc số Zalo"
                      className="w-full px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3] transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono font-medium text-[#1D1D1F] dark:text-zinc-300 mb-1.5">
                    Ghi chú thêm <span className="text-[#6E6E73] font-normal">(tùy chọn)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ý tưởng hoặc mẫu nhân vật bạn muốn thử nghiệm gen..."
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-sm text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white shadow-md shadow-[#0071E3]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  <span>
                    {isSubmitting
                      ? 'Đang gửi...'
                      : group === 'waiting'
                      ? 'Đăng ký nhận thông tin'
                      : 'Đăng ký tham gia nhóm thử nghiệm'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
