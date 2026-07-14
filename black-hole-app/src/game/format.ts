import Decimal from 'break_eternity.js'

export const formatDecimal = (value: Decimal, digits = 3) => {
  const number = value.toNumber()
  if (Number.isFinite(number) && Math.abs(number) < 1e6) {
    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: digits,
      minimumFractionDigits: number < 10 ? Math.min(2, digits) : 0,
    }).format(number)
  }
  return value.toExponential(digits)
}

export const formatScientific = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return '∞'
  if (value === 0) return '0'
  const absolute = Math.abs(value)
  if (absolute >= 0.001 && absolute < 1e6) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits }).format(value)
  }
  return value.toExponential(digits).replace('e+', 'e')
}

export const formatMassKg = (kg: number) => `${formatScientific(kg, 3)} кг`

export const formatTemperature = (kelvin: number) => {
  if (kelvin >= 1e9) return `${formatScientific(kelvin / 1e9, 2)} млрд K`
  if (kelvin >= 1e6) return `${formatScientific(kelvin / 1e6, 2)} млн K`
  if (kelvin >= 1e3) return `${formatScientific(kelvin / 1e3, 2)} тыс. K`
  return `${formatScientific(kelvin, 2)} K`
}

export const formatLength = (meters: number) => {
  const absolute = Math.abs(meters)
  if (absolute >= 1e3) return `${formatScientific(meters / 1e3, 2)} км`
  if (absolute >= 1) return `${formatScientific(meters, 2)} м`
  if (absolute >= 1e-3) return `${formatScientific(meters * 1e3, 2)} мм`
  if (absolute >= 1e-6) return `${formatScientific(meters * 1e6, 2)} мкм`
  if (absolute >= 1e-9) return `${formatScientific(meters * 1e9, 2)} нм`
  return `${formatScientific(meters, 2)} м`
}
