/* ===================================================
 * MTPS API Service — Communicates with Cloudflare Workers
 * =================================================== */

import type {
  GenerateRequest,
  GenerateResponse,
  VerifyRequest,
  VerifyResponse,
  ReadingRequest,
  ReadingResponse,
  ArchetypesResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }

  return res.json() as Promise<T>;
}

/** POST /api/generate — Generate a parameterised deck & spread */
export function generateDeck(params: GenerateRequest): Promise<GenerateResponse> {
  return request<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/** POST /api/verify — Run LTL model checking on a reading */
export function verifyReading(data: VerifyRequest): Promise<VerifyResponse> {
  return request<VerifyResponse>('/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** GET /api/archetypes — Fetch predefined archetype families */
export function getArchetypes(): Promise<ArchetypesResponse> {
  return request<ArchetypesResponse>('/archetypes');
}

/** POST /api/readings — Generate narrative reading */
export function generateNarrative(data: ReadingRequest): Promise<ReadingResponse> {
  return request<ReadingResponse>('/readings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
