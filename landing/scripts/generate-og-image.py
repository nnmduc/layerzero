#!/usr/bin/env python3
"""
Generate high-resolution Open Graph image (1200x630) for LayerZero Studio landing page.
Requirements: Google Chrome, Pillow (PIL), and Python 3.
"""

import base64
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
LANDING_DIR = SCRIPT_DIR.parent
PUBLIC_DIR = LANDING_DIR / "public"
OUTPUT_PATH = PUBLIC_DIR / "og-image.png"

def get_b64(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def main():
    icon_path = PUBLIC_DIR / "app-icon.png"
    shot_path = PUBLIC_DIR / "images" / "screenshot-app-full-audit.png"

    if not icon_path.exists():
        print(f"Error: {icon_path} not found", file=sys.stderr)
        sys.exit(1)
    if not shot_path.exists():
        print(f"Error: {shot_path} not found", file=sys.stderr)
        sys.exit(1)

    icon_b64 = get_b64(icon_path)
    shot_b64 = get_b64(shot_path)

    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<style>
  * {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }}
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

  body {{
    width: 1200px;
    height: 630px;
    background-color: #0B0D13;
    background-image: 
      radial-gradient(circle at 15% 20%, rgba(0, 113, 227, 0.22) 0%, transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.14) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px;
    font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "SF Pro Display", sans-serif;
    color: #FFFFFF;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0 64px;
    justify-content: space-between;
  }}

  .glow-border {{
    position: absolute;
    inset: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    pointer-events: none;
  }}

  .left-col {{
    width: 530px;
    display: flex;
    flex-direction: column;
    z-index: 2;
  }}

  .brand-row {{
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }}

  .app-icon {{
    width: 58px;
    height: 58px;
    border-radius: 14px;
    box-shadow: 0 10px 25px rgba(0, 113, 227, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2);
  }}

  .brand-title-wrap {{
    display: flex;
    flex-direction: column;
  }}

  .brand-name {{
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .brand-badge {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    background: rgba(41, 151, 255, 0.14);
    border: 1px solid rgba(41, 151, 255, 0.3);
    border-radius: 999px;
    font-size: 11px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
    font-weight: 600;
    color: #60A5FA;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }}

  .headline {{
    font-size: 42px;
    font-weight: 800;
    line-height: 1.14;
    letter-spacing: -0.03em;
    margin-bottom: 16px;
    color: #FFFFFF;
  }}

  .headline-gradient {{
    background: linear-gradient(135deg, #38BDF8 0%, #818CF8 60%, #C084FC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }}

  .subhead {{
    font-size: 16.5px;
    line-height: 1.5;
    color: #94A3B8;
    margin-bottom: 24px;
    font-weight: 400;
    max-width: 500px;
  }}

  .feature-tags {{
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 28px;
  }}

  .tag-item {{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    font-weight: 600;
    color: #E2E8F0;
  }}

  .tag-icon {{
    width: 20px;
    height: 20px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }}

  .tag-icon.check {{
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }}

  .tag-icon.sparkle {{
    background: rgba(0, 113, 227, 0.18);
    color: #60A5FA;
    border: 1px solid rgba(0, 113, 227, 0.35);
  }}

  .tag-icon.box {{
    background: rgba(168, 85, 247, 0.15);
    color: #C084FC;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }}

  .footer-meta {{
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: #64748B;
    font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
  }}

  .domain {{
    color: #38BDF8;
    font-weight: 600;
  }}

  .status-dot {{
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10B981;
  }}

  .right-col {{
    position: relative;
    width: 530px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }}

  .mac-window {{
    width: 540px;
    background: #161922;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 
      0 30px 60px -12px rgba(0, 0, 0, 0.85),
      0 0 45px rgba(0, 113, 227, 0.22);
    overflow: hidden;
    position: relative;
  }}

  .mac-titlebar {{
    height: 34px;
    background: #1E232E;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 8px;
    position: relative;
  }}

  .mac-dot {{
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }}
  .mac-dot.close {{ background: #FF5F56; }}
  .mac-dot.min {{ background: #FFBD2E; }}
  .mac-dot.max {{ background: #27C93F; }}

  .mac-title {{
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11.5px;
    color: #94A3B8;
    font-weight: 500;
  }}

  .mac-shot {{
    width: 100%;
    display: block;
    aspect-ratio: 1440 / 900;
    object-fit: cover;
    object-position: top center;
  }}

  .floating-pill {{
    position: absolute;
    bottom: -12px;
    left: 24px;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 12px;
    padding: 10px 16px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    gap: 12px;
  }}

  .floating-pill .val {{
    font-size: 18px;
    font-weight: 800;
    color: #38BDF8;
    font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
  }}

  .floating-pill .desc {{
    font-size: 11.5px;
    color: #CBD5E1;
    line-height: 1.3;
  }}

  .floating-pill .desc strong {{
    color: #FFFFFF;
    display: block;
  }}
</style>
</head>
<body>
  <div class="glow-border"></div>

  <div class="left-col">
    <div class="brand-row">
      <img src="data:image/png;base64,{icon_b64}" class="app-icon" alt="LayerZero Icon" />
      <div class="brand-title-wrap">
        <div class="brand-name">LayerZero Studio</div>
        <div style="margin-top: 4px;">
          <span class="brand-badge">Trợ lý AI · In 3D Bambu & Prusa</span>
        </div>
      </div>
    </div>

    <h1 class="headline">
      In 3D đẹp ngay từ đầu.<br/>
      <span class="headline-gradient">Vừa làm vừa hiểu sâu.</span>
    </h1>

    <p class="subhead">
      Giải phẫu file .3mf bằng toán học 3D và AI cá nhân để tự động quét lỗi, sửa phẳng đáy bám bàn và tối ưu 17 thông số Slicer.
    </p>

    <div class="feature-tags">
      <div class="tag-item">
        <div class="tag-icon check">✓</div>
        <span>Tự động phát hiện & sửa phẳng đáy Z = 0 bám bàn PEI</span>
      </div>
      <div class="tag-item">
        <div class="tag-icon box">◈</div>
        <span>Giải tích lưới 3D, độ võng Overhang & gia cố Support</span>
      </div>
      <div class="tag-item">
        <div class="tag-icon sparkle">✦</div>
        <span>Kết nối AI cá nhân (agy CLI) giải thích từng thông số</span>
      </div>
    </div>

    <div class="footer-meta">
      <span class="domain">layerzero.io.vn</span>
      <span>•</span>
      <span style="display:flex; align-items:center; gap:6px;">
        <span class="status-dot"></span> macOS · Windows · Linux
      </span>
      <span>•</span>
      <span>Miễn phí 100%</span>
    </div>
  </div>

  <div class="right-col">
    <div class="mac-window">
      <div class="mac-titlebar">
        <div class="mac-dot close"></div>
        <div class="mac-dot min"></div>
        <div class="mac-dot max"></div>
        <div class="mac-title">LayerZero Studio v2.0 — Triceratops.3mf</div>
      </div>
      <img src="data:image/png;base64,{shot_b64}" class="mac-shot" alt="LayerZero Studio Screen" />
    </div>

    <div class="floating-pill">
      <div class="val">100%</div>
      <div class="desc">
        <strong>Tối ưu tự động file .3mf</strong>
        Bảo toàn khớp chuyển động & độ bám bàn
      </div>
    </div>
  </div>
</body>
</html>
"""

    tmp_html = "/tmp/og_template.html"
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(html)

    chrome_candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "google-chrome",
        "chromium"
    ]
    chrome_bin = None
    for cand in chrome_candidates:
        if Path(cand).exists() or subprocess.run(["which", cand], capture_output=True).returncode == 0:
            chrome_bin = cand
            break

    if not chrome_bin:
        print("Error: Google Chrome or Chromium not found.", file=sys.stderr)
        sys.exit(1)

    print(f"Generating OG image using {chrome_bin}...")
    subprocess.run([
        chrome_bin,
        "--headless=new",
        f"--screenshot={OUTPUT_PATH}",
        "--window-size=1200,630",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"file://{tmp_html}"
    ], check=True)

    with Image.open(OUTPUT_PATH) as im:
        print(f"✅ Generated {OUTPUT_PATH} ({im.size[0]}x{im.size[1]}, {os.path.getsize(OUTPUT_PATH):,} bytes)")

if __name__ == "__main__":
    main()
