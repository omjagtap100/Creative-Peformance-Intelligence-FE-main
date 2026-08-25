/** src/types/cpi.ts */

export type UserRole = "viewer" | "analyst" | "admin";

export type AuthUser = {
  user_id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
};

export type LoginResult = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthUser;
};

export type ApiErrorBody = {
  error: string;
  code?: string;
};

export type CreativeFormat = "static" | "video" | "carousel";
export type Concept =
  | "product_hero"
  | "lifestyle"
  | "promo_price"
  | "social_proof"
  | "festive_event"
  | "corporate_gifting"
  | "ugc_style"
  | string;
export type Cta = "SEND_WHATSAPP" | "ORDER_NOW" | "SHOP_NOW" | string;

export type CreativeListItem = {
  creative_id: string;
  campaign_id: string;
  format: CreativeFormat | string;
  concept: Concept | null;
  cta: Cta | null;
  product_theme: string | null;
  headline: string | null;
  provenance: string;
  campaign?: { campaign_id: string; name: string } | null;
};

export type CreativeBundle = {
  creative: {
    creative_id: string;
    campaign_id: string;
    library_id: string | null;
    format: string;
    video_duration_seconds: number | null;
    source_tag: string | null;
    concept: string | null;
    cta: string | null;
    destination: string | null;
    product_theme: string | null;
    primary_text: string | null;
    headline: string | null;
    description: string | null;
    started_running_on: string | null;
    media_path: string | null;
    provenance: string;
    copy_provenance: string | null;
    performance_provenance: string | null;
  };
  campaign: {
    campaign_id: string;
    brand_id: string;
    name: string;
    objective_hint: string | null;
    provenance: string;
  } | null;
  brand: {
    brand_id: string;
    name: string;
    provenance: string;
  } | null;
  content_matrix: ContentMatrix | null;
  video_dropoff: VideoDropoff | null;
  metrics_daily: MetricDaily[];
  targeting_stats: TargetingStat[];
};

export type ContentMatrix = {
  creative_id: string;
  tone: string | null;
  logo_clarity: number | null;
  has_human_figure: boolean | null;
  has_price_badge: boolean | null;
  hook_seconds: string | number | null;
  cta_in_asset: string | null;
  cta_timing_seconds: string | number | null;
  presenter: string | null;
  colour_hue_primary: string | null;
  colour_palette: unknown;
  font_style: string | null;
  font_size_relative: string | null;
  seconds_per_scene: unknown;
  script_summary: string | null;
  model_version: string | null;
  provenance: string;
  created_at?: string;
  updated_at?: string;
};

export type VideoDropoff = {
  creative_id: string;
  duration_seconds: number | null;
  curve: Array<{ t: number; retention: number }> | unknown;
  provenance: string;
  created_at?: string;
  updated_at?: string;
};

export type MetricDaily = {
  creative_id: string;
  metric_date: string;
  campaign_id: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: string | number | null;
  cpc_inr: string | number | null;
  spend_inr: string | number | null;
  thumb_stop_rate: string | number | null;
  hook_rate_3s: string | number | null;
  video_p25: string | number | null;
  video_p50: string | number | null;
  video_p75: string | number | null;
  video_p100: string | number | null;
  messaging_conversations_started: number;
  purchases: number;
  adds_to_cart: number;
  landing_page_views: number;
  results_roas: string | number | null;
  provenance: string;
  created_at?: string;
  updated_at?: string;
};

export type TargetingStat = {
  id: number;
  creative_id: string;
  metric_date: string;
  audience_type: string | null;
  age_bucket: string | null;
  gender: string | null;
  geo: string | null;
  placement: string | null;
  impressions: number;
  clicks: number;
  spend_inr: string | number | null;
  messaging_conversations_started: number;
  purchases: number;
  provenance: string;
  created_at?: string;
  updated_at?: string;
};

export type MetricsSummary = {
  creative_id: string;
  days: number;
  date_from: string | null;
  date_to: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  spend_inr: number;
  avg_ctr: number | null;
  avg_cpc_inr: number | null;
  avg_thumb_stop_rate: number | null;
  avg_hook_rate_3s: number | null;
  avg_video_p25: number | null;
  avg_video_p50: number | null;
  avg_video_p75: number | null;
  avg_video_p100: number | null;
  messaging_conversations_started: number;
  purchases: number;
  adds_to_cart: number;
  landing_page_views: number;
  avg_results_roas: number | null;
  provenance: string;
};

export type AnalysisFinding = {
  severity: "info" | "warn" | "critical";
  area: "hook" | "ctr" | "cta" | "retention" | "efficiency" | "matrix" | "peers" | string;
  claim: string;
  citations: string[];
};

export type SimilarCreativeHit = {
  creative_id: string;
  concept?: string;
  cta?: string;
  product_theme?: string;
  format?: string;
  distance?: number | null;
  document_preview?: string | null;
};

export type LlmAnalysisFinding = {
  severity: "low" | "medium" | "high";
  area: string;
  observation: string;
  interpretation: string;
  evidence_citations: string[];
};

export type LlmAnalysisRecommendation = {
  priority: "high" | "medium" | "low";
  recommendation: string;
  reason: string;
  evidence_citations: string[];
};

export type LlmAnalysisEnhancement = {
  summary: string;
  strongest_elements: string[];
  weakest_elements: string[];
  findings: LlmAnalysisFinding[];
  recommendations: LlmAnalysisRecommendation[];
  similar_creative_insights: string[];
  next_tests: string[];
};

export type AnalysisDiagnosis = {
  creative_id: string;
  data_provenance: string;
  analysed_at: string;
  summary: string;
  findings: AnalysisFinding[];
  metrics: MetricsSummary;
  content_matrix: Record<string, unknown> | null;
  similar_creatives: SimilarCreativeHit[];
  llm_analysis_available: boolean;
  llm_analysis: LlmAnalysisEnhancement | null;
  llm_error?: string | null;
};

export type RecommendItem = {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
  evidence_citations: string[];
  kind: "fact_based" | "inference";
};

export type RecommendPlan = {
  creative_id: string;
  summary: string;
  items: RecommendItem[];
  next_tests: string[];
  source: "llm" | "deterministic";
  created_at: string;
};

export type GenerationDraft = {
  type: "copy" | "concept" | "static_image";
  headline?: string;
  primary_text?: string;
  cta?: string;
  concept_notes?: string;
  image_prompt?: string;
  status: "draft";
  evidence_citations: string[];
};

export type GenerationResult = {
  creative_id: string;
  recommendation_id: string | null;
  drafts: GenerationDraft[];
  created_at: string;
};

export type ArgStopAt = "analyse" | "recommend" | "generate";

export type ArgRequest = {
  creativeId: string;
  persist?: boolean;
  useLlm?: boolean;
  stopAt?: ArgStopAt;
};

export type AnalyseRecommendGenerateResult = {
  stage: ArgStopAt;
  creative_id: string;
  diagnosis: AnalysisDiagnosis;
  recommend: RecommendPlan | null;
  generate: GenerationResult | null;
  recommendation_id: string | null;
  generation_ids: string[];
  next: "recommend" | "generate" | "approve" | null;
};

export type RecommendationStatus = "draft" | "approved" | "rejected";

export type RecommendationRow = {
  recommendation_id: string;
  creative_id: string;
  payload: unknown;
  citations: unknown;
  status: RecommendationStatus | string;
  created_at: string;
  updated_at: string;
};

export type GenerationRow = {
  generation_id: string;
  recommendation_id: string;
  type: "copy" | "concept" | "static_image" | string;
  /** JSON string of GenerationDraft — must JSON.parse before render */
  content: string | null;
  media_path: string | null;
  status: RecommendationStatus | string;
  created_at: string;
  updated_at: string;
};

export type LeadStage =
  | "new"
  | "engaged"
  | "intent"
  | "visit_booked"
  | "visited"
  | "sale";

export type LeadRow = {
  lead_id: string;
  brand_id: string;
  creative_id: string | null;
  campaign_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  stage: LeadStage | string;
  ad_ref: string | null;
  source_channel: string | null;
  created_at: string;
  provenance: string;
  updated_at: string;
};

export type BrandRow = {
  brand_id: string;
  name: string;
  tagline: string | null;
  provenance: string;
  created_at: string;
  updated_at: string;
};

export type BrandKitRow = {
  brand_id: string;
  colours: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    [k: string]: unknown;
  } | null;
  fonts: { display?: string; body?: string; [k: string]: unknown } | null;
  tone: string[] | unknown;
  must_include: string[] | unknown;
  must_avoid: string[] | unknown;
  cta_preferences: string[] | unknown;
  markets: string[] | unknown;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthResponse = {
  ok: boolean;
  dataMode: string;
  llm: string;
};
