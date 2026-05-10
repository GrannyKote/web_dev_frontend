import { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import CartPage from './pages/CartPage'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductPage from './pages/ProductPage'
import TextPage from './pages/TextPage'
import { fetchCatalogItems, fetchFeature3Values, orderBase } from './utils/catalogApi'

function App() {
  const [products, setProducts] = useState([])
  const [feature3Options, setFeature3Options] = useState([])
  const [cartItems, setCartItems] = useState({})
  const [lastOrderNumber, setLastOrderNumber] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const isFirstCatalogFetchRef = useRef(true)

  const loadCatalog = useCallback(async (filters = {}) => {
    if (isFirstCatalogFetchRef.current) {
      setIsLoading(true)
    }
    setLoadError('')
    try {
      const [items, options] = await Promise.all([
        fetchCatalogItems(filters),
        fetchFeature3Values(),
      ])
      setProducts(items)
      setFeature3Options(options)
    } catch (error) {
      setLoadError('Не удалось загрузить каталог. Проверьте backend сервисы.')
      console.error(error)
    } finally {
      if (isFirstCatalogFetchRef.current) {
        setIsLoading(false)
      }
      isFirstCatalogFetchRef.current = false
    }
  }, [])

  useEffect(() => {
    // Начальная загрузка каталога и опций feature_3 с API
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadCatalog асинхронно обновляет состояние после ответа
    void loadCatalog({})
  }, [loadCatalog])

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

  const handleConfirmOrder = async ({ delivery, address, phone }) => {
    const payload = {
      delivery,
      address: delivery ? address : null,
      phone,
      items: Object.entries(cartItems).map(([itemId, quantity]) => ({
        item_id: Number(itemId),
        quantity,
      })),
    }
    const response = await fetch(`${orderBase}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Order API status: ${response.status}`)
    }

    const createdOrder = await response.json()
    setLastOrderNumber(createdOrder.number)
    setCartItems({})
    return createdOrder.number
  }

  if (isLoading) {
    return <p style={{ padding: '2rem' }}>Загрузка каталога...</p>
  }

  if (loadError) {
    return <p style={{ padding: '2rem', color: '#dc2626' }}>{loadError}</p>
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={
            <CatalogPage
              products={products}
              feature3Options={feature3Options}
              onAddToCart={handleAddToCart}
              onApplyFilters={loadCatalog}
            />
          }
        />
        <Route
          path="product/:productId"
          element={
            <ProductPage products={products} onAddToCart={handleAddToCart} />
          }
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
