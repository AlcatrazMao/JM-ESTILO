export interface Design {
  id: number
  garment: string
  stampId: number
  gc: string
  at: string
  name: string
}

export interface Stamp {
  id: number
  name: string
  price: number
  cat: string
  type: string
  p: string
  s: string
}

export interface Garment {
  id: string
  label: string
}

export const GARMENTS: Garment[] = [
  { id: 'tshirt', label: 'Camiseta' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'crewneck', label: 'Buzo' },
  { id: 'cap', label: 'Gorra' },
  { id: 'tote', label: 'Tote' },
]

export const GCOLORS = [
  { name: 'Noir', v: '#080808' },
  { name: 'Carbón', v: '#1e1c1a' },
  { name: 'Pizarra', v: '#252838' },
  { name: 'Humo', v: '#484038' },
  { name: 'Marfil', v: '#f0ece4' },
  { name: 'Arena', v: '#c8b48a' },
  { name: 'Bosque', v: '#1a2418' },
  { name: 'Burdeos', v: '#380c14' },
]

export const STAMPS: Stamp[] = [
  { id: 1, name: 'Aurum Geo', price: 8500, cat: 'Abstracto', type: 'geo', p: '#C9A84C', s: '#8B6914' },
  { id: 2, name: 'Argentum', price: 7200, cat: 'Minimal', type: 'lines', p: '#C0C0C0', s: '#707070' },
  { id: 3, name: 'Noir Cross', price: 6800, cat: 'Minimal', type: 'cross', p: '#FFFFFF', s: '#555' },
  { id: 4, name: 'Celestial', price: 9200, cat: 'Abstracto', type: 'stars', p: '#C9A84C', s: '#E8F0FF' },
  { id: 5, name: 'Vortex', price: 8900, cat: 'Abstracto', type: 'spiral', p: '#D0D0D0', s: '#888' },
  { id: 6, name: 'Monogram JM', price: 11500, cat: 'Tipográfico', type: 'mono', p: '#C9A84C', s: '#8B6914' },
  { id: 7, name: 'Sacred Geo', price: 12000, cat: 'Abstracto', type: 'sacred', p: '#C9A84C', s: '#FFE0A0' },
  { id: 8, name: 'Urban Grid', price: 7500, cat: 'Urbano', type: 'grid', p: '#FFFFFF', s: '#444' },
  { id: 9, name: 'Wave Silver', price: 8200, cat: 'Abstracto', type: 'wave', p: '#B8B8B8', s: '#606060' },
  { id: 10, name: 'Diamond', price: 9800, cat: 'Minimal', type: 'diamond', p: '#C9A84C', s: '#FFF' },
  { id: 11, name: 'Botanical', price: 10500, cat: 'Naturaleza', type: 'bot', p: '#A8C888', s: '#C9A84C' },
  { id: 12, name: 'Classic Type', price: 9200, cat: 'Tipográfico', type: 'type', p: '#E8E8E8', s: '#888' },
]

export const INIT_DESIGNS: Design[] = [
  { id: 1, garment: 'tshirt', stampId: 6, gc: '#080808', at: '15 Abr 2026', name: 'Monogram Noir' },
  { id: 2, garment: 'hoodie', stampId: 4, gc: '#1e1c1a', at: '18 Abr 2026', name: 'Hoodie Celestial' },
  { id: 3, garment: 'crewneck', stampId: 1, gc: '#252838', at: '20 Abr 2026', name: 'Buzo Aurum' },
]