# SPESIFIKASI BUILD: Platform Etalase Digital + Asisten Chatbot Himar Coffee Garut

Kamu adalah AI engineer yang akan membangun aplikasi ini dari nol sampai siap deploy. Baca seluruh dokumen ini dulu sebelum menulis kode. Ikuti spesifikasi secara tepat. Jangan menambah fitur di luar dokumen, jangan mengubah nama endpoint, kolom, atau format respons. Jika ada hal yang benar-benar memblokir dan tidak bisa diputuskan dari dokumen ini, ajukan satu pertanyaan singkat; selain itu ambil keputusan terbaik dan catat di README bagian "Keputusan Desain".

Bahasa: seluruh teks antarmuka, pesan error ke pengguna, dan dokumentasi dalam **Bahasa Indonesia**. Nama variabel, fungsi, file, dan kolom dalam bahasa Inggris.

---

## 1. Konteks proyek

- **Klien:** Himar Coffee Garut (UMKM kafe, bidang kuliner/F&B).
- **Masalah:** informasi menu dan jadwal event tersebar di media sosial dan WhatsApp Business. Staf kasir/admin kewalahan membalas pertanyaan berulang, terutama saat ramai atau akhir pekan, sehingga pelayanan lambat dan pesanan bisa hilang. Manajer belum punya dasbor terpusat.
- **Pengguna:**
  1. **Pelanggan** (publik, tanpa login): lihat katalog menu dan event, tanya chatbot, kirim pesanan ke WhatsApp.
  2. **Admin/manajer** (login): kelola menu dan event, lihat dasbor penjualan, lihat riwayat chat.
- **Solusi:** website responsif + chatbot yang menjawab pertanyaan menu/event + alur pesan via WhatsApp + halaman admin CRUD + dasbor penjualan (dibuat tim Data Science, di-embed).
- **Menu unggulan yang harus tampil di beranda:** *The Lost Sheep* dan *Merry Gloss* (ditandai `is_featured = true`).

### Pembagian tanggung jawab (PENTING)
Kamu **hanya** membangun bagian Full-Stack: `frontend/` dan `backend/`. Dua bagian lain dikerjakan anggota tim lain dan hanya kamu **integrasikan lewat kontrak API** di bagian 7:
- `ai-service/` (FastAPI: klasifikasi intent + RAG + LLM) → dibuat tim AI. Sebelum siap, backend memakai **mode mock** (bagian 7.3).
- `dashboard/` (Streamlit) → dibuat tim Data Science. Frontend hanya meng-embed URL-nya lewat iframe.

### Di luar cakupan (JANGAN dibuat)
Payment gateway, integrasi POS/kasir fisik, inventaris/stok bahan baku, registrasi/akun pelanggan, penyimpanan data pribadi pelanggan (nama, nomor telepon, alamat), AutoML, pemanggilan API LLM langsung dari frontend, akses Supabase langsung dari frontend.

---

## 2. Stack (wajib persis ini)

| Bagian | Teknologi |
|---|---|
| Frontend | React + Vite (JavaScript), Tailwind CSS (versi stabil terbaru, ikuti dokumentasi resmi untuk integrasi Vite), React Router, Axios, `react-hot-toast`, `lucide-react` |
| Backend | Node.js 20+, Express (ES Modules), Joi, `@supabase/supabase-js`, `multer`, `helmet`, `cors`, `morgan`, `express-rate-limit`, `dotenv` |
| Database/Auth/Storage | Supabase (PostgreSQL, Supabase Auth, Storage) |
| Tes backend | Vitest + Supertest |
| Deploy | Frontend: Vercel (free tier). Backend: Render (free tier). |

Arsitektur: **frontend dan backend terpisah (decoupled)**, berkomunikasi lewat HTTP (Axios). Frontend hanya memanggil backend. Backend yang berbicara ke Supabase dan ke `ai-service`.

```
Browser (React) --Axios--> Express /api/v1 --+--> Supabase (DB, Auth, Storage)
                                             +--> ai-service FastAPI (chat)
Admin page --iframe--> Dashboard Streamlit (URL dari env)
```

---

## 3. Struktur repositori (monorepo)

```
himar-coffee/
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance + fungsi per resource
│   │   ├── components/     # UI reusable (Button, Modal, Skeleton, EmptyState, ...)
│   │   ├── features/
│   │   │   ├── catalog/    # MenuCard, MenuGrid, MenuDetailModal, CategoryFilter
│   │   │   ├── events/     # EventCard, EventList
│   │   │   ├── cart/       # CartProvider, CartDrawer
│   │   │   ├── chat/       # ChatWidget, MessageBubble, useChat
│   │   │   └── admin/      # AdminLayout, MenuForm, EventForm, tables
│   │   ├── pages/          # Home, Menu, Events, NotFound, admin/*
│   │   ├── lib/            # format.js (rupiah, tanggal), session.js
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html, vite.config.js, package.json, .env.example
├── backend/
│   ├── src/
│   │   ├── config/         # env.js (validasi env), supabase.js
│   │   ├── middleware/     # auth.js, validate.js, errorHandler.js, rateLimit.js
│   │   ├── routes/         # menus, events, chat, orders, auth, admin/*
│   │   ├── controllers/
│   │   ├── services/       # menuService, eventService, aiClient, aiMock, whatsapp, logService
│   │   ├── validators/     # skema Joi
│   │   ├── utils/          # response.js, AppError.js
│   │   ├── app.js, server.js
│   ├── scripts/seed.js     # data dummy idempoten
│   ├── tests/
│   └── package.json, .env.example
├── docs/                   # api-contract.md, user-manual.md, test-report.md
├── render.yaml, .gitignore, README.md
(frontend/vercel.json berada di dalam folder frontend/)
```

Aturan umum kode: ES Modules, async/await, tidak ada `console.log` data sensitif, fungsi kecil dan bernama jelas, komentar hanya untuk hal yang tidak jelas dari kode.

---

## 4. Prasyarat yang sudah dikerjakan manusia (jangan dibuat ulang)

Project Supabase sudah dibuat dan skema SQL sudah dijalankan. Akun admin sudah dibuat di Supabase Auth dan sign-up publik sudah dimatikan. Kamu cukup memakai tabel di bawah. **Jangan** membuat migrasi yang mengubah skema, kecuali menulis `docs/schema.sql` sebagai salinan referensi dari definisi ini.

### Tabel (nama kolom harus persis)

**`menus`**: `id uuid pk`, `name text not null`, `description text null`, `price integer not null (>=0, Rupiah)`, `category text not null`, `variants jsonb not null default '[]'` (array `{name, extra_price}`), `image_url text null`, `is_featured boolean default false`, `is_available boolean default true`, `created_at timestamptz`, `updated_at timestamptz`.

**`events`**: `id uuid pk`, `title text not null`, `description text null`, `event_date timestamptz not null`, `location text null`, `image_url text null`, `is_published boolean default true`, `created_at`, `updated_at`.

**`chat_logs`**: `id uuid pk`, `session_id text not null`, `user_message text not null`, `intent text null`, `confidence numeric(5,4) null`, `bot_response text null`, `created_at timestamptz`.

**`sales`**: dipakai tim Data Science. **Backend tidak menyentuh tabel ini.**

**Storage:** bucket publik `menu-images`. URL publik lewat `supabase.storage.from('menu-images').getPublicUrl(path)`.

**RLS** aktif di semua tabel; backend memakai secret key (bypass RLS).

### Variabel lingkungan

`backend/.env.example` (buat file ini, JANGAN isi nilai asli, `.env` harus ada di `.gitignore`):

```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173            # untuk CORS; boleh beberapa, pisahkan koma
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=                     # sb_publishable_...
SUPABASE_SECRET_KEY=                          # sb_secret_... (HANYA backend)
ADMIN_EMAILS=                                 # opsional, allowlist email admin, pisahkan koma
WHATSAPP_NUMBER=                              # format internasional tanpa +, contoh 628123456789
AI_SERVICE_URL=                               # contoh http://localhost:8000
AI_MOCK=true                                  # true = pakai mock lokal, abaikan AI_SERVICE_URL
AI_TIMEOUT_MS=20000
INTERNAL_API_KEY=                             # rahasia bersama untuk panggilan reindex ke ai-service
```

`frontend/.env.example`:

```
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_DASHBOARD_URL=                           # URL Streamlit; kosong = tampilkan placeholder
```

`config/env.js` wajib memvalidasi env saat start (Joi). Jika variabel wajib kosong (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `FRONTEND_URL`, `WHATSAPP_NUMBER`), proses berhenti dengan pesan jelas.

---

## 5. Konvensi API

- Base path: **`/api/v1`**.
- Semua respons JSON.
- **Sukses:** `{ "success": true, "data": <payload>, "message": "<opsional>" }`
- **Gagal:** `{ "success": false, "error": { "code": "<KODE>", "message": "<pesan ramah, Bahasa Indonesia>", "details": <opsional> } }`

| Kode | HTTP | Kapan |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input tidak valid; `details` berisi array `{field, message}` |
| `UPLOAD_INVALID` | 400 / 413 | Tipe/ukuran file tidak sesuai |
| `UNAUTHORIZED` | 401 | Token tidak ada/tidak valid/kedaluwarsa, atau login salah |
| `FORBIDDEN` | 403 | Login valid tapi email tidak ada di `ADMIN_EMAILS` (jika diisi) |
| `NOT_FOUND` | 404 | Resource atau rute tidak ada |
| `RATE_LIMITED` | 429 | Terlalu banyak request |
| `AI_RATE_LIMITED` | 429 | Layanan AI mencapai batas kuota |
| `AI_UNAVAILABLE` | 503 | Layanan AI tidak bisa dihubungi/timeout |
| `INTERNAL_ERROR` | 500 | Error tak terduga (jangan bocorkan stack trace di production) |

Error handler terpusat; `AppError(code, status, message, details)`. Middleware `validate(schema, 'body'|'query'|'params')` memakai Joi dengan `abortEarly: false`, `stripUnknown: true`.

---

## 6. Endpoint backend

### 6.1 Publik (tanpa login)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | `{status:"ok", time}` untuk health check Render |
| GET | `/menus` | Query opsional: `category`, `q` (ilike pada `name` saja; escape karakter `%` dan `_`), `featured=true`, `available=true`. Urut: `is_featured desc, name asc`. |
| GET | `/menus/categories` | Daftar kategori unik (array string) |
| GET | `/menus/:id` | Detail menu (validasi `id` UUID) |
| GET | `/events` | Hanya `is_published = true`. Query `scope=upcoming\|past\|all` (default `upcoming`: `event_date >= now()`, urut naik). |
| GET | `/events/:id` | Detail event terbit |
| POST | `/chat` | Lihat bagian 7 |
| POST | `/orders/whatsapp-link` | Lihat 6.4 |

### 6.2 Auth

Frontend tidak pernah memakai Supabase langsung. Autentikasi lewat backend.

| Method | Path | Body | Respons `data` |
|---|---|---|---|
| POST | `/auth/login` | `{email, password}` | `{access_token, refresh_token, expires_at, user:{id,email}}` |
| POST | `/auth/refresh` | `{refresh_token}` | token baru (bentuk sama) |
| GET | `/auth/me` | header Bearer | `{id, email}` |

**Aturan implementasi Supabase (krusial):**
- Buat **dua** klien terpisah di `config/supabase.js`: `supabaseAdmin` (secret key, untuk DB/Storage/verifikasi token) dan `supabaseAuth` (publishable key, khusus `signInWithPassword` dan `refreshSession`). Keduanya dengan `{ auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }`.
- **Jangan** memanggil `signInWithPassword` pada `supabaseAdmin`, karena itu mengubah sesi klien dan membuat query berikutnya kehilangan hak secret key.
- Middleware `requireAdmin`: ambil token dari `Authorization: Bearer <token>`, verifikasi dengan `supabaseAdmin.auth.getUser(token)`. Gagal → `UNAUTHORIZED`. Jika `ADMIN_EMAILS` terisi dan email tidak ada di dalamnya → `FORBIDDEN`.
- Login salah → pesan generik "Email atau kata sandi salah" (jangan bedakan email/kata sandi). Rate limit ketat pada `/auth/login` (maks 5 percobaan/menit/IP).

### 6.3 Admin (semua wajib `requireAdmin`)

| Method | Path | Keterangan |
|---|---|---|
| POST | `/admin/menus` | Buat menu → 201, kembalikan objek menu |
| PUT | `/admin/menus/:id` | Ubah menu (validasi penuh seperti buat) |
| DELETE | `/admin/menus/:id` | Hapus; jika `image_url` berasal dari bucket kita, hapus objek storage (best effort, jangan gagalkan request) |
| POST | `/admin/events` | Buat event |
| PUT | `/admin/events/:id` | Ubah event |
| DELETE | `/admin/events/:id` | Hapus event |
| GET | `/admin/events` | Semua event termasuk `is_published=false` |
| POST | `/admin/uploads` | `multipart/form-data`, field `file`, field `folder` (`menus`\|`events`). Respons `{url, path}` |
| GET | `/admin/chat-logs` | Query `page` (default 1), `limit` (default 20, maks 100), `intent`. Respons `{items, page, limit, total}` urut terbaru |

**Skema validasi Joi:**
- **Menu:** `name` string trim 2–100 wajib; `description` string maks 1000, boleh kosong; `price` integer 0–10.000.000 wajib; `category` string trim 2–50 wajib; `variants` array maks 10 berisi `{name: string 1–50 wajib, extra_price: integer >=0 default 0}`; `image_url` uri atau null/kosong; `is_featured` boolean default false; `is_available` boolean default true.
- **Event:** `title` 3–120 wajib; `description` maks 2000; `event_date` tanggal ISO wajib; `location` maks 200; `image_url` uri/null; `is_published` boolean default true.
- **Upload:** hanya `image/jpeg`, `image/png`, `image/webp`, maks 2 MB (multer memory storage). Nama file di storage: `<folder>/<uuid>.<ext>` (jangan pakai nama asli dari klien). Salah tipe/ukuran → `UPLOAD_INVALID`.
- Setelah setiap create/update/delete menu atau event, panggil `aiClient.triggerReindex()` secara **fire-and-forget** (lihat 7.4). Kegagalannya tidak boleh memengaruhi respons admin.

### 6.4 Pesan via WhatsApp

`POST /orders/whatsapp-link`

Body: `{ items: [{menu_id: uuid, quantity: 1–50, variant?: string<=50}] (1–30 item), note?: string<=200 }`

Backend **tidak memercayai harga dari klien**. Langkah: ambil menu dari DB berdasarkan `menu_id`; tolak jika ada yang tidak ada atau `is_available=false` (400 `VALIDATION_ERROR` dengan nama menu yang bermasalah); hitung harga satuan = `price` + `extra_price` varian (jika `variant` diberikan dan ada di `variants`; jika varian tidak dikenal → 400); hitung total; susun teks:

```
Halo Himar Coffee Garut, saya ingin memesan:
1. The Lost Sheep (Iced) x2 - Rp50.000
2. Merry Gloss x1 - Rp28.000

Total: Rp78.000
Catatan: <note, jika ada>

Nama pemesan:
Mohon konfirmasi ketersediaan. Terima kasih!
```

Respons `data`: `{ url, text, total }` dengan `url = https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`. Pesanan **tidak disimpan** di database dan tidak ada data pribadi yang diminta.

---

## 7. Integrasi chatbot (kontrak dengan `ai-service`)

### 7.1 Endpoint backend `POST /chat`

Body: `{ session_id: string 8–64 karakter [A-Za-z0-9_-], message: string trim 1–500 }`. Rate limit: 20 request/menit/IP.

Alur:
1. Validasi.
2. Panggil `aiClient.chat({session_id, message})` (mock atau nyata, lihat 7.3).
3. Petakan intent ke `actions` (dibuat backend, bukan AI service):
   - `tanya_menu` → `{type:"link", label:"Lihat menu", path:"/menu"}`
   - `tanya_event` → `{type:"link", label:"Lihat jadwal event", path:"/events"}`
   - `pemesanan` → `{type:"whatsapp", label:"Pesan via WhatsApp", url}` dengan teks generik "Halo Himar Coffee Garut, saya ingin memesan. Nama pemesan:"
   - `keluhan` → `{type:"whatsapp", label:"Hubungi pemilik", url}` dengan teks "Halo Himar Coffee Garut, saya ingin menyampaikan masukan/keluhan:"
   - `di_luar_konteks` atau intent lain → `actions: []`
4. Simpan ke `chat_logs` secara **best effort** (gagal simpan tidak boleh menggagalkan respons).
5. Respons `data`: `{ reply: string, intent: string, confidence: number|null, actions: Action[] }`.

### 7.2 Kontrak yang harus dipenuhi `ai-service` (FastAPI, dibuat tim lain)

- `GET /health` → 200.
- `POST /api/v1/chat`, request `{session_id, message}`, respons 200 `{intent, confidence, reply}`. Nilai `intent` salah satu: `tanya_menu`, `tanya_event`, `pemesanan`, `keluhan`, `di_luar_konteks`.
- `POST /api/v1/reindex` (header `X-Internal-Key: <INTERNAL_API_KEY>`) → 202. Memberi tahu AI service bahwa katalog berubah.
- AI service mengambil data katalog dari `GET {BACKEND}/api/v1/menus` dan `/events` (endpoint publik di atas).
- Error dari AI service berbentuk `{error:{code, message}}` dengan HTTP 429 untuk kuota habis dan 5xx untuk gangguan.

Tulis kontrak ini juga di `docs/api-contract.md` agar tim AI bisa membacanya.

### 7.3 Mode mock (wajib, supaya aplikasi jalan sebelum AI service siap)

`services/aiMock.js`: klasifikasi sederhana berbasis kata kunci, mengembalikan bentuk respons yang **sama persis** dengan kontrak 7.2.
- kata kunci menu/harga/kopi/minum/makan → `tanya_menu`; event/acara/jadwal/komunitas → `tanya_event`; pesan/order/beli → `pemesanan`; keluhan/kecewa/lambat/komplain → `keluhan`; selainnya → `di_luar_konteks`.
- Untuk `tanya_menu` dan `tanya_event`, `reply` mock mengambil 3 item terkait dari database (nama + harga / judul + tanggal) agar terasa nyata.
- `di_luar_konteks` → "Maaf, aku hanya bisa membantu seputar menu, event, dan pemesanan di Himar Coffee Garut."
- Aktif jika `AI_MOCK=true`. Saat `AI_MOCK=false`, `aiClient` memakai `AI_SERVICE_URL` dengan Axios dan timeout `AI_TIMEOUT_MS`.

### 7.4 Penanganan kegagalan

- Timeout/koneksi gagal/5xx dari AI → `AI_UNAVAILABLE` (503), pesan: "Asisten sedang tidak tersedia. Silakan coba lagi sebentar lagi atau pesan langsung via WhatsApp."
- HTTP 429 dari AI → `AI_RATE_LIMITED` (429), pesan: "Asisten sedang ramai. Coba lagi dalam beberapa saat."
- `triggerReindex()`: kirim `POST {AI_SERVICE_URL}/api/v1/reindex` dengan `X-Internal-Key`, timeout 5 detik, tangkap semua error, jangan lempar. Lewati jika `AI_MOCK=true` atau `AI_SERVICE_URL` kosong.
- Respons dari AI service **divalidasi** (intent string, reply string tidak kosong); jika tidak sesuai kontrak → perlakukan sebagai `AI_UNAVAILABLE` dan catat di log server.
- AI service dihubungi **hanya dari backend**, tidak pernah dari frontend.

---

## 8. Frontend

### 8.1 Arah desain (keputusan yang jelas, bukan template generik)

Nuansa kedai kopi hangat dan bersahaja, mobile-first (mayoritas pelanggan membuka dari ponsel).
- **Warna (token Tailwind di `theme.extend`):** latar krem `#FAF4EA`, teks espresso `#2B1B12`, aksen utama terracotta `#B5532C`, aksen sekunder hijau sage `#6F8F72`, permukaan kartu `#FFFFFF`, garis halus `#E7DCCB`. Pastikan kontras teks memenuhi WCAG AA.
- **Tipografi:** judul memakai font serif berkarakter (misalnya *Fraunces* dari Google Fonts), isi memakai sans bersih (misalnya *Inter*), dengan fallback system font.
- **Gaya:** sudut membulat sedang, bayangan lembut, foto menu besar dengan rasio konsisten (4:3), ruang putih lega, tanpa gradien ungu/neon.
- Ikon dari `lucide-react`. Semua gambar punya `alt`, `loading="lazy"`, dan placeholder jika `image_url` kosong atau gagal dimuat (`onError`).
- `index.html`: `lang="id"`, meta viewport, title dan meta description, favicon.

### 8.2 Rute

| Path | Halaman |
|---|---|
| `/` | Beranda: hero singkat + tombol "Lihat Menu" dan "Tanya Asisten", bagian **Menu Unggulan** (`featured=true`), bagian **Event Mendatang** (maks 3), cara pesan (3 langkah singkat) |
| `/menu` | Katalog: pencarian nama, filter kategori (chip), grid kartu, klik kartu → modal detail (foto besar, deskripsi, harga, pilihan varian, tombol "Tambah ke pesanan") |
| `/events` | Daftar event mendatang dengan tab "Mendatang" / "Sudah berlalu" |
| `/admin/login` | Form login |
| `/admin` | Redirect ke `/admin/menus` |
| `/admin/menus`, `/admin/events` | Tabel + CRUD |
| `/admin/dashboard` | Iframe dasbor penjualan |
| `/admin/chat-logs` | Tabel riwayat chat, filter intent, paginasi |
| `*` | Halaman 404 ramah |

Rute `/admin/*` (kecuali login) dilindungi `ProtectedRoute`; tanpa token valid → redirect ke `/admin/login`. Navbar publik **tidak** menampilkan tautan admin (akses lewat URL langsung atau tautan kecil di footer).

### 8.3 Lapisan API

- `api/client.js`: instance Axios dengan `baseURL = VITE_API_BASE_URL`, timeout 30 detik (backend Render free tier bisa "bangun" lambat).
- Interceptor request: sisipkan `Authorization: Bearer` untuk rute admin.
- Interceptor response: pada 401 di rute admin, coba `POST /auth/refresh` **sekali** (hindari loop), ulangi request; jika gagal → hapus sesi dan arahkan ke login dengan toast "Sesi berakhir, silakan masuk lagi".
- Fungsi helper yang menormalkan error: ubah respons error backend atau error jaringan menjadi `{code, message}` untuk ditampilkan. Jaringan putus → "Tidak bisa terhubung ke server. Periksa koneksi internet kamu."
- Penyimpanan sesi admin: `localStorage` (access_token, refresh_token, expires_at, email) lewat `AuthProvider`.

### 8.4 Status UI (wajib di SETIAP aksi dan pemuatan data)

Setiap fetch/aksi harus punya tiga status yang jelas:
- **Loading:** skeleton untuk daftar/kartu, spinner kecil + tombol `disabled` saat submit.
- **Sukses:** toast hijau ("Menu berhasil disimpan").
- **Gagal:** toast/blok error dengan pesan jelas dan tombol "Coba lagi" untuk pemuatan data.
- **Kosong:** `EmptyState` dengan ilustrasi sederhana dan teks, misalnya "Belum ada event mendatang".
Cegah klik ganda pada submit. Konfirmasi (modal) sebelum menghapus.

### 8.5 Keranjang pesanan

- `CartProvider` (Context + reducer), tersimpan di `localStorage` (`menu_id`, `quantity`, `variant`). Ikon keranjang di navbar dengan badge jumlah.
- `CartDrawer`: daftar item (nama, varian, qty +/−, hapus), kolom catatan (maks 200), total perkiraan.
- Tombol **"Pesan via WhatsApp"** memanggil `POST /orders/whatsapp-link`, lalu membuka `url` dengan `window.open(url, '_blank', 'noopener')`. Jika popup diblokir, tampilkan tautan manual. Tampilkan pesan jika ada menu yang sudah tidak tersedia (dari error backend) dan perbarui keranjang.
- Total yang tampil di drawer hanya perkiraan; angka final berasal dari backend.

### 8.6 Chat widget (`features/chat`)

- Tombol melayang di kanan bawah (semua halaman publik). Di ponsel, panel mengisi layar penuh dengan tombol tutup; di desktop berupa panel 380×560.
- `session_id`: buat dengan `crypto.randomUUID()` (hilangkan tanda `-` tidak perlu, format valid sesuai Joi), simpan di `sessionStorage`.
- Pesan sambutan awal dari bot (lokal, tidak dikirim ke server) + 3 *suggestion chip*: "Menu unggulan apa saja?", "Ada event apa minggu ini?", "Gimana cara pesan?".
- Input maks 500 karakter dengan penghitung; Enter = kirim, Shift+Enter = baris baru; tombol kirim `disabled` saat kosong atau sedang mengirim.
- Indikator mengetik (tiga titik) selama menunggu; setelah 8 detik tambahkan teks "Asisten sedang menyiapkan jawaban…" (cold start).
- Render `reply` sebagai **teks biasa** (JANGAN `dangerouslySetInnerHTML`), pertahankan baris baru dengan `whitespace-pre-wrap`.
- Render `actions`: `link` → navigasi internal (`react-router`) lalu tutup panel di ponsel; `whatsapp` → tombol hijau yang membuka `url` di tab baru.
- Saat error: gelembung error dengan pesan dari backend dan tombol "Coba lagi" (kirim ulang pesan terakhir). Auto-scroll ke pesan terbaru, `aria-live="polite"` pada area pesan.

### 8.7 Halaman admin

- **Login:** email + kata sandi, validasi sisi klien (format email, tidak kosong), tombol tampil/sembunyikan sandi, pesan error dari backend, loading di tombol. Jangan tampilkan hint apakah email atau sandi yang salah.
- **Layout:** sidebar (Menu, Event, Dasbor, Riwayat Chat) yang menjadi menu hamburger di ponsel, header dengan email admin dan tombol Keluar.
- **Menu:** tabel (foto kecil, nama, kategori, harga, badge Unggulan/Tersedia), pencarian, tombol Tambah/Ubah/Hapus. Form di modal: nama, deskripsi, harga (angka), kategori (input dengan saran dari kategori yang ada), varian (repeater nama + tambahan harga), unggah foto (pratinjau, validasi tipe dan ukuran di klien sebelum kirim, lalu `POST /admin/uploads`, simpan URL di state), switch Unggulan dan Tersedia. Tampilkan error validasi per kolom dari `details`. Setelah simpan: tutup modal, segarkan tabel, toast sukses.
- **Event:** pola sama; input `datetime-local` dikonversi ke ISO dengan zona waktu Asia/Jakarta saat kirim; tampilkan tanggal dengan format Indonesia (WIB).
- **Dasbor:** jika `VITE_DASHBOARD_URL` terisi → iframe tinggi penuh (`title` terisi, `loading="lazy"`) dengan tautan "Buka di tab baru"; jika kosong → kartu placeholder "Dasbor belum dikonfigurasi".
- **Riwayat chat:** tabel waktu, intent (badge), pesan pengguna, jawaban bot; filter intent; paginasi.

### 8.8 Format dan utilitas

`lib/format.js`: `formatRupiah(n)` memakai `Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0})`; `formatTanggal(iso)` memakai `Intl.DateTimeFormat('id-ID', {dateStyle:'full', timeStyle:'short', timeZone:'Asia/Jakarta'})`.

---

## 9. Keamanan (wajib)

- `helmet()`, CORS allowlist dari `FRONTEND_URL` (bukan `*`), batas body `100kb`, rate limit global 100 request/menit/IP plus batas khusus untuk `/chat` dan `/auth/login`.
- Secret key dan kunci lain **hanya** dari env, tidak pernah dikirim ke frontend, tidak masuk log, tidak ada di repo. Pastikan `.gitignore` berisi `.env`, `node_modules`, `dist`.
- Semua input divalidasi Joi di backend (jangan hanya di frontend). Query Supabase memakai API klien (parameterized); jangan merangkai string filter dari input pengguna (hindari `.or()` dengan input mentah).
- Respons error production tanpa stack trace. `app.set('trust proxy', 1)` agar rate limit benar di belakang proxy Render.
- Jangan menyimpan atau meminta data pribadi pelanggan. `chat_logs` hanya menyimpan `session_id` acak.
- Upload: cek MIME dan ukuran, nama file di-generate server.

---

## 10. Data contoh (seed)

`backend/scripts/seed.js` (`npm run seed`): idempoten (cek `name`/`title` sebelum insert), memasukkan data **dummy yang diberi label jelas**:
- Menu: "The Lost Sheep" dan "Merry Gloss" (`is_featured=true`), plus 4–6 menu lain di kategori `Kopi`, `Non-Kopi`, `Makanan`. Deskripsi diawali `[DUMMY]` dan harga placeholder yang wajar.
- 2–3 event dummy dengan tanggal di masa depan, judul diawali `[DUMMY]`.
Tambahkan peringatan di README: **ganti dengan data asli Himar Coffee sebelum demo**.

---

## 11. Pengujian

### Otomatis (Vitest + Supertest, klien Supabase dan Axios di-mock)
- `GET /menus` dan `/events`: format respons, filter, hanya event terbit.
- Validasi: `POST /admin/menus` dengan nama kosong, harga negatif, varian salah → 400 `VALIDATION_ERROR` dengan `details`.
- Auth: `/admin/*` tanpa token → 401; token tidak valid → 401; email di luar `ADMIN_EMAILS` → 403.
- `/chat`: pesan kosong/ >500 karakter → 400; AI mock mengembalikan intent + `actions` benar; AI service timeout → 503 `AI_UNAVAILABLE`; AI 429 → 429 `AI_RATE_LIMITED`; gagal menyimpan log tidak menggagalkan respons.
- `/orders/whatsapp-link`: total dihitung di server (abaikan harga dari klien), menu tidak tersedia ditolak, varian tidak dikenal ditolak, URL memuat `wa.me/<nomor>` dan teks ter-encode.
- Upload: tipe salah dan >2 MB ditolak.

### Manual (tulis hasilnya di `docs/test-report.md` dengan tabel: skenario, langkah, hasil diharapkan, hasil aktual, status)
1. Katalog: buka `/menu`, filter kategori, buka detail The Lost Sheep dan Merry Gloss, semua data dan foto tampil tanpa error.
2. Chatbot: pertanyaan bervariasi (menu, event, pemesanan, keluhan), kalimat kosong, teks sangat panjang, typo, pertanyaan di luar topik; tombol aksi WhatsApp membuka teks terformat.
3. Keranjang → WhatsApp: tambah item berbagai varian, ubah qty, kirim; periksa teks.
4. Admin: login salah → pesan error; login benar → tambah menu baru → muncul di halaman pelanggan; kosongkan kolom wajib → ditolak dengan pesan; ubah dan hapus.
5. Backend AI mati (`AI_MOCK=false`, URL salah) → chat menampilkan pesan error dengan tombol "Coba lagi".
6. Responsif: lebar 360px, 768px, 1280px; uji di ponsel sungguhan lewat URL publik.

---

## 12. Deployment

- **`render.yaml`** (backend): web service Node, `rootDir: backend`, `buildCommand: npm install`, `startCommand: npm start`, `healthCheckPath: /api/v1/health`, daftar env dengan `sync: false` untuk semua nilai rahasia.
- **`frontend/vercel.json`** (frontend, Vercel): rewrite SPA agar rute seperti `/menu` dan `/admin/login` tidak 404 saat di-refresh:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
  Pengaturan proyek di Vercel (dijelaskan di README): Root Directory `frontend`, Framework Preset `Vite`, Build Command `npm run build`, Output Directory `dist`. Variabel `VITE_API_BASE_URL` dan `VITE_DASHBOARD_URL` diisi di Project Settings > Environment Variables. Karena variabel `VITE_*` ditanam saat build, **setiap kali nilainya diubah, frontend harus di-redeploy**.
- README bagian "Deploy": langkah memasang env di Render dan Vercel, urutan (deploy backend → ambil URL → set `VITE_API_BASE_URL` di Vercel → deploy frontend → set `FRONTEND_URL` di Render ke URL produksi Vercel). Catatan CORS: URL *preview deployment* Vercel berbeda dari URL produksi dan akan diblokir CORS kecuali ditambahkan ke `FRONTEND_URL` (dipisah koma). Untuk demo cukup gunakan URL produksi.
- Catatan di README: Render free tier "tidur" saat sepi sehingga request pertama bisa 30–60 detik, dan Supabase free tier menjeda project yang tidak aktif sekitar seminggu. Buka aplikasi beberapa menit sebelum demo.

---

## 13. Dokumentasi yang harus dihasilkan

- **`README.md`:** masalah UMKM dan pengguna, fitur, diagram arsitektur, struktur repo, cara menjalankan lokal (backend, frontend), tabel variabel env, cara seed, cara menjalankan tes, cara deploy, **sumber data/library/API yang dipakai**, keputusan desain, batasan yang diketahui.
- **`docs/api-contract.md`:** semua endpoint beserta contoh request/response, kode error, dan kontrak `ai-service` (bagian 7.2).
- **`docs/user-manual.md`:** panduan singkat bergambar-teks untuk pelanggan (cara lihat menu, tanya asisten, pesan via WhatsApp) dan untuk admin (login, kelola menu/event, lihat dasbor), bahasa sederhana untuk pelaku UMKM.
- **`docs/test-report.md`:** templat tabel pengujian (bagian 11).
- Sertakan juga `docs/api.http` (atau koleksi Postman) berisi contoh request ke setiap endpoint.

---

## 14. Urutan pengerjaan dan kriteria selesai

Kerjakan **berurutan**. Di akhir tiap fase, jalankan dan verifikasi sendiri, lalu ringkas apa yang dibuat dan cara mengujinya sebelum lanjut.

**Fase 0, Fondasi.** Scaffold monorepo, `.gitignore`, `.env.example`, validasi env, klien Supabase, error handler, `/health`.
*Selesai jika:* `npm run dev` jalan, `/api/v1/health` mengembalikan 200, aplikasi gagal start dengan pesan jelas bila env wajib kosong.

**Fase 1, API baca publik + seed.** `/menus`, `/menus/categories`, `/menus/:id`, `/events`, `/events/:id`, `scripts/seed.js`.
*Selesai jika:* seed berhasil dua kali berturut-turut tanpa duplikat; endpoint mengembalikan data sesuai bagian 5 dan 6.

**Fase 2, Auth + admin CRUD + upload.** Login/refresh/me, `requireAdmin`, CRUD menu dan event, upload, chat-logs.
*Selesai jika:* semua kasus validasi dan otorisasi di bagian 11 lulus.

**Fase 3, Frontend publik.** Setup Vite + Tailwind + token desain, layout, Beranda, Menu, Event, status loading/kosong/error, responsif.
*Selesai jika:* semua halaman publik berfungsi di 360px dan 1280px dengan data dari backend.

**Fase 4, Keranjang + WhatsApp.** Endpoint `/orders/whatsapp-link`, `CartProvider`, `CartDrawer`.
*Selesai jika:* teks WhatsApp sesuai format bagian 6.4 dan total dihitung server.

**Fase 5, Chat.** `aiClient`, `aiMock`, `/chat`, log, `ChatWidget`, penanganan error AI.
*Selesai jika:* chat berjalan end-to-end dengan `AI_MOCK=true`, tombol aksi bekerja, dan mematikan AI menghasilkan pesan error yang benar.

**Fase 6, Admin UI.** Login, layout, CRUD menu dan event dengan upload foto, dasbor iframe, riwayat chat.
*Selesai jika:* menu baru yang ditambah admin langsung terlihat di halaman pelanggan, input kosong ditolak dengan pesan per kolom.

**Fase 7, Finalisasi.** Tes otomatis, `render.yaml`, `netlify.toml`, README dan dokumen, audit keamanan (bagian 9), pemeriksaan aksesibilitas dasar (kontras, label form, fokus keyboard).
*Selesai jika:* `npm test` hijau, build produksi frontend berhasil tanpa peringatan penting, dan semua dokumen di bagian 13 ada.

### Checklist penerimaan akhir
- [ ] Menyelesaikan satu masalah UMKM yang jelas untuk pengguna spesifik (ada di README).
- [ ] Minimal 2 fitur utama berfungsi: katalog/event, chatbot, pesan via WhatsApp, admin CRUD.
- [ ] Hasil sesuai aksi/input pengguna.
- [ ] Setiap aksi punya tanda berhasil, gagal, dan sedang diproses.
- [ ] Mudah dipakai UMKM, dengan panduan (`docs/user-manual.md` + teks bantu di UI).
- [ ] Dapat diakses publik lewat browser, termasuk ponsel (bukan localhost).
- [ ] Frontend dan backend terpisah dan terhubung lewat networking call (Axios); URL API versi `/api/v1`.
- [ ] Data tersimpan persisten (Supabase); layanan AI diakses lewat backend.
- [ ] Validasi skema di backend (Joi); kegagalan layanan ditangani dengan pesan jelas.
- [ ] Antarmuka memakai CSS framework (Tailwind); mockup/desain mengikuti bagian 8.1.
- [ ] Riwayat chat tersimpan di database.
- [ ] Riwayat kode memakai Git; commit kecil dan bermakna per fase.
