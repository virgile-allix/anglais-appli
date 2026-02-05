export const COLORS = [
  { id: 'rouge',     label: 'Rouge',     hex: '#DC2626' },
  { id: 'bleu',      label: 'Bleu',      hex: '#2563EB' },
  { id: 'vert',      label: 'Vert',      hex: '#16A34A' },
  { id: 'or',        label: 'Or / Dore', hex: '#D4A853' },
  { id: 'argent',    label: 'Argent',    hex: '#9CA3AF' },
  { id: 'noir',      label: 'Noir',      hex: '#1F2937' },
  { id: 'blanc',     label: 'Blanc',     hex: '#F9FAFB' },
  { id: 'violet',    label: 'Violet',    hex: '#7C3AED' },
  { id: 'rose',      label: 'Rose',      hex: '#EC4899' },
  { id: 'orange',    label: 'Orange',    hex: '#EA580C' },
  { id: 'marron',    label: 'Marron',    hex: '#78350F' },
  { id: 'turquoise', label: 'Turquoise', hex: '#06B6D4' },
] as const

export const STYLES = [
  { id: 'realistic', name: 'Realiste', description: 'Rendu photorealiste avec details fins' },
  { id: 'cartoon', name: 'Cartoon', description: 'Style dessin anime colore' },
  { id: 'sculpture', name: 'Sculpture', description: 'Style statue/sculpture classique' },
  { id: 'low-poly', name: 'Low Poly', description: 'Style geometrique minimaliste' },
] as const
