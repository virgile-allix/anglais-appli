// URL de ton API backend (Vercel)
// En dev : http://localhost:3001
// En prod : https://anglais-api.vercel.app (à adapter après déploiement)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(error.message || `Erreur ${res.status}`)
  }

  return res.json()
}
