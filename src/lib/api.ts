import { getIdToken } from './firebase'

const BASE = import.meta.env.VITE_WORKER_URL ?? ''

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function saveDesign(payload: {
  product_id: number
  garment_type: string
  garment_color: string
  custom_image_url: string | null
}): Promise<void> {
  const res = await fetch(`${BASE}/api/designs`, {
    method: 'POST',
    headers: await authHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Save failed: ${res.status}`)
}

export async function fetchDesigns() {
  const res = await fetch(`${BASE}/api/designs`, {
    headers: await authHeaders(),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const { data } = await res.json<{ data: unknown[] }>()
  return data
}
