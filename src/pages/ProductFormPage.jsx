import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import { useAuth } from '../utils/AuthContext'
import {
  createCatalogItem,
  fetchCatalogItemById,
  photoSrcFromCatalogApi,
  updateCatalogItem,
} from '../utils/catalogApi'

const MAX_PHOTO_BYTES = 800 * 1024

const EMPTY_FORM = {
  name: '',
  description: '',
  feature_1: '',
  feature_2: '',
  feature_3: '',
  price: '',
  stock: '',
}

const EMPTY_PHOTO_STATE = {
  base64: null,
  touched: false,
  cleared: false,
}

function rawToForm(raw) {
  if (!raw) return EMPTY_FORM
  return {
    name: raw.name ?? '',
    description: raw.description ?? '',
    feature_1: raw.feature_1 ?? '',
    feature_2:
      raw.feature_2 === null || raw.feature_2 === undefined
        ? ''
        : String(raw.feature_2),
    feature_3: raw.feature_3 ?? '',
    price:
      raw.price === null || raw.price === undefined ? '' : String(raw.price),
    stock:
      raw.stock === null || raw.stock === undefined ? '' : String(raw.stock),
  }
}

function toPayload(form, photo) {
  const payload = {
    name: form.name.trim(),
    description: form.description,
    feature_1: form.feature_1 || null,
    feature_3: form.feature_3.trim() || null,
  }
  if (form.feature_2 !== '') {
    const n = Number(String(form.feature_2).replace(',', '.'))
    payload.feature_2 = Number.isFinite(n) ? n : null
  } else {
    payload.feature_2 = null
  }
  if (form.price !== '') {
    const n = Number(String(form.price).replace(',', '.'))
    if (Number.isFinite(n)) payload.price = n
  }
  if (form.stock !== '') {
    const n = Number(form.stock)
    if (Number.isFinite(n)) payload.stock = Math.trunc(n)
  }
  if (photo.touched) {
    payload.photo = photo.cleared ? null : photo.base64
  }
  return payload
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Не удалось прочитать файл'))
        return
      }
      const commaIndex = result.indexOf(',')
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Ошибка чтения файла'))
    reader.readAsDataURL(file)
  })
}

function ProductFormPage({ mode, products, onCatalogChanged }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()

  const isEdit = mode === 'edit'
  const id = isEdit ? Number(productId) : null
  const fromList =
    isEdit && Number.isFinite(id)
      ? products.find((item) => item.id === id)
      : undefined

  const [product, setProduct] = useState(fromList ?? null)
  const [form, setForm] = useState(() =>
    isEdit ? rawToForm(fromList?.raw) : EMPTY_FORM,
  )
  const [photo, setPhoto] = useState(EMPTY_PHOTO_STATE)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) {
      return
    }
    if (!Number.isFinite(id)) {
      setNotFound(true)
      return
    }
    if (fromList) {
      setProduct(fromList)
      setForm(rawToForm(fromList.raw))
      setPhoto(EMPTY_PHOTO_STATE)
      setNotFound(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const loaded = await fetchCatalogItemById(id)
      if (cancelled) return
      if (!loaded) {
        setNotFound(true)
        return
      }
      setProduct(loaded)
      setForm(rawToForm(loaded.raw))
      setPhoto(EMPTY_PHOTO_STATE)
    })()
    return () => {
      cancelled = true
    }
  }, [id, fromList, isEdit])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isEdit && notFound) {
    return <Navigate to="/" replace />
  }

  if (isEdit && !product) {
    return (
      <>
        <StoreHero />
        <main className="detail-page">
          <p style={{ padding: '1rem 0' }}>Загрузка...</p>
        </main>
      </>
    )
  }

  const updateField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Можно загрузить только изображение')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(
        `Файл слишком большой (${(file.size / 1024).toFixed(0)} КБ). Максимум ${MAX_PHOTO_BYTES / 1024} КБ.`,
      )
      return
    }
    try {
      const base64 = await readFileAsBase64(file)
      setPhoto({ base64, touched: true, cleared: false })
      setError('')
    } catch (err) {
      setError(err.message || 'Не удалось прочитать файл')
    }
  }

  const handlePhotoDelete = () => {
    setPhoto({ base64: null, touched: true, cleared: true })
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Название обязательно')
      return
    }
    setSubmitting(true)
    try {
      const payload = toPayload(form, photo)
      if (isEdit) {
        await updateCatalogItem(product.id, payload, token)
      } else {
        await createCatalogItem(payload, token)
      }
      onCatalogChanged?.()
      navigate(isEdit ? `/product/${product.id}` : '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Ошибка операции')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isEdit && product) {
      navigate(`/product/${product.id}`)
    } else {
      navigate('/')
    }
  }

  const previewSrc = photo.touched
    ? photo.cleared
      ? null
      : photoSrcFromCatalogApi(photo.base64)
    : (product?.photoSrc ?? null)
  const hasPhoto = Boolean(previewSrc)

  const title = isEdit
    ? `Редактирование товара #${product.id}`
    : 'Новый товар'

  return (
    <>
      <StoreHero />

      <main className="detail-page">
        <form className="product-edit-form" onSubmit={handleSubmit} noValidate>
          <article className="detail-card">
            <div className="detail-main product-edit">
              <div className="detail-top">
                <h3>{title}</h3>
              </div>

              <label className="edit-field">
                <span>Название*</span>
                <input
                  value={form.name}
                  onChange={updateField('name')}
                  required
                />
              </label>

              <label className="edit-field">
                <span>Описание</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={updateField('description')}
                />
              </label>

              <div className="edit-field-grid">
                <label className="edit-field">
                  <span>Характеристика 1</span>
                  <select
                    value={form.feature_1}
                    onChange={updateField('feature_1')}
                  >
                    <option value="">—</option>
                    <option value="вариант 1">вариант 1</option>
                    <option value="вариант 2">вариант 2</option>
                  </select>
                </label>

                <label className="edit-field">
                  <span>Характеристика 2 (число)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.feature_2}
                    onChange={updateField('feature_2')}
                  />
                </label>

                <label className="edit-field">
                  <span>Характеристика 3</span>
                  <input
                    value={form.feature_3}
                    onChange={updateField('feature_3')}
                  />
                </label>
              </div>

              <div className="edit-field-grid">
                <label className="edit-field">
                  <span>Цена</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={updateField('price')}
                  />
                </label>

                <label className="edit-field">
                  <span>Остаток</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={updateField('stock')}
                  />
                </label>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div className="product-actions">
                <button type="submit" disabled={submitting}>
                  {submitting
                    ? 'Сохраняем...'
                    : isEdit
                      ? 'Сохранить'
                      : 'Добавить'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Отмена
                </button>
              </div>
            </div>

            <div className="detail-photo-block">
              <div className="photo-placeholder detail-photo">
                {hasPhoto ? (
                  <img
                    src={previewSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="catalog-photo-fallback">Нет фото</span>
                )}
              </div>
              <div className="photo-actions">
                <label className="btn-secondary photo-upload-btn">
                  {hasPhoto ? 'Заменить фото' : 'Загрузить фото'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
                {hasPhoto && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handlePhotoDelete}
                  >
                    Удалить фото
                  </button>
                )}
              </div>
              <p className="photo-hint">
                JPG, PNG, GIF, WebP. До {MAX_PHOTO_BYTES / 1024} КБ.
              </p>
            </div>
          </article>
        </form>
      </main>
    </>
  )
}

export default ProductFormPage
