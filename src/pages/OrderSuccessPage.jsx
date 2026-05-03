import { useLocation } from 'react-router-dom'
import StoreHero from '../components/StoreHero'

function OrderSuccessPage({ lastOrderNumber }) {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber ?? lastOrderNumber ?? 'XXX'

  return (
    <>
      <StoreHero />

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

export default OrderSuccessPage
