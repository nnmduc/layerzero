/**
 * User-facing release history for /changelog (Vietnamese, newest first).
 * The developer-facing English history lives in the repo's CHANGELOG.md.
 * Download links point at each version's own files, never at "latest", so old versions stay downloadable.
 */

export interface ChangelogDownload {
  label: string;
  ext: string;
  url: string;
}

export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogVersion {
  version: string;
  date: string;
  badge?: 'latest' | 'launch';
  summary: string;
  sections: ChangelogSection[];
  /** Empty when the version shipped no installers of its own. */
  downloads: ChangelogDownload[];
  noDownloadNote?: string;
}

const MAC_BASE = 'https://dl.layerzero.io.vn';
const GITHUB_RELEASES = 'https://github.com/nnmduc/layerzero/releases/download';

/** The six installers every published release ships: macOS on R2, Windows and Linux on GitHub Releases. */
const installersFor = (v: string): ChangelogDownload[] => [
  { label: 'macOS Apple Silicon', ext: '.dmg', url: `${MAC_BASE}/LayerZero_${v}_Apple_Silicon_arm64.dmg` },
  { label: 'macOS Intel', ext: '.dmg', url: `${MAC_BASE}/LayerZero_${v}_Intel_x64.dmg` },
  { label: 'Windows', ext: '.exe', url: `${GITHUB_RELEASES}/v${v}/LayerZero_${v}_Windows_x64-setup.exe` },
  { label: 'Windows', ext: '.msi', url: `${GITHUB_RELEASES}/v${v}/LayerZero_${v}_Windows_x64.msi` },
  { label: 'Linux', ext: '.AppImage', url: `${GITHUB_RELEASES}/v${v}/LayerZero_${v}_Linux_x64.AppImage` },
  { label: 'Linux', ext: '.deb', url: `${GITHUB_RELEASES}/v${v}/LayerZero_${v}_Linux_amd64.deb` },
];

export const CHANGELOG: ChangelogVersion[] = [
  {
    version: '2.2.0',
    date: '06/11/2026',
    badge: 'latest',
    summary: 'Hỗ trợ Bambu PLA Lite, PLA Basic và PETG HF trên A1, A1 mini, P1S và X1C.',
    sections: [
      {
        title: 'Tính năng mới',
        items: [
          'Tự chọn đúng preset Bambu Studio cho từng máy in và từng loại nhựa.',
          'Nhiệt độ bàn theo đúng loại mặt bàn trong file: Textured PEI, Smooth PEI, Cool Plate…',
          'Quy tắc riêng cho PETG: khe hở Support từ 0.2 mm, Brim gap từ 0.1 mm, Z-Hop Spiral Lift.',
          'Thẻ lưu ý vật liệu: sấy PETG, bôi keo trên Smooth PEI, mở cửa máy kín khi in PLA.',
          'Bảng vật liệu hiển thị preset, mặt bàn và slot AMS; chọn vật liệu cho từng slot khi file trộn PLA và PETG.',
        ],
      },
      {
        title: 'Sửa lỗi',
        items: [
          'File nhiều màu không còn bị ghi đè mọi slot AMS; slot Support của tác giả được giữ nguyên.',
          'Chọn A1 mini hoặc P1S không còn ghi preset của A1; đổi máy in cập nhật đúng kích thước bàn.',
        ],
      },
    ],
    downloads: installersFor('2.2.0'),
  },
  {
    version: '2.1.0',
    date: '04/11/2026',
    summary: 'Tương thích Bambu Studio tốt hơn và giao diện gọn gàng hơn.',
    sections: [
      {
        title: 'Sửa lỗi & cải thiện',
        items: [
          'Scarf Joint Seam dùng đúng giá trị của Bambu Studio, hết cảnh báo reset khi mở file.',
          'Bảng thông số bên phải dạng thẻ hai tầng, không còn chữ chồng lên nhau.',
          'Bấm vào đề xuất sẽ tự chuyển tới đúng khay in; thêm bộ lọc theo khay.',
          'Gọn lại nút chế độ xem 3D; chú giải màu và tooltip không còn che nhau.',
        ],
      },
    ],
    downloads: installersFor('2.1.0'),
  },
  {
    version: '2.0.1',
    date: '04/11/2026',
    summary: 'Thêm Claude Code CLI và tối ưu cho màn hình nhỏ.',
    sections: [
      {
        title: 'Tính năng mới',
        items: [
          'Hỗ trợ Claude Code CLI bên cạnh agy; tự phát hiện và chọn CLI ngay trên giao diện.',
          'Giao diện gọn hơn trên màn hình dưới 1440px.',
          'Tải bản macOS trực tiếp từ dl.layerzero.io.vn.',
        ],
      },
    ],
    downloads: [],
    noDownloadNote: '2.1.0',
  },
  {
    version: '2.0.0',
    date: '04/11/2026',
    badge: 'launch',
    summary: 'Phiên bản đầu tiên của LayerZero Studio.',
    sections: [
      {
        title: 'Tính năng',
        items: [
          'Đọc file .3mf của Bambu Studio và PrusaSlicer, quét hàng triệu tam giác trong khoảng một giây.',
          'Phát hiện đáy khớp cầu nhỏ, thiếu Support, ốc vít, mặt vòm, mặt phẳng và thân trụ.',
          'Vá file không phá hủy: cắt phẳng đáy, Support 360°, cấu hình riêng cho từng chi tiết; giữ nguyên màu AMS.',
          'AI agy phân tích trực tiếp, tự chuyển sang chế độ Offline khi không có AI.',
          'Ứng dụng desktop cho macOS, Windows và Linux.',
        ],
      },
    ],
    downloads: installersFor('2.0.0'),
  },
];
