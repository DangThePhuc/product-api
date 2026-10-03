#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
PID="CI$(date +%s)"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS: $name (nhận $actual)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name (mong đợi $expected, nhận $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo "Test CRUD trên $BASE_URL với pid=$PID"

# 1. Health
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
check "GET /health" 200 "$code"

# 2. Create
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d "{\"pid\":\"$PID\",\"pname\":\"Laptop\",\"price\":1000,\"quantity\":5}")
check "POST tạo sản phẩm" 201 "$code"

# 3. Create trùng pid
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d "{\"pid\":\"$PID\",\"pname\":\"Trung\",\"price\":1,\"quantity\":1}")
check "POST trùng pid bị từ chối" 409 "$code"

# 4. Read all
body=$(curl -s "$BASE_URL/api/products")
if echo "$body" | grep -q "$PID"; then r=ok; else r=missing; fi
check "GET danh sách có sản phẩm vừa tạo" ok "$r"

# 5. Read one
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/products/$PID")
check "GET một sản phẩm" 200 "$code"

# 6. Update
body=$(curl -s -X PUT "$BASE_URL/api/products/$PID" \
  -H "Content-Type: application/json" \
  -d '{"price":1500}')
if echo "$body" | grep -q '"price":1500'; then r=ok; else r=wrong; fi
check "PUT cập nhật giá" ok "$r"

# 7. Delete
code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/products/$PID")
check "DELETE xóa sản phẩm" 200 "$code"

# 8. Read sau khi xóa
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/products/$PID")
check "GET sau khi xóa trả 404" 404 "$code"

echo "Kết quả: $PASS pass, $FAIL fail"
[ "$FAIL" -eq 0 ]