export const TYPES_SERVICE = [
  { value: 'frp',      label: 'FRP Android',      emoji: '🔓', prix: 5000,  duree: '30 min', color: 'orange' },
  { value: 'icloud',   label: 'iCloud Apple',     emoji: '🍎', prix: 15000, duree: '2 h',    color: 'blue' },
  { value: 'password', label: 'Mot de passe',     emoji: '🔐', prix: 3000,  duree: '15 min', color: 'purple' },
  { value: 'sim',      label: 'Déblocage SIM',    emoji: '📡', prix: 10000, duree: '1 h',    color: 'green' },
  { value: 'flash',    label: 'Flash / Firmware', emoji: '🔄', prix: 7000,  duree: '1 h',    color: 'red' },
  { value: 'root',     label: 'Root / Jailbreak', emoji: '🧩', prix: 5000,  duree: '30 min', color: 'pink' },
] as const

export type TypeService = typeof TYPES_SERVICE[number]['value']

export const STATUTS_DEBLOCAGE = [
  { value: 'en_attente', label: 'En attente', color: 'bg-slate-100 text-slate-700' },
  { value: 'en_cours',   label: 'En cours',   color: 'bg-amber-100 text-amber-700' },
  { value: 'reussi',     label: 'Réussi',     color: 'bg-green-100 text-green-700' },
  { value: 'echoue',     label: 'Échoué',     color: 'bg-red-100 text-red-700' },
  { value: 'livre',      label: 'Livré',      color: 'bg-blue-100 text-blue-700' },
] as const

export type StatutDeblocage = typeof STATUTS_DEBLOCAGE[number]['value']

export function getTypeService(value: string) {
  return TYPES_SERVICE.find((t) => t.value === value) || TYPES_SERVICE[0]
}

export function getStatut(value: string) {
  return STATUTS_DEBLOCAGE.find((s) => s.value === value) || STATUTS_DEBLOCAGE[0]
}