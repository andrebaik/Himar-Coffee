import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { supabaseAdmin } from '../src/config/supabase.js';

describe('Public API Endpoints', () => {
  it('GET /api/v1/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.time).toBeDefined();
  });

  it('GET /api/v1/menus returns 200 with array of menus', async () => {
    const res = await request(app).get('/api/v1/menus');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Verify featured items come first
    if (res.body.data.length >= 2) {
      const firstIsFeatured = res.body.data[0].is_featured;
      expect(firstIsFeatured).toBe(true);
    }
  });

  it('GET /api/v1/menus?featured=true returns only featured menus', async () => {
    const res = await request(app).get('/api/v1/menus?featured=true');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((m) => {
      expect(m.is_featured).toBe(true);
    });
  });

  it('GET /api/v1/menus?category=Kopi returns only Kopi items', async () => {
    const res = await request(app).get('/api/v1/menus?category=Kopi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((m) => {
      expect(m.category).toBe('Kopi');
    });
  });

  it('GET /api/v1/menus/categories returns unique categories array', async () => {
    const res = await request(app).get('/api/v1/menus/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toContain('Kopi');
  });

  it('GET /api/v1/menus/:id with invalid UUID returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/v1/menus/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
  });

  it('GET /api/v1/menus/:id with non-existent UUID returns 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/menus/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/events returns 200 with array of events', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/events/:id with invalid UUID returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/v1/events/invalid-uuid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Authentication & Authorization', () => {
  it('POST /api/v1/auth/login with wrong credentials returns 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toBe('Email atau kata sandi salah');
  });

  it('POST /api/v1/auth/login with invalid email format returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'somepassword' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/admin/menus without token returns 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .post('/api/v1/admin/menus')
      .send({ name: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/admin/menus with invalid token returns 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .post('/api/v1/admin/menus')
      .set('Authorization', 'Bearer invalid-token-123')
      .send({ name: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/admin/events without token returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/v1/admin/events');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Admin Validation Logic', () => {
  it('rejects invalid menu body with 400 VALIDATION_ERROR when authenticated as admin', async () => {
    // Mock requireAdmin by mocking supabaseAdmin.auth.getUser
    const spy = vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: { id: 'test-admin-id', email: 'himar@admin.com' } },
      error: null,
    });

    const res = await request(app)
      .post('/api/v1/admin/menus')
      .set('Authorization', 'Bearer valid-mock-token')
      .send({
        name: '', // empty name
        price: -5000, // negative price
        category: '', // empty category
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);

    spy.mockRestore();
  });

  it('rejects non-admin email with 403 FORBIDDEN even with valid Supabase token', async () => {
    const spy = vi.spyOn(supabaseAdmin.auth, 'getUser').mockResolvedValueOnce({
      data: { user: { id: 'not-admin-id', email: 'intruder@other.com' } },
      error: null,
    });

    const res = await request(app)
      .get('/api/v1/admin/events')
      .set('Authorization', 'Bearer valid-user-token');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toBe('Akun ini tidak memiliki akses admin');

    spy.mockRestore();
  });
});

describe('Not Found Routing', () => {
  it('returns 404 for non-existent route with standard error format', async () => {
    const res = await request(app).get('/api/v1/random-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Orders WhatsApp Link Endpoint', () => {
  it('POST /api/v1/orders/whatsapp-link calculates total on server and returns wa.me URL', async () => {
    // Get existing menu from DB
    const menusRes = await request(app).get('/api/v1/menus');
    const lostSheep = menusRes.body.data.find((m) => m.name === 'The Lost Sheep');
    expect(lostSheep).toBeDefined();

    const res = await request(app)
      .post('/api/v1/orders/whatsapp-link')
      .send({
        items: [
          {
            menu_id: lostSheep.id,
            quantity: 2,
            variant: 'Iced',
          },
        ],
        note: 'Gula sedikit saja',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('https://wa.me/62895620019593');
    expect(res.body.data.text).toContain('The Lost Sheep (Iced) x2');
    expect(res.body.data.text).toContain('Gula sedikit saja');
    // Price: (25000 + 3000) * 2 = 56000
    expect(res.body.data.total).toBe(56000);
  });

  it('rejects invalid variant name with 400 VALIDATION_ERROR', async () => {
    const menusRes = await request(app).get('/api/v1/menus');
    const lostSheep = menusRes.body.data.find((m) => m.name === 'The Lost Sheep');

    const res = await request(app)
      .post('/api/v1/orders/whatsapp-link')
      .send({
        items: [
          {
            menu_id: lostSheep.id,
            quantity: 1,
            variant: 'SuperSpicyNonExistent',
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('SuperSpicyNonExistent');
  });

  it('rejects empty items array with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/orders/whatsapp-link')
      .send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Chat Endpoint & Mock AI', () => {
  it('rejects empty message with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({
        session_id: 'session123456',
        message: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects message exceeding 500 characters with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({
        session_id: 'session123456',
        message: 'a'.repeat(501),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns tanya_menu intent with menu action for menu questions', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({
        session_id: 'session123456',
        message: 'Bisa minta rekomendasi kopi atau menu favorit?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intent).toBe('tanya_menu');
    expect(res.body.data.reply).toBeDefined();
    expect(res.body.data.actions).toEqual([
      { type: 'link', label: 'Lihat menu', path: '/menu' },
    ]);
  });

  it('returns pemesanan intent with WhatsApp action for order questions', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({
        session_id: 'session123456',
        message: 'Gimana cara order kopi di sini ya?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intent).toBe('pemesanan');
    expect(res.body.data.actions[0].type).toBe('whatsapp');
    expect(res.body.data.actions[0].url).toContain('https://wa.me/62895620019593');
  });

  it('returns di_luar_konteks with empty actions for unrelated questions', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({
        session_id: 'session123456',
        message: 'Siapa presiden pertama Indonesia?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intent).toBe('di_luar_konteks');
    expect(res.body.data.actions).toEqual([]);
    expect(res.body.data.reply).toContain('Maaf');
  });
});
