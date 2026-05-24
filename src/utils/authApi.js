export const gatewayBase =
  import.meta.env.VITE_GATEWAY_API_URL ??
  (import.meta.env.DEV ? '' : 'http://127.0.0.1:8080')

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeAuth(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* localStorage недоступен */
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* localStorage недоступен */
  }
}

export function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseError(response) {
  try {
    const data = await response.json()
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ')
      }
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    }
    return JSON.stringify(data)
  } catch {
    return `HTTP ${response.status}`
  }
}

export async function registerUser({ username, password, email }) {
  const response = await fetch(`${gatewayBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email: email || null }),
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json()
}

export async function loginUser({ username, password }) {
  const response = await fetch(`${gatewayBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  return response.json()
}
