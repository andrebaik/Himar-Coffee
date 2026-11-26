import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import request from 'supertest';

// State mock dibuat via vi.hoisted agar bisa dipakai di dalam vi.mock factory.
const h = vi.hoisted(() => {
  const state = { menus: [], orders: [] };

  const exec = (q) => {
    if (q.table === 'menus') {
      const ids = q.inFilter ? q.inFilter.ids : [];
      const data = state.menus.filter((m) => ids.includes(m.id));
      return { data, error: null };
    }

    if (q.table === 'orders') {
      if (q.op === 'insert') {
        const row = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...q.payload,
        };
        state.orders.push(row);
        return { data: row, error: null };
      }

      if (q.op === 'update') {
        const rows = state.orders.filter((o) =>
          Object.entries(q.eqFilters).every(([col, val]) => o[col] === val)
        );
        rows.forEach((o) => Object.assign(o, q.payload));
        return { data: q.selectCols ? rows[0] || null : null, error: null };
      }

      const rows = state.orders.filter((o) =>
        Object.entries(q.eqFilters).every(([col, val]) => o[col] === val)
      );
      return { data: rows[0] || null, error: null };
    }

    return { data: null, error: null };
  };

  const makeBuilder = (table) => {
    const q = { table, op: null, payload: null, eqFilters: {}, inFilter: null, selectCols: null };
    const builder = {
      select(cols) {
        q.selectCols = cols;
        return builder;
      },
      in(col, ids) {
        q.inFilter = { col, ids };
        return builder;
      },
      eq(col, val) {
        q.eqFilters[col] = val;
        return builder;
      },
      insert(payload) {
        q.op = 'insert';
        q.payload = payload;
        return builder;
      },
      update(payload) {
        q.op = 'update';
        q.payload = payload;
        return builder;
      },
      maybeSingle() {
        return builder;
      },
      single() {
        return builder;
      },
      then(resolve, reject) {
        let result;
        try {
          result = exec(q);
        } catch (err) {
          return Promise.reject(err).then(resolve, reject);
        }
        return Promise.resolve(result).then(resolve, reject);
      },
    };
    return builder;
  };

  const supabaseAdmin = { from: (table) => makeBuilder(table) };
  const createTransaction = vi.fn();

  return { state, supabaseAdmin, createTransaction };
});

vi.mock('../src/config/supabase.js', () => ({
  supabaseAdmin: h.supabaseAdmin,
  supabaseAuth: {},
}));

vi.mock('../src/config/midtrans.js', () => ({
  getSnapClient: () => ({ createTransaction: h.createTransaction }),
}));

// Nilai env ditetapkan sebelum import app agar config deterministik.
process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-test';
process.env.MIDTRANS_CLIENT_KEY = 'SB-Mid-client-test';
process.env.DELIVERY_FEE = '8000';
process.env.DELIVERY_MIN_ORDER = '30000';

const { default: app } = await import('../src/app.js');

const AMERICANO_ID = '11111111-1111-1111-1111-111111111111';
const LOST_SHEEP_ID = '22222222-2222-2222-2222-222222222222';
const SOLD_OUT_ID = '33333333-3333-3333-3333-333333333333';

const seedState = () => {
  h.state.menus = [
    {
      id: AMERICANO_ID,
      name: 'Americano',
      price: 16000,
      category: 'Coffee Based',
      variants: [{ name: 'Cold', extra_price: 2000 }],
      is_available: true,
    },
    {
      id: LOST_SHEEP_ID,
      name: 'The Lost Sheep',
      price: 20000,
      category: 'Signature Coffee',
      variants: [],
      is_available: true,
    },
    {
      id: SOLD_OUT_ID,
      name: 'Menu Habis',
      price: 10000,
      category: 'Coffee Based',
      variants: [],
      is_available: false,
    },
  ];
  h.state.orders = [];
};

const baseOrderBody = (overrides = {}) => ({
  items: [{ menu_id: AMERICANO_ID, quantity: 2 }],
  customer_name: 'Budi Santoso',
  customer_phone: '081234567890',
  fulfillment_type: 'pickup',
  ...overrides,
});

describe('POST /api/v1/orders (Checkout Midtrans)', () => {
  beforeEach(() => {
    seedState();
    h.createTransaction.mockReset();
    h.createTransaction.mockResolvedValue({
      token: 'snap-token-test',
      redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vttoken/snap-token-test',
    });
  });

  it('pickup: subtotal dihitung server-side, tanpa ongkir, snap token dikembalikan', async () => {
    const res = await request(app).post('/api/v1/orders').send(baseOrderBody());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order_code).toMatch(/^HIMAR-[A-Z0-9]{8}$/);
    expect(res.body.data.snap_token).toBe('snap-token-test');
    expect(res.body.data.subtotal).toBe(32000);
    expect(res.body.data.delivery_fee).toBe(0);
    expect(res.body.data.total).toBe(32000);
    expect(h.state.orders).toHaveLength(1);
    expect(h.state.orders[0].status).toBe('pending');
    // Harga dari klien (bila dikirim) tidak boleh memengaruhi total
    expect(h.state.orders[0].items[0].unit_price).toBe(16000);
  });

  it('delivery di bawah minimum ditolak dengan pesan sisa nominal', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(
        baseOrderBody({
          items: [{ menu_id: AMERICANO_ID, quantity: 1 }],
          fulfillment_type: 'delivery',
          delivery_address: 'Jl. Merdeka No. 1, Garut',
        })
      );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Kurang');
    expect(res.body.error.message).toContain('signature');
  });

  it('delivery: menu signature dihitung ganda sehingga lolos minimum', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(
        baseOrderBody({
          items: [{ menu_id: LOST_SHEEP_ID, quantity: 1 }],
          fulfillment_type: 'delivery',
          delivery_address: 'Jl. Raya Garut No. 10',
        })
      );

    expect(res.status).toBe(201);
    // Subtotal efektif = 20000 x 2 = 40000 >= 30000 (minimum)
    expect(res.body.data.subtotal).toBe(20000);
    expect(res.body.data.delivery_fee).toBe(8000);
    expect(res.body.data.total).toBe(28000);
    expect(h.state.orders[0].items[0].is_signature).toBe(true);
  });

  it('delivery tanpa alamat ditolak 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(
        baseOrderBody({
          items: [{ menu_id: LOST_SHEEP_ID, quantity: 2 }],
          fulfillment_type: 'delivery',
        })
      );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Alamat');
  });

  it('menu tidak tersedia ditolak 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(baseOrderBody({ items: [{ menu_id: SOLD_OUT_ID, quantity: 1 }] }));

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Menu Habis');
  });

  it('varian tidak dikenal ditolak 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(
        baseOrderBody({
          items: [{ menu_id: AMERICANO_ID, quantity: 1, variant: 'PanasEsTeh' }],
        })
      );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('PanasEsTeh');
  });

  it('validasi Joi: nama kosong dan HP tidak valid ditolak 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send(baseOrderBody({ customer_name: '', customer_phone: 'abc123' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(2);
  });

  it('kegagalan Midtrans mengembalikan 503 PAYMENT_UNAVAILABLE', async () => {
    h.createTransaction.mockRejectedValueOnce(new Error('snap down'));

    const res = await request(app).post('/api/v1/orders').send(baseOrderBody());

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('PAYMENT_UNAVAILABLE');
    // Pesanan yang gagal dibuat transaksinya ditandai failed
    expect(h.state.orders[0].status).toBe('failed');
  });
});

describe('GET /api/v1/orders/:code', () => {
  beforeEach(seedState);

  it('mengembalikan status pesanan yang ada', async () => {
    h.state.orders.push({
      order_code: 'HIMAR-TEST0001',
      customer_name: 'Budi',
      customer_phone: '081234567890',
      fulfillment_type: 'pickup',
      delivery_address: null,
      note: null,
      items: [],
      subtotal: 32000,
      delivery_fee: 0,
      total: 32000,
      status: 'pending',
      midtrans_payment_type: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    });

    const res = await request(app).get('/api/v1/orders/HIMAR-TEST0001');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.order_code).toBe('HIMAR-TEST0001');
  });

  it('kode tidak dikenal mengembalikan 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/orders/HIMAR-TIDAKADA');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/v1/payments/notifications (Webhook Midtrans)', () => {
  beforeEach(() => {
    seedState();
    h.state.orders.push({
      id: 'order-internal-1',
      order_code: 'HIMAR-TEST0001',
      customer_name: 'Budi',
      customer_phone: '081234567890',
      fulfillment_type: 'pickup',
      delivery_address: null,
      note: null,
      items: [],
      subtotal: 32000,
      delivery_fee: 0,
      total: 32000,
      status: 'pending',
      midtrans_transaction_id: null,
      midtrans_payment_type: null,
      paid_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  const buildPayload = (overrides = {}) => {
    const payload = {
      order_id: 'HIMAR-TEST0001',
      status_code: '200',
      gross_amount: '32000.00',
      transaction_status: 'settlement',
      fraud_status: 'accept',
      transaction_id: 'txn-123',
      payment_type: 'qris',
      ...overrides,
    };
    payload.signature_key = crypto
      .createHash('sha512')
      .update(
        `${payload.order_id}${payload.status_code}${payload.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
      )
      .digest('hex');
    return payload;
  };

  it('signature valid + settlement mengubah status menjadi paid', async () => {
    const res = await request(app).post('/api/v1/payments/notifications').send(buildPayload());

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paid');
    expect(h.state.orders[0].status).toBe('paid');
    expect(h.state.orders[0].paid_at).toBeTruthy();
    expect(h.state.orders[0].midtrans_payment_type).toBe('qris');
  });

  it('signature salah ditolak 403 FORBIDDEN', async () => {
    const payload = buildPayload();
    payload.signature_key = 'signature-palsu';

    const res = await request(app).post('/api/v1/payments/notifications').send(payload);

    expect(res.status).toBe(403);
    expect(h.state.orders[0].status).toBe('pending');
  });

  it('nominal tidak sesuai pesanan ditolak 403', async () => {
    const payload = buildPayload({ gross_amount: '999999.00' });

    const res = await request(app).post('/api/v1/payments/notifications').send(payload);

    expect(res.status).toBe(403);
    expect(h.state.orders[0].status).toBe('pending');
  });

  it('order tidak dikenal mengembalikan 404', async () => {
    const payload = buildPayload({ order_id: 'HIMAR-TIDAKADA' });

    const res = await request(app).post('/api/v1/payments/notifications').send(payload);

    expect(res.status).toBe(404);
  });

  it('expire mengubah status menjadi expired', async () => {
    const payload = buildPayload({
      status_code: '407',
      transaction_status: 'expire',
    });

    const res = await request(app).post('/api/v1/payments/notifications').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('expired');
    expect(h.state.orders[0].paid_at).toBeFalsy();
  });
});
