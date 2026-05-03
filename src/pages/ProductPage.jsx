import { Navigate, useParams } from 'react-router-dom'
import StoreHero from '../components/StoreHero'

function ProductPage({ products, onAddToCart }) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === Number(productId))

  if (!product) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <StoreHero />

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

export default ProductPage
