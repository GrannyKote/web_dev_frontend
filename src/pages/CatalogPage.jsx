import { useState } from 'react'
import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'
import { useAuth } from '../utils/AuthContext'
import { deleteCatalogItem } from '../utils/catalogApi'
import { formatPrice } from '../utils/price'

const FEATURE_1_ALL = ''

const FEATURE_1_OPTIONS = [
  { value: FEATURE_1_ALL, label: 'Все' },
  { value: 'вариант 1', label: 'вариант 1' },
  { value: 'вариант 2', label: 'вариант 2' },
]

function CatalogPage({
  products,
  feature3Options = [],
  onAddToCart,
  onApplyFilters,
  onCatalogChanged,
}) {
  const { isAuthenticated, token } = useAuth()
  const [feature1, setFeature1] = useState(FEATURE_1_ALL)
  const [feature2From, setFeature2From] = useState('')
  const [feature2To, setFeature2To] = useState('')
  const [feature3, setFeature3] = useState('')

  const [actionError, setActionError] = useState('')

  const safeFeature3Options = Array.isArray(feature3Options) ? feature3Options : []
  const resolvedFeature3 =
    feature3 && safeFeature3Options.includes(feature3) ? feature3 : ''

  const handleApply = () => {
    onApplyFilters({
      feature_1: feature1 || undefined,
      feature_2_from: feature2From,
      feature_2_to: feature2To,
      feature_3: resolvedFeature3 || undefined,
    })
  }

  const handleReset = () => {
    setFeature1(FEATURE_1_ALL)
    setFeature2From('')
    setFeature2To('')
    setFeature3('')
    onApplyFilters({})
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) {
      return
    }
    setActionError('')
    try {
      await deleteCatalogItem(product.id, token)
      onCatalogChanged?.()
    } catch (err) {
      setActionError(err.message || 'Не удалось удалить товар')
    }
  }

  return (
    <>
      <StoreHero />

      <main className="catalog-layout">
        <aside className="filters">
          <h3>Характеристика 1</h3>
          {FEATURE_1_OPTIONS.map((option) => (
            <label key={option.value || 'all'}>
              <input
                type="radio"
                name="feature1"
                value={option.value}
                checked={feature1 === option.value}
                onChange={() => setFeature1(option.value)}
              />{' '}
              {option.label}
            </label>
          ))}

          <h3>Характеристика 2</h3>
          <div className="range-inputs">
            <input
              type="text"
              inputMode="decimal"
              placeholder="от"
              value={feature2From}
              onChange={(event) => setFeature2From(event.target.value)}
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="до"
              value={feature2To}
              onChange={(event) => setFeature2To(event.target.value)}
            />
          </div>

          <h3>Характеристика 3</h3>
          <select
            value={resolvedFeature3}
            onChange={(event) => setFeature3(event.target.value)}
          >
            <option value="">Любая</option>
            {safeFeature3Options.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <div className="filter-actions">
            <button type="button" onClick={handleReset}>
              Сбросить
            </button>
            <button type="button" onClick={handleApply}>
              Применить
            </button>
          </div>
        </aside>

        <section className="products">
          {isAuthenticated && (
            <div className="catalog-toolbar">
              <Link to="/product/new" className="btn-primary">
                + Добавить товар
              </Link>
              {actionError && <span className="auth-error">{actionError}</span>}
            </div>
          )}

          {products.length === 0 ? (
            <p className="catalog-empty">Нет товаров по выбранным условиям.</p>
          ) : (
            products.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-main">
                  <Link to={`/product/${product.id}`} className="product-title-link">
                    {product.name}
                  </Link>
                  <p>{product.description}</p>
                  <p className="price">{formatPrice(product.priceCents)}</p>
                  <div className="product-actions">
                    {!isAuthenticated && (
                      <button type="button" onClick={() => onAddToCart(product.id)}>
                        В корзину
                      </button>
                    )}
                    {isAuthenticated && (
                      <>
                        <Link
                          to={`/product/${product.id}/edit`}
                          className="btn-secondary"
                        >
                          Редактировать
                        </Link>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDelete(product)}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="photo-placeholder">
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
            ))
          )}
        </section>
      </main>
    </>
  )
}

export default CatalogPage
