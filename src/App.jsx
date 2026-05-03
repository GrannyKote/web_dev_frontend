import { useState } from 'react'
import {
  Link,
  useLocation,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'

const initialProducts = [
  {
    id: 1,
    name: 'Название лампочки 1',
    description: 'описание 1',
    price: 'цена 1',
    priceCents: 15990,
    photo: 'Фото 1',
    features: ['Характеристика 1: XXX', 'Характеристика 2: XXX', 'Характеристика 3: XXX'],
    available: 'Доступно к заказу: XXX штук',
  },
  {
    id: 2,
    name: 'Название лампочки 2',
    description: 'описание 2',
    price: 'цена 2',
    priceCents: 23990,
    photo: 'Фото 2',
    features: ['Характеристика 1: XXX', 'Характеристика 2: XXX', 'Характеристика 3: XXX'],
    available: 'Доступно к заказу: XXX штук',
  },
]

const formatPrice = (priceCents) => {
  const rubles = Math.floor(priceCents / 100)
  const kopeks = priceCents % 100

  return `${rubles} руб. ${String(kopeks).padStart(2, '0')} коп.`
}

function AppLayout() {
  const navLinkClass = ({ isActive }) =>
    isActive ? 'menu-link menu-link-active' : 'menu-link'

  return (
    <div className="page">
      <header className="top-menu">
        <NavLink to="/" className={navLinkClass}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className={navLinkClass}>
          Корзина
        </NavLink>
        <NavLink to="/login" className={navLinkClass}>
          Войти
        </NavLink>
      </header>
      <Outlet />
    </div>
  )
}

function CatalogPage({ products, onAddToCart }) {
  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>адрес магазина</p>
      </section>

      <section className="banner">
        <h2>Большой рекламный баннер магазина</h2>
      </section>

      <main className="catalog-layout">
        <aside className="filters">
          <h3>Характеристика 1</h3>
          <label>
            <input type="radio" name="feature1" defaultChecked /> вариант 1
          </label>
          <label>
            <input type="radio" name="feature1" /> вариант 2
          </label>

          <h3>Характеристика 2</h3>
          <div className="range-inputs">
            <input type="text" />
            <input type="text" />
          </div>

          <h3>Характеристика 3</h3>
          <select defaultValue="">
            <option value="" disabled>
              Выберите
            </option>
            <option value="1">Опция 1</option>
            <option value="2">Опция 2</option>
          </select>

          <div className="filter-actions">
            <button type="button">Сбросить</button>
            <button type="button">Применить</button>
          </div>
        </aside>

        <section className="products">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-main">
                <Link to={`/product/${product.id}`} className="product-title-link">
                  {product.name}
                </Link>
                <p>{product.description}</p>
                <p className="price">{product.price}</p>
                <button type="button" onClick={() => onAddToCart(product.id)}>
                  В корзину
                </button>
              </div>
              <div className="photo-placeholder">{product.photo}</div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}

function ProductPage({ products, onAddToCart }) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === Number(productId))

  if (!product) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>адрес магазина</p>
      </section>

      <section className="banner">
        <h2>Большой рекламный баннер магазина</h2>
      </section>

      <main className="detail-page">
        <article className="detail-card">
          <div className="detail-main">
            <div className="detail-top">
              <h3>{product.name}</h3>
              <p className="price">{product.price}</p>
            </div>
            <p>{product.description}</p>
            <ul className="detail-features">
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p>{product.available}</p>

            <button type="button" onClick={() => onAddToCart(product.id)}>
              В корзину
            </button>
          </div>
          <div className="photo-placeholder detail-photo">{product.photo}</div>
        </article>
      </main>
    </>
  )
}

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
        priceCents: product.priceCents,
        totalCents: product.priceCents * quantity,
      }
    })
    .filter(Boolean)

  const totalCents = items.reduce((sum, item) => sum + item.totalCents, 0)

  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>адрес магазина</p>
      </section>

      <section className="banner">
        <h2>Большой рекламный баннер магазина</h2>
      </section>

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

function CheckoutPage({ products, cartItems, onConfirmOrder }) {
  const navigate = useNavigate()
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

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

  const handleConfirmOrder = () => {
    if (!canConfirm) {
      return
    }

    const orderNumber = onConfirmOrder()
    navigate('/order-success', { state: { orderNumber } })
  }

  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>адрес магазина</p>
      </section>

      <section className="banner">
        <h2>Большой рекламный баннер магазина</h2>
      </section>

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

          <button
            type="button"
            className="confirm-order-button"
            disabled={!canConfirm}
            onClick={handleConfirmOrder}
          >
            Подтвердить заказ
          </button>
        </section>
      </main>
    </>
  )
}

function OrderSuccessPage({ lastOrderNumber }) {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber ?? lastOrderNumber ?? 'XXX'

  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>адрес магазина</p>
      </section>

      <section className="banner">
        <h2>Большой рекламный баннер магазина</h2>
      </section>

      <main className="order-success-page">
        <section className="order-success-card">
          <p>Номер вашего заказа: {orderNumber}.</p>
          <p>Наш менеджер свяжется с Вами, когда товар будет передан в доставку.</p>
          <strong>Спасибо за заказ!</strong>
        </section>
      </main>
    </>
  )
}

function TextPage({ title }) {
  return (
    <main className="stub-page">
      <h2>{title}</h2>
    </main>
  )
}

function App() {
  const [products, setProducts] = useState(initialProducts)
  const [cartItems, setCartItems] = useState({})
  const [lastOrderNumber, setLastOrderNumber] = useState(null)

  const handleAddToCart = (productId) => {
    const normalizedId = Number(productId)
    const hasProduct = products.some((item) => item.id === normalizedId)

    if (!hasProduct) {
      return
    }

    setCartItems((previous) => ({
      ...previous,
      [normalizedId]: (previous[normalizedId] ?? 0) + 1,
    }))
  }

  const handleIncreaseQuantity = (productId) => {
    setCartItems((previous) => ({
      ...previous,
      [productId]: (previous[productId] ?? 0) + 1,
    }))
  }

  const handleDecreaseQuantity = (productId) => {
    setCartItems((previous) => {
      const currentQuantity = previous[productId] ?? 0
      if (currentQuantity <= 1) {
        return previous
      }

      return { ...previous, [productId]: currentQuantity - 1 }
    })
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems((previous) => {
      const nextItems = { ...previous }
      delete nextItems[productId]
      return nextItems
    })
  }

  const handleConfirmOrder = () => {
    const nextOrderNumber = Math.floor(100 + Math.random() * 900)
    setLastOrderNumber(nextOrderNumber)
    setCartItems({})
    return nextOrderNumber
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={<CatalogPage products={products} onAddToCart={handleAddToCart} />}
        />
        <Route
          path="product/:productId"
          element={<ProductPage products={products} onAddToCart={handleAddToCart} />}
        />
        <Route
          path="cart"
          element={
            <CartPage
              products={products}
              cartItems={cartItems}
              onIncrease={handleIncreaseQuantity}
              onDecrease={handleDecreaseQuantity}
              onRemove={handleRemoveFromCart}
            />
          }
        />
        <Route
          path="checkout"
          element={
            <CheckoutPage
              products={products}
              cartItems={cartItems}
              onConfirmOrder={handleConfirmOrder}
            />
          }
        />
        <Route
          path="order-success"
          element={<OrderSuccessPage lastOrderNumber={lastOrderNumber} />}
        />
        <Route path="login" element={<TextPage title="Войти" />} />
      </Route>
    </Routes>
  )
}

export default App
