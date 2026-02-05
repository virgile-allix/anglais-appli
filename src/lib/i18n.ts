export type Locale = 'fr' | 'en'

export type LocalizedText = {
  fr?: string
  en?: string
}

export function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'fr'
): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  const primary = value[locale]
  if (primary && primary.trim()) return primary

  const fallback = value[fallbackLocale] || value.fr || value.en
  return fallback ? String(fallback) : ''
}

export function normalizeLocalizedText(
  frValue: string,
  enValue: string
): LocalizedText {
  const fr = frValue.trim()
  const en = enValue.trim() || fr
  return { fr, en }
}
