import { useState, FormEvent } from 'react'
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userCredential
      if (tab === 'login') {
        userCredential = await loginWithEmail(email, password)
      } else {
        userCredential = await registerWithEmail(email, password)
      }
      onLogin(userCredential.user)
    } catch (err: any) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await loginWithGoogle()
      onLogin(result.user)
    } catch (err: any) {
      setError(err.message || 'Error con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-bg relative overflow-hidden">
      {/* Background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="hx" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,2 58,18 58,34 30,50 2,34 2,18"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hx)" />
      </svg>

      {/* Logo */}
      <div className="text-center mb-12 relative z-10">
        <div className="font-serif text-5xl font-light tracking-[0.24em] leading-none">
          JM <span className="text-gold">ESTILO</span>
        </div>
        <div className="text-xs tracking-[0.32em] text-text-dim mt-3 uppercase">
          Estampados Premium
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface border border-border w-[352px] p-8 relative z-10">
        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 pb-3 text-xs tracking-[0.12em] uppercase transition-colors duration-200"
              style={{
                color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
                borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <div className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2">Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-surface-2 border border-border text-text px-3 py-2.5 text-sm outline-none rounded-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <div className="text-[10px] tracking-[0.1em] uppercase text-text-dim mb-2">Contraseña</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border text-text px-3 py-2.5 text-sm outline-none rounded-sm"
              required
              minLength={6}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 text-xs text-red-400">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-g w-full mb-3"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Cargando…' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>

          {/* Divider */}
          <div className="text-center text-text-dim text-xs my-4">— o —</div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-o w-full flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z" />
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z" />
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z" />
            </svg>
            Continuar con Google
          </button>
        </form>
      </div>

      <div className="mt-6 text-[10px] text-text-dim tracking-[0.05em] relative z-10">
        © 2026 JM Estilo
      </div>
    </div>
  )
}