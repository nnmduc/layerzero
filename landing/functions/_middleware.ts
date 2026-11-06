// Cloudflare Pages Functions Middleware
// Tự động chạy tại Cloudflare Edge cho mọi request vào project layerzero-landing

interface EventContext {
  request: Request;
  next: () => Promise<Response>;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);

  // 1. Chuyển hướng 301 vĩnh viễn từ www.layerzero.io.vn về layerzero.io.vn
  if (url.hostname === 'www.layerzero.io.vn') {
    url.hostname = 'layerzero.io.vn';
    return Response.redirect(url.toString(), 301);
  }

  // 2. Chuyển tiếp request tới trang web / static asset
  const response = await context.next();

  // 3. Nhân bản response để gắn thêm các Security Headers & Cache Headers chuẩn
  const headers = new Headers(response.headers);
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Nếu là tài nguyên tĩnh đã băm (hashed) trong /assets/, đặt cache 1 năm immutable
  if (url.pathname.startsWith('/assets/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
