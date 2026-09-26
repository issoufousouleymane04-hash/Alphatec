// ============================================================
// CONFIGURATION DE LA VITRINE ALPHA-TEC
// Modifie ces valeurs selon tes besoins
// ============================================================

export const VITRINE_CONFIG = {
  // Informations entreprise
  nom: 'Alpha-Tec',
  slogan: 'Réparation • Vente • Déblocage',
  description:
    'Votre partenaire de confiance pour la réparation, la vente de matériel informatique et le déblocage de téléphones.',

  // Contact
  telephone: '+22799425024',
  telephoneAffichage: '+227 99 42 50 24',
  whatsapp: '+22799425024',
  email: 'contact@alpha-tec.com',

  // Adresse
  adresse: 'Quartier Talladje, vers la CNSS',
  ville: 'Niamey, Niger',

  // Horaires
  horaires: [
    { jour: 'Lundi - Vendredi', heures: '08h00 - 20h00' },
    { jour: 'Samedi', heures: '08h00 - 20h00' },
    { jour: 'Dimanche', heures: 'Fermé' },
  ],

  // Réseaux sociaux (optionnel)
  facebook: '',
  instagram: '',
} as const

// Message WhatsApp par défaut
export const WHATSAPP_MESSAGE =
  'Bonjour Alpha-Tec, je vous contacte depuis votre site web.'