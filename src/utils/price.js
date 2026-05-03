export const formatPrice = (priceCents) => {
  const rubles = Math.floor(priceCents / 100)
  const kopeks = priceCents % 100

  return `${rubles} руб. ${String(kopeks).padStart(2, '0')} коп.`
}
