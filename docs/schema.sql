-- Himar Coffee Garut - Database Schema Reference
-- Skema ini sudah dijalankan di Supabase. File ini hanya sebagai referensi.

-- Tabel menu
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel event
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel log chat
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  intent TEXT,
  confidence NUMERIC(5,4),
  bot_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel sales (dipakai tim Data Science, backend tidak menyentuh)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price INTEGER NOT NULL,
  sale_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktif di semua tabel; backend memakai secret key (bypass RLS)
-- Storage: bucket publik 'menu-images'
