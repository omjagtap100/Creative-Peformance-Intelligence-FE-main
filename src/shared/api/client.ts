import {
  AnalyseRecommendGenerateResult,
  ArgRequest,
  AuthUser,
  BrandKitRow,
  BrandRow,
  CreativeBundle,
  CreativeListItem,
  GenerationRow,
  HealthResponse,
  LeadRow,
  LeadStage,
  LoginResult,
  RecommendationRow,
  RecommendationStatus,
  UserRole,
} from '../../types/cpi';
import {
  MOCK_BRAND,
  MOCK_BRAND_KIT,
  MOCK_BUNDLES,
  MOCK_CREATIVES_LIST,
  MOCK_GENERATIONS,
  MOCK_LEADS,
  MOCK_RECOMMENDATIONS,
  MOCK_USERS,
  buildArgMockResult,
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3141';

// Local storage keys
const TOKEN_KEY = 'cpi_access_token';
const USER_KEY = 'cpi_user_info';
const MOCK_LEADS_KEY = 'cpi_mock_leads_data';
const MOCK_RECS_KEY = 'cpi_mock_recs_data';
const MOCK_GENS_KEY = 'cpi_mock_gens_data';

// Connection state listener
export type ConnectionStatus = 'checking' | 'live' | 'mock_offline';
let currentConnectionStatus: ConnectionStatus = 'checking';
const connectionListeners: Array<(status: ConnectionStatus) => void> = [];

export function subscribeConnectionStatus(callback: (status: ConnectionStatus) => void) {
  connectionListeners.push(callback);
  callback(currentConnectionStatus);
  return () => {
    const idx = connectionListeners.indexOf(callback);
    if (idx !== -1) connectionListeners.splice(idx, 1);
  };
}

function setConnectionStatus(status: ConnectionStatus) {
  if (currentConnectionStatus !== status) {
    currentConnectionStatus = status;
    connectionListeners.forEach((fn) => fn(status));
  }
}

// Local mock storage helpers
function getStoredMockLeads(): LeadRow[] {
  try {
    const raw = localStorage.getItem(MOCK_LEADS_KEY);
    return raw ? JSON.parse(raw) : MOCK_LEADS;
  } catch {
    return MOCK_LEADS;
  }
}
function saveStoredMockLeads(leads: LeadRow[]) {
  localStorage.setItem(MOCK_LEADS_KEY, JSON.stringify(leads));
}

function getStoredMockRecs(): RecommendationRow[] {
  try {
    const raw = localStorage.getItem(MOCK_RECS_KEY);
    return raw ? JSON.parse(raw) : MOCK_RECOMMENDATIONS;
  } catch {
    return MOCK_RECOMMENDATIONS;
  }
}
function saveStoredMockRecs(recs: RecommendationRow[]) {
  localStorage.setItem(MOCK_RECS_KEY, JSON.stringify(recs));
}

function getStoredMockGens(): GenerationRow[] {
  try {
    const raw = localStorage.getItem(MOCK_GENS_KEY);
    return raw ? JSON.parse(raw) : MOCK_GENERATIONS;
  } catch {
    return MOCK_GENERATIONS;
  }
}
function saveStoredMockGens(gens: GenerationRow[]) {
  localStorage.setItem(MOCK_GENS_KEY, JSON.stringify(gens));
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Universal API Client for CPI
 * Transparently falls back to resilient local mock engine when backend is offline
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new CustomEvent('cpi_auth_logout'));
      throw new ApiError('Session expired or unauthorized', 401, 'unauthorized');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.error || response.statusText || 'Request failed',
        response.status,
        data.code
      );
    }

    setConnectionStatus('live');
    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network error: Backend is down or unreachable
    // Trigger offline mock fallback
    setConnectionStatus('mock_offline');
    return handleMockFallback<T>(path, options, token);
  }
}

/**
 * High-fidelity Mock Fallback Engine
 */
async function handleMockFallback<T>(
  path: string,
  options: RequestInit,
  token: string | null
): Promise<T> {
  // Simulate natural micro-delay for realistic UI feedback
  await new Promise((resolve) => setTimeout(resolve, 180));

  const method = (options.method || 'GET').toUpperCase();
  const [pathname, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');

  // 0. Public Routes: Health & Root
  if (pathname === '/health' || pathname === '/') {
    return {
      ok: true,
      dataMode: 'synthetic',
      llm: 'simulated_claude_sonnet',
    } as T;
  }

  // 1. Auth: Login
  if (pathname === '/v1/auth/login' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const { email, password } = body;
    const match = MOCK_USERS[email];

    if (!match || match.password !== password) {
      throw new ApiError('Invalid email or password', 401, 'unauthorized');
    }

    const result: LoginResult = {
      accessToken: `mock_jwt_${match.user.role}_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: '7d',
      user: match.user,
    };
    return result as T;
  }

  // Auth: Register (Disabled by default)
  if (pathname === '/v1/auth/register' && method === 'POST') {
    throw new ApiError('Registration is disabled', 403, 'forbidden');
  }

  // Verify auth for protected routes
  let currentUser: AuthUser | null = null;
  if (token) {
    if (token.includes('admin')) {
      currentUser = MOCK_USERS['admin@cpi.demo'].user;
    } else if (token.includes('analyst')) {
      currentUser = MOCK_USERS['analyst@cpi.demo'].user;
    } else {
      currentUser = MOCK_USERS['viewer@cpi.demo'].user;
    }
  }

  if (!currentUser) {
    // Check if user info stored
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) currentUser = JSON.parse(stored);
    } catch {}
  }

  if (!currentUser && !path.startsWith('/v1/auth/login')) {
    throw new ApiError('Authentication required', 401, 'unauthorized');
  }

  // 1. Auth: Me
  if (pathname === '/v1/auth/me') {
    return { user: currentUser! } as T;
  }

  // 2. Creatives List
  if (pathname === '/creatives' && method === 'GET') {
    return { items: MOCK_CREATIVES_LIST } as T;
  }

  // 2. Creative Bundle Detail
  if (pathname.startsWith('/creatives/') && method === 'GET') {
    const creativeId = pathname.replace('/creatives/', '');
    const bundle = MOCK_BUNDLES[creativeId] || MOCK_BUNDLES['cr_476183_01'];
    return bundle as T;
  }

  // 3. ARG Routes (POST /v1/analyse, /v1/recommend, /v1/generate, /v1/arg)
  if (
    (pathname === '/v1/analyse' ||
      pathname === '/v1/recommend' ||
      pathname === '/v1/generate' ||
      pathname === '/v1/arg') &&
    method === 'POST'
  ) {
    // Role check: Minimum analyst
    if (currentUser?.role === 'viewer') {
      throw new ApiError('Insufficient role: Analyst or Admin required for ARG', 403, 'forbidden');
    }

    const body: ArgRequest = options.body ? JSON.parse(options.body as string) : {};
    const creativeId = body.creativeId || 'cr_476183_01';
    const useLlm = body.useLlm !== false;
    const persist = body.persist !== false;

    let targetStage: 'analyse' | 'recommend' | 'generate' = 'generate';
    if (pathname === '/v1/analyse') targetStage = 'analyse';
    else if (pathname === '/v1/recommend') targetStage = 'recommend';
    else if (pathname === '/v1/generate') targetStage = 'generate';
    else if (body.stopAt) targetStage = body.stopAt;

    const result = buildArgMockResult(creativeId, targetStage, useLlm);

    if (persist && result.recommend) {
      // Save recommendation to mock storage
      const existingRecs = getStoredMockRecs();
      const newRec: RecommendationRow = {
        recommendation_id: result.recommendation_id || `rec_${Date.now()}`,
        creative_id: creativeId,
        payload: {
          stage: result.stage,
          diagnosis: result.diagnosis,
          recommend: result.recommend,
        },
        citations: result.diagnosis.findings.flatMap((f) => f.citations),
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveStoredMockRecs([newRec, ...existingRecs]);

      if (result.generate && result.generate.drafts.length > 0) {
        const existingGens = getStoredMockGens();
        const newGens: GenerationRow[] = result.generate.drafts.map((d, i) => ({
          generation_id: result.generation_ids[i] || `gen_${Date.now()}_${i}`,
          recommendation_id: newRec.recommendation_id,
          type: d.type,
          content: JSON.stringify(d),
          media_path: null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        saveStoredMockGens([...newGens, ...existingGens]);
      }
    }

    return result as T;
  }

  // 4. Recommendations List
  if (pathname === '/v1/recommendations' && method === 'GET') {
    const creativeId = params.get('creativeId');
    let list = getStoredMockRecs();
    if (creativeId) {
      list = list.filter((r) => r.creative_id === creativeId);
    }
    return { items: list } as T;
  }

  // 4. Recommendations Detail
  if (pathname.startsWith('/v1/recommendations/') && method === 'GET') {
    const id = pathname.replace('/v1/recommendations/', '');
    const rec = getStoredMockRecs().find((r) => r.recommendation_id === id);
    if (!rec) throw new ApiError(`Recommendation not found: ${id}`, 404, 'not_found');
    return rec as T;
  }

  // 4. Recommendations Update (Admin only)
  if (pathname.startsWith('/v1/recommendations/') && method === 'PATCH') {
    if (currentUser?.role !== 'admin') {
      throw new ApiError('Admin role required to approve/reject recommendations', 403, 'forbidden');
    }
    const id = pathname.replace('/v1/recommendations/', '');
    const body = options.body ? JSON.parse(options.body as string) : {};
    const list = getStoredMockRecs();
    const idx = list.findIndex((r) => r.recommendation_id === id);
    if (idx === -1) throw new ApiError(`Recommendation not found: ${id}`, 404, 'not_found');

    const updated: RecommendationRow = {
      ...list[idx],
      status: body.status || list[idx].status,
      payload: body.payload !== undefined && body.payload !== null ? body.payload : list[idx].payload,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredMockRecs(list);
    return updated as T;
  }

  // 5. Generations List
  if (pathname === '/v1/generations' && method === 'GET') {
    const recommendationId = params.get('recommendationId');
    let list = getStoredMockGens();
    if (recommendationId) {
      list = list.filter((g) => g.recommendation_id === recommendationId);
    }
    return { items: list } as T;
  }

  // 5. Generations Update (Admin only)
  if (pathname.startsWith('/v1/generations/') && method === 'PATCH') {
    if (currentUser?.role !== 'admin') {
      throw new ApiError('Admin role required to approve/reject generations', 403, 'forbidden');
    }
    const id = pathname.replace('/v1/generations/', '');
    const body = options.body ? JSON.parse(options.body as string) : {};
    const list = getStoredMockGens();
    const idx = list.findIndex((g) => g.generation_id === id);
    if (idx === -1) throw new ApiError(`Generation not found: ${id}`, 404, 'not_found');

    const updated: GenerationRow = {
      ...list[idx],
      status: body.status || list[idx].status,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredMockGens(list);
    return updated as T;
  }

  // 6. CRM Leads List
  if (pathname === '/v1/leads' && method === 'GET') {
    const creativeId = params.get('creativeId');
    const stage = params.get('stage');
    let list = getStoredMockLeads();
    if (creativeId) list = list.filter((l) => l.creative_id === creativeId);
    if (stage) list = list.filter((l) => l.stage === stage);
    return { items: list } as T;
  }

  // 6. CRM Lead Detail
  if (pathname.startsWith('/v1/leads/') && !pathname.endsWith('/stage') && method === 'GET') {
    const id = pathname.replace('/v1/leads/', '');
    const lead = getStoredMockLeads().find((l) => l.lead_id === id);
    if (!lead) throw new ApiError(`Lead not found: ${id}`, 404, 'not_found');
    return lead as T;
  }

  // 6. CRM Lead Stage Update (Analyst+)
  if (pathname.startsWith('/v1/leads/') && pathname.endsWith('/stage') && method === 'PATCH') {
    if (currentUser?.role === 'viewer') {
      throw new ApiError('Insufficient role: Analyst or Admin required to update stage', 403, 'forbidden');
    }
    const id = pathname.replace('/v1/leads/', '').replace('/stage', '');
    const body = options.body ? JSON.parse(options.body as string) : {};
    const list = getStoredMockLeads();
    const idx = list.findIndex((l) => l.lead_id === id);
    if (idx === -1) throw new ApiError(`Lead not found: ${id}`, 404, 'not_found');

    const updated: LeadRow = {
      ...list[idx],
      stage: body.stage as LeadStage,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredMockLeads(list);
    return updated as T;
  }

  // 7. Brand
  if (pathname === '/v1/brands/brand_mm_mithaiwala' || pathname.startsWith('/v1/brands/')) {
    if (pathname.endsWith('/kit')) {
      return MOCK_BRAND_KIT as T;
    }
    return MOCK_BRAND as T;
  }

  throw new ApiError(`Endpoint not found: ${path}`, 404, 'not_found');
}

// Typed API Helper Functions
export const api = {
  // Health
  getHealth: () => apiRequest<HealthResponse>('/health'),

  // Auth
  login: (email: string, password: string) =>
    apiRequest<LoginResult>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => apiRequest<{ user: AuthUser }>('/v1/auth/me'),

  // Creatives
  getCreatives: () => apiRequest<{ items: CreativeListItem[] }>('/creatives'),
  getCreativeById: (creativeId: string) =>
    apiRequest<CreativeBundle>(`/creatives/${creativeId}`),

  // ARG Pipeline
  runAnalyse: (req: ArgRequest) =>
    apiRequest<AnalyseRecommendGenerateResult>('/v1/analyse', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  runRecommend: (req: ArgRequest) =>
    apiRequest<AnalyseRecommendGenerateResult>('/v1/recommend', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  runGenerate: (req: ArgRequest) =>
    apiRequest<AnalyseRecommendGenerateResult>('/v1/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  runArg: (req: ArgRequest) =>
    apiRequest<AnalyseRecommendGenerateResult>('/v1/arg', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // Recommendations
  getRecommendations: (creativeId?: string) => {
    const query = creativeId ? `?creativeId=${encodeURIComponent(creativeId)}` : '';
    return apiRequest<{ items: RecommendationRow[] }>(`/v1/recommendations${query}`);
  },
  getRecommendationById: (id: string) =>
    apiRequest<RecommendationRow>(`/v1/recommendations/${id}`),
  updateRecommendationStatus: (id: string, status: RecommendationStatus, payload?: unknown) =>
    apiRequest<RecommendationRow>(`/v1/recommendations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, payload }),
    }),

  // Generations
  getGenerations: (recommendationId?: string) => {
    const query = recommendationId ? `?recommendationId=${encodeURIComponent(recommendationId)}` : '';
    return apiRequest<{ items: GenerationRow[] }>(`/v1/generations${query}`);
  },
  updateGenerationStatus: (id: string, status: RecommendationStatus) =>
    apiRequest<GenerationRow>(`/v1/generations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // CRM Leads
  getLeads: (params?: { creativeId?: string; brandId?: string; stage?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.creativeId) searchParams.set('creativeId', params.creativeId);
    if (params?.brandId) searchParams.set('brandId', params.brandId);
    if (params?.stage) searchParams.set('stage', params.stage);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<{ items: LeadRow[] }>(`/v1/leads${query}`);
  },
  getLeadById: (id: string) => apiRequest<LeadRow>(`/v1/leads/${id}`),
  updateLeadStage: (id: string, stage: LeadStage) =>
    apiRequest<LeadRow>(`/v1/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    }),

  // Brand
  getBrand: (brandId = 'brand_mm_mithaiwala') =>
    apiRequest<BrandRow>(`/v1/brands/${brandId}`),
  getBrandKit: (brandId = 'brand_mm_mithaiwala') =>
    apiRequest<BrandKitRow>(`/v1/brands/${brandId}/kit`),
};
