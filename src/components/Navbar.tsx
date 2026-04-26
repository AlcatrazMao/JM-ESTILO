import { User } from 'firebase/auth'

type Page = 'viewer' | 'catalog' | 'designs' | 'constructor'

interface NavbarProps {
  page: Page
  setPage: (page: Page) => void
  user: User
  onLogout: () => void
}

export function Navbar({ page, setPage, user, onLogout }: NavbarProps) {
  const navItems = [
    { id: 'viewer' as const, label: 'Diseñar' },
    { id: 'catalog' as const, label: 'Catálogo' },
    { id: 'designs' as const, label: 'Mis Diseños' },
    { id: 'constructor' as const, label: 'Editor' },
  ]

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario'
  const initial = displayName[0].toUpperCase()

  return (
    <nav className="h-[54px] bg-surface border-b border-border flex items-center px-6 flex-shrink-0 gap-0">
      {/* Logo */}
      <div className="font-serif text-xl font-light tracking-[0.2em] mr-9 whitespace-nowrap">
        JM <span className="text-gold">ESTILO</span>
      </div>

      {/* Nav Items */}
      <div className="flex flex-1 gap-0">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className="h-[54px] px-4 text-[11px] tracking-[0.12em] uppercase transition-colors duration-200"
            style={{
              color: page === id ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: `2px solid ${page === id ? 'var(--gold)' : 'transparent'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gold-d flex items-center justify-center text-[11px] font-medium text-[#0a0808]">
          {initial}
        </div>
        <span className="text-[11px] text-text-dim">
          {displayName.length > 10 ? displayName.slice(0, 10) + '…' : displayName}
        </span>
        <button
          onClick={onLogout}
          className="text-[10px] text-text-dim tracking-[0.08em] uppercase cursor-pointer hover:text-text transition-colors"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}