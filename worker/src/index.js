import { getCorsHeaders, handleOptions } from './cors.js';
import { insertRegistration, getRegistrationCount } from './db.js';
import { sendAdminNotification, sendApplicantConfirmation } from './email.js';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      let count = 0;
      let dbOk = false;
      try {
        count = await getRegistrationCount(env.DB);
        dbOk = true;
      } catch (err) {
        console.error('DB Health Error:', err);
      }

      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'pegforge-registration-worker',
          database: dbOk ? 'connected' : 'error',
          total_registrations: count,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Registration endpoint
    if (
      request.method === 'POST' &&
      (url.pathname === '/api/pegforge-register' || url.pathname === '/pegforge-register' || url.pathname === '/')
    ) {
      try {
        const body = await request.json().catch(() => null);
        if (!body) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dữ liệu JSON không hợp lệ.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { tier, email, facebook, zalo, github, note } = body;

        // Validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Địa chỉ email không hợp lệ.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const validTiers = ['waiting', 'testing', 'contributor'];
        if (!tier || !validTiers.includes(tier)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Nhóm đăng ký không hợp lệ.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (tier === 'testing' && (!facebook || !facebook.trim())) {
          return new Response(
            JSON.stringify({ success: false, error: 'Testing List yêu cầu cung cấp link Facebook cá nhân.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (tier === 'contributor') {
          if (!facebook || !facebook.trim()) {
            return new Response(
              JSON.stringify({ success: false, error: 'Contributor yêu cầu cung cấp link Facebook cá nhân.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (!zalo || !zalo.trim()) {
            return new Response(
              JSON.stringify({ success: false, error: 'Contributor yêu cầu cung cấp số Zalo liên hệ.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (!github || !github.trim()) {
            return new Response(
              JSON.stringify({ success: false, error: 'Contributor yêu cầu cung cấp tài khoản GitHub.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const id = crypto.randomUUID();
        const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || null;
        const userAgent = request.headers.get('user-agent') || null;

        const regRecord = {
          id,
          tier,
          email: email.trim().toLowerCase(),
          facebook: facebook ? facebook.trim() : null,
          zalo: zalo ? zalo.trim() : null,
          github: github ? github.trim() : null,
          note: note ? note.trim() : null,
          ip,
          userAgent,
        };

        // 1. Insert into D1 SQLite
        await insertRegistration(env.DB, regRecord);

        // 2. Dispatch emails asynchronously via ctx.waitUntil so response is fast
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(
            Promise.allSettled([
              sendAdminNotification(env, regRecord),
              sendApplicantConfirmation(env, regRecord),
            ])
          );
        } else {
          // If local or background
          await Promise.allSettled([
            sendAdminNotification(env, regRecord),
            sendApplicantConfirmation(env, regRecord),
          ]);
        }

        return new Response(
          JSON.stringify({
            success: true,
            id,
            message: 'Đăng ký thành công! Hệ thống đã ghi nhận thông tin của bạn.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('Registration processing error:', err);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Đã có lỗi hệ thống xảy ra khi lưu đăng ký. Vui lòng thử lại.',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
