import React, { useEffect, useRef, useState } from 'react';
import { Viewport3D } from './components/Viewport3D';
import {
  AgentActivityLog,
  AuditReport,
  DiagnosticCard,
  ObjectTelemetry,
  SampleFile,
  TelemetryData,
} from './types';

const API_BASE =
  typeof window !== 'undefined' && window.location.port === '5173'
    ? ''
    : 'http://127.0.0.1:8000';

const IS_DESKTOP =
  typeof window !== 'undefined' &&
  ('__TAURI_INTERNALS__' in window || window.location.port !== '5173');

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [auditSource, setAuditSource] = useState<'none' | 'agy' | 'engine'>('none');
  const [samples, setSamples] = useState<SampleFile[]>([]);

  // Live Agent Activity Stream State
  const [agentLogs, setAgentLogs] = useState<AgentActivityLog[]>([]);
  const [showAgentDrawer, setShowAgentDrawer] = useState<boolean>(false);

  // Panel Visibility State (Left & Right Collapsible Sidebars)
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);

  // Filter & Selection State
  const [activePlateId, setActivePlateId] = useState<string>('1');
  const [leftPillarFilter, setLeftPillarFilter] = useState<'all' | 'safety' | 'aesthetics'>('all');
  const [rightCategoryFilter, setRightCategoryFilter] = useState<
    'all' | 'aesthetics' | 'adhesion' | 'kinematics' | 'support'
  >('all');
  const [viewMode, setViewMode] = useState<'support' | 'surface' | 'xray'>('support');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [flattenMm, setFlattenMm] = useState<number>(0.8);

  // Printer & Filament Presets
  const [printerPreset, setPrinterPreset] = useState<string>('Bambu Lab A1 0.4 nozzle');
  const [filamentPreset, setFilamentPreset] = useState<string>('Bambu PLA Lite @BBL A1');

  // Dynamic Island & Modals
  const [islandStatus, setIslandStatus] = useState<string>('Chọn file .3mf để bắt đầu');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const requestSeqRef = useRef<number>(0);
  const activeEsRef = useRef<EventSource | null>(null);

  // Load available local samples from ~/Downloads on startup (with retry while Tauri Python sidecar boots)
  useEffect(() => {
    let cancelled = false;
    const loadSamplesWithRetry = async (attempt = 0) => {
      try {
        const r = await fetch(`${API_BASE}/api/samples`);
        if (!r.ok) throw new Error('Backend booting');
        const list: SampleFile[] = await r.json();
        if (!cancelled) {
          setSamples(list);
          setIslandStatus('Chọn file .3mf để bắt đầu');
          setShowDropzone(true);
        }
      } catch {
        if (!cancelled && attempt < 25) {
          if (attempt === 0) {
            setIslandStatus('Đang khởi động nhân Python Sidecar...');
          }
          setTimeout(() => loadSamplesWithRetry(attempt + 1), 400);
        } else if (!cancelled) {
          setIslandStatus('Chọn file .3mf để bắt đầu');
          setShowDropzone(true);
        }
      }
    };
    loadSamplesWithRetry();
    return () => {
      cancelled = true;
    };
  }, []);

  const showToastMsg = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 3800);
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  // Stage 1: When a .3mf file is loaded, ONLY load 3D Geometry & Python Morphology Telemetry!
  // Wait for user to click "Run agy AI" (or click the Dynamic Island) before populating AI Audit results.
  const applyLoadedGeometry = (data: {
    session_id: string;
    telemetry: TelemetryData;
    audit: AuditReport;
  }) => {
    if (activeEsRef.current) {
      activeEsRef.current.close();
      activeEsRef.current = null;
    }
    setIsAnalyzing(false);
    setSessionId(data.session_id);
    setTelemetry(data.telemetry);
    setAudit(null); // Clear old audit so user clearly sees 3D Geometry first before running AI!
    setAuditSource('none');
    setSelectedCardId(null);

    if (data.telemetry.plates.length > 0) {
      const firstPlate = data.telemetry.plates[0];
      setActivePlateId(firstPlate.id);
      if (firstPlate.object_ids.length > 0) {
        setSelectedObjectId(firstPlate.object_ids[0]);
      } else if (data.telemetry.objects.length > 0) {
        setSelectedObjectId(data.telemetry.objects[0].id);
      }
    } else if (data.telemetry.objects.length > 0) {
      setSelectedObjectId(data.telemetry.objects[0].id);
    }

    setAgentLogs([
      {
        id: 'step-0',
        step: 'geometry_ready',
        title: `📐 Đã dựng 3D & đo đạc hình học ${data.telemetry.objects.length} chi tiết (${data.telemetry.plates.length} khay in)`,
        detail: `Sẵn sàng gửi hồ sơ hình học + đường dẫn file .3mf cho agy CLI phân tích chuyên sâu.`,
        elapsed_s: 0.0,
      },
    ]);
    setIslandStatus(
      `Đã tải 3D (${data.telemetry.objects.length} chi tiết) · Bấm để chạy agy AI Phân tích`
    );
    setShowDropzone(false);
  };

  const handleLoadLocalSample = async (path: string) => {
    const reqId = ++requestSeqRef.current;
    setIsLoadingFile(true);
    setShowDropzone(false);
    setIslandStatus('Đang giải nén .3mf & dựng lưới tam giác 3D...');
    try {
      const res = await fetch(`${API_BASE}/api/load-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          printer_preset: printerPreset,
          filament_preset: filamentPreset,
        }),
      });
      if (!res.ok) throw new Error('Không thể đọc file .3mf');
      const data = await res.json();
      if (reqId === requestSeqRef.current) {
        applyLoadedGeometry(data);
      }
    } catch (err: any) {
      if (reqId === requestSeqRef.current) {
        showToastMsg('Lỗi tải file', err.message || 'Không thể mở file .3mf');
      }
    } finally {
      if (reqId === requestSeqRef.current) {
        setIsLoadingFile(false);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    const reqId = ++requestSeqRef.current;
    setIsLoadingFile(true);
    setShowDropzone(false);
    setIslandStatus(`Đang tải lên & dựng mô hình 3D ${file.name}...`);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(
        `${API_BASE}/api/upload?printer_preset=${encodeURIComponent(
          printerPreset
        )}&filament_preset=${encodeURIComponent(filamentPreset)}`,
        {
          method: 'POST',
          body: form,
        }
      );
      if (!res.ok) throw new Error('File không hợp lệ');
      const data = await res.json();
      if (reqId === requestSeqRef.current) {
        applyLoadedGeometry(data);
      }
    } catch (err: any) {
      if (reqId === requestSeqRef.current) {
        showToastMsg('Lỗi tải file', err.message || 'Vui lòng chọn file .3mf');
      }
    } finally {
      if (reqId === requestSeqRef.current) {
        setIsLoadingFile(false);
      }
    }
  };

  // Stage 2: Trigger Unleashed Headless `agy` CLI Stream Analysis
  const triggerAgyAnalysis = () => {
    if (!sessionId || isAnalyzing) return;
    if (activeEsRef.current) {
      activeEsRef.current.close();
    }

    setIsAnalyzing(true);
    setShowAgentDrawer(true);
    setAgentLogs([]);
    setIslandStatus('Đang khởi chạy agy -p --dangerously-skip-permissions...');

    const url = `${API_BASE}/api/analyze/${sessionId}?printer_preset=${encodeURIComponent(
      printerPreset
    )}&filament_preset=${encodeURIComponent(filamentPreset)}`;
    const es = new EventSource(url);
    activeEsRef.current = es;

    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload.type === 'log') {
          setAgentLogs((prev) => [
            ...prev,
            {
              id: `${payload.step}-${prev.length}`,
              step: payload.step,
              title: payload.title,
              detail: payload.detail || '',
              elapsed_s: payload.elapsed_s ?? 0,
            },
          ]);
        } else if (payload.type === 'status') {
          setIslandStatus(payload.message);
        } else if (payload.type === 'complete' && payload.report) {
          const rep: AuditReport = payload.report;
          setAudit(rep);
          setAuditSource(payload.source === 'agy' ? 'agy' : 'engine');
          if (rep.diagnostic_cards.length > 0) {
            const firstC = rep.diagnostic_cards[0];
            setSelectedCardId(firstC.id);
            setSelectedObjectId(firstC.object_id);
            if (firstC.action_type === 'FLATTEN_BOTTOM') {
              setFlattenMm(firstC.param_value || 0.8);
            }
          }
          const sCnt = rep.diagnostic_cards.filter((c) => c.pillar === 'safety').length;
          const aCnt = rep.diagnostic_cards.filter((c) => c.pillar === 'aesthetics').length;
          setIslandStatus(`agy AI hoàn tất · ${sCnt} Chống lỗi + ${aCnt} Tối ưu độ đẹp`);
          setIsAnalyzing(false);
          es.close();
          activeEsRef.current = null;
          showToastMsg('agy AI Audit hoàn tất', rep.summary);
        }
      } catch {
        // ignore parse error
      }
    };

    es.onerror = () => {
      setIsAnalyzing(false);
      es.close();
      activeEsRef.current = null;
    };
  };

  // Stage 3: Export optimized .3mf or Open directly in Bambu Studio
  const handleApplyAndExport = async (openInBambu: boolean) => {
    if (!sessionId || !audit) {
      showToastMsg('Chưa có báo cáo tối ưu', 'Hãy bấm "Phân tích & Tối ưu bằng agy AI" trước khi xuất file.');
      return;
    }
    setIslandStatus(
      openInBambu ? 'Đang đóng gói .3mf & mở Bambu Studio...' : 'Đang đóng gói file .3mf tối ưu...'
    );
    try {
      const res = await fetch(`${API_BASE}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          diagnostic_cards: audit.diagnostic_cards,
          settings_diff: audit.settings_diff,
          printer_preset: printerPreset,
          filament_preset: filamentPreset,
          open_in_bambu: openInBambu,
          reveal_in_finder: !openInBambu && IS_DESKTOP,
        }),
      });
      if (!res.ok) throw new Error('Lỗi khi xuất file .3mf');
      const data = await res.json();
      setIslandStatus(`Đã xuất: ${data.output_filename}`);
      showToastMsg(
        openInBambu
          ? 'Đã mở trong Bambu Studio'
          : IS_DESKTOP
          ? 'Đã lưu vào ~/Downloads & mở Finder'
          : 'Đã xuất file .3mf tối ưu',
        data.output_filename
      );
      if (!openInBambu && !IS_DESKTOP && data.download_url) {
        window.location.href = `${API_BASE}${data.download_url}`;
      }
    } catch (err: any) {
      showToastMsg('Lỗi khi xuất file', err.message);
    }
  };

  const toggleCardApproval = (cardId: string, checked: boolean) => {
    if (!audit) return;
    setAudit({
      ...audit,
      diagnostic_cards: audit.diagnostic_cards.map((c) =>
        c.id === cardId ? { ...c, approved: checked } : c
      ),
    });
  };

  const handleFlattenChange = (val: number) => {
    setFlattenMm(val);
    if (!audit) return;
    setAudit({
      ...audit,
      diagnostic_cards: audit.diagnostic_cards.map((c) =>
        c.action_type === 'FLATTEN_BOTTOM' ? { ...c, param_value: val } : c
      ),
    });
  };

  const toggleSettingApproval = (key: string, objId: string, checked: boolean) => {
    if (!audit) return;
    setAudit({
      ...audit,
      settings_diff: audit.settings_diff.map((s) =>
        s.key === key && s.object_id === objId ? { ...s, approved: checked } : s
      ),
    });
  };

  const editSettingValue = (key: string, objId: string, newVal: string) => {
    if (!audit) return;
    setAudit({
      ...audit,
      settings_diff: audit.settings_diff.map((s) =>
        s.key === key && s.object_id === objId ? { ...s, proposed_val: newVal } : s
      ),
    });
  };

  const approveAll = () => {
    if (!audit) return;
    setAudit({
      ...audit,
      diagnostic_cards: audit.diagnostic_cards.map((c) => ({ ...c, approved: true })),
      settings_diff: audit.settings_diff.map((s) => ({ ...s, approved: true })),
    });
  };

  // Derived data for UI
  const cards = audit?.diagnostic_cards || [];
  const filteredCards =
    leftPillarFilter === 'all' ? cards : cards.filter((c) => c.pillar === leftPillarFilter);

  const settings = audit?.settings_diff || [];
  const filteredSettings =
    rightCategoryFilter === 'all'
      ? settings
      : settings.filter((s) => s.category === rightCategoryFilter);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
  const activeObject: ObjectTelemetry | undefined = telemetry?.objects.find(
    (o) => o.id === selectedObjectId
  );

  const activePlate = telemetry?.plates.find((p) => p.id === activePlateId);
  const activePlateObjectIds = activePlate ? activePlate.object_ids : [];

  const approvedCardsCount = cards.filter((c) => c.approved).length;
  const approvedSettingsCount = settings.filter((s) => s.approved).length;
  const totalItems = cards.length + settings.length;
  const totalApproved = approvedCardsCount + approvedSettingsCount;

  const safetyBefore = audit?.safety_score_before ?? 45;
  const beautyBefore = audit?.aesthetics_score_before ?? 58;
  const ratio = totalItems > 0 ? totalApproved / totalItems : 1;
  const liveSafetyScore = Math.round(safetyBefore + (98 - safetyBefore) * ratio);
  const liveBeautyScore = Math.round(beautyBefore + (96 - beautyBefore) * ratio);

  const getCardIcon = (actionType: DiagnosticCard['action_type']) => {
    switch (actionType) {
      case 'FLATTEN_BOTTOM':
        return { icon: 'ph-globe-hemisphere-west', color: 'text-[#FF3B30] bg-[#FF3B30]/12' };
      case 'REINFORCE_SUPPORTS':
        return { icon: 'ph-paint-brush-broad', color: 'text-[#FF9F0A] bg-[#FF9F0A]/15' };
      case 'OPTIMIZE_SCREW':
        return { icon: 'ph-screw', color: 'text-[#FF3B30] bg-[#FF3B30]/12' };
      case 'ROTATE_YAW':
        return { icon: 'ph-arrows-clockwise', color: 'text-[#0071E3] bg-[#0071E3]/12' };
      case 'ADAPTIVE_LAYER_DOME':
        return { icon: 'ph-subtract-square', color: 'text-[#5856D6] bg-[#5856D6]/12' };
      case 'IRONING_FLAT_TOP':
        return { icon: 'ph-square-half-bottom', color: 'text-[#30B0C7] bg-[#30B0C7]/15' };
      case 'SCARF_SEAM_CYLINDER':
        return { icon: 'ph-cylinder', color: 'text-[#0071E3] bg-[#0071E3]/12' };
      case 'FUZZY_SKIN':
        return { icon: 'ph-magic-wand', color: 'text-[#6E6E73] bg-black/[0.06] dark:bg-white/[0.1]' };
      default:
        return { icon: 'ph-sparkle', color: 'text-[#0071E3] bg-[#0071E3]/12' };
    }
  };

  return (
    <div className="relative flex flex-col h-[100dvh] w-full overflow-hidden">
      {/* ===================================================================== */}
      {/* TOP NAVIGATION BAR (56px, Compact & Screen-Size Resilient)            */}
      {/* ===================================================================== */}
      <header className="h-14 px-4 flex items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#161618]/80 backdrop-blur-xl z-30 shrink-0">
        {/* Left: Toggle Left Sidebar + Brand + Active 3MF File + Printer/Filament Preset */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setShowLeftPanel((v) => !v)}
            data-tip={showLeftPanel ? 'Thu gọn bảng Chẩn đoán trái' : 'Mở bảng Chẩn đoán trái'}
            data-tip-pos="bottom"
            className={`w-8 h-8 rounded-[9px] flex items-center justify-center spring-transition shrink-0 ${
              showLeftPanel
                ? 'bg-[#0071E3]/12 text-[#0071E3]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <i className="ph-bold ph-sidebar-simple text-base"></i>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-[10px] bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] flex items-center justify-center shadow-sm shrink-0">
              <i className="ph-bold ph-cube-focus text-lg"></i>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-semibold tracking-tight text-[14.5px]">LayerZero</span>
              <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6]">
                v2.0
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-black/[0.08] dark:bg-white/[0.1] shrink-0"></div>

          {/* Active 3MF File Selector */}
          <button
            onClick={() => setShowDropzone(true)}
            data-tip="Mở hoặc đổi file mô hình .3mf khác"
            data-tip-pos="bottom"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-[0.98] spring-transition text-left min-w-0"
          >
            <i className="ph-fill ph-file-archive text-[#0071E3] text-base shrink-0"></i>
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium leading-none flex items-center gap-1.5">
                <span className="max-w-[145px] xl:max-w-[180px] truncate">
                  {telemetry ? telemetry.filename : 'Chọn file .3mf...'}
                </span>
                <i className="ph-bold ph-folder-open text-[#0071E3] text-xs shrink-0"></i>
              </div>
              <div className="text-[10.5px] text-[#6E6E73] dark:text-[#8E8E93] font-mono mt-0.5 whitespace-nowrap">
                {telemetry
                  ? `${telemetry.plates.length}P · ${telemetry.objects.length}Obj · ${telemetry.file_size_mb}MB`
                  : 'Bambu & Prusa .3mf'}
              </div>
            </div>
          </button>

          {/* Target Printer & Filament Selector */}
          <div
            data-tip="Cấu hình máy in & vật liệu nhựa mục tiêu"
            data-tip-pos="bottom"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] text-[11.5px] shrink-0 whitespace-nowrap"
          >
            <i className="ph-bold ph-printer text-[#0071E3]"></i>
            <select
              value={printerPreset}
              onChange={(e) => setPrinterPreset(e.target.value)}
              className="bg-transparent font-medium text-[#1D1D1F] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="Bambu Lab A1 0.4 nozzle">A1 (0.4mm PEI)</option>
              <option value="Bambu Lab A1 mini 0.4 nozzle">A1 Mini (0.4mm)</option>
              <option value="Bambu Lab P1S 0.4 nozzle">P1S / X1C</option>
            </select>
            <span className="opacity-30">|</span>
            <span className="w-2 h-2 rounded-full bg-white border border-black/25 inline-block shrink-0"></span>
            <select
              value={filamentPreset}
              onChange={(e) => setFilamentPreset(e.target.value)}
              className="bg-transparent font-medium text-[#6E6E73] dark:text-[#A1A1A6] focus:outline-none cursor-pointer"
            >
              <option value="Bambu PLA Lite @BBL A1">PLA Lite</option>
              <option value="Bambu PLA Basic @BBL A1">PLA Basic</option>
              <option value="Bambu PETG HF @BBL A1">PETG HF</option>
            </select>
          </div>
        </div>

        {/* Center: Dynamic Island Headless `agy` Status & Log Drawer Toggle */}
        <div className="flex items-center min-w-0 shrink">
          <button
            onClick={() => {
              if (!audit && !isAnalyzing && sessionId) {
                triggerAgyAnalysis();
              } else {
                setShowAgentDrawer(!showAgentDrawer);
              }
            }}
            data-tip={`Nhật ký suy luận agy AI (${agentLogs.length} bước) — Bấm để đóng/mở`}
            data-tip-pos="bottom"
            className="apple-pill-glass px-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] spring-transition min-w-0"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isAnalyzing || isLoadingFile
                  ? 'bg-[#FF9F0A] animate-ping'
                  : audit
                  ? 'bg-[#28CD41]'
                  : 'bg-[#0071E3]'
              }`}
            ></span>
            <span className="text-[11.5px] font-medium tracking-tight max-w-[190px] xl:max-w-[270px] truncate">
              {islandStatus}
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap">
              <i className="ph-bold ph-terminal-window"></i>
              <span>{agentLogs.length}</span>
            </span>
          </button>
        </div>

        {/* Right: Compact Icon Actions with Tooltips */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <button
            onClick={toggleTheme}
            data-tip={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            data-tip-pos="bottom-right"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] spring-transition shrink-0"
          >
            <i className={`ph ${darkMode ? 'ph-sun' : 'ph-moon'} text-base`}></i>
          </button>

          <button
            onClick={() => handleApplyAndExport(false)}
            disabled={!audit}
            data-tip="Xuất file .3mf tối ưu vào ~/Downloads"
            data-tip-pos="bottom-right"
            className={`w-8 h-8 rounded-full text-[13px] font-medium spring-transition flex items-center justify-center shrink-0 ${
              audit
                ? 'text-[#1D1D1F] dark:text-white bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.15] active:scale-[0.96]'
                : 'opacity-40 cursor-not-allowed bg-black/[0.04] dark:bg-white/[0.05]'
            }`}
          >
            <i className="ph-bold ph-download-simple text-base"></i>
          </button>

          <button
            onClick={() => handleApplyAndExport(true)}
            disabled={!audit}
            data-tip="Áp dụng tối ưu & Mở trực tiếp trong Bambu Studio"
            data-tip-pos="bottom-right"
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium text-white shadow-sm spring-transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              audit
                ? 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98]'
                : 'bg-[#0071E3]/40 cursor-not-allowed'
            }`}
          >
            <i className="ph-bold ph-arrow-square-out text-sm"></i>
            <span>Bambu Studio</span>
          </button>

          <button
            onClick={() => setShowRightPanel((v) => !v)}
            data-tip={showRightPanel ? 'Thu gọn bảng Thông số phải' : 'Mở bảng Thông số phải'}
            data-tip-pos="bottom-right"
            className={`w-8 h-8 rounded-[9px] flex items-center justify-center spring-transition shrink-0 ${
              showRightPanel
                ? 'bg-[#0071E3]/12 text-[#0071E3]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
            }`}
          >
            <i className="ph-bold ph-sidebar-simple text-base scale-x-[-1]"></i>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* EXPANDABLE AGENT LIVE TERMINAL DRAWER (Shows every `agy` action)      */}
      {/* ===================================================================== */}
      {showAgentDrawer && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[680px] max-w-[92vw] apple-glass rounded-[20px] p-4 z-40 shadow-2xl border border-white/60 dark:border-white/15">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] flex items-center justify-center">
                <i className="ph-bold ph-terminal-window text-sm"></i>
              </div>
              <div>
                <div className="text-[13px] font-semibold flex items-center gap-2">
                  <span>Tiến trình Suy luận & Hành động của agy AI (Unleashed Mode)</span>
                  {isAnalyzing && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A]">
                      Đang thực thi...
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] font-mono">
                  Toàn quyền gọi Bash, Python, đọc XML/JSON & đối chiếu hình học 3D
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sessionId && !isAnalyzing && (
                <button
                  onClick={triggerAgyAnalysis}
                  className="px-3 py-1 rounded-full text-[11.5px] font-medium bg-[#0071E3] text-white hover:bg-[#0077ED]"
                >
                  Chạy lại agy AI
                </button>
              )}
              <button
                onClick={() => setShowAgentDrawer(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#6E6E73] hover:bg-black/5 dark:hover:bg-white/10"
              >
                <i className="ph-bold ph-x"></i>
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1 font-mono text-[11.5px]">
            {agentLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-semibold text-[12px] text-[#1D1D1F] dark:text-white">
                    {log.title}
                  </span>
                  <span className="text-[10.5px] text-[#6E6E73] shrink-0">+{log.elapsed_s}s</span>
                </div>
                {log.detail && (
                  <div className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] mt-1 break-all">
                    {log.detail}
                  </div>
                )}
              </div>
            ))}
            {isAnalyzing && (
              <div className="p-2.5 rounded-[10px] bg-[#0071E3]/[0.06] border border-[#0071E3]/20 flex items-center gap-2.5 text-[#0071E3]">
                <i className="ph-bold ph-spinner animate-spin text-sm"></i>
                <span className="font-sans text-[12px] font-medium">
                  agy đang kiểm tra mô hình & tổng hợp báo cáo JSON...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN WORKSPACE: 3-PANE APPLE STUDIO LAYOUT                            */}
      {/* ===================================================================== */}
      <main className="relative flex-1 flex overflow-hidden">
        {/* =================================================================== */}
        {/* LEFT PANE: STAGE 1 (GEOMETRY READY CTA) OR STAGE 2 (AI RESULTS)     */}
        {/* =================================================================== */}
        {showLeftPanel && (
          <aside className="w-[330px] xl:w-[360px] h-full flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-white/65 dark:bg-[#141416]/75 backdrop-blur-xl z-20 shrink-0">
            {!audit ? (
              /* STAGE 1: 3D Geometry Loaded -> Waiting for User to Run `agy` AI */
              <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-semibold text-[#6E6E73] dark:text-[#A1A1A6]">
                    Bảng Chẩn đoán & Chi tiết 3D
                  </span>
                  <button
                    onClick={() => setShowLeftPanel(false)}
                    data-tip="Thu gọn bảng bên trái"
                    data-tip-pos="bottom"
                    className="w-6 h-6 rounded-md text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center spring-transition"
                  >
                    <i className="ph-bold ph-caret-line-left text-xs"></i>
                  </button>
                </div>
                <div className="p-5 rounded-[18px] bg-gradient-to-b from-[#0071E3]/[0.08] to-transparent border border-[#0071E3]/20">
                  <div className="w-10 h-10 rounded-[12px] bg-[#0071E3] text-white flex items-center justify-center shadow-sm mb-3">
                    <i className="ph-bold ph-sparkle text-xl"></i>
                  </div>
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    Bước 1 hoàn tất: Đã dựng lưới 3D
                  </h2>
                  <p className="text-[12.5px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed mt-1.5">
                    Python NumPy đã giải nén{' '}
                    <strong className="text-[#1D1D1F] dark:text-white">
                      {telemetry?.objects.length || 0} chi tiết
                    </strong>{' '}
                    và đo đạc xong diện tích tiếp xúc đáy <code className="font-mono">Z=0</code>, độ
                    cong mặt vòm, mặt phẳng đỉnh và vùng Overhang.
                  </p>

                  <button
                    onClick={triggerAgyAnalysis}
                    disabled={!sessionId || isAnalyzing || isLoadingFile}
                    className="mt-4 w-full py-3 px-4 rounded-[12px] bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.99] text-white font-semibold text-[13.5px] shadow-md spring-transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <i
                      className={`ph-bold ${
                        isAnalyzing ? 'ph-spinner animate-spin' : 'ph-magic-wand'
                      } text-base`}
                    ></i>
                    <span>
                      {isAnalyzing
                        ? 'agy AI đang chạy phân tích...'
                        : 'Phân tích & Tối ưu bằng agy AI'}
                    </span>
                  </button>
                </div>

                {/* Live Activity Feed directly inside Left Pane while analyzing */}
                {agentLogs.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[12px] font-semibold text-[#6E6E73] dark:text-[#A1A1A6] mb-2.5 flex items-center justify-between">
                      <span>Hoạt động trực tiếp của agy AI</span>
                      <span className="font-mono text-[11px] text-[#0071E3]">
                        {agentLogs.length} bước
                      </span>
                    </div>
                    <div className="space-y-2">
                      {agentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-[12px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-semibold leading-snug">
                              {log.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#6E6E73] shrink-0">
                              +{log.elapsed_s}s
                            </span>
                          </div>
                          {log.detail && (
                            <div className="text-[11px] font-mono text-[#6E6E73] dark:text-[#8E8E93] mt-1 break-all">
                              {log.detail}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Object List Measured by Python NumPy */}
                {telemetry && telemetry.objects.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[12px] font-semibold text-[#6E6E73] dark:text-[#A1A1A6] mb-2">
                      Danh sách chi tiết trên khay in ({telemetry.objects.length})
                    </div>
                    <div className="space-y-1.5">
                      {telemetry.objects.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedObjectId(o.id);
                            const ownerPlate = telemetry.plates.find((p) =>
                              p.object_ids.includes(o.id)
                            );
                            if (ownerPlate) setActivePlateId(ownerPlate.id);
                          }}
                          className={`p-2.5 rounded-[10px] cursor-pointer spring-transition flex items-center justify-between ${
                            selectedObjectId === o.id
                              ? 'bg-[#0071E3]/10 border border-[#0071E3]'
                              : 'bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.06]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-[12.5px] font-medium truncate">{o.name}</div>
                            <div className="text-[10.5px] font-mono text-[#6E6E73] truncate">
                              {o.archetypes.join(' · ')}
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-[#6E6E73] shrink-0">
                            {Number(o.size_mm[0]).toFixed(1)}×{Number(o.size_mm[1]).toFixed(1)}×
                            {Number(o.size_mm[2]).toFixed(1)}mm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* STAGE 2: AI Audit Completed -> Show Scores & Diagnostic Cards */
              <>
                <div className="p-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[12px] font-semibold text-[#1D1D1F] dark:text-white truncate">
                        Chẩn đoán {auditSource === 'agy' ? 'agy AI' : 'Morphology'}
                      </span>
                      <button
                        onClick={() => setShowAgentDrawer(true)}
                        data-tip="Xem nhật ký suy luận của agy AI"
                        data-tip-pos="bottom"
                        className="w-6 h-6 rounded-md bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/20 flex items-center justify-center shrink-0 spring-transition"
                      >
                        <i className="ph-bold ph-terminal-window text-xs"></i>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        data-tip="Số hạng mục tối ưu đang được bật để áp dụng"
                        data-tip-pos="bottom"
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#28CD41]/15 text-[#28CD41] font-medium shrink-0 whitespace-nowrap"
                      >
                        {totalApproved}/{totalItems} Bật
                      </span>
                      <button
                        onClick={() => setShowLeftPanel(false)}
                        data-tip="Thu gọn bảng bên trái"
                        data-tip-pos="bottom"
                        className="w-6 h-6 rounded-md text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center spring-transition"
                      >
                        <i className="ph-bold ph-caret-line-left text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] text-[#6E6E73] dark:text-[#8E8E93]">
                        <span>Độ an toàn in</span>
                        <i className="ph-fill ph-shield-check text-[#28CD41]"></i>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-mono text-[#FF3B30] line-through">
                          {safetyBefore}
                        </span>
                        <i className="ph-bold ph-arrow-right text-[10px] text-[#6E6E73]"></i>
                        <span className="text-xl font-semibold font-mono text-[#28CD41] tracking-tight">
                          {liveSafetyScore}
                        </span>
                        <span className="text-[11px] text-[#6E6E73] font-mono">/100</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] text-[#6E6E73] dark:text-[#8E8E93]">
                        <span>Độ mịn thẩm mỹ</span>
                        <i className="ph-fill ph-sparkle text-[#0071E3]"></i>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-mono text-[#FF9F0A] line-through">
                          {beautyBefore}
                        </span>
                        <i className="ph-bold ph-arrow-right text-[10px] text-[#6E6E73]"></i>
                        <span className="text-xl font-semibold font-mono text-[#0071E3] tracking-tight">
                          {liveBeautyScore}
                        </span>
                        <span className="text-[11px] text-[#6E6E73] font-mono">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Segmented Filter */}
                  <div className="mt-2.5 p-1 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] grid grid-cols-3 gap-1 text-[11.5px] font-medium">
                    <button
                      onClick={() => setLeftPillarFilter('all')}
                      className={`py-1 rounded-[7px] spring-transition whitespace-nowrap ${
                        leftPillarFilter === 'all'
                          ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                          : 'text-[#6E6E73] dark:text-[#A1A1A6]'
                      }`}
                    >
                      Tất cả ({cards.length})
                    </button>
                    <button
                      onClick={() => setLeftPillarFilter('safety')}
                      className={`py-1 rounded-[7px] spring-transition flex items-center justify-center gap-1 whitespace-nowrap ${
                        leftPillarFilter === 'safety'
                          ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                          : 'text-[#6E6E73] dark:text-[#A1A1A6]'
                      }`}
                    >
                      <i className="ph-fill ph-shield-warning text-[#FF3B30]"></i>
                      <span>An toàn ({cards.filter((c) => c.pillar === 'safety').length})</span>
                    </button>
                    <button
                      onClick={() => setLeftPillarFilter('aesthetics')}
                      className={`py-1 rounded-[7px] spring-transition flex items-center justify-center gap-1 whitespace-nowrap ${
                        leftPillarFilter === 'aesthetics'
                          ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm'
                          : 'text-[#6E6E73] dark:text-[#A1A1A6]'
                      }`}
                    >
                      <i className="ph-fill ph-sparkle text-[#0071E3]"></i>
                      <span>Độ đẹp ({cards.filter((c) => c.pillar === 'aesthetics').length})</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5">
                  {filteredCards.map((card) => {
                    const isSelected = card.id === selectedCardId;
                    const { icon, color } = getCardIcon(card.action_type);

                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setSelectedObjectId(card.object_id);
                          setViewMode(card.pillar === 'aesthetics' ? 'surface' : 'support');
                        }}
                        className={`p-3.5 rounded-[14px] bg-white dark:bg-[#1C1C1E] cursor-pointer spring-transition ${
                          isSelected
                            ? 'border-2 border-[#0071E3] shadow-sm'
                            : 'border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20'
                        } ${card.approved ? '' : 'opacity-60'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-[9px] ${color} flex items-center justify-center shrink-0 mt-0.5`}
                            >
                              <i className={`ph-fill ${icon} text-base`}></i>
                            </span>
                            <div>
                              <div className="text-[13px] font-semibold leading-snug">
                                {card.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    card.pillar === 'safety'
                                      ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                      : 'bg-[#0071E3]/10 text-[#0071E3]'
                                  }`}
                                >
                                  {card.pillar === 'safety' ? 'An toàn' : 'Độ đẹp'}
                                </span>
                                <span className="text-[11px] font-mono text-[#6E6E73] dark:text-[#8E8E93]">
                                  {card.object_tag}
                                </span>
                              </div>
                            </div>
                          </div>

                          <label
                            className="flex items-center cursor-pointer shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={card.approved}
                              onChange={(e) => toggleCardApproval(card.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-black/15 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative peer-checked:bg-[#0071E3]"></div>
                          </label>
                        </div>

                        <p className="text-[12px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed mt-2">
                          {card.desc}
                        </p>

                        {card.action_type === 'FLATTEN_BOTTOM' ? (
                          <div
                            className="mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-[11.5px] mb-1">
                              <span className="font-medium text-[#1D1D1F] dark:text-white flex items-center gap-1">
                                <i className="ph-bold ph-scissors text-[#0071E3]"></i>
                                <span>Cắt phẳng đáy (Flatten Z)</span>
                              </span>
                              <span className="font-mono font-semibold text-[#0071E3]">
                                {flattenMm.toFixed(2)} mm
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1.4"
                              step="0.1"
                              value={flattenMm}
                              onChange={(e) => handleFlattenChange(parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 px-2.5 py-1 rounded-[8px] bg-black/[0.03] dark:bg-white/[0.05] text-[11px] font-mono text-[#1D1D1F] dark:text-[#E5E5EA]">
                            {card.pill_text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </aside>
        )}

        {/* =================================================================== */}
        {/* CENTER PANE: INTERACTIVE 3D VIEWPORT + ICON/TOOLTIP HUD             */}
        {/* =================================================================== */}
        <section className="relative flex-1 h-full bg-gradient-to-b from-[#ECECEF] to-[#DFDFE4] dark:from-[#121214] dark:to-[#09090B] overflow-hidden min-w-0">
          {/* Top Floating Bar: Left Expand + Compact Plate Pills (Left) | Icon View Switcher + Right Expand (Right) */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none z-10">
            <div className="flex items-center gap-2 pointer-events-auto max-w-[70%]">
              {!showLeftPanel && (
                <button
                  onClick={() => setShowLeftPanel(true)}
                  data-tip="Mở bảng Chẩn đoán trái"
                  data-tip-pos="bottom"
                  className="apple-pill-glass px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11.5px] font-medium text-[#1D1D1F] dark:text-white hover:text-[#0071E3] spring-transition shrink-0"
                >
                  <i className="ph-bold ph-sidebar-simple text-[#0071E3] text-sm"></i>
                  <span>Chẩn đoán ({cards.length})</span>
                </button>
              )}

              <div className="apple-pill-glass p-1 rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(telemetry?.plates || []).map((pl) => {
                  const manyPlates = (telemetry?.plates.length || 0) > 3;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        setActivePlateId(pl.id);
                        if (pl.object_ids.length > 0) {
                          setSelectedObjectId(pl.object_ids[0]);
                        }
                      }}
                      data-tip={`Khay in Plate ${pl.id} (${pl.object_ids.length} chi tiết)`}
                      data-tip-pos="bottom"
                      className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium shrink-0 whitespace-nowrap spring-transition ${
                        activePlateId === pl.id
                          ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-sm'
                          : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                      }`}
                    >
                      {manyPlates
                        ? `P${pl.id} (${pl.object_ids.length})`
                        : `Plate ${pl.id} (${pl.object_ids.length})`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto shrink-0">
              <div className="apple-pill-glass p-1 rounded-full flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setViewMode('support')}
                  data-tip="Support & Vạt đáy: Xem vùng cần chống đỡ & diện tích bám bàn Z=0"
                  data-tip-pos="bottom-right"
                  className={`w-8 h-8 rounded-full text-sm font-medium spring-transition flex items-center justify-center ${
                    viewMode === 'support'
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  <i className="ph-fill ph-shield-check text-base"></i>
                </button>
                <button
                  onClick={() => setViewMode('surface')}
                  data-tip="Bề mặt & Đường ghép: Xem mặt phẳng Ironing & vòm cầu Adaptive Z"
                  data-tip-pos="bottom-right"
                  className={`w-8 h-8 rounded-full text-sm font-medium spring-transition flex items-center justify-center ${
                    viewMode === 'surface'
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  <i className="ph-fill ph-sparkle text-base"></i>
                </button>
                <button
                  onClick={() => setViewMode('xray')}
                  data-tip="Soi từ dưới đáy (Z=0): Xoay camera nhìn xuyên từ mặt bàn PEI lên đáy"
                  data-tip-pos="bottom-right"
                  className={`w-8 h-8 rounded-full text-sm font-medium spring-transition flex items-center justify-center ${
                    viewMode === 'xray'
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  <i className="ph-bold ph-layers text-base"></i>
                </button>
              </div>

              {!showRightPanel && (
                <button
                  onClick={() => setShowRightPanel(true)}
                  data-tip="Mở bảng Thông số Slicer phải"
                  data-tip-pos="bottom-right"
                  className="apple-pill-glass px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11.5px] font-medium text-[#1D1D1F] dark:text-white hover:text-[#0071E3] spring-transition shrink-0"
                >
                  <span>Thông số ({settings.length})</span>
                  <i className="ph-bold ph-sidebar-simple scale-x-[-1] text-[#0071E3] text-sm"></i>
                </button>
              )}
            </div>
          </div>

          <Viewport3D
            objects={telemetry?.objects || []}
            activePlateObjectIds={activePlateObjectIds}
            selectedObjectId={selectedObjectId}
            selectedCard={selectedCard}
            viewMode={viewMode}
            flattenMm={flattenMm}
            onSelectObject={(oid) => setSelectedObjectId(oid)}
          />

          {/* Bottom Floating Single-Row Compact Object Inspector & Tooltip Color Legend */}
          <div className="absolute bottom-4 left-3.5 right-3.5 apple-glass px-3.5 py-2 rounded-full flex items-center justify-between gap-3 z-10 max-w-[760px] mx-auto">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-full bg-[#0071E3]/12 text-[#0071E3] flex items-center justify-center shrink-0">
                <i className="ph-fill ph-cube text-sm"></i>
              </span>
              <span className="text-[12px] font-semibold text-[#1D1D1F] dark:text-white truncate max-w-[140px] xl:max-w-[200px]">
                {activeObject ? activeObject.name : 'Khay Bambu A1 (256×256)'}
              </span>
              {activeObject && (
                <span
                  data-tip={`Kích thước: ${Number(activeObject.size_mm[0]).toFixed(1)} × ${Number(
                    activeObject.size_mm[1]
                  ).toFixed(1)} × ${Number(activeObject.size_mm[2]).toFixed(
                    1
                  )} mm · Đáy L1: ${Number(activeObject.footprint_l1_mm[0]).toFixed(1)}×${Number(
                    activeObject.footprint_l1_mm[1]
                  ).toFixed(1)} mm`}
                  className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] shrink-0 whitespace-nowrap cursor-help"
                >
                  {Number(activeObject.size_mm[0]).toFixed(1)}×
                  {Number(activeObject.size_mm[1]).toFixed(1)}×
                  {Number(activeObject.size_mm[2]).toFixed(1)}mm
                </span>
              )}
            </div>

            {/* Compact Color Legend Chips with Hover Tooltips */}
            <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#6E6E73] dark:text-[#A1A1A6] shrink-0 whitespace-nowrap">
              <span
                data-tip="Đáy chạm bàn (Z=0): Diện tích tiếp xúc trực tiếp với mặt bàn PEI"
                className="flex items-center gap-1 cursor-help"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#28CD41]"></span>
                <span>Z=0</span>
              </span>
              <span
                data-tip="Vùng Support: Vùng hàm/gầm dốc cần vẽ trụ đỡ chống sập"
                className="flex items-center gap-1 cursor-help"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]"></span>
                <span>Support</span>
              </span>
              <span
                data-tip="Mặt phẳng Ironing: Đỉnh phẳng ngang thích hợp là mịn đầu phun"
                className="flex items-center gap-1 cursor-help"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#30B0C7]"></span>
                <span>Ironing</span>
              </span>
              <span
                data-tip="Vòm cầu Adaptive Z: Đỉnh cong cần giảm chiều cao lớp in chống bậc thang"
                data-tip-pos="top-right"
                className="flex items-center gap-1 cursor-help"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#5856D6]"></span>
                <span>Vòm Z</span>
              </span>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* RIGHT PANE: SLICER SETTINGS DIFF (POPULATED BY AGY AI)              */}
        {/* =================================================================== */}
        {showRightPanel && (
          <aside className="w-[390px] xl:w-[440px] h-full flex flex-col border-l border-black/[0.06] dark:border-white/[0.08] bg-white/65 dark:bg-[#141416]/75 backdrop-blur-xl z-20 shrink-0">
            {!audit ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-[#6E6E73] dark:text-[#A1A1A6]">
                    Bảng Thông số Slicer
                  </span>
                  <button
                    onClick={() => setShowRightPanel(false)}
                    data-tip="Thu gọn bảng bên phải"
                    data-tip-pos="bottom-right"
                    className="w-6 h-6 rounded-md text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center spring-transition"
                  >
                    <i className="ph-bold ph-caret-line-right text-xs"></i>
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6E6E73] flex items-center justify-center mb-3">
                    <i className="ph-duotone ph-sliders-horizontal text-2xl"></i>
                  </div>
                  <div className="text-[14px] font-semibold">
                    Bảng Đề xuất Slicer & Per-Object Overrides
                  </div>
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#A1A1A6] max-w-xs mt-1 leading-relaxed">
                    Sau khi bạn bấm <strong>"Phân tích & Tối ưu bằng agy AI"</strong> ở cột bên
                    trái, AI Agent sẽ đối chiếu hình học 3D với cấu hình gốc của tác giả và xuất
                    bảng so sánh chi tiết tại đây.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <h2 className="text-[14px] font-semibold tracking-tight truncate">
                        Thông số Slicer & Per-Object Diff
                      </h2>
                      <p className="text-[11px] text-[#6E6E73] dark:text-[#8E8E93] truncate">
                        Đề xuất bởi {auditSource === 'agy' ? 'agy AI Agent' : 'Morphology Engine'} ·
                        Sửa hoặc bỏ tích
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={approveAll}
                        data-tip="Bật duyệt toàn bộ thông số Slicer đề xuất"
                        data-tip-pos="bottom-right"
                        className="px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/20 shrink-0 flex items-center gap-1 whitespace-nowrap spring-transition"
                      >
                        <i className="ph-bold ph-checks"></i>
                        <span>Duyệt hết</span>
                      </button>
                      <button
                        onClick={() => setShowRightPanel(false)}
                        data-tip="Thu gọn bảng bên phải"
                        data-tip-pos="bottom-right"
                        className="w-6 h-6 rounded-md text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] flex items-center justify-center spring-transition"
                      >
                        <i className="ph-bold ph-caret-line-right text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Compact Icon + Count Category Filter Tabs with Tooltips */}
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        {
                          id: 'all',
                          icon: 'ph-squares-four',
                          short: `Tất cả (${settings.length})`,
                          tip: `Tất cả thông số (${settings.length})`,
                        },
                        {
                          id: 'aesthetics',
                          icon: 'ph-sparkle',
                          short: `${settings.filter((s) => s.category === 'aesthetics').length}`,
                          tip: `Độ đẹp bề mặt (${
                            settings.filter((s) => s.category === 'aesthetics').length
                          })`,
                        },
                        {
                          id: 'adhesion',
                          icon: 'ph-anchor-simple',
                          short: `${settings.filter((s) => s.category === 'adhesion').length}`,
                          tip: `Bám bàn & Nhiệt độ (${
                            settings.filter((s) => s.category === 'adhesion').length
                          })`,
                        },
                        {
                          id: 'kinematics',
                          icon: 'ph-gauge',
                          short: `${settings.filter((s) => s.category === 'kinematics').length}`,
                          tip: `Độ bền & Tốc độ/Gia tốc (${
                            settings.filter((s) => s.category === 'kinematics').length
                          })`,
                        },
                        {
                          id: 'support',
                          icon: 'ph-tree-structure',
                          short: `${settings.filter((s) => s.category === 'support').length}`,
                          tip: `Support & Ốc vít (${
                            settings.filter((s) => s.category === 'support').length
                          })`,
                        },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setRightCategoryFilter(tab.id)}
                        data-tip={tab.tip}
                        data-tip-pos="bottom"
                        className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium shrink-0 spring-transition flex items-center gap-1 whitespace-nowrap ${
                          rightCategoryFilter === tab.id
                            ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-sm'
                            : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                        }`}
                      >
                        <i
                          className={`ph-fill ${tab.icon} ${
                            tab.id === 'aesthetics' && rightCategoryFilter !== tab.id
                              ? 'text-[#0071E3]'
                              : ''
                          }`}
                        ></i>
                        <span>{tab.short}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-2 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.06] grid grid-cols-12 text-[11px] font-medium text-[#6E6E73] dark:text-[#8E8E93]">
                  <div className="col-span-5">Thông số & Phạm vi áp dụng</div>
                  <div className="col-span-2 text-center">Mặc định</div>
                  <div className="col-span-2 text-center">Tác giả</div>
                  <div className="col-span-3 text-right pr-1">Đề xuất (Sửa)</div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-black/[0.05] dark:divide-white/[0.06] px-4">
                  {filteredSettings.map((item) => (
                    <div
                      key={`${item.object_id}-${item.key}`}
                      onClick={() => {
                        if (item.object_id !== 'global') {
                          setSelectedObjectId(item.object_id);
                        }
                      }}
                      className={`py-3 px-1 transition-opacity cursor-pointer ${
                        item.approved ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      <div className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-5 flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={item.approved}
                            onChange={(e) =>
                              toggleSettingApproval(item.key, item.object_id, e.target.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-4 h-4 rounded text-[#0071E3] focus:ring-0 cursor-pointer accent-[#0071E3]"
                          />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold leading-tight text-[#1D1D1F] dark:text-white">
                              {item.label}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#E5E5EA]">
                                {item.scope_tag}
                              </span>
                              <span className="text-[10.5px] text-[#6E6E73] dark:text-[#8E8E93] truncate">
                                {item.meaning}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2 text-center font-mono text-[11px] text-[#6E6E73] dark:text-[#8E8E93]">
                          {item.default_val}
                        </div>

                        <div className="col-span-2 text-center font-mono text-[11px] text-[#FF3B30] line-through decoration-[#FF3B30]/60">
                          {item.author_val}
                        </div>

                        <div className="col-span-3 flex items-center justify-end">
                          <input
                            type="text"
                            value={item.proposed_val}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              editSettingValue(item.key, item.object_id, e.target.value)
                            }
                            className="w-28 text-right font-mono text-[11.5px] font-semibold px-2 py-1 rounded-[8px] bg-[#0071E3]/[0.08] dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#4DA3FF] border border-[#0071E3]/25 focus:outline-none focus:border-[#0071E3]"
                          />
                        </div>
                      </div>

                      <div className="mt-1.5 ml-6 pl-2.5 border-l-2 border-[#0071E3]/30 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                        {item.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        )}
      </main>

      {/* APPLE DROPZONE MODAL */}
      {showDropzone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-md p-6">
          <div className="apple-glass w-full max-w-lg rounded-[24px] p-6 shadow-2xl border border-white/60 dark:border-white/15">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#0071E3] text-white flex items-center justify-center">
                  <i className="ph-bold ph-upload-simple text-base"></i>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold">Mở mô hình 3D (.3mf)</h3>
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#A1A1A6]">
                    Bước 1: Dựng 3D & đo hình học · Bước 2: Chạy agy AI phân tích
                  </p>
                </div>
              </div>
              {telemetry && (
                <button
                  onClick={() => setShowDropzone(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6E73] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <i className="ph-bold ph-x"></i>
                </button>
              )}
            </div>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="flex flex-col items-center justify-center h-40 rounded-[16px] border-2 border-dashed border-[#0071E3]/40 bg-[#0071E3]/[0.03] hover:bg-[#0071E3]/[0.07] cursor-pointer spring-transition"
            >
              <i className="ph-duotone ph-cube-transparent text-4xl text-[#0071E3] mb-2"></i>
              <span className="text-[13.5px] font-medium">
                Kéo thả file <code className="font-mono text-[#0071E3]">.3mf</code> vào đây hoặc bấm
                để chọn
              </span>
              <span className="text-[11.5px] text-[#6E6E73] mt-1">
                Hỗ trợ Bambu Studio & PrusaSlicer (.3mf)
              </span>
              <input
                type="file"
                accept=".3mf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>

            {samples.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] font-medium text-[#6E6E73] mb-2">
                  Các file .3mf tìm thấy trong ~/Downloads của bạn:
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {samples.map((s) => (
                    <button
                      key={s.path}
                      onClick={() => handleLoadLocalSample(s.path)}
                      className="w-full p-2.5 rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-left flex items-center justify-between gap-2.5 spring-transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <i className="ph-fill ph-cube text-[#0071E3] text-lg shrink-0"></i>
                        <span className="text-[12.5px] font-medium truncate">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#6E6E73] shrink-0">
                        {s.size_mb}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 apple-glass px-4 py-3 rounded-[14px] flex items-center gap-3 z-50 shadow-xl">
          <div className="w-8 h-8 rounded-full bg-[#28CD41]/15 text-[#28CD41] flex items-center justify-center shrink-0">
            <i className="ph-bold ph-check text-base"></i>
          </div>
          <div className="max-w-sm">
            <div className="text-[13px] font-semibold">{toast.title}</div>
            <div className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] font-mono truncate">
              {toast.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
