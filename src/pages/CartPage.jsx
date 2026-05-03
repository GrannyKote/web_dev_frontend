import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import { formatPrice } from '../utils/price'

function CartPage({ products, cartItems, onIncrease, onDecrease, onRemove }) {
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

  return (
    <>
      <StoreHero />

      <main className="cart-page">
        <section className="cart-card">
          <h3>Корзина</h3>

          {items.length === 0 ? (
            <p className="cart-empty">Корзина пока пустая.</p>
          ) : (
            <div className="cart-list">
              {items.map((item) => (
                <article key={item.productId} className="cart-row">
                  <p className="cart-name">{item.name}</p>

                  <div className="qty-control">
                    <button type="button" onClick={() => onDecrease(item.productId)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => onIncrease(item.productId)}>
                      +
                    </button>
                  </div>

                  <p className="cart-price">{formatPrice(item.totalCents)}</p>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => onRemove(item.productId)}
                    aria-label={`Удалить ${item.name}`}
                  >
                    x
                  </button>
                </article>
              ))}
            </div>
          )}

          <div className="cart-total">
            <p>Итого</p>
            <strong>{formatPrice(totalCents)}</strong>
          </div>

          {items.length === 0 ? (
            <button type="button" className="checkout-button" disabled>
              Сформировать заказ
            </button>
          ) : (
            <Link to="/checkout" className="checkout-button">
              Сформировать заказ
            </Link>
          )}
        </section>
      </main>
    </>
  )
}

export default CartPage
