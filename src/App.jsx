import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { initialProducts } from './data/products'
import AppLayout from './layouts/AppLayout'
import CartPage from './pages/CartPage'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductPage from './pages/ProductPage'
import TextPage from './pages/TextPage'

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
