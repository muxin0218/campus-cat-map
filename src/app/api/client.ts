export type Sex = "unknown" | "male" | "female";

export interface CatListItem {
  id: number;
  name: string;
  sex: Sex;
  description: string | null;
  neutered: boolean;
  latitude: number | null;
  longitude: number | null;
  last_seen_at: string | null;
  photo_url: string | null;
}

export interface SightingItem {
  id: number;
  cat_id: number;
  latitude: number;
  longitude: number;
  note: string | null;
  happened_at: string;
  created_at: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as any;
      if (body?.message) message = body.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function listCats(params?: { q?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return requestJson<{ items: CatListItem[] }>(`/api/cats${suffix}`);
}

export async function getCat(id: number) {
  return requestJson<CatListItem>(`/api/cats/${id}`);
}

export async function createCat(input: {
  name: string;
  sex: Sex;
  description?: string;
  neutered?: boolean;
  created_by?: number;
  latitude?: number;
  longitude?: number;
}) {
  return requestJson<{ id: number; name: string; sex: Sex; description: string | null; neutered: boolean }>(`/api/cats`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function listSightings(params?: {
  cat_id?: number;
  reporter_id?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.cat_id != null) qs.set("cat_id", String(params.cat_id));
  if (params?.reporter_id != null) qs.set("reporter_id", String(params.reporter_id));
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return requestJson<{ items: SightingItem[] }>(`/api/sightings${suffix}`);
}

export interface FeedingPointItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export async function listFeedingPoints(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return requestJson<{ items: FeedingPointItem[] }>(`/api/feeding-points${suffix}`);
}

export async function createFeedingPoint(input: {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  created_by?: number;
}) {
  return requestJson<FeedingPointItem>("/api/feeding-points", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateFeedingPoint(id: number, input: {
  name?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}) {
  return requestJson<FeedingPointItem>(`/api/feeding-points/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteFeedingPoint(id: number) {
  await fetch(`${apiBaseUrl}/api/feeding-points/${id}`, { method: "DELETE" });
}

export async function createFeedingEvent(input: {
  feeding_point_id: number;
  feeder_id?: number;
  food_type?: string;
  amount?: string;
  note?: string;
  fed_at?: string;
}) {
  return requestJson<{
    id: number;
    feeding_point_id: number;
    feeder_id: number | null;
    food_type: string | null;
    amount: string | null;
    note: string | null;
    fed_at: string;
    created_at: string;
  }>("/api/feeding-events", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function createSighting(input: {
  cat_id: number;
  latitude: number;
  longitude: number;
  note?: string;
  happened_at?: string;
  reporter_id?: number;
}) {
  return requestJson<SightingItem>(`/api/sightings`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

// ─── 认证相关 API（调用 Python 后端 localhost:8000） ──────

const authBaseUrl = "http://localhost:8000";

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export async function authRegister(username: string, password: string) {
  const res = await fetch(`${authBaseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    let message = `注册失败（${res.status}）`;
    try {
      const body = (await res.json()) as any;
      if (body?.detail) message = body.detail;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as AuthResponse;
}

export async function authLogin(username: string, password: string) {
  const res = await fetch(`${authBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    let message = `登录失败（${res.status}）`;
    try {
      const body = (await res.json()) as any;
      if (body?.detail) message = body.detail;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await res.json()) as AuthResponse;
}

export async function authGetMe() {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("未登录");

  const res = await fetch(`${authBaseUrl}/api/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth-change"));
    }
    throw new Error("获取用户信息失败");
  }

  return (await res.json()) as UserInfo;
}

export function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("auth_token");
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  window.dispatchEvent(new Event("auth-change"));
}

