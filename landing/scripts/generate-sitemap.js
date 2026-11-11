import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://layerzero.io.vn';

/**
 * Danh sách routes mặc định và metadata SEO
 */
const BASE_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/pegforge', priority: '0.8', changefreq: 'weekly' },
  { path: '/form3d', priority: '0.8', changefreq: 'weekly' },
  { path: '/changelog', priority: '0.8', changefreq: 'weekly' },
];

/**
 * Tự động quét mã nguồn (src) để phát hiện trang mới (*Page.tsx)
 */
function discoverNewPages() {
  const discovered = new Map(BASE_ROUTES.map((r) => [r.path, r]));
  const srcDir = path.resolve(__dirname, '../src');

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('Page.tsx')) {
        // Ví dụ: DocsPage.tsx -> /docs, GuidePage.tsx -> /guide
        const baseName = entry.name.replace('Page.tsx', '').toLowerCase();
        const routePath = `/${baseName}`;
        if (!discovered.has(routePath) && routePath !== '/app') {
          discovered.set(routePath, {
            path: routePath,
            priority: '0.7',
            changefreq: 'monthly',
          });
          console.log(`[Sitemap Auto-Discovery] Phát hiện trang mới: ${entry.name} -> ${routePath}`);
        }
      }
    }
  }

  scanDir(srcDir);
  return Array.from(discovered.values());
}

export function generateSitemap() {
  const routes = discoverNewPages();
  const today = new Date().toISOString().split('T')[0];

  const urls = routes.map((route) => {
    const cleanPath = route.path === '/' ? '' : route.path;
    return `  <url>
    <loc>${SITE_URL}${cleanPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  // Ghi vào public/sitemap.xml (để dev & build copy sang dist)
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap] Đã sinh sitemap.xml tự động với ${routes.length} trang tại: ${publicPath}`);

  // Ghi sang dist/sitemap.xml nếu dist đã build
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.resolve(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap] Đã đồng bộ sang: ${distPath}`);
  }
}

generateSitemap();
