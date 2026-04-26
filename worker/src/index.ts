import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwtVerify } from 'jose'
import { getCookie } from 'hono/cookie'

type Env = {
  DB: D1Database
  FIREBASE_PUBLIC_KEY: string
  CORS_ORIGIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('/*', async (c, next) => {
  const origins = ['http://localhost:5173']
  if (c.env.CORS_ORIGIN) origins.push(c.env.CORS_ORIGIN)
  return cors({ origin: origins, credentials: true })(c, next)
})

async function verifyFirebaseToken(token: string, publicKey: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      await import('jose').then(j => j.importSPKI(publicKey, 'RS256'))
    )
    return payload
  } catch {
    return null
  }
}

async function getUser(c: any) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || getCookie(c, 'token')
  if (!token) return null

  const publicKey = c.env.FIREBASE_PUBLIC_KEY || ''
  if (!publicKey) {
    return { uid: 'dev-user', email: 'dev@example.com' }
  }

  return await verifyFirebaseToken(token, publicKey)
}

// GET /api/products
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, price, image_url FROM products ORDER BY name'
    ).all()
    return c.json({ success: true, data: results })
  } catch {
    return c.json({ success: false, error: 'Database error' }, 500)
  }
})

// POST /api/designs — image already uploaded to Firebase Storage, receives URL directly
app.post('/api/designs', async (c) => {
  const user = await getUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const { product_id, garment_type, garment_color, custom_image_url } = await c.req.json()

  try {
    await c.env.DB.prepare(
      `INSERT INTO designs (user_firebase_uid, product_id, custom_image_url, garment_type, garment_color, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(user.uid, product_id, custom_image_url ?? null, garment_type ?? 'tshirt', garment_color ?? '#141414').run()

    return c.json({ success: true })
  } catch {
    return c.json({ success: false, error: 'Failed to save design' }, 500)
  }
})

// GET /api/designs
app.get('/api/designs', async (c) => {
  const user = await getUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const { results } = await c.env.DB.prepare(
      `SELECT d.id, d.product_id, d.custom_image_url, d.created_at, p.name as product_name, p.price
       FROM designs d
       JOIN products p ON d.product_id = p.id
       WHERE d.user_firebase_uid = ?
       ORDER BY d.created_at DESC`
    ).bind(user.uid).all()

    return c.json({ success: true, data: results })
  } catch {
    return c.json({ success: false, error: 'Database error' }, 500)
  }
})

// GET /api/health
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
