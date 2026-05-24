import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ProductFormModal from '../components/ProductFormModal'
import StoreHero from '../components/StoreHero'
import { useAuth } from '../utils/AuthContext'
import { deleteCatalogItem, fetchCatalogItemById } from '../utils/catalogApi'
import { formatPrice } from '../utils/price'

function ProductPage({ products, onAddToCart, onCatalogChanged }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const id = Number(productId)
  const fromList = Number.isFinite(id) ? products.find((item) => item.id === id) : undefined

  const [product, setProduct] = useState(fromList ?? null)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- выравнивание product при смене id / списка */
    if (!Number.isFinite(id)) {
      setProduct(null)
      setNotFound(false)
      return
    }
    if (fromList) {
      setProduct(fromList)
      setNotFound(false)
      return
    }
    setProduct(null)
    setNotFound(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id, fromList])

  useEffect(() => {
    if (!Number.isFinite(id)) {
      return
    }
    let cancelled = false
    ;(async () => {
      const loaded = await fetchCatalogItemById(id)
      if (cancelled) {
        return
      }
      if (!loaded) {
        setNotFound(true)
        return
      }
      setProduct(loaded)
    })()
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  if (!Number.isFinite(id)) {
    return <Navigate to="/" replace />
  }

  if (notFound) {
    return <Navigate to="/" replace />
  }

  if (!product) {
    return (
      <>
        <StoreHero />
        <main className="detail-page">
          <p style={{ padding: '1rem 0' }}>Загрузка...</p>
        </main>
      </>
    )
  }

  const handleDelete = async () => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) {
      return
    }
    setActionError('')
    try {
      await deleteCatalogItem(product.id, token)
      onCatalogChanged?.()
      navigate('/', { replace: true })
    } catch (err) {
      setActionError(err.message || 'Не удалось удалить товар')
    }
  }

  const handleSaved = () => {
    onCatalogChanged?.()
    setReloadKey((value) => value + 1)
  }

  return (
    <>
      <StoreHero />

      <main className="detail-page">
        <article className="detail-card">
          <div className="detail-main">
            <div className="detail-top">
              <h3>{product.name}</h3>
              <p className="price">{formatPrice(product.priceCents)}</p>
            </div>
            <p>{product.description}</p>
            <ul className="detail-features">
              {product.features.map((feature, index) => (
                <li key={`${index}-${feature}`}>{feature}</li>
              ))}
            </ul>
            <p>{product.available}</p>

            <div className="product-actions">
              <button type="button" onClick={() => onAddToCart(product.id)}>
                В корзину
              </button>
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditing(true)}
                  >
                    Редактировать
                  </button>
                  <button type="button" className="btn-danger" onClick={handleDelete}>
                    Удалить
                  </button>
                </>
              )}
            </div>
            {actionError && <p className="auth-error">{actionError}</p>}
          </div>
          <div className="photo-placeholder detail-photo">
            {product.photoSrc ? (
              <img
                src={product.photoSrc}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="catalog-photo-fallback">Нет фото</span>
            )}
          </div>
        </article>
      </main>

      {editing && (
        <ProductFormModal
          mode="edit"
          product={product}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

export default ProductPage
