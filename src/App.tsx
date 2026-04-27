import { useState, useEffect, lazy, Suspense } from 'react'
import { Viewer3D } from './components/Viewer3D'
import { LoginPage } from './components/LoginPage'
import { Navbar } from './components/Navbar'
import { ViewerPage } from './components/ViewerPage'
import { CatalogPage } from './components/CatalogPage'
import { MyDesignsPage } from './components/MyDesignsPage'
import { TweaksPanel } from './components/TweaksPanel'
import { Stamp, Design, INIT_DESIGNS } from './lib/data'
import { auth } from './lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

// Lazy load constructor (heavy module - only loads when needed)
const ConstructorPage = lazy(() => import('./features/constructor/components/ConstructorPage').then(m => ({ default: m.default })))

type Page = 'viewer' | 'catalog' | 'designs' | 'constructor'
type Layout = 'split' | 'cinematic' | 'studio'

const TWEAK_DEFAULTS: Record<string, string | boolean> = {
  layout: 'split',
  accentColor: '#c9a84c',
  garmentColorDefault: '#141414',
  autoRotate: true,
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('viewer')
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null)
  const [savedDesigns, setSavedDesigns] = useState<Design[]>(INIT_DESIGNS)
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS)
  const [tweaksVisible, setTweaksVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        localStorage.setItem('jme_session', JSON.stringify(user))
      } else {
        setUser(null)
        localStorage.removeItem('jme_session')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Update CSS accent color from tweaks
  useEffect(() => {
    document.documentElement.style.setProperty('--gold', tweaks.accentColor as string)
    const g = tweaks.accentColor as string
    document.documentElement.style.setProperty('--gold-d', g + '99')
    document.documentElement.style.setProperty('--gold-b', g + 'dd')
  }, [tweaks.accentColor])

  // Tweaks protocol for edit mode
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksVisible(true)
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false)
    }
    window.addEventListener('message', handleMessage)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleTweaks = (t: Record<string, string | boolean>) => {
    setTweaks(t)
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: t }, '*')
  }

  const logout = () => {
    import('./lib/firebase').then(({ logout }) => logout())
    setUser(null)
    localStorage.removeItem('jme_session')
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg">
        <div className="text-gold text-sm tracking-widest animate-pulse">CARGANDO...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={(u) => {
      setUser(u)
      localStorage.setItem('jme_session', JSON.stringify(u))
    }} />
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar page={page} setPage={setPage} user={user} onLogout={logout} />
      <div className="flex-1 flex overflow-hidden relative">
        {page === 'viewer' && (
          <ViewerPage
            layout={tweaks.layout as Layout}
            selectedStamp={selectedStamp}
            setSelectedStamp={setSelectedStamp}
            savedDesigns={savedDesigns}
            setSavedDesigns={setSavedDesigns}
            autoRotate={tweaks.autoRotate as boolean}
          />
        )}
        {page === 'catalog' && (
          <CatalogPage
            selectedStamp={selectedStamp}
            setSelectedStamp={setSelectedStamp}
            setPage={setPage}
          />
        )}
        {page === 'designs' && (
          <MyDesignsPage
            savedDesigns={savedDesigns}
            setSavedDesigns={setSavedDesigns}
            setSelectedStamp={setSelectedStamp}
            setPage={setPage}
          />
        )}
        {page === 'constructor' && (
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-bg">
              <div className="text-gold text-sm tracking-widest animate-pulse">CARGANDO EDITOR...</div>
            </div>
          }>
            <ConstructorPage />
          </Suspense>
        )}
      </div>
      <TweaksPanel tweaks={tweaks} onChange={handleTweaks} visible={tweaksVisible} />
    </div>
  )
}

export default App