import { useEffect, useState } from 'react'
import Modal from './Modal'
import { updateOrder } from '../utils/catalogApi'
import { useAuth } from '../utils/AuthContext'

const STATUSES = [
  'Создан',
  'Передан в доставку',
  'Доставлен/Готов к выдаче',
  'Оплачен',
  'Отменен',
]

function OrderEditModal({ order, onClose, onSaved }) {
  const { token } = useAuth()
  const [status, setStatus] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [delivery, setDelivery] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!order) return
    setStatus(order.status ?? '')
    setPhone(order.phone ?? '')
    setAddress(order.address ?? '')
    setDelivery(Boolean(order.delivery))
    setError('')
  }, [order])

  if (!order) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        status: status || undefined,
        phone: phone || undefined,
        address: delivery ? address || undefined : null,
        delivery,
      }
      const updated = await updateOrder(order.id, payload, token)
      onSaved?.(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Не удалось обновить заказ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Редактирование заказа ${order.number}`} onClose={onClose}>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          <span>Статус</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">—</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Телефон</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={delivery}
            onChange={(e) => setDelivery(e.target.checked)}
          />{' '}
          Доставка
        </label>
        {delivery && (
          <label>
            <span>Адрес доставки</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
        )}
        <div className="order-items">
          <strong>Позиции:</strong>
          <ul>
            {order.items.map((it) => (
              <li key={it.id}>
                {it.name} × {it.quantity} — {it.price}
              </li>
            ))}
          </ul>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Сохраняем...' : 'Сохранить'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default OrderEditModal
