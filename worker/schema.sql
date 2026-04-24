-- Cloudflare D1 Schema for JM-ESTILO

-- Users table (synced from Firebase)
CREATE TABLE IF NOT EXISTS users (
  firebase_uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products (stamps/patterns)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Designs (user saved designs)
CREATE TABLE IF NOT EXISTS designs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_firebase_uid TEXT NOT NULL,
  product_id INTEGER,
  custom_image_url TEXT,
  garment_type TEXT DEFAULT 'tshirt',
  garment_color TEXT DEFAULT '#141414',
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_firebase_uid) REFERENCES users(firebase_uid)
);

-- Orders (optional)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_firebase_uid TEXT NOT NULL,
  design_id INTEGER,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (design_id) REFERENCES designs(id),
  FOREIGN KEY (user_firebase_uid) REFERENCES users(firebase_uid)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designs_user ON designs(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_designs_product ON designs(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Seed some default products
INSERT INTO products (name, description, price, category) VALUES
  ('Aurum Geo', 'Patrón geométrico dorado', 8500, 'Abstracto'),
  ('Argentum', 'Líneas minimalistas plateadas', 7200, 'Minimal'),
  ('Noir Cross', 'Cruz minimalista', 6800, 'Minimal'),
  ('Celestial', 'Estrellas y cosmos', 9200, 'Abstracto'),
  ('Vortex', 'Espiral vortex', 8900, 'Abstracto'),
  ('Monogram JM', 'Monograma JM exclusivo', 11500, 'Tipográfico'),
  ('Sacred Geo', 'Geometría sagrada', 12000, 'Abstracto'),
  ('Urban Grid', 'Grid urbano', 7500, 'Urbano'),
  ('Wave Silver', 'Ondas plateadas', 8200, 'Abstracto'),
  ('Diamond', 'Diamante minimalista', 9800, 'Minimal'),
  ('Botanical', 'Diseño botánico', 10500, 'Naturaleza'),
  ('Classic Type', 'Tipografía clásica', 9200, 'Tipográfico');