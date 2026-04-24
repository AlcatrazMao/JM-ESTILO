import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwtVerify } from 'jose'
import { getCookie } from 'hono/cookie'

type Env = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  FIREBASE_PUBLIC_KEY: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.pages.dev'],
  credentials: true,
}))

// Helper: Verify Firebase JWT
async function verifyFirebaseToken(token: string, publicKey: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      await import('jose').then(j => j.importSPKI(publicKey, 'RS256'))
    )
    return payload
  } catch (e) {
    return null
  }
}

// Helper: Get user from cookie or header
async function getUser(c: any) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || getCookie(c, 'token')
  if (!token) return null
  
  const publicKey = c.env.FIREBASE_PUBLIC_KEY || ''
  if (!publicKey) {
    // For development, accept any token
    return { uid: 'dev-user', email: 'dev@example.com' }
  }
  
  return await verifyFirebaseToken(token, publicKey)
}

// GET /api/products - List available stamps
app.get('/api/products', async (c) => {
  try {
    const stmt = c.env.DB.prepare('SELECT id, name, price, image_url FROM products ORDER BY name')
    const { results } = await stmt.all()
    return c.json({ success: true, data: results })
  } catch (e) {
    return c.json({ success: false, error: 'Database error' }, 500)
  }
})

// POST /api/designs - Save a design
app.post('/api/designs', async (c) => {
  const user = await getUser(c)
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()
  const { product_id, custom_image_data } = body
  const userId = user.uid

  try {
    let imageUrl = null

    // If user uploaded a custom image, save to R2
    if (custom_image_data) {
      const key = `designs/${userId}/${Date.now()}.png`
      await c.env.R2_BUCKET.put(key, custom_image_data, {
        httpMetadata: { contentType: 'image/png' },
      })
      imageUrl = `https://your-bucket.r2.cloudflarestorage.com/${key}`
    }

    // Save to D1
    const stmt = c.env.DB.prepare(`
      INSERT INTO designs (user_firebase_uid, product_id, custom_image_url, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `)
    await stmt.bind(userId, product_id, imageUrl)

    return c.json({ success: true, data: { imageUrl } })
  } catch (e) {
    return c.json({ success: false, error: 'Failed to save design' }, 500)
  }
})

// GET /api/designs - List user's designs
app.get('/api/designs', async (c) => {
  const user = await getUser(c)
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  try {
    const stmt = c.env.DB.prepare(`
      SELECT d.id, d.product_id, d.custom_image_url, d.created_at, p.name as product_name, p.price
      FROM designs d
      JOIN products p ON d.product_id = p.id
      WHERE d.user_firebase_uid = ?
      ORDER BY d.created_at DESC
    `)
    const { results } = await stmt.bind(user.uid)
    return c.json({ success: true, data: results })
  } catch (e) {
    return c.json({ success: false, error: 'Database error' }, 500)
  }
})

// POST /api/upload - Upload image to R2
app.post('/api/upload', async (c) => {
  const user = await getUser(c)
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const body = await c.req.parseBody()
  const file = body.file as File

  if (!file) {
    return c.json({ success: false, error: 'No file provided' }, 400)
  }

  try {
    const key = `uploads/${user.uid}/${Date.now()}-${file.name}`
    await c.env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    })

    const url = `https://your-bucket.r2.cloudflarestorage.com/${key}`
    return c.json({ success: true, data: { url, key } })
  } catch (e) {
    return c.json({ success: false, error: 'Upload failed' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app