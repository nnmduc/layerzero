import React, { useState } from 'react';
import { PaperPlaneTilt, Info } from '@phosphor-icons/react';

type RegistrationTier = 'waiting' | 'testing' | 'contributor';

interface TierConfig {
  title: string;
  desc: string;
  fbRequired: boolean;
  zalo: boolean;
  github: boolean;
  buttonText: string;
}

const TIER_CONFIGS: Record<RegistrationTier, TierConfig> = {
  waiting: {
    title: 'Waiting List: Nhận thông tin và Bản thử nghiệm Beta',
    desc: 'Đăng ký để là những người đầu tiên nhận link tải PegForge Studio khi bản Beta sẵn sàng, cùng thông báo cập nhật tiến độ định kỳ.',
    fbRequired: false,
    zalo: false,
    github: false,
    buttonText: 'Đăng ký Waiting List',
  },
  testing: {
    title: 'Testing List: Tham gia nhóm thử nghiệm kín',
    desc: 'Dành cho người có máy in 3D (Bambu Lab, Prusa, v.v.), sẵn sàng in thử các file cắt thực tế và gửi phản hồi để hoàn thiện tính năng.',
    fbRequired: true,
    zalo: false,
    github: false,
    buttonText: 'Đăng ký làm Tester',
  },
  contributor: {
    title: 'Contributor: Gia nhập nhóm phát triển cộng đồng',
    desc: 'Dành cho các lập trình viên hoặc 3D artists muốn đóng góp mã nguồn, cải tiến thuật toán hoặc thiết kế mẫu. Tự do tham gia, không áp lực, có thể rời bất cứ lúc nào.',
    fbRequired: true,
    zalo: true,
    github: true,
    buttonText: 'Đăng ký tham gia Contributor',
  },
};

const WORKER_ENDPOINT = 'https://pegforge-registration-worker.sodifarm.workers.dev/api/pegforge-register';

export const PegforgeRegistration: React.FC = () => {
  const [tier, setTier] = useState<RegistrationTier>('waiting');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [zalo, setZalo] = useState('');
  const [github, setGithub] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const config = TIER_CONFIGS[tier];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        tier,
        email: email.trim(),
        facebook: facebook.trim() || null,
        zalo: zalo.trim() || null,
        github: github.trim() || null,
        note: note.trim() || null,
      };

      const res = await fetch(WORKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Đã có lỗi xảy ra khi lưu đăng ký. Vui lòng thử lại.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-16 md:py-24 bg-apple-surface dark:bg-[#161618] border-t border-apple-border dark:border-[rgba(255,255,255,0.09)] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#0071E3] dark:text-sky-400 mb-3">
            <span>Tham gia cùng chúng tôi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">
            Đăng ký tham gia PegForge
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#98989D]">
            Chọn nhóm phù hợp với sự quan tâm và mong muốn của bạn.
          </p>
        </div>

        {/* Pale Yellow Disclaimer Notice (Outside, Above all 3 forms) */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/[0.08] dark:bg-amber-400/[0.08] border border-amber-500/25 dark:border-amber-400/20 text-xs sm:text-[13px] text-amber-950/85 dark:text-amber-200/90 leading-relaxed">
          <div className="font-semibold text-sm text-amber-950 dark:text-amber-100 mb-1 flex items-center gap-2">
            <span>Cam kết riêng tư & cập nhật</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-400/15 text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              Phi thương mại
            </span>
          </div>
          <p className="mb-1.5">
            Mọi thông tin đăng ký chỉ được dùng duy nhất để gửi cập nhật tiến độ và link tải thử nghiệm PegForge Studio. Cam kết không quảng cáo, không spam và không thu thập bất kỳ dữ liệu cá nhân nào khác.
          </p>
          <p className="text-[11.5px] opacity-80">
            Bạn hoàn toàn có thể thoải mái dùng email ảo hoặc email ẩn danh, miễn là vẫn nhận được mail từ hệ thống là được.
          </p>
        </div>

        <div className="apple-card-elevated rounded-3xl p-6 sm:p-10">
          {/* Segmented Tier Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#F0F0F3] dark:bg-[#202024] mb-8">
            {(['waiting', 'testing', 'contributor'] as RegistrationTier[]).map((key) => {
              const active = tier === key;
              const labels: Record<RegistrationTier, string> = {
                waiting: 'Waiting List',
                testing: 'Testing List',
                contributor: 'Contributor',
              };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTier(key);
                    setSubmitted(false);
                    setErrorMessage('');
                  }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>

          {/* Tier Description Card */}
          <div className="p-4 rounded-2xl bg-[#0071E3]/5 dark:bg-[#0071E3]/10 border border-[#0071E3]/20 mb-8 flex items-start gap-3.5">
            <Info size={22} className="text-[#0071E3] shrink-0 mt-0.5" weight="bold" />
            <div>
              <h4 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                {config.title}
              </h4>
              <p className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                {config.desc}
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center font-mono">
              <div className="text-emerald-700 dark:text-emerald-300 font-bold text-base mb-2">
                Đăng ký thành công!
              </div>
              <p className="text-xs text-[#6E6E73] dark:text-[#98989D] leading-relaxed max-w-md mx-auto">
                Cảm ơn bạn (<strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{email}</strong>) đã đăng ký tham gia nhóm{' '}
                <strong className="text-[#0071E3] uppercase">{tier}</strong>.
                <br />
                Email xác nhận đã được gửi tự động từ <em>hello@layerzero.io.vn</em>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setFacebook('');
                  setZalo('');
                  setGithub('');
                  setNote('');
                }}
                className="mt-5 px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Đăng ký thêm thông tin khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email (Always Required) */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] mb-2"
                >
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="reg-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#F0F0F3] dark:bg-[#202024] border border-apple-border dark:border-[rgba(255,255,255,0.09)] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>

              {/* Facebook (Optional in Waiting, Required in Testing & Contributor) */}
              <div>
                <label
                  htmlFor="reg-facebook"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] mb-2"
                >
                  Link Facebook cá nhân{' '}
                  {config.fbRequired ? (
                    <span className="text-red-500 font-semibold">* (Bắt buộc)</span>
                  ) : (
                    <span className="text-[#6E6E73] dark:text-[#98989D] text-xs font-normal">
                      (Không bắt buộc)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="reg-facebook"
                  required={config.fbRequired}
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username hoặc Tên Facebook"
                  className="w-full px-4 py-3 rounded-xl bg-[#F0F0F3] dark:bg-[#202024] border border-apple-border dark:border-[rgba(255,255,255,0.09)] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
                <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1.5">
                  Dùng để kết nối trao đổi nhanh khi có bản cập nhật mới.
                </p>
              </div>

              {/* Zalo (Only for Contributor) */}
              {config.zalo && (
                <div>
                  <label
                    htmlFor="reg-zalo"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] mb-2"
                  >
                    Số Zalo liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reg-zalo"
                    required
                    value={zalo}
                    onChange={(e) => setZalo(e.target.value)}
                    placeholder="Số điện thoại dùng Zalo"
                    className="w-full px-4 py-3 rounded-xl bg-[#F0F0F3] dark:bg-[#202024] border border-apple-border dark:border-[rgba(255,255,255,0.09)] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1.5">
                    Dùng để mời vào nhóm chat trao đổi kỹ thuật và cập nhật tiến độ dev hàng tuần.
                  </p>
                </div>
              )}

              {/* GitHub (Only for Contributor) */}
              {config.github && (
                <div>
                  <label
                    htmlFor="reg-github"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] mb-2"
                  >
                    Tài khoản GitHub <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reg-github"
                    required
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="github.com/username hoặc username"
                    className="w-full px-4 py-3 rounded-xl bg-[#F0F0F3] dark:bg-[#202024] border border-apple-border dark:border-[rgba(255,255,255,0.09)] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1.5">
                    Dùng để add vào tổ chức GitHub và phân quyền truy cập repo trước khi release.
                  </p>
                </div>
              )}

              {/* Optional Note */}
              <div>
                <label
                  htmlFor="reg-note"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#F5F5F7] mb-2"
                >
                  Ghi chú thêm (Dòng máy in đang dùng, kỹ năng hoặc mong muốn đóng góp)
                </label>
                <textarea
                  id="reg-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đang dùng Bambu A1 + AMS, muốn test in các file figure anime..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F0F0F3] dark:bg-[#202024] border border-apple-border dark:border-[rgba(255,255,255,0.09)] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#0071E3] resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-md shadow-[#0071E3]/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Đang gửi thông tin...' : config.buttonText}</span>
                <PaperPlaneTilt size={16} weight="bold" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
