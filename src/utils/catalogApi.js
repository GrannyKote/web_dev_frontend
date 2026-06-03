import { authHeader, gatewayBase } from './authApi'

// Все запросы идут через API Gateway:
//   - /catalog/*       — публичный каталог (catalog_service)
//   - /order/{number}  — публичный просмотр заказа, POST /order — оформление
//   - /admin/catalog/* — администрирование товаров (admin_service ↔ catalog через Kafka)
//   - /admin/order/*   — администрирование заказов (admin_service ↔ order через Kafka)
//   - /auth/*          — авторизация
export const catalogBase =
  import.meta.env.VITE_CATALOG_API_URL ?? gatewayBase

export const orderBase =
  import.meta.env.VITE_ORDER_API_URL ?? gatewayBase

export const adminBase =
  import.meta.env.VITE_ADMIN_API_URL ?? gatewayBase

/**
 * API отдаёт photo как сырой base64 (байты картинки). Строим data URL для <img>.
 * @param {string | null | undefined} photo
 * @returns {string | null}
 */
export function photoSrcFromCatalogApi(photo) {
  if (photo == null || typeof photo !== 'string') {
    return null
  }
  const trimmed = photo.trim()
  if (!trimmed) {
    return null
  }
  if (trimmed.startsWith('data:')) {
    return trimmed
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  let mime = 'image/jpeg'
  try {
    const slice = trimmed.slice(0, 48)
    const binary = atob(slice)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      mime = 'image/jpeg'
    } else if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      mime = 'image/png'
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      mime = 'image/gif'
    } else if (
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      mime = 'image/webp'
    }
  } catch {
    /* невалидный base64 — ниже всё равно попробуем jpeg */
  }
  return `data:${mime};base64,${trimmed}`
}

export function mapProduct(item) {
  const featureEntries = [
    ['Характеристика 1', item.feature_1],
    ['Характеристика 2', item.feature_2],
    ['Характеристика 3', item.feature_3],
  ]
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([label, value]) => `${label}: ${value}`)

  return {
    id: item.id,
    name: item.name ?? 'Без названия',
    description: item.description ?? '',
    priceCents: Math.round((Number(item.price) || 0) * 100),
    photoSrc: photoSrcFromCatalogApi(item.photo),
    features: featureEntries,
    available: `Доступно к заказу: ${item.stock ?? 0} штук`,
    raw: item,
  }
}

function appendNumberParam(params, key, raw) {
  if (raw === '' || raw === null || raw === undefined) {
    return
  }
  const n = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(n)) {
    return
  }
  params.set(key, String(n))
}

export async function fetchFeature3Values() {
  const response = await fetch(`${catalogBase}/catalog/feature-3-values`)
  if (!response.ok) {
    throw new Error(`Catalog API status: ${response.status}`)
  }
  return response.json()
}

export async function fetchCatalogItems(filters = {}) {
  const params = new URLSearchParams()
  if (filters.feature_1) {
    params.set('feature_1', filters.feature_1)
  }
  appendNumberParam(params, 'feature_2_from', filters.feature_2_from)
  appendNumberParam(params, 'feature_2_to', filters.feature_2_to)
  if (filters.feature_3) {
    params.set('feature_3', filters.feature_3)
  }
  const qs = params.toString()
  const url = qs ? `${catalogBase}/catalog?${qs}` : `${catalogBase}/catalog`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Catalog API status: ${response.status}`)
  }
  const data = await response.json()
  return data.map(mapProduct)
}

export async function fetchCatalogItemById(id) {
  const response = await fetch(`${catalogBase}/catalog/${id}`)
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return mapProduct(data)
}

async function readError(response) {
  try {
    const data = await response.json()
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ')
      }
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    }
  } catch {
    /* нет JSON — отдадим статус */
  }
  return `HTTP ${response.status}`
}

export async function createCatalogItem(payload, token) {
  const response = await fetch(`${adminBase}/admin/catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json()
}

export async function updateCatalogItem(id, payload, token) {
  const response = await fetch(`${adminBase}/admin/catalog/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json()
}

export async function deleteCatalogItem(id, token) {
  const response = await fetch(`${adminBase}/admin/catalog/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })
  if (!response.ok && response.status !== 204) {
    throw new Error(await readError(response))
  }
}

export async function fetchOrderByNumber(number) {
  const response = await fetch(`${orderBase}/order/${encodeURIComponent(number)}`)
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json()
}

export async function fetchOrders(token) {
  const response = await fetch(`${adminBase}/admin/order`, {
    headers: { ...authHeader(token) },
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json()
}

export async function updateOrder(orderId, payload, token) {
  const response = await fetch(`${adminBase}/admin/order/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }
  return response.json()
}

export async function deleteOrder(orderId, token) {
  const response = await fetch(`${adminBase}/admin/order/${orderId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })
  if (!response.ok && response.status !== 204) {
    throw new Error(await readError(response))
  }
}
