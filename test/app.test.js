const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');

// ===== Phần 1: smoke test (không cần MongoDB) =====
describe('Smoke test (không cần MongoDB)', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => {
    server.close();
  });

  test('GET /health trả 503 khi chưa kết nối MongoDB', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 503);
    const body = await res.json();
    assert.strictEqual(body.status, 'error');
  });

  test('GET đường dẫn không tồn tại trả 404', async () => {
    const res = await fetch(`${baseUrl}/khong-ton-tai`);
    assert.strictEqual(res.status, 404);
  });
});

// ===== Phần 2: CRUD tích hợp (cần API và MongoDB đang chạy) =====
const BASE_URL = process.env.BASE_URL;

describe(
  'CRUD integration',
  { skip: BASE_URL ? false : 'Đặt BASE_URL để chạy phần này' },
  () => {
    const pid = `CI${Date.now()}`;
    const send = (method, path, body) =>
      fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

    after(async () => {
      // dọn dữ liệu nếu test dừng giữa chừng
      await send('DELETE', `/api/products/${pid}`).catch(() => {});
    });

    test('GET /health trả 200', async () => {
      const res = await send('GET', '/health');
      assert.strictEqual(res.status, 200);
    });

    test('POST tạo sản phẩm trả 201', async () => {
      const res = await send('POST', '/api/products', {
        pid, pname: 'Laptop', price: 1000, quantity: 5,
      });
      assert.strictEqual(res.status, 201);
    });

    test('POST trùng pid bị từ chối (409)', async () => {
      const res = await send('POST', '/api/products', {
        pid, pname: 'Trung', price: 1, quantity: 1,
      });
      assert.strictEqual(res.status, 409);
    });

    test('GET danh sách có sản phẩm vừa tạo', async () => {
      const res = await send('GET', '/api/products');
      const list = await res.json();
      assert.ok(list.some((p) => p.pid === pid));
    });

    test('GET một sản phẩm trả 200', async () => {
      const res = await send('GET', `/api/products/${pid}`);
      assert.strictEqual(res.status, 200);
    });

    test('PUT cập nhật giá', async () => {
      const res = await send('PUT', `/api/products/${pid}`, { price: 1500 });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.price, 1500);
    });

    test('DELETE xóa sản phẩm trả 200', async () => {
      const res = await send('DELETE', `/api/products/${pid}`);
      assert.strictEqual(res.status, 200);
    });

    test('GET sau khi xóa trả 404', async () => {
      const res = await send('GET', `/api/products/${pid}`);
      assert.strictEqual(res.status, 404);
    });
  }
);