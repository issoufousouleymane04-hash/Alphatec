export type Language = 'fr' | 'en'

export const LANGUAGES = [
  { value: 'fr' as Language, label: 'Français', flag: '🇫🇷', code: 'FR' },
  { value: 'en' as Language, label: 'English', flag: '🇬🇧', code: 'EN' },
]

export function getLanguage(value: string | null): Language {
  if (value === 'en') return 'en'
  return 'fr'
}

export function getLanguageConfig(value: string | null) {
  return LANGUAGES.find(l => l.value === getLanguage(value)) || LANGUAGES[0]
}