# CPI Web UI — Standalone Frontend

---

## Mission

Build a **standalone frontend only** for **Creative Performance Intelligence (CPI)** — a product that runs **Analyse → Recommend → Generate** on paid-social creatives for demo brand **MM Mithaiwala**, with **human approval** and a **lite CRM**.

A separate backend API already exists and will be running locally (or on a host you configure). Your job:

1. Scaffold a **new** Vite + React + TypeScript project from scratch (independent repo).
2. Style with **Tailwind CSS** + **Framer Motion** (modern, sleek).
3. Talk to the CPI HTTP API using the contracts in this prompt.
4. Implement all pages, auth, RBAC, and UX described here.

**Do NOT rebuild the backend. Do NOT invent Meta publishing. Do NOT skip auth. Do NOT depend on any monorepo packages** (`@cpi/shared`, `@cpi/web`, etc.). Copy the TypeScript types from this prompt into the new app.

---

## Project setup (independent repo)

### Create the app

```bash
npm create vite@latest cpi-web -- --template react-ts
cd cpi-web
npm install
npm install react-router-dom framer-motion lucide-react
# Tailwind v4 (follow latest Vite + Tailwind install docs)
# Optional: npm install @tanstack/react-query recharts
```

Suggested folder name / repo: `cpi-web` (or `cpi-ui`). Keep it **outside** the backend repository.

### Env

Create `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:3141
```

Use `import.meta.env.VITE_API_BASE_URL` in the API client. Default fallback: `http://127.0.0.1:3141`.

### Dev server

- UI: Vite default `http://localhost:5173`
- Backend CORS is typically set to `http://localhost:5173`. If you use another origin/port, ask the backend owner to set `API_CORS_ORIGIN` to match, or proxy API calls through Vite:

```ts
// vite.config.ts (optional proxy)
server: {
  proxy: {
    '/v1': 'http://127.0.0.1:3141',
    '/creatives': 'http://127.0.0.1:3141',
    '/health': 'http://127.0.0.1:3141',
  },
}
```

If using the proxy, set `VITE_API_BASE_URL=""` (same-origin) or keep absolute URL and rely on CORS.

### Backend the UI expects (someone else runs this)

The API must already be up at `VITE_API_BASE_URL` (default `http://127.0.0.1:3141`). Swagger: `http://127.0.0.1:3141/docs`.

You do **not** run MySQL/Chroma/migrations from this UI repo. If APIs fail, surface clear errors (“API unreachable — is CPI backend running on :3141?”).

### Smoke-check before building screens

```bash
curl http://127.0.0.1:3141/health
# expect: {"ok":true,"dataMode":"synthetic","llm":"..."}
```

---

## Stack (locked)

| Layer | Choice |
|---|---|
| Scaffold | Vite + React 18/19 + TypeScript |
| Routing | `react-router-dom` v6/v7 |
| Styling | Tailwind CSS |
| Motion | Framer Motion |
| Icons | `lucide-react` |
| Charts | Optional `recharts` for `metrics_daily` |
| Data fetching | TanStack Query **or** React state — pick one, stay consistent |
| Types | **Local** `src/types/` — paste from this prompt (no shared monorepo package) |
| API base | `VITE_API_BASE_URL` |

---

## Product scenario (what the UI must communicate)

1. Marketer logs in (JWT).
2. Sees a library of **creatives** (ads) with concept, CTA, format, theme.
3. Opens a creative → copy, content matrix, metrics history; similar ads appear inside ARG responses.
4. Runs **Analyse** (optional LLM) → grounded findings + citations.
5. Continues to **Recommend** → concrete fixes citing metrics.
6. Continues to **Generate** → draft copy / concept notes / **image prompt** (not a rendered image).
7. **Admin** approves or rejects recommendation + generation drafts.
8. **CRM lite**: leads attributed to creatives; analysts move pipeline stages.
9. Always show a visible **Demo data** badge (`dataMode` from `/health` is usually `synthetic`).

Brand context for empty states: festive / heritage mithai, Mumbai, WhatsApp CTAs, INR spend.

| Entity | Demo ID |
|---|---|
| Brand | `brand_mm_mithaiwala` |
| Sample creative | `cr_476183_01` |

---

## Auth model (mandatory)

### Demo users

| Email | Password | Role |
|---|---|---|
| `admin@cpi.demo` | `Admin123!` | `admin` |
| `analyst@cpi.demo` | `Analyst123!` | `analyst` |
| `viewer@cpi.demo` | `Viewer123!` | `viewer` |

### Roles → UI capabilities

| Capability | viewer | analyst | admin |
|---|---|---|---|
| View creatives / brand kit / leads / recs / gens | yes | yes | yes |
| Run ARG (`/v1/analyse`, `/recommend`, `/generate`, `/arg`) | no | yes | yes |
| Update lead stage | no | yes | yes |
| Approve/reject recommendation or generation | no | no | yes |

### Token handling

- `POST /v1/auth/login` → store `accessToken` in `localStorage`.
- Send `Authorization: Bearer <accessToken>` on every protected call.
- On **401**: clear token → `/login`.
- On **403**: toast/inline “insufficient role”.
- On app load: `GET /v1/auth/me` to hydrate session.
- Registration is **disabled** by default — hide register or show disabled.

Request headers the API accepts: `Content-Type`, `Authorization`, `X-Request-Id`.  
Response may expose: `X-Request-Id`.

---

## TypeScript types (copy into `src/types/`)

Put these in the new app. Do not invent extra required fields.

```ts
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
  curve: unknown;
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
```

---

## Global API conventions

### Error body (all failures)

```json
{
  "error": "human readable message",
  "code": "unauthorized"
}
```

| HTTP | Typical `code` | When |
|---|---|---|
| 400 | `bad_request` | Invalid body / invalid stage or status |
| 401 | `unauthorized` | Missing/invalid JWT, bad login |
| 403 | `forbidden` | Wrong role, registration disabled |
| 404 | `not_found` | Missing entity |
| 409 | `conflict` | Rare |
| 500 | `internal` | Unexpected |

### Decimal / date notes

- Sequelize `DATE` → ISO strings.
- `DATEONLY` → `"YYYY-MM-DD"`.
- DECIMAL fields often arrive as **strings** (`"12.50"`). Coerce with `Number(...)` for charts.

---

# COMPLETE API REFERENCE

Base: `VITE_API_BASE_URL` (e.g. `http://127.0.0.1:3141`).

---

## 0. Root & health (public)

### `GET /`

**200**

```json
{
  "name": "cpi-api",
  "docs": "/docs",
  "openapi": "/openapi.json",
  "auth": "POST /v1/auth/login then Bearer token"
}
```

### `GET /health`

**200**

```json
{
  "ok": true,
  "dataMode": "synthetic",
  "llm": "disabled"
}
```

`llm` is a model id string or `"disabled"`. Use `dataMode` for the Demo badge.

### `GET /docs` / `GET /openapi.json`

Swagger — optional for humans; not required in the app UI.

---

## 1. Auth

### `POST /v1/auth/login` (public)

**Request**

```json
{
  "email": "admin@cpi.demo",
  "password": "Admin123!"
}
```

**200 → LoginResult**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "7d",
  "user": {
    "user_id": "user_admin_demo",
    "email": "admin@cpi.demo",
    "role": "admin",
    "display_name": "Demo Admin"
  }
}
```

**401**

```json
{ "error": "Invalid email or password", "code": "unauthorized" }
```

---

### `POST /v1/auth/register` (public; usually disabled)

**Request**

```json
{
  "email": "new@example.com",
  "password": "Password1!",
  "display_name": "Optional Name"
}
```

**200** (only if backend `AUTH_ALLOW_REGISTER=true`) — same as login.

**403** (default)

```json
{ "error": "Registration is disabled", "code": "forbidden" }
```

---

### `GET /v1/auth/me` (Bearer)

**200**

```json
{
  "user": {
    "user_id": "user_admin_demo",
    "email": "admin@cpi.demo",
    "role": "admin",
    "display_name": "Demo Admin"
  }
}
```

---

## 2. Creatives

### `GET /creatives` (Bearer, viewer+)

**200**

```json
{
  "items": [
    {
      "creative_id": "cr_476183_01",
      "campaign_id": "camp_xxx",
      "format": "video",
      "concept": "festive_event",
      "cta": "SEND_WHATSAPP",
      "product_theme": "mithai_box",
      "headline": "Festive mithai boxes for every celebration",
      "provenance": "synthetic",
      "campaign": {
        "campaign_id": "camp_xxx",
        "name": "Festive Outreach"
      }
    }
  ]
}
```

---

### `GET /creatives/{creativeId}` (Bearer, viewer+)

**200 → CreativeBundle**

```json
{
  "creative": {
    "creative_id": "cr_476183_01",
    "campaign_id": "camp_xxx",
    "library_id": "476183...",
    "format": "video",
    "video_duration_seconds": 15,
    "source_tag": "owned",
    "concept": "festive_event",
    "cta": "SEND_WHATSAPP",
    "destination": "whatsapp",
    "product_theme": "mithai_box",
    "primary_text": "Celebrate with Mumbai's favourite mithai...",
    "headline": "Festive mithai boxes for every celebration",
    "description": "Optional longer description",
    "started_running_on": "2026-08-01",
    "media_path": null,
    "provenance": "synthetic",
    "copy_provenance": "synthetic",
    "performance_provenance": "synthetic"
  },
  "campaign": {
    "campaign_id": "camp_xxx",
    "brand_id": "brand_mm_mithaiwala",
    "name": "Festive Outreach",
    "objective_hint": "messages",
    "provenance": "synthetic"
  },
  "brand": {
    "brand_id": "brand_mm_mithaiwala",
    "name": "MM Mithaiwala",
    "provenance": "synthetic"
  },
  "content_matrix": {
    "creative_id": "cr_476183_01",
    "tone": "festive_warm",
    "logo_clarity": 4,
    "has_human_figure": true,
    "has_price_badge": false,
    "hook_seconds": "1.50",
    "cta_in_asset": "WhatsApp us",
    "cta_timing_seconds": "8.00",
    "presenter": "product_hero",
    "colour_hue_primary": "maroon",
    "colour_palette": ["#7A1F2B", "#C4A35A", "#FFF8F0"],
    "font_style": "serif_display",
    "font_size_relative": "large",
    "seconds_per_scene": [3, 4, 5],
    "script_summary": "Open on box → product close-up → WhatsApp CTA",
    "model_version": "matrix_v1",
    "provenance": "synthetic",
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z"
  },
  "video_dropoff": {
    "creative_id": "cr_476183_01",
    "duration_seconds": 15,
    "curve": [
      { "t": 0, "retention": 1.0 },
      { "t": 3, "retention": 0.72 },
      { "t": 15, "retention": 0.31 }
    ],
    "provenance": "synthetic",
    "created_at": "2026-08-25T00:00:00.000Z",
    "updated_at": "2026-08-25T00:00:00.000Z"
  },
  "metrics_daily": [
    {
      "creative_id": "cr_476183_01",
      "metric_date": "2026-08-18",
      "campaign_id": "camp_xxx",
      "impressions": 12000,
      "reach": 9800,
      "clicks": 340,
      "ctr": "0.0283",
      "cpc_inr": "12.50",
      "spend_inr": "4250.00",
      "thumb_stop_rate": "0.3100",
      "hook_rate_3s": "0.2800",
      "video_p25": "0.5500",
      "video_p50": "0.4000",
      "video_p75": "0.2800",
      "video_p100": "0.1800",
      "messaging_conversations_started": 42,
      "purchases": 3,
      "adds_to_cart": 8,
      "landing_page_views": 90,
      "results_roas": "1.8500",
      "provenance": "synthetic",
      "created_at": "2026-08-25T00:00:00.000Z",
      "updated_at": "2026-08-25T00:00:00.000Z"
    }
  ],
  "targeting_stats": [
    {
      "id": 1,
      "creative_id": "cr_476183_01",
      "metric_date": "2026-08-18",
      "audience_type": "broad",
      "age_bucket": "25-34",
      "gender": "female",
      "geo": "Mumbai",
      "placement": "feed",
      "impressions": 4000,
      "clicks": 120,
      "spend_inr": "1400.00",
      "messaging_conversations_started": 18,
      "purchases": 1,
      "provenance": "synthetic",
      "created_at": "2026-08-25T00:00:00.000Z",
      "updated_at": "2026-08-25T00:00:00.000Z"
    }
  ]
}
```

`content_matrix` / `video_dropoff` / `campaign` / `brand` may be `null`. Arrays may be empty.

---

## 3. ARG (Analyse → Recommend → Generate)

Min role: **analyst** or **admin**. Viewer → **403**.

### Shared request body

```json
{
  "creativeId": "cr_476183_01",
  "persist": true,
  "useLlm": false,
  "stopAt": "generate"
}
```

| Field | Type | Default | Notes |
|---|---|---|---|
| `creativeId` | string | required | |
| `persist` | boolean | `true` | Persist rows to DB |
| `useLlm` | boolean | server default `true` if omitted | Send explicitly; if LLM down, still get deterministic diagnosis |
| `stopAt` | `"analyse"\|"recommend"\|"generate"` | `"generate"` | Only on `/v1/arg`; other routes force stage |

### Routes

| Method | Path | Forced stop |
|---|---|---|
| POST | `/v1/analyse` | `analyse` |
| POST | `/v1/recommend` | `recommend` |
| POST | `/v1/generate` | `generate` |
| POST | `/v1/arg` | body `stopAt` (default `generate`) |

### Shared **200** → `AnalyseRecommendGenerateResult`

```json
{
  "stage": "generate",
  "creative_id": "cr_476183_01",
  "diagnosis": { "...AnalysisDiagnosis..." },
  "recommend": { "...RecommendPlan..." },
  "generate": { "...GenerationResult..." },
  "recommendation_id": "rec_550e8400-e29b-41d4-a716-446655440000",
  "generation_ids": [
    "gen_11111111-1111-1111-1111-111111111111",
    "gen_22222222-2222-2222-2222-222222222222"
  ],
  "next": "approve"
}
```

| stage | recommend | generate | next |
|---|---|---|---|
| `analyse` | `null` | `null` | `"recommend"` |
| `recommend` | object | `null` | `"generate"` |
| `generate` | object | object | `"approve"` |

If `persist: false`, ids may be null / empty.

---

### Nested `diagnosis` — AnalysisDiagnosis (always present)

```json
{
  "creative_id": "cr_476183_01",
  "data_provenance": "synthetic",
  "analysed_at": "2026-08-26T04:00:00.000Z",
  "summary": "Hook rate is soft vs peers; CTR mid-pack; WhatsApp CTA is clear.",
  "findings": [
    {
      "severity": "warn",
      "area": "hook",
      "claim": "3s hook rate is below peer median for festive_event creatives.",
      "citations": ["metrics.avg_hook_rate_3s", "peers.cr_476183_02"]
    }
  ],
  "metrics": {
    "creative_id": "cr_476183_01",
    "days": 7,
    "date_from": "2026-08-18",
    "date_to": "2026-08-24",
    "impressions": 84000,
    "reach": 62000,
    "clicks": 2100,
    "spend_inr": 28500.5,
    "avg_ctr": 0.025,
    "avg_cpc_inr": 13.57,
    "avg_thumb_stop_rate": 0.31,
    "avg_hook_rate_3s": 0.22,
    "avg_video_p25": 0.55,
    "avg_video_p50": 0.4,
    "avg_video_p75": 0.28,
    "avg_video_p100": 0.18,
    "messaging_conversations_started": 260,
    "purchases": 18,
    "adds_to_cart": 40,
    "landing_page_views": 520,
    "avg_results_roas": 1.85,
    "provenance": "synthetic"
  },
  "content_matrix": {
    "tone": "festive_warm",
    "logo_clarity": 4,
    "hook_seconds": "1.50",
    "colour_palette": ["#7A1F2B", "#C4A35A"],
    "script_summary": "Open on box → product → CTA"
  },
  "similar_creatives": [
    {
      "creative_id": "cr_476183_02",
      "concept": "festive_event",
      "cta": "ORDER_NOW",
      "product_theme": "mithai_box",
      "format": "static",
      "distance": 0.21,
      "document_preview": "Festive box hero with gold accents..."
    }
  ],
  "llm_analysis_available": false,
  "llm_analysis": null,
  "llm_error": "LLM disabled or credentials missing"
}
```

**When LLM succeeds**

```json
{
  "llm_analysis_available": true,
  "llm_analysis": {
    "summary": "Creative is mid-funnel efficient but loses attention in first 3s.",
    "strongest_elements": ["Clear WhatsApp CTA", "Brand colours"],
    "weakest_elements": ["Slow product reveal", "Weak opening frame"],
    "findings": [
      {
        "severity": "medium",
        "area": "hook",
        "observation": "avg_hook_rate_3s is 0.22 over 7 days.",
        "interpretation": "Opening frame may not stop scroll for festive shoppers.",
        "evidence_citations": ["metrics.avg_hook_rate_3s"]
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "recommendation": "Lead with product hero in first 1s.",
        "reason": "Hook underperforms peers with earlier product reveal.",
        "evidence_citations": ["metrics.avg_hook_rate_3s", "peers.cr_476183_02"]
      }
    ],
    "similar_creative_insights": [
      "Peer cr_476183_02 uses ORDER_NOW with earlier logo lockup."
    ],
    "next_tests": [
      "A/B first frame: product vs lifestyle",
      "Swap CTA to ORDER_NOW for 3 days"
    ]
  },
  "llm_error": null
}
```

UI rule: **observation** = fact; **interpretation** = inference. Never invent metrics.

---

### Nested `recommend` — RecommendPlan (null on analyse-only)

```json
{
  "creative_id": "cr_476183_01",
  "summary": "Tighten the opening hook and keep WhatsApp CTA; test ORDER_NOW as alternate.",
  "items": [
    {
      "priority": "high",
      "action": "Cut to product within first 1 second.",
      "reason": "Hook rate lags peer set for festive_event.",
      "evidence_citations": ["metrics.avg_hook_rate_3s"],
      "kind": "fact_based"
    },
    {
      "priority": "medium",
      "action": "Add stronger logo lockup in first frame.",
      "reason": "Brand recognition aids thumb-stop on heritage creatives.",
      "evidence_citations": ["content_matrix.logo_clarity"],
      "kind": "inference"
    }
  ],
  "next_tests": [
    "A/B first frame product vs lifestyle",
    "CTA ORDER_NOW vs SEND_WHATSAPP"
  ],
  "source": "deterministic",
  "created_at": "2026-08-26T04:00:01.000Z"
}
```

---

### Nested `generate` — GenerationResult (null until generate)

```json
{
  "creative_id": "cr_476183_01",
  "recommendation_id": "rec_550e8400-e29b-41d4-a716-446655440000",
  "drafts": [
    {
      "type": "copy",
      "headline": "Mumbai's festive mithai, ready on WhatsApp",
      "primary_text": "Gift boxes packed fresh. Message us to order today.",
      "cta": "SEND_WHATSAPP",
      "status": "draft",
      "evidence_citations": ["recommend.items[0]", "brand.cta_preferences"]
    },
    {
      "type": "concept",
      "concept_notes": "Open on gold box macro; 1s logo; human hands gifting; end card WhatsApp.",
      "status": "draft",
      "evidence_citations": ["content_matrix.script_summary"]
    },
    {
      "type": "static_image",
      "image_prompt": "Premium Indian mithai gift box on warm cream marble, maroon and gold accents, MM Mithaiwala logo top-left, soft festive lighting, no discount spam text",
      "status": "draft",
      "evidence_citations": ["brand.colours", "recommend.items[0]"]
    }
  ],
  "created_at": "2026-08-26T04:00:02.000Z"
}
```

For `static_image`, show **`image_prompt` text only** — caption: “Prompt only — render/publish not enabled.”

### ARG errors

**403** `{ "error": "Forbidden", "code": "forbidden" }`  
**400** `{ "error": "...", "code": "bad_request" }`

---

## 4. Recommendations (persisted)

### `GET /v1/recommendations?creativeId=` (Bearer, viewer+)

Optional query: `creativeId`

**200**

```json
{
  "items": [
    {
      "recommendation_id": "rec_550e8400-e29b-41d4-a716-446655440000",
      "creative_id": "cr_476183_01",
      "payload": {
        "stage": "generate",
        "diagnosis": {
          "summary": "...",
          "findings": [],
          "metrics": {},
          "llm_analysis_available": false,
          "llm_analysis": null,
          "llm_error": null
        },
        "recommend": {
          "creative_id": "cr_476183_01",
          "summary": "...",
          "items": [],
          "next_tests": [],
          "source": "deterministic",
          "created_at": "2026-08-26T04:00:01.000Z"
        }
      },
      "citations": ["metrics.avg_hook_rate_3s", "peers.cr_476183_02"],
      "status": "draft",
      "created_at": "2026-08-26T04:00:01.000Z",
      "updated_at": "2026-08-26T04:00:01.000Z"
    }
  ]
}
```

`status`: `"draft" | "approved" | "rejected"`

Payload variants:

- analyse persist: `{ stage:"analyse", summary, findings, metrics, similar_creatives, llm_* }`
- recommend/generate: `{ stage, diagnosis:{...}, recommend: RecommendPlan }`

---

### `GET /v1/recommendations/{id}` (Bearer, viewer+)

**200** — one recommendation row (same as list item).  
**404** `{ "error": "Recommendation not found: ...", "code": "not_found" }`

---

### `PATCH /v1/recommendations/{id}` (Bearer, **admin**)

**Request**

```json
{
  "status": "approved",
  "payload": null
}
```

`status` required; `payload` optional (replaces JSON if provided).

**200** — updated row. **403** non-admin.

---

## 5. Generations (persisted)

### `GET /v1/generations?recommendationId=` (Bearer, viewer+)

**200**

```json
{
  "items": [
    {
      "generation_id": "gen_11111111-1111-1111-1111-111111111111",
      "recommendation_id": "rec_550e8400-e29b-41d4-a716-446655440000",
      "type": "copy",
      "content": "{\"type\":\"copy\",\"headline\":\"Mumbai's festive mithai, ready on WhatsApp\",\"primary_text\":\"Gift boxes packed fresh. Message us to order today.\",\"cta\":\"SEND_WHATSAPP\",\"status\":\"draft\",\"evidence_citations\":[\"recommend.items[0]\"]}",
      "media_path": null,
      "status": "draft",
      "created_at": "2026-08-26T04:00:02.000Z",
      "updated_at": "2026-08-26T04:00:02.000Z"
    }
  ]
}
```

**Critical:** `content` is a **JSON string** of `GenerationDraft`. Always `JSON.parse(item.content)` before UI render.

---

### `PATCH /v1/generations/{id}` (Bearer, **admin**)

**Request** `{ "status": "approved" }`  
**200** — updated generation row.

---

## 6. CRM (leads)

### `GET /v1/leads` (Bearer, viewer+)

Query optional: `creativeId`, `brandId`, `stage`

**200**

```json
{
  "items": [
    {
      "lead_id": "lead_001",
      "brand_id": "brand_mm_mithaiwala",
      "creative_id": "cr_476183_01",
      "campaign_id": "camp_xxx",
      "name": "Priya Shah",
      "phone": "+91XXXXXXXXXX",
      "email": "priya@example.com",
      "stage": "new",
      "ad_ref": "ad_ref_xxx",
      "source_channel": "whatsapp",
      "created_at": "2026-08-20T10:00:00.000Z",
      "provenance": "synthetic",
      "updated_at": "2026-08-20T10:00:00.000Z"
    }
  ]
}
```

`stage`: `"new" | "engaged" | "intent" | "visit_booked" | "visited" | "sale"`  
Max ~200 rows, newest first.

---

### `GET /v1/leads/{id}` (Bearer, viewer+)

**200** — one lead. **404** if missing.

---

### `PATCH /v1/leads/{id}/stage` (Bearer, **analyst+**)

**Request** `{ "stage": "engaged" }`  
**200** — updated lead.

---

## 7. Brands

### `GET /v1/brands/{brandId}` (Bearer, viewer+)

Use `brand_mm_mithaiwala`.

**200**

```json
{
  "brand_id": "brand_mm_mithaiwala",
  "name": "MM Mithaiwala",
  "tagline": "Mumbai's iconic mithai shop since 1976",
  "provenance": "synthetic",
  "created_at": "2026-08-25T00:00:00.000Z",
  "updated_at": "2026-08-25T00:00:00.000Z"
}
```

---

### `GET /v1/brands/{brandId}/kit` (Bearer, viewer+)

**200**

```json
{
  "brand_id": "brand_mm_mithaiwala",
  "colours": {
    "primary": "#7A1F2B",
    "secondary": "#C4A35A",
    "accent": "#F3E6C8",
    "background": "#FFF8F0",
    "text": "#1F1A17"
  },
  "fonts": {
    "display": "Playfair Display",
    "body": "Source Sans 3"
  },
  "tone": [
    "premium but warm",
    "festive",
    "Mumbai heritage",
    "gift-forward",
    "no slang-heavy Gen-Z voice"
  ],
  "must_include": [
    "brand name or logo clarity",
    "product clearly visible"
  ],
  "must_avoid": [
    "discount-only spam",
    "competitor names",
    "medical claims"
  ],
  "cta_preferences": [
    "ORDER_NOW",
    "SEND_WHATSAPP",
    "SHOP_NOW"
  ],
  "markets": [
    "Mumbai",
    "Maharashtra",
    "Gujarat",
    "India delivery"
  ],
  "logo_path": "storage/brand/mm_logo_placeholder.svg",
  "created_at": "2026-08-25T00:00:00.000Z",
  "updated_at": "2026-08-25T00:00:00.000Z"
}
```

JSON fields arrive as objects/arrays (already parsed).

---

# Pages & IA (build these)

**8 primary routes** + authenticated shell. Independent app — you own the entire `src/`.

### 0. App shell (authenticated)

- Nav: Creatives, Recommendations, Generations, CRM, Brand kit, role chip, Logout.
- Persistent **Demo data** badge (from `/health` `dataMode` or hardcode “Demo data” when synthetic).
- Responsive; Framer Motion page transitions + list stagger (2–3 intentional motions).

### 1. `/login`

- Email + password; demo credential chips (admin/analyst/viewer).
- Login API → store token → `/creatives`.

### 2. `/creatives`

- `GET /creatives`; search/filter client-side; click → detail.

### 3. `/creatives/:creativeId` (core)

- `GET /creatives/:id`.
- Sections: Overview, Metrics (`metrics_daily` charts), Content matrix, Intelligence (ARG).
- Analyst+: `useLlm` / `persist` toggles; Analyse / Recommend / Generate / full loop (`POST /v1/generate`).
- Render findings, citations, recommend items, drafts.
- Viewer: read-only “Ask an analyst to run analysis”.

### 4. `/recommendations`

- List + detail from `payload`; admin Approve/Reject.

### 5. `/generations`

- List; **JSON.parse(content)**; admin Approve/Reject.

### 6. `/crm`

- Leads list/kanban by stage; analyst+ stage PATCH; link to creative.

### 7. `/brand`

- Brand + kit for `brand_mm_mithaiwala`; swatches, tone, rules, CTAs, markets.

### 8. `/`

- Auth → `/creatives`; else → `/login`.

**Do not build:** Meta connect, video editor, trends admin, multi-brand switcher, settings beyond logout.

---

## Suggested `src/` structure (standalone)

```text
src/
  app/                 # App.tsx, providers, router, AuthGate
  features/
    auth/
    creatives/
    analysis/          # ARG panel
    recommendations/
    generations/
    crm/
    brand/
    demo/              # DemoBadge
  shared/
    api/client.ts      # fetch wrapper + Bearer
    hooks/
    ui/
  types/cpi.ts         # types from this prompt
  styles/
  main.tsx
```

---

## API client requirements

```ts
// shared/api/client.ts — conceptual
const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3141";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("cpi_access_token");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? res.statusText) as Error & {
      status: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data as T;
}
```

Handle network failures (backend down) with a clear message.

---

## Design direction (sleek modern — hard constraints)

- One composition per viewport; avoid AI dashboard soup.
- Product name **CPI** / “Creative Performance Intelligence” as a strong shell mark.
- Expressive typography (not Inter/Roboto/Arial/system defaults). You may load fonts similar to brand kit (`Playfair Display` + `Source Sans 3`) via Google Fonts — or choose another expressive pair that fits heritage mithai.
- Atmosphere: subtle gradients / soft grain — not flat gray or purple-on-white cliché.
- **Avoid:** purple-indigo AI gradients, cream+#terracotta brochure cliché, newspaper columns, emoji decoration, glow spam, rounded-full pill overload.
- Color system suggestion from brand kit: maroon `#7A1F2B`, gold `#C4A35A`, cream `#FFF8F0`, text `#1F1A17` — use CSS variables.
- Cards only where they aid interaction.
- Motion: route fade/slide, list stagger, button press — restrained.
- Always show **Demo data** badge.

---

## UX copy rules

- Never invent metrics; only show API numbers.
- Label LLM interpretation vs measured findings.
- Empty states: “No recommendations yet — run Analyse on a creative.”
- Image drafts: show `image_prompt`; “Prompt only — render/publish not enabled.”
- Parse generation `content` JSON strings before display.
- Coerce decimal metric strings for charts.

---

## Acceptance checklist

- [ ] New independent Vite React app (own folder/repo), not inside backend monorepo.
- [ ] `.env` with `VITE_API_BASE_URL`.
- [ ] Login works for all 3 demo users; role gates correct.
- [ ] Creative list + detail match documented shapes.
- [ ] Analyst can run analyse/recommend/generate and render nested results.
- [ ] Admin can approve/reject recommendation & generation.
- [ ] CRM list + stage update for analyst.
- [ ] Brand kit page for `brand_mm_mithaiwala`.
- [ ] 401 → login; 403 → friendly message; API-down message clear.
- [ ] Generation inbox parses `content` JSON strings.
- [ ] Tailwind + Framer Motion; Demo badge visible.
- [ ] No fake endpoints; no Meta publish; no `@cpi/*` package imports.

---

## Suggested implementation order

1. Scaffold Vite app + Tailwind + router + types file  
2. API client + auth store + login + route guards  
3. Shell + Demo badge + creatives list/detail  
4. ARG panel  
5. Recommendations + generations approval  
6. CRM  
7. Brand kit  
8. Motion polish + empty/error states  

---

