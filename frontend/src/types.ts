export interface PlateInfo {
  id: string;
  name: string;
  object_ids: string[];
}

export interface ObjectMetrics {
  total_area_mm2: number;
  flat_top_area_mm2: number;
  domed_top_area_mm2: number;
  domed_ratio: number;
  cylindrical_score: number;
  steep_overhang_area_mm2: number;
  bridge_area_mm2: number;
  paint_enforcers_total: number;
  paint_blockers_total: number;
  base_enforcers_z8: number;
  base_blockers_z8: number;
}

export interface ObjectTelemetry {
  id: string;
  name: string;
  model_file: string;
  archetypes: string[];
  morphology_flags: string[];
  size_mm: [number, number, number];
  world_pos: [number, number, number];
  transform?: number[];
  footprint_l1_mm: [number, number];
  footprint_l10_mm: [number, number];
  l1_vertex_count: number;
  triangle_count: number;
  metrics: ObjectMetrics;
  overrides: Record<string, string>;
  mesh_preview?: {
    vertices: number[];
    indices: number[];
    vertex_zones: number[];
    vertex_extruders?: number[];
    filament_colours?: string[];
  };
}

export interface TelemetryData {
  filename: string;
  path: string;
  file_size_mb: number;
  plates: PlateInfo[];
  objects: ObjectTelemetry[];
}

export interface DiagnosticCard {
  id: string;
  pillar: 'safety' | 'aesthetics';
  object_id: string;
  object_tag: string;
  archetype: string;
  title: string;
  desc: string;
  pill_text: string;
  action_type:
    | 'FLATTEN_BOTTOM'
    | 'REINFORCE_SUPPORTS'
    | 'OPTIMIZE_SCREW'
    | 'ROTATE_YAW'
    | 'ADAPTIVE_LAYER_DOME'
    | 'IRONING_FLAT_TOP'
    | 'SCARF_SEAM_CYLINDER'
    | 'FUZZY_SKIN'
    | 'ARACHNE_FINE_DETAIL'
    | 'BRIDGE_AND_NECK_COOLING';
  param_value: number;
  approved: boolean;
}

export interface SettingDiffItem {
  key: string;
  label: string;
  scope_tag: string;
  object_id: string;
  category: 'aesthetics' | 'adhesion' | 'kinematics' | 'support';
  meaning: string;
  default_val: string;
  author_val: string;
  proposed_val: string;
  reason: string;
  approved: boolean;
}

export interface AuditReport {
  summary: string;
  safety_score_before: number;
  safety_score_after: number;
  aesthetics_score_before: number;
  aesthetics_score_after: number;
  diagnostic_cards: DiagnosticCard[];
  settings_diff: SettingDiffItem[];
}

export interface SampleFile {
  name: string;
  path: string;
  size_mb: string;
}

export interface AgentActivityLog {
  id: string;
  step: string;
  title: string;
  detail: string;
  elapsed_s: number;
}
