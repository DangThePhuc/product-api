const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');

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