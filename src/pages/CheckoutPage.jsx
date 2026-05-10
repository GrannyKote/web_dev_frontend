import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import { formatPrice } from '../utils/price'

function CheckoutPage({ products, cartItems, onConfirmOrder }) {
  const navigate = useNavigate()
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const productById = new Map(products.map((product) => [product.id, product]))

  const items = Object.entries(cartItems)
    .map(([productId, quantity]) => {
      const product = productById.get(Number(productId))
      if (!product) {
        return null
      }

      return {
        productId: product.id,
        name: product.name,
        quantity,
        totalCents: product.priceCents * quantity,
      }
    })
    .filter(Boolean)

  const totalCents = items.reduce((sum, item) => sum + item.totalCents, 0)
  const isDelivery = deliveryType === 'delivery'
  const canConfirm =
    items.length > 0 &&
    phone.trim().length > 0 &&
    (isDelivery ? address.trim().length > 0 : true)

  const handleConfirmOrder = async () => {
    if (!canConfirm) {
      return
    }
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const orderNumber = await onConfirmOrder({
        delivery: isDelivery,
        address,
        phone,
      })
      navigate('/order-success', { state: { orderNumber } })
    } catch (error) {
      setSubmitError('Не удалось создать заказ. Попробуйте еще раз.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <StoreHero />

      <main className="checkout-page">
        <section className="checkout-card">
          <h3>Заказ</h3>

          {items.length === 0 ? (
            <p className="checkout-empty">Корзина пуста. Добавьте товары перед оформлением.</p>
          ) : (
            <>
              <div className="checkout-list">
                {items.map((item) => (
                  <article key={item.productId} className="checkout-row">
                    <p>{item.name}</p>
                    <p>{item.quantity} шт.</p>
                    <p>{formatPrice(item.totalCents)}</p>
                  </article>
                ))}
              </div>

              <div className="checkout-total">
                <p>Итого</p>
                <strong>{formatPrice(totalCents)}</strong>
              </div>
            </>
          )}

          <div className="delivery-switch">
            <label>
              <input
                type="radio"
                name="deliveryType"
                checked={deliveryType === 'delivery'}
                onChange={() => setDeliveryType('delivery')}
              />
              Доставка
            </label>
            <label>
              <input
                type="radio"
                name="deliveryType"
                checked={deliveryType === 'pickup'}
                onChange={() => setDeliveryType('pickup')}
              />
              Самовывоз
            </label>
          </div>

          <div className="checkout-fields">
            <label>
              Адрес доставки:
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={!isDelivery}
              />
            </label>
            <label>
              Контактный номер телефона:
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>

          <p className="checkout-note">Оплата производится при получении товара.</p>
          {submitError ? <p className="checkout-note">{submitError}</p> : null}

          <button
            type="button"
            className="confirm-order-button"
            disabled={!canConfirm || isSubmitting}
            onClick={handleConfirmOrder}
          >
            {isSubmitting ? 'Создание заказа...' : 'Подтвердить заказ'}
          </button>
        </section>
      </main>
    </>
  )
}

export default CheckoutPage
