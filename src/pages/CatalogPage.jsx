import { Link } from 'react-router-dom'
import StoreHero from '../components/StoreHero'

function CatalogPage({ products, onAddToCart }) {
  return (
    <>
      <StoreHero />

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

export default CatalogPage
