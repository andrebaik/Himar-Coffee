# Kontrak API — Himar Coffee Garut

Dokumentasi lengkap seluruh endpoint backend Express dan kontrak integrasi dengan ai-service (FastAPI).

---

## Daftar Isi

1. [Konvensi Umum](#1-konvensi-umum)
2. [Endpoint Publik (tanpa login)](#2-endpoint-publik-tanpa-login)
3. [Auth](#3-auth)
4. [Admin (wajib Bearer token)](#4-admin-wajib-bearer-token)
5. [Kontrak ai-service (FastAPI)](#5-kontrak-ai-service-fastapi)
6. [Skema Validasi](#6-skema-validasi)

---

## 1. Konvensi Umum

### Base Path

```
/api/v1
```

### Format Respons Sukses

```json
{
  "success": true,
  "data": "<payload>",
  "message": "<opsional>"
}
```

### Format Respons Gagal

```json
{
  "success": false,
  "error": {
    "code": "<KODE>",
    "message": "<pesan ramah, Bahasa Indonesia>",
    "details": "<opsional>"
  }
}
```

### Tabel Kode Error

| Kode | HTTP Status | Kapan |
|------|-------------|-------|
| `VALIDATION_ERROR` | 400 | Input tidak valid; `details` berisi array `{field, message}` |
| `UPLOAD_INVALID` | 400 / 413 | Tipe atau ukuran file tidak sesuai |
| `UNAUTHORIZED` | 401 | Token tidak ada / tidak valid / kedaluwarsa, atau login salah |
| `FORBIDDEN` | 403 | Login valid tapi email tidak ada di `ADMIN_EMAILS` (jika diisi) |
| `NOT_FOUND` | 404 | Resource atau rute tidak ditemukan |
| `RATE_LIMITED` | 429 | Terlalu banyak request umum |
| `AI_RATE_LIMITED` | 429 | Terlalu banyak request ke endpoint chat |
| `AI_UNAVAILABLE` | 503 | Layanan AI sedang tidak tersedia |
| `INTERNAL_ERROR` | 500 | Kesalahan server internal |

---

## 2. Endpoint Publik (tanpa login)

### 2.1 Health Check

```
GET /api/v1/health
```

Mengecek status backend.

**Curl:**

```bash
curl http://localhost:4000/api/v1/health
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "time": "2025-01-20T10:30:00.000Z"
  }
}
```

---

### 2.2 Daftar Menu

```
GET /api/v1/menus
```

Menampilkan daftar menu yang tersedia. Hasil diurutkan `is_featured DESC, name ASC`.

**Query Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `category` | string | Filter berdasarkan kategori (case-insensitive) |
| `q` | string | Pencarian teks pada `name` dan `description` |
| `featured` | boolean | Filter menu unggulan saja (`true`) |
| `available` | boolean | Filter ketersediaan (default `true`) |

**Curl:**

```bash
# Semua menu
curl http://localhost:4000/api/v1/menus

# Filter kategori
curl "http://localhost:4000/api/v1/menus?category=Kopi"

# Pencarian
curl "http://localhost:4000/api/v1/menus?q=lost%20sheep"

# Hanya featured
curl "http://localhost:4000/api/v1/menus?featured=true"
```

**Respons 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "The Lost Sheep",
      "description": "Signature coffee blend dengan rasa karamel dan cokelat",
      "price": 28000,
      "category": "Kopi",
      "variants": [
        { "name": "Hot", "extra_price": 0 },
        { "name": "Iced", "extra_price": 3000 }
      ],
      "image_url": "https://xxx.supabase.co/storage/v1/object/public/menu-images/lost-sheep.jpg",
      "is_featured": true,
      "is_available": true,
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-01-15T08:00:00.000Z"
    }
  ]
}
```

---

### 2.3 Kategori Menu

```
GET /api/v1/menus/categories
```

Mengembalikan array string kategori unik dari menu yang tersedia.

**Curl:**

```bash
curl http://localhost:4000/api/v1/menus/categories
```

**Respons 200:**

```json
{
  "success": true,
  "data": ["Kopi", "Non-Kopi", "Makanan", "Snack"]
}
```

---

### 2.4 Detail Menu

```
GET /api/v1/menus/:id
```

Menampilkan detail satu menu berdasarkan UUID.

**Curl:**

```bash
curl http://localhost:4000/api/v1/menus/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "The Lost Sheep",
    "description": "Signature coffee blend dengan rasa karamel dan cokelat",
    "price": 28000,
    "category": "Kopi",
    "variants": [
      { "name": "Hot", "extra_price": 0 },
      { "name": "Iced", "extra_price": 3000 }
    ],
    "image_url": "https://xxx.supabase.co/storage/v1/object/public/menu-images/lost-sheep.jpg",
    "is_featured": true,
    "is_available": true,
    "created_at": "2025-01-15T08:00:00.000Z",
    "updated_at": "2025-01-15T08:00:00.000Z"
  }
}
```

**Respons 404:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu tidak ditemukan"
  }
}
```

---

### 2.5 Daftar Event

```
GET /api/v1/events
```

Menampilkan daftar event yang dipublikasikan.

**Query Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `scope` | string | `upcoming` (default), `past`, atau `all` |

**Curl:**

```bash
# Event mendatang (default)
curl http://localhost:4000/api/v1/events

# Event yang sudah berlalu
curl "http://localhost:4000/api/v1/events?scope=past"

# Semua event
curl "http://localhost:4000/api/v1/events?scope=all"
```

**Respons 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Live Music Friday",
      "description": "Penampilan akustik setiap Jumat malam",
      "event_date": "2025-02-14T19:00:00+07:00",
      "location": "Indoor Stage",
      "image_url": "https://xxx.supabase.co/storage/v1/object/public/menu-images/event-music.jpg",
      "is_published": true,
      "created_at": "2025-01-10T08:00:00.000Z",
      "updated_at": "2025-01-10T08:00:00.000Z"
    }
  ]
}
```

---

### 2.6 Detail Event

```
GET /api/v1/events/:id
```

Menampilkan detail satu event berdasarkan UUID.

**Curl:**

```bash
curl http://localhost:4000/api/v1/events/b2c3d4e5-f6a7-8901-bcde-f12345678901
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "title": "Live Music Friday",
    "description": "Penampilan akustik setiap Jumat malam",
    "event_date": "2025-02-14T19:00:00+07:00",
    "location": "Indoor Stage",
    "image_url": "https://xxx.supabase.co/storage/v1/object/public/menu-images/event-music.jpg",
    "is_published": true,
    "created_at": "2025-01-10T08:00:00.000Z",
    "updated_at": "2025-01-10T08:00:00.000Z"
  }
}
```

**Respons 404:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event tidak ditemukan"
  }
}
```

---

### 2.7 Chat (Chatbot)

```
POST /api/v1/chat
```

Mengirim pesan ke chatbot. Backend meneruskan ke ai-service (atau mock jika `AI_MOCK=true`).

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `session_id` | string | Ya | ID sesi (8-64 karakter, `[A-Za-z0-9_-]`) |
| `message` | string | Ya | Pesan pengguna (1-500 karakter) |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test_session_001","message":"menu kopi apa saja?"}'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "reply": "Berikut menu kopi kami:\n1. The Lost Sheep — Rp28.000\n2. Espresso — Rp18.000\n3. Merry Gloss — Rp25.000\n\nMau pesan yang mana? 😊",
    "intent": "tanya_menu",
    "confidence": 0.9512,
    "actions": [
      {
        "type": "show_menu",
        "category": "Kopi"
      }
    ]
  }
}
```

**Respons 400 (validasi):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": [
      { "field": "message", "message": "Pesan tidak boleh kosong" }
    ]
  }
}
```

**Respons 503 (AI tidak tersedia):**

```json
{
  "success": false,
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "Layanan chat sedang tidak tersedia, silakan coba lagi nanti"
  }
}
```

---

### 2.8 Link WhatsApp (Pemesanan)

```
POST /api/v1/orders/whatsapp-link
```

Menghasilkan link WhatsApp (`wa.me`) berisi teks pesanan yang sudah diformat.

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `items` | array | Ya | Array item pesanan (1-30 item) |
| `items[].menu_id` | uuid | Ya | ID menu |
| `items[].quantity` | integer | Ya | Jumlah (1-50) |
| `items[].variant` | string | Tidak | Nama varian (misal "Iced") |
| `note` | string | Tidak | Catatan tambahan (max 200 karakter) |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/orders/whatsapp-link \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "menu_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "quantity": 2, "variant": "Iced" },
      { "menu_id": "c3d4e5f6-a7b8-9012-cdef-123456789012", "quantity": 1 }
    ],
    "note": "Tidak pakai gula"
  }'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "url": "https://wa.me/628123456789?text=Halo%20Himar%20Coffee%21%0ASaya%20ingin%20pesan%3A%0A...",
    "text": "Halo Himar Coffee!\nSaya ingin pesan:\n1. The Lost Sheep (Iced) x2 — Rp62.000\n2. Merry Gloss x1 — Rp25.000\n\nTotal: Rp87.000\n\nCatatan: Tidak pakai gula\n\nTerima kasih!",
    "total": 87000
  }
}
```

**Respons 400 (validasi):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": [
      { "field": "items", "message": "Minimal 1 item pesanan" }
    ]
  }
}
```

---

## 3. Auth

### 3.1 Login

```
POST /api/v1/auth/login
```

Login admin menggunakan Supabase Auth.

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `email` | string | Ya | Email admin |
| `password` | string | Ya | Password |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"himar@admin.com","password":"andrebaiksekali"}'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.Mxyz...",
    "expires_in": 3600,
    "user": {
      "id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
      "email": "himar@admin.com"
    }
  },
  "message": "Login berhasil"
}
```

**Respons 401:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Email atau password salah"
  }
}
```

---

### 3.2 Refresh Token

```
POST /api/v1/auth/refresh
```

Memperbarui access token menggunakan refresh token.

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `refresh_token` | string | Ya | Refresh token dari login |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"v1.Mxyz..."}'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.Nabc...",
    "expires_in": 3600
  },
  "message": "Token diperbarui"
}
```

**Respons 401:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Refresh token tidak valid atau sudah kedaluwarsa"
  }
}
```

---

### 3.3 Info Admin (Me)

```
GET /api/v1/auth/me
```

Mengambil informasi admin yang sedang login.

**Header:**

```
Authorization: Bearer <access_token>
```

**Curl:**

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
    "email": "himar@admin.com"
  }
}
```

**Respons 401:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token tidak valid atau sudah kedaluwarsa"
  }
}
```

---

## 4. Admin (wajib Bearer token)

Semua endpoint di bagian ini memerlukan header:

```
Authorization: Bearer <access_token>
```

Jika `ADMIN_EMAILS` diisi di environment, email pengguna harus ada di daftar tersebut. Jika tidak, respons 403 `FORBIDDEN`.

---

### 4.1 Tambah Menu

```
POST /api/v1/admin/menus
```

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `name` | string | Ya | Nama menu (2-100 karakter) |
| `description` | string | Tidak | Deskripsi (max 1000 karakter) |
| `price` | integer | Ya | Harga dalam Rupiah (0-10.000.000) |
| `category` | string | Ya | Kategori (2-50 karakter) |
| `variants` | array | Tidak | Array varian (max 10 item), masing-masing `{name, extra_price}` |
| `image_url` | string | Tidak | URL gambar |
| `is_featured` | boolean | Tidak | Menu unggulan (default `false`) |
| `is_available` | boolean | Tidak | Tersedia (default `true`) |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/admin/menus \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Espresso",
    "description": "Espresso klasik",
    "price": 18000,
    "category": "Kopi",
    "variants": [
      { "name": "Hot", "extra_price": 0 },
      { "name": "Iced", "extra_price": 3000 }
    ],
    "is_featured": false,
    "is_available": true
  }'
```

**Respons 201:**

```json
{
  "success": true,
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f678-90abcdef1234",
    "name": "Espresso",
    "description": "Espresso klasik",
    "price": 18000,
    "category": "Kopi",
    "variants": [
      { "name": "Hot", "extra_price": 0 },
      { "name": "Iced", "extra_price": 3000 }
    ],
    "image_url": null,
    "is_featured": false,
    "is_available": true,
    "created_at": "2025-01-20T10:00:00.000Z",
    "updated_at": "2025-01-20T10:00:00.000Z"
  },
  "message": "Menu berhasil ditambahkan"
}
```

---

### 4.2 Ubah Menu

```
PUT /api/v1/admin/menus/:id
```

Mengubah menu yang ada. Hanya field yang dikirim yang diperbarui.

**Curl:**

```bash
curl -X PUT http://localhost:4000/api/v1/admin/menus/f6a7b8c9-d0e1-2345-f678-90abcdef1234 \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Espresso Updated",
    "price": 20000,
    "category": "Kopi"
  }'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f678-90abcdef1234",
    "name": "Espresso Updated",
    "description": "Espresso klasik",
    "price": 20000,
    "category": "Kopi",
    "variants": [
      { "name": "Hot", "extra_price": 0 },
      { "name": "Iced", "extra_price": 3000 }
    ],
    "image_url": null,
    "is_featured": false,
    "is_available": true,
    "created_at": "2025-01-20T10:00:00.000Z",
    "updated_at": "2025-01-20T11:00:00.000Z"
  },
  "message": "Menu berhasil diperbarui"
}
```

**Respons 404:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu tidak ditemukan"
  }
}
```

---

### 4.3 Hapus Menu

```
DELETE /api/v1/admin/menus/:id
```

Menghapus menu berdasarkan UUID.

**Curl:**

```bash
curl -X DELETE http://localhost:4000/api/v1/admin/menus/f6a7b8c9-d0e1-2345-f678-90abcdef1234 \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

**Respons 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Menu berhasil dihapus"
}
```

**Respons 404:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu tidak ditemukan"
  }
}
```

---

### 4.4 Tambah Event

```
POST /api/v1/admin/events
```

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `title` | string | Ya | Judul event (3-120 karakter) |
| `description` | string | Tidak | Deskripsi (max 2000 karakter) |
| `event_date` | string | Ya | Tanggal event (format ISO 8601) |
| `location` | string | Tidak | Lokasi (max 200 karakter) |
| `image_url` | string | Tidak | URL gambar |
| `is_published` | boolean | Tidak | Dipublikasikan (default `true`) |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/admin/events \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Live Music Friday",
    "description": "Penampilan akustik setiap Jumat malam",
    "event_date": "2025-02-14T19:00:00+07:00",
    "location": "Indoor Stage",
    "is_published": true
  }'
```

**Respons 201:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-c9d0-1234-e567-890abcdef012",
    "title": "Live Music Friday",
    "description": "Penampilan akustik setiap Jumat malam",
    "event_date": "2025-02-14T19:00:00+07:00",
    "location": "Indoor Stage",
    "image_url": null,
    "is_published": true,
    "created_at": "2025-01-20T10:00:00.000Z",
    "updated_at": "2025-01-20T10:00:00.000Z"
  },
  "message": "Event berhasil ditambahkan"
}
```

---

### 4.5 Ubah Event

```
PUT /api/v1/admin/events/:id
```

Mengubah event yang ada. Hanya field yang dikirim yang diperbarui.

**Curl:**

```bash
curl -X PUT http://localhost:4000/api/v1/admin/events/e5f6a7b8-c9d0-1234-e567-890abcdef012 \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Live Music Saturday",
    "event_date": "2025-02-15T19:00:00+07:00"
  }'
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-c9d0-1234-e567-890abcdef012",
    "title": "Live Music Saturday",
    "description": "Penampilan akustik setiap Jumat malam",
    "event_date": "2025-02-15T19:00:00+07:00",
    "location": "Indoor Stage",
    "image_url": null,
    "is_published": true,
    "created_at": "2025-01-20T10:00:00.000Z",
    "updated_at": "2025-01-20T12:00:00.000Z"
  },
  "message": "Event berhasil diperbarui"
}
```

**Respons 404:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event tidak ditemukan"
  }
}
```

---

### 4.6 Hapus Event

```
DELETE /api/v1/admin/events/:id
```

Menghapus event berdasarkan UUID.

**Curl:**

```bash
curl -X DELETE http://localhost:4000/api/v1/admin/events/e5f6a7b8-c9d0-1234-e567-890abcdef012 \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

**Respons 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Event berhasil dihapus"
}
```

---

### 4.7 Semua Event (Admin)

```
GET /api/v1/admin/events
```

Menampilkan semua event termasuk yang belum dipublikasikan (draft). Hanya untuk admin.

**Curl:**

```bash
curl http://localhost:4000/api/v1/admin/events \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

**Respons 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "e5f6a7b8-c9d0-1234-e567-890abcdef012",
      "title": "Live Music Friday",
      "description": "Penampilan akustik setiap Jumat malam",
      "event_date": "2025-02-14T19:00:00+07:00",
      "location": "Indoor Stage",
      "image_url": null,
      "is_published": true,
      "created_at": "2025-01-20T10:00:00.000Z",
      "updated_at": "2025-01-20T10:00:00.000Z"
    },
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890abc",
      "title": "Workshop Latte Art (Draft)",
      "description": "Belajar latte art untuk pemula",
      "event_date": "2025-03-01T10:00:00+07:00",
      "location": "Bar Area",
      "image_url": null,
      "is_published": false,
      "created_at": "2025-01-18T08:00:00.000Z",
      "updated_at": "2025-01-18T08:00:00.000Z"
    }
  ]
}
```

---

### 4.8 Upload Gambar

```
POST /api/v1/admin/uploads
```

Upload gambar ke Supabase Storage (bucket `menu-images`).

**Content-Type:** `multipart/form-data`

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `file` | file | Ya | File gambar (jpeg/png/webp, max 2MB) |
| `folder` | string | Tidak | Sub-folder di bucket (misal `menus`, `events`) |

**Curl:**

```bash
curl -X POST http://localhost:4000/api/v1/admin/uploads \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=menus"
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/v1/object/public/menu-images/menus/1705747200-image.jpg"
  },
  "message": "Gambar berhasil diunggah"
}
```

**Respons 400 (file tidak valid):**

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_INVALID",
    "message": "Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP"
  }
}
```

**Respons 413 (file terlalu besar):**

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_INVALID",
    "message": "Ukuran file melebihi batas maksimum 2MB"
  }
}
```

---

### 4.9 Riwayat Chat

```
GET /api/v1/admin/chat-logs
```

Menampilkan riwayat percakapan chatbot dengan paginasi.

**Query Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `page` | integer | Halaman (default `1`) |
| `limit` | integer | Jumlah per halaman (default `20`, max `100`) |
| `intent` | string | Filter berdasarkan intent |

**Curl:**

```bash
# Halaman pertama
curl "http://localhost:4000/api/v1/admin/chat-logs?page=1&limit=20" \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"

# Filter intent
curl "http://localhost:4000/api/v1/admin/chat-logs?intent=tanya_menu" \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

**Respons 200:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "c9d0e1f2-a3b4-5678-c901-234567890def",
        "session_id": "user_abc123",
        "user_message": "menu kopi apa saja?",
        "intent": "tanya_menu",
        "confidence": 0.9512,
        "bot_response": "Berikut menu kopi kami:\n1. The Lost Sheep — Rp28.000\n2. Espresso — Rp18.000",
        "created_at": "2025-01-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

---

## 5. Kontrak ai-service (FastAPI)

Layanan AI dibangun tim AI menggunakan FastAPI. Backend Express berkomunikasi dengan ai-service melalui HTTP. Jika `AI_MOCK=true`, backend menggunakan mock internal dan tidak menghubungi ai-service.

### Base URL

Diambil dari environment variable `AI_SERVICE_URL` (contoh: `http://localhost:8000`).

---

### 5.1 Health Check

```
GET /health
```

**Curl:**

```bash
curl http://localhost:8000/health
```

**Respons 200:**

```json
{
  "status": "ok"
}
```

---

### 5.2 Chat (Klasifikasi Intent + Jawaban)

```
POST /api/v1/chat
```

**Body (JSON):**

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `session_id` | string | Ya | ID sesi pengguna |
| `message` | string | Ya | Pesan pengguna |

**Curl:**

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test_session_001","message":"menu kopi apa saja?"}'
```

**Respons 200:**

```json
{
  "intent": "tanya_menu",
  "confidence": 0.9512,
  "reply": "Berikut menu kopi kami:\n1. The Lost Sheep — Rp28.000\n2. Espresso — Rp18.000\n3. Merry Gloss — Rp25.000\n\nMau pesan yang mana? 😊"
}
```

### Daftar Intent

| Intent | Deskripsi |
|--------|-----------|
| `tanya_menu` | Pertanyaan tentang menu, harga, rekomendasi |
| `tanya_event` | Pertanyaan tentang event, jadwal, acara |
| `pemesanan` | Ingin memesan, cara pesan, alur beli |
| `keluhan` | Keluhan, kritik, saran, masalah |
| `di_luar_konteks` | Pertanyaan tidak terkait Himar Coffee |

---

### 5.3 Reindex (Internal)

```
POST /api/v1/reindex
```

Memicu ai-service untuk memperbarui indeks data (menu/event) yang digunakan RAG. Dipanggil backend setelah admin menambah/mengubah/menghapus menu atau event.

**Header:**

```
X-Internal-Key: <INTERNAL_API_KEY>
```

**Curl:**

```bash
curl -X POST http://localhost:8000/api/v1/reindex \
  -H "X-Internal-Key: INTERNAL_API_KEY_HERE"
```

**Respons 200:**

```json
{
  "status": "ok",
  "message": "Reindex started"
}
```

**Respons 401 (key salah):**

```json
{
  "detail": "Invalid API key"
}
```

---

## 6. Skema Validasi

Aturan validasi yang diterapkan backend (Joi) untuk setiap resource.

### 6.1 Menu

| Field | Aturan |
|-------|--------|
| `name` | String, wajib, 2-100 karakter |
| `description` | String, opsional, max 1000 karakter |
| `price` | Integer, wajib, 0-10.000.000 |
| `category` | String, wajib, 2-50 karakter |
| `variants` | Array, opsional, max 10 item. Setiap item: `{ name: string (wajib), extra_price: integer (wajib, >= 0) }` |
| `image_url` | String (URI), opsional |
| `is_featured` | Boolean, opsional |
| `is_available` | Boolean, opsional |

### 6.2 Event

| Field | Aturan |
|-------|--------|
| `title` | String, wajib, 3-120 karakter |
| `description` | String, opsional, max 2000 karakter |
| `event_date` | String (ISO 8601), wajib |
| `location` | String, opsional, max 200 karakter |
| `image_url` | String (URI), opsional |
| `is_published` | Boolean, opsional |

### 6.3 Upload

| Aturan | Nilai |
|--------|-------|
| Tipe file | `image/jpeg`, `image/png`, `image/webp` |
| Ukuran max | 2 MB (2.097.152 bytes) |

### 6.4 Chat

| Field | Aturan |
|-------|--------|
| `session_id` | String, wajib, 8-64 karakter, pattern: `[A-Za-z0-9_-]` |
| `message` | String, wajib, 1-500 karakter |

### 6.5 WhatsApp Order

| Field | Aturan |
|-------|--------|
| `items` | Array, wajib, 1-30 item |
| `items[].menu_id` | UUID, wajib |
| `items[].quantity` | Integer, wajib, 1-50 |
| `items[].variant` | String, opsional |
| `note` | String, opsional, max 200 karakter |
