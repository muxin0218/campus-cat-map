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

export async function listSightings(params?: {
  cat_id?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.cat_id != null) qs.set("cat_id", String(params.cat_id));
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return requestJson<{ items: SightingItem[] }>(`/api/sightings${suffix}`);
}

export async function createSighting(input: {
  cat_id: number;
  latitude: number;
  longitude: number;
  note?: string;
  happened_at?: string;
}) {
  return requestJson<SightingItem>(`/api/sightings`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

