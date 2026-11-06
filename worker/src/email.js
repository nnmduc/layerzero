import { createMimeMessage } from 'mimetext';
import { EmailMessage } from 'cloudflare:email';

const TIER_LABELS = {
  waiting: 'Waiting List (Trải nghiệm sớm)',
  testing: 'Testing List (Tham gia nhóm kín)',
  contributor: 'Contributor (Đội ngũ phát triển)',
};

/**
 * Send admin notification email to nnmduc@gmail.com
 */
export async function sendAdminNotification(env, reg) {
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
    console.warn('[EMAIL] env.EMAIL binding not available.');
    return { sent: false, skipped: true };
  }

  const tierLabel = TIER_LABELS[reg.tier] || reg.tier;
  const adminEmail = 'nnmduc@gmail.com';
  const fromEmail = 'hello@layerzero.io.vn';

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="vi">
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 30px 15px; color: #1d1d1f;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 32px; border: 1px solid #e5e5ea; box-shadow: 0 4px 18px rgba(0,0,0,0.04);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
          <span style="font-size: 13px; font-weight: 700; color: #0071E3; font-family: monospace; text-transform: uppercase;">PegForge Studio · LayerZero</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #1d1d1f; margin-top: 0; margin-bottom: 8px; line-height: 1.2;">Đăng ký mới từ ${reg.email}</h2>
        <p style="font-size: 14px; color: #6e6e73; margin-top: 0; margin-bottom: 24px;">Một thành viên vừa hoàn tất đăng ký vào hệ thống.</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; width: 130px; font-weight: 600;">Nhóm đăng ký:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #0071E3; font-weight: 700;">${tierLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; font-weight: 600;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #1d1d1f;"><a href="mailto:${reg.email}" style="color: #0071E3;">${reg.email}</a></td>
          </tr>
          ${reg.facebook ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; font-weight: 600;">Facebook:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #1d1d1f;">${reg.facebook}</td>
          </tr>` : ''}
          ${reg.zalo ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; font-weight: 600;">Zalo:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #1d1d1f;">${reg.zalo}</td>
          </tr>` : ''}
          ${reg.github ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; font-weight: 600;">GitHub:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #1d1d1f;"><a href="https://github.com/${reg.github.replace('@', '')}" style="color: #0071E3;">${reg.github}</a></td>
          </tr>` : ''}
          ${reg.note ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #86868b; font-weight: 600; vertical-align: top;">Ghi chú thêm:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f2; color: #1d1d1f; line-height: 1.5;">${reg.note}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 10px 0; color: #86868b; font-weight: 600;">IP & Thời gian:</td>
            <td style="padding: 10px 0; color: #86868b; font-family: monospace; font-size: 11px;">${reg.ip || 'N/A'} · ${new Date().toISOString()}</td>
          </tr>
        </table>

        <div style="border-top: 1px solid #e5e5ea; padding-top: 18px; font-size: 11px; color: #86868b; text-align: center;">
          Thông báo tự động từ PegForge Registration Worker · LayerZero Studio
        </div>
      </div>
    </body>
    </html>
  `;

  const msg = createMimeMessage();
  msg.setSender({ name: 'PegForge System', addr: fromEmail });
  msg.setRecipient(adminEmail);
  msg.setSubject(`[PegForge] Đăng ký mới (${reg.tier.toUpperCase()}): ${reg.email}`);
  msg.addMessage({ contentType: 'text/html', data: htmlBody });

  const emailMessage = new EmailMessage(fromEmail, adminEmail, msg.asRaw());
  await env.EMAIL.send(emailMessage);
  return { sent: true };
}

/**
 * Send automated friendly confirmation email to applicant from hello@layerzero.io.vn
 */
export async function sendApplicantConfirmation(env, reg) {
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
    return { sent: false, skipped: true };
  }

  const tierLabel = TIER_LABELS[reg.tier] || reg.tier;
  const fromEmail = 'hello@layerzero.io.vn';

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="vi">
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; margin: 0; padding: 30px 15px; color: #1d1d1f;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 36px; border: 1px solid #e5e5ea; box-shadow: 0 4px 18px rgba(0,0,0,0.04);">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 12px; font-weight: 700; color: #0071E3; font-family: monospace; text-transform: uppercase;">PegForge Studio · Hệ sinh thái LayerZero</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: #1d1d1f; margin-top: 0; margin-bottom: 12px; line-height: 1.2;">Chào bạn, cảm ơn đã đăng ký!</h1>
        <p style="font-size: 15px; color: #515154; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
          Chúng tôi đã ghi nhận thông tin đăng ký của bạn (<strong style="color: #1d1d1f;">${reg.email}</strong>) vào danh sách <strong style="color: #0071E3;">${tierLabel}</strong>.
        </p>

        <div style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5ea;">
          <h3 style="font-size: 14px; font-weight: 700; color: #1d1d1f; margin-top: 0; margin-bottom: 8px;">Các bước tiếp theo:</h3>
          <ul style="font-size: 13px; color: #515154; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${reg.tier === 'waiting' ? `
              <li>Bạn sẽ nhận được thông báo cập nhật tiến độ phát triển định kỳ qua email.</li>
              <li>Khi bản Beta sẵn sàng, link tải PegForge Studio sẽ được gửi ưu tiên đến bạn trước tiên.</li>
            ` : ''}
            ${reg.tier === 'testing' ? `
              <li>Đội ngũ sẽ liên hệ qua Facebook để mời bạn vào nhóm thử nghiệm kín.</li>
              <li>Bạn sẽ được nhận các bản build nightly để in thử và đóng góp ý kiến về độ khít ngàm chốt.</li>
            ` : ''}
            ${reg.tier === 'contributor' ? `
              <li>Đội ngũ sẽ kết nối qua Zalo và mời bạn vào tổ chức GitHub của dự án.</li>
              <li>Bạn có thể tham gia thảo luận kiến trúc lõi, đóng góp mã nguồn hoặc thiết kế mẫu mà không có bất kỳ áp lực nào.</li>
            ` : ''}
          </ul>
        </div>

        <p style="font-size: 14px; color: #515154; line-height: 1.6; margin-bottom: 28px;">
          PegForge là dự án mã nguồn mở (giấy phép MIT) luôn miễn phí, đồng hành cùng LayerZero Studio nhằm mang lại trải nghiệm in 3D hoàn hảo nhất cho cộng đồng.
        </p>

        <div style="border-top: 1px solid #e5e5ea; padding-top: 20px; font-size: 12px; color: #86868b; text-align: center;">
          <p style="margin: 0 0 6px 0;">Mọi thắc mắc hoặc góp ý, bạn có thể phản hồi trực tiếp email này.</p>
          <p style="margin: 0; font-family: monospace;">hello@layerzero.io.vn · https://layerzero.io.vn/pegforge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const msg = createMimeMessage();
    msg.setSender({ name: 'PegForge Studio', addr: fromEmail });
    msg.setRecipient(reg.email);
    msg.setSubject(`[PegForge] Xác nhận đăng ký tham gia ${tierLabel}`);
    msg.addMessage({ contentType: 'text/html', data: htmlBody });

    const emailMessage = new EmailMessage(fromEmail, reg.email, msg.asRaw());
    await env.EMAIL.send(emailMessage);
    return { sent: true };
  } catch (err) {
    // Cloudflare Email Routing free tier may restrict destinations to verified recipients
    console.warn('[EMAIL] Confirmation to applicant skipped or restricted:', err.message);
    return { sent: false, error: err.message };
  }
}
