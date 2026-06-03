import bannerImg from '../assets/banner.png'

function StoreHero() {
  return (
    <>
      <section className="store-info">
        <h1>Название магазина</h1>
        <p>г. Тестовый, ул. Тестовая, д.1</p>
      </section>

      <section className="banner">
        <img src={bannerImg} alt="Интернет-магазин лампочек Светим" />
      </section>
    </>
  )
}

export default StoreHero
