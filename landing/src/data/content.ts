export interface ProblemCase {
  id:
    | 'flatten-bottom'
    | 'reinforce-supports'
    | 'bed-slinger-inertia'
    | 'screw-tolerance'
    | 'dome-stair-stepping'
    | 'flat-top-ironing'
    | 'cylinder-scarf-seam';
  pillar: 'safety' | 'aesthetics';
  pillarLabel: string;
  actionCode: string;
  shortTitle: string;
  title: string;
  oneLineSummary: string;
  learnedConcept: string;
  image: string;
  metrics: {
    label: string;
    before: string;
    after: string;
  }[];
  slicerKeys: {
    key: string;
    value: string;
  }[];
}

export interface DiffSettingRow {
  key: string;
  label: string;
  category: 'aesthetics' | 'adhesion' | 'kinematics' | 'support';
  categoryLabel: string;
  defaultVal: string;
  authorVal: string;
  proposedVal: string;
  whatItDoes: string;
  shortWhy: string;
  impactBadge: string;
  zoneLabel: string;
}

export const PROBLEM_CASES: ProblemCase[] = [
  {
    id: 'flatten-bottom',
    pillar: 'safety',
    pillarLabel: 'An toàn & Bám bàn',
    actionCode: 'FLATTEN_BOTTOM',
    shortTitle: 'Đáy khớp cầu chạm điểm nhỏ',
    title: 'Cắt phẳng đáy Z = 0.80mm giúp tăng 310% diện tích bám bàn PEI',
    oneLineSummary:
      'Khớp cầu chạm bàn chỉ vài mm² rất dễ lắc bung. LayerZero tự động vát phẳng 0.80mm dưới đáy mà vẫn giữ nguyên biên dạng khớp.',
    learnedConcept:
      'Độ bám bàn bền vững quyết định bởi tiết diện tiếp xúc tại Layer 1.',
    image: '/images/prob-flatten-bottom.jpg',
    metrics: [
      { label: 'Tiết diện Z = 0', before: '2.4 x 2.1 mm', after: '9.8 x 9.4 mm (+310%)' },
      { label: 'Lát cắt đáy Z', before: '0.00 mm (Đáy cầu)', after: '0.80 mm (Đáy phẳng)' },
      { label: 'Độ ổn định PEI', before: 'Dễ lắc bung', after: 'Khóa chặt Layer 1' },
    ],
    slicerKeys: [
      { key: 'z_cut_flatten_mm', value: '0.80 mm' },
      { key: 'initial_layer_print_height', value: '0.22 mm' },
      { key: 'elefant_foot_compensation', value: '0.12 mm' },
    ],
  },
  {
    id: 'reinforce-supports',
    pillar: 'safety',
    pillarLabel: 'An toàn & Bám bàn',
    actionCode: 'REINFORCE_SUPPORTS',
    shortTitle: 'Thiếu Support & Dính Blocker ẩn',
    title: 'Gỡ Support Blocker lỗi ở đế & bọc đài đỡ Tree Hybrid 360 độ',
    oneLineSummary:
      'Tự động quét thuộc tính paint_supports trong file .3mf, xóa các vùng chặn lỗi ở Z <= 8mm và sơn bổ sung nôi đỡ ôm sát gầm.',
    learnedConcept:
      'Tree Hybrid kết hợp khe hở Z-Top 0.20mm giúp đỡ vững mà bóc nhẹ bằng tay.',
    image: '/images/prob-reinforce-supports.jpg',
    metrics: [
      { label: 'Blocker lỗi ở đế', before: '142 tam giác chặn', after: '0 (Đã gỡ sạch)' },
      { label: 'Đài đỡ gầm Z <= 8mm', before: 'Hẫng tự do', after: 'Bọc 360 độ' },
      { label: 'Tốc độ cầu nối Bridge', before: '50 mm/s', after: '25 mm/s + Quạt 100%' },
    ],
    slicerKeys: [
      { key: 'support_style', value: 'tree_hybrid' },
      { key: 'support_top_z_distance', value: '0.20 mm' },
      { key: 'bridge_speed', value: '25 mm/s' },
    ],
  },
  {
    id: 'bed-slinger-inertia',
    pillar: 'safety',
    pillarLabel: 'An toàn & Bám bàn',
    actionCode: 'ROTATE_YAW',
    shortTitle: 'Chống giật bàn trượt trục Y',
    title: 'Xoay dọc chi tiết cao mảnh theo trục Y & hạ gia tốc chống lật',
    oneLineSummary:
      'Chuyển file từ máy CoreXY sang máy bàn trượt (A1) dễ làm đổ vật cao. Phần mềm tự xoay chi tiết song song trục Y và hạ gia tốc.',
    learnedConcept:
      'Đặt cạnh dài song song trục trượt Y giúp triệt tiêu mô-men quán tính lật.',
    image: '/images/prob-bed-slinger.jpg',
    metrics: [
      { label: 'Gia tốc Travel', before: '10,000 mm/s²', after: '4,000 mm/s²' },
      { label: 'Hướng đặt vật cao', before: 'Ngang trục Y', after: 'Xoay dọc trục Y (90°)' },
      { label: 'Nhấc đầu phun Z-Hop', before: 'Auto / Spiral', after: 'Normal Lift 0.80 mm' },
    ],
    slicerKeys: [
      { key: 'travel_acceleration', value: '4000 mm/s²' },
      { key: 'retract_lift_top', value: '0.80 mm (Normal)' },
      { key: 'slow_down_layer_time', value: '10 s' },
    ],
  },
  {
    id: 'screw-tolerance',
    pillar: 'safety',
    pillarLabel: 'An toàn & Bám bàn',
    actionCode: 'OPTIMIZE_SCREW',
    shortTitle: 'Gia cố ốc vít & Dung sai lỗ',
    title: 'Tăng 6 vòng tường đặc riêng cho ốc vít & bù dung sai vặn mượt',
    oneLineSummary:
      'Chỉ gán Per-Object Settings cho đúng chi tiết ốc: 6 Walls đồng tâm chống gãy xoắn, Brim 5mm giữ rãnh tua-vít và mở rộng nhẹ lỗ ren.',
    learnedConcept:
      'Dùng Per-Object Override giúp gia cố chi tiết chịu lực mà không làm chậm cả bàn in.',
    image: '/images/prob-screw-tolerance.jpg',
    metrics: [
      { label: 'Kết cấu thân ốc', before: '2 Walls + Infill rỗng', after: '6 Walls Concentric đặc' },
      { label: 'Tốc độ in bước ren', before: '150 mm/s', after: '35 mm/s' },
      { label: 'Bù dung sai lỗ X-Y', before: '0.00 mm (Kẹt ren)', after: '+0.06 mm (Vặn mượt)' },
    ],
    slicerKeys: [
      { key: 'wall_loops (Per-Object)', value: '6 loops' },
      { key: 'xy_hole_compensation', value: '+0.06 mm' },
      { key: 'brim_object_gap', value: '0.04 mm' },
    ],
  },
  {
    id: 'dome-stair-stepping',
    pillar: 'aesthetics',
    pillarLabel: 'Thẩm mỹ Bề mặt',
    actionCode: 'ADAPTIVE_LAYER_DOME',
    shortTitle: 'Xóa bậc thang đỉnh vòm',
    title: 'Làm mịn mặt cầu bằng lớp cắt 0.16mm & đường nhựa đồng tâm',
    oneLineSummary:
      'Phát hiện pháp tuyến vòm thoai thoải ở đỉnh (0.70 < normal_z < 0.98) để chuyển sang Layer 0.16mm và mẫu lấp Concentric.',
    learnedConcept:
      'Đường nhựa Concentric chạy ôm theo độ cong giúp xóa rãnh bậc thang trên đỉnh vòm.',
    image: '/images/prob-dome-stair.jpg',
    metrics: [
      { label: 'Độ dày lớp cắt', before: '0.20 mm', after: '0.16 mm Optimal' },
      { label: 'Mẫu mặt đỉnh', before: 'Monotonic Line', after: 'Concentric (Đồng tâm)' },
      { label: 'Chồng lớp Overhang', before: 'Tiêu chuẩn', after: '+25% diện tích đỡ' },
    ],
    slicerKeys: [
      { key: 'layer_height', value: '0.16 mm' },
      { key: 'top_surface_pattern', value: 'concentric' },
      { key: 'ensure_vertical_shell_thickness', value: 'enabled' },
    ],
  },
  {
    id: 'flat-top-ironing',
    pillar: 'aesthetics',
    pillarLabel: 'Thẩm mỹ Bề mặt',
    actionCode: 'IRONING_FLAT_TOP',
    shortTitle: 'Là phẳng mặt đỉnh như đúc',
    title: 'Per-Object Ironing làm láng mịn bề mặt hộp phẳng ngang',
    oneLineSummary:
      'Tự động đo diện tích mặt phẳng đỉnh (normal_z >= 0.995) để bật Ironing riêng cho đúng chi tiết đó với thông số chuẩn PLA.',
    learnedConcept:
      'Ironing dùng đầu phun nóng đi là lại với 12% lưu lượng nhựa để xóa sạch rãnh sợi.',
    image: '/images/prob-flat-ironing.jpg',
    metrics: [
      { label: 'Phạm vi Ironing', before: 'Tắt / Toàn cục', after: 'Per-Object Topmost' },
      { label: 'Lưu lượng & Tốc độ', before: '10% @ 15 mm/s', after: '12% @ 30 mm/s' },
      { label: 'Khoảng cách đường là', before: '0.10 mm', after: '0.15 mm' },
    ],
    slicerKeys: [
      { key: 'ironing_type (Per-Object)', value: 'topmost' },
      { key: 'ironing_flow', value: '12%' },
      { key: 'ironing_speed', value: '30 mm/s' },
    ],
  },
  {
    id: 'cylinder-scarf-seam',
    pillar: 'aesthetics',
    pillarLabel: 'Thẩm mỹ Bề mặt',
    actionCode: 'SCARF_SEAM_CYLINDER',
    shortTitle: 'Giấu sẹo Z-Seam thân trụ',
    title: 'Mối nối vát chéo Scarf Seam & Nội suy cung tròn G2/G3',
    oneLineSummary:
      'Chi tiết trụ tròn không có góc khuất sẽ được vát mỏng hai đầu mối nối lớp (Scarf Joint) kết hợp đường chạy cung tròn G2/G3.',
    learnedConcept:
      'Scarf Joint chồng mép nhựa vát nghiêng giúp xóa đường sẹo dọc trên mặt trụ.',
    image: '/images/prob-cylinder-seam.jpg',
    metrics: [
      { label: 'Kiểu mối nối lớp', before: 'Butt Joint (Lộ sẹo)', after: 'Scarf Joint External' },
      { label: 'Đường chạy mặt cong', before: 'Đoạn thẳng G1', after: 'Cung tròn G2/G3' },
      { label: 'Bộ sinh tường mỏng', before: 'Classic', after: 'Arachne biến thiên' },
    ],
    slicerKeys: [
      { key: 'seam_slope_type', value: 'external' },
      { key: 'arc_fitting', value: 'G2/G3 (0.012mm)' },
      { key: 'wall_generator', value: 'arachne' },
    ],
  },
];

export const DIFF_SETTINGS_SHOWCASE: DiffSettingRow[] = [
  {
    key: 'wall_generator',
    label: 'Bộ sinh đường tường (Wall Generator)',
    category: 'aesthetics',
    categoryLabel: 'Thẩm mỹ',
    zoneLabel: 'Chi tiết mỏng & Đỉnh',
    defaultVal: 'classic',
    authorVal: 'classic',
    proposedVal: 'arachne',
    whatItDoes:
      'Điều khiển thuật toán bơm nhựa cho các vách mỏng: giữ nét cố định (Classic) hay tự động co giãn độ rộng sợi nhựa (Arachne).',
    shortWhy:
      'Mẫu in có các gai sừng và khớp vát mỏng dưới 0.8mm. Dùng Arachne giúp đầu phun biến thiên bề rộng nét từ 0.28mm đến 0.65mm, lấp kín khe hở giữa 2 vách mà không bị rỗng ruột.',
    impactBadge: 'Xóa khe hở vách mỏng · Chữ & Gờ sắc nét',
  },
  {
    key: 'outer_wall_speed',
    label: 'Tốc độ vách ngoài (Outer Wall Speed)',
    category: 'aesthetics',
    categoryLabel: 'Thẩm mỹ',
    zoneLabel: 'Bề mặt vách ngoài',
    defaultVal: '200 mm/s',
    authorVal: '200 mm/s',
    proposedVal: '120 mm/s',
    whatItDoes:
      'Quyết định tốc độ di chuyển của đầu phun khi vẽ đường chu vi ngoài cùng nơi mắt người nhìn thấy trực tiếp.',
    shortWhy:
      'In ở 200 mm/s khiến lưu lượng chảy biến thiên đột ngột giữa các lớp có chu vi khác nhau, tạo ra vệt bóng mờ không đều. Hạ xuống 120 mm/s giúp nhựa PLA chảy ổn định và bóng đồng nhất từ đáy lên đỉnh.',
    impactBadge: 'Đồng nhất độ bóng · Giảm vân Ghosting',
  },
  {
    key: 'travel_acceleration',
    label: 'Gia tốc di chuyển (Travel Acceleration)',
    category: 'kinematics',
    categoryLabel: 'Động học',
    zoneLabel: 'Thân mô hình cao',
    defaultVal: '10,000 mm/s²',
    authorVal: '10,000 mm/s²',
    proposedVal: '4,000 mm/s²',
    whatItDoes:
      'Kiểm soát độ giật của bàn in trục Y mỗi khi đầu phun nhảy nhanh giữa các vùng không in.',
    shortWhy:
      'File gốc cấu hình cho máy CoreXY (bàn đứng yên). Khi đem sang máy bàn trượt như Bambu A1, gia tốc 10,000 mm/s² sẽ giật mạnh bàn in làm rung hoặc gãy đổ chi tiết cao.',
    impactBadge: 'Giảm 60% lực giật bàn Y · Chống lật vật cao',
  },
  {
    key: 'support_top_z_distance',
    label: 'Khe hở đỉnh Support & Vành Brim',
    category: 'support',
    categoryLabel: 'Bám bàn & Đỡ',
    zoneLabel: 'Đế tiếp xúc & Mặt gầm',
    defaultVal: '0.20 mm / auto',
    authorVal: '0.15 mm / no_brim',
    proposedVal: '0.20 mm + Brim 8mm',
    whatItDoes:
      'Định nghĩa khoảng cách tách lớp giữa đỉnh cây chống (Support) với mặt dưới vật in và vành giữ chân đế trên bàn PEI.',
    shortWhy:
      'File gốc để khe hở 0.15mm làm nhựa dính chết vào Support rất khó gỡ, đồng thời tắt Brim khiến khớp cầu dễ bung. Tăng lên 0.20mm kèm 3 lớp Interface và Brim 8mm (gap 0.08mm) giúp bám chắc khi in nhưng bóc nhẹ bằng tay.',
    impactBadge: 'Bóc Support sạch tay · Khóa chặt Layer 1',
  },
];
