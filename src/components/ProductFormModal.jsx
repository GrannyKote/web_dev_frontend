import { useEffect, useState } from 'react'
import Modal from './Modal'
import { createCatalogItem, updateCatalogItem } from '../utils/catalogApi'
import { useAuth } from '../utils/AuthContext'

const EMPTY_FORM = {
  name: '',
  description: '',
  feature_1: '',
  feature_2: '',
  feature_3: '',
  price: '',
  stock: '',
}

function rawToForm(raw) {
  if (!raw) return EMPTY_FORM
  return {
    name: raw.name ?? '',
    description: raw.description ?? '',
    feature_1: raw.feature_1 ?? '',
    feature_2: raw.feature_2 === null || raw.feature_2 === undefined ? '' : String(raw.feature_2),
    feature_3: raw.feature_3 ?? '',
    price: raw.price === null || raw.price === undefined ? '' : String(raw.price),
    stock: raw.stock === null || raw.stock === undefined ? '' : String(raw.stock),
  }
}

function toPayload(form) {
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
  return payload
}

function ProductFormModal({ mode, product, onClose, onSaved }) {
  const { token } = useAuth()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() => (isEdit ? rawToForm(product?.raw) : EMPTY_FORM))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm(isEdit ? rawToForm(product?.raw) : EMPTY_FORM)
    setError('')
  }, [product, isEdit])

  const updateField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Название обязательно')
      return
    }
    setSubmitting(true)
    try {
      const payload = toPayload(form)
      if (isEdit) {
        await updateCatalogItem(product.id, payload, token)
      } else {
        await createCatalogItem(payload, token)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Ошибка операции')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={isEdit ? `Редактирование товара #${product?.id}` : 'Новый товар'}
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Название*</span>
          <input value={form.name} onChange={updateField('name')} required />
        </label>
        <label>
          <span>Описание</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={updateField('description')}
          />
        </label>
        <label>
          <span>Характеристика 1</span>
          <select value={form.feature_1} onChange={updateField('feature_1')}>
            <option value="">—</option>
            <option value="вариант 1">вариант 1</option>
            <option value="вариант 2">вариант 2</option>
          </select>
        </label>
        <label>
          <span>Характеристика 2 (число)</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.feature_2}
            onChange={updateField('feature_2')}
          />
        </label>
        <label>
          <span>Характеристика 3</span>
          <input value={form.feature_3} onChange={updateField('feature_3')} />
        </label>
        <label>
          <span>Цена</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={updateField('price')}
          />
        </label>
        <label>
          <span>Остаток</span>
          <input type="number" min="0" value={form.stock} onChange={updateField('stock')} />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Сохраняем...' : isEdit ? 'Сохранить' : 'Добавить'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductFormModal
