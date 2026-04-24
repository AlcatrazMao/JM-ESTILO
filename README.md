# JM ESTILO

Test

Web de venta de estampados con visualizador 3D en tiempo real.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **3D**: Three.js + React Three Fiber + Drei
- **Auth**: Firebase Authentication (Google + Email/Password)
- **Backend**: Cloudflare Workers + Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2

## Getting Started

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa con tus datos de Firebase:

```bash
cp .env.example .env
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`

### 4. Configurar Cloudflare Worker ( desarrollo local)

```bash
cd worker
npm install
wrangler d1 create jm-estilo-db  # Crear D1 database
# Copia el database_id a wrangler.toml
wrangler d1 execute jm-estilo-db --local --file=schema.sql  # Crear tablas
wrangler dev  # Worker en http://localhost:8787
```

## Secrets de GitHub

Agregar en **Settings > Secrets and variables > Actions**:

### Firebase
| Secret | Valor |
|--------|-------|
| `FIREBASE_PROJECT_ID` | Tu project ID (ej: `jm-estilo`) |
| `FIREBASE_SERVICE_ACCOUNT` | Contenido completo del JSON de service account |
| `FIREBASE_API_KEY` | API key de Firebase |
| `FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `FIREBASE_STORAGE_BUCKET` | `tu-proyecto.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID (número) |
| `FIREBASE_APP_ID` | App ID (ej: `1:123456789:web:xxx`) |
| `FIREBASE_PUBLIC_KEY` | Clave pública de Firebase (formato PEM, linea única) |

### Cloudflare
| Secret | Valor |
|--------|-------|
| `CF_ACCOUNT_ID` | Account ID del dashboard |
| `CF_API_TOKEN` | Token API con permisos: Workers, D1, R2, Pages |

## Estructura del Proyecto

```
JM-ESTILO/
├── src/
│   ├── components/     # Componentes React
│   ├── lib/           # Utilidades (Firebase, datos)
│   ├── App.tsx        # App principal
│   └── main.tsx       # Entry point
├── worker/
│   ├── src/index.ts   # Worker Hono
│   ├── wrangler.toml  # Config Cloudflare
│   └── schema.sql     # Schema D1
├── .github/
│   └── workflows/     # CI/CD
└── public/            # Assets estáticos
```

## Funcionalidades

- ✅ Visualizador 3D de prendas (camiseta, hoodie, buzo, gorra, tote)
- ✅ Catálogo de estampados con filtros
- ✅ Guardar diseños personalizados
- ✅ Login con Google y Email/Password
- ✅ Subir imágenes personalizadas a R2
- ✅ API REST con Cloudflare Worker
- ✅ Diseño responsive con TailwindCSS

## Límites Gratuitos (Free Tier)

| Servicio | Límite |
|----------|--------|
| Firebase Auth | Ilimitado |
| Firebase Hosting | 1 GB |
| Cloudflare Workers | 100k req/día |
| Cloudflare D1 | 5M consultas/mes |
| Cloudflare R2 | 10 GB almacenamiento |

## Licencia

MIT