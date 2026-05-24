import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import OrderEditModal from '../components/OrderEditModal'
import { useAuth } from '../utils/AuthContext'
import { deleteOrder, fetchOrders } from '../utils/catalogApi'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function OrdersListPage() {
  const { isAuthenticated, token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOrder, setEditingOrder] = useState(null)

  const reload = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchOrders(token)
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated) return
    void reload()
  }, [isAuthenticated, reload])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleDelete = async (order) => {
    if (!window.confirm(`Удалить заказ ${order.number}?`)) {
      return
    }
    setError('')
    try {
      await deleteOrder(order.id, token)
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
    } catch (err) {
      setError(err.message || 'Не удалось удалить заказ')
    }
  }

  const handleSaved = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
  }

  return (
    <main className="orders-page">
      <header className="orders-header">
        <h2>Список заказов</h2>
        <button type="button" className="btn-secondary" onClick={() => void reload()}>
          Обновить
        </button>
      </header>

      {error && <p className="auth-error">{error}</p>}

      {loading ? (
        <p>Загрузка...</p>
      ) : orders.length === 0 ? (
        <p>Заказов пока нет.</p>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Номер</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Телефон</th>
                <th>Доставка</th>
                <th>Адрес</th>
                <th>Создан</th>
                <th>Позиции</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.number}</td>
                  <td>{order.status ?? '—'}</td>
                  <td>{order.amount ?? '—'}</td>
                  <td>{order.phone}</td>
                  <td>{order.delivery ? 'Да' : 'Нет'}</td>
                  <td>{order.address ?? '—'}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <ul className="orders-items">
                      {order.items.map((it) => (
                        <li key={it.id}>
                          {it.name} × {it.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div className="orders-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingOrder(order)}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(order)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={handleSaved}
        />
      )}
    </main>
  )
}

export default OrdersListPage
