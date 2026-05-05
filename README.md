# 🚦 Dain Lab – Redis Rate Limiter (Express + TypeScript)

## 📌 Overview

This project implements a **production-grade rate limiting system** using:

- **Node.js (Express + TypeScript)**
- **Redis (Sorted Set)**
- **Lua Script (atomic execution)**

The goal is to solve **concurrency issues and race conditions** in high-traffic environments while maintaining accuracy and performance.

---

## 🎯 Problem

Naive rate limiting using Redis often looks like:

```text
ZREMRANGEBYSCORE
ZCARD
ZADD
```

Under concurrent requests:

```text
count = 99
→ 2 requests arrive simultaneously
→ both pass
→ final count = 101 ❌
```

👉 This leads to **race conditions** and inaccurate limits.

---

## ✅ Solution

Use **Redis Lua scripting** to ensure **atomic execution**:

```text
EVALSHA script
```

All operations (remove old entries, count, check, insert) are executed **in a single atomic step inside Redis**.

---

## ⚙️ Features

### 🔹 1. Fixed Window Rate Limit

- Uses `INCR + EXPIRE`
- Simple and fast
- Not fully accurate under burst traffic

---

### 🔹 2. Sliding Window Rate Limit (Main)

- Uses **Redis Sorted Set**
- Tracks each request with timestamp
- Removes expired entries dynamically
- Ensures accuracy across time windows

---

### 🔹 3. Atomic Execution with Lua

- Eliminates race conditions
- Guarantees consistency under concurrency
- Uses `EVALSHA` for performance

---

### 🔹 4. Custom Middleware

Supports:

- `skip(req)` – bypass certain requests
- `keyGenerator(req)` – define identity (IP, user, route)
- `handler(req, res, context)` – custom response logic

---

### 🔹 5. Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 23
Retry-After: 42
```

Helps clients:

- avoid unnecessary retries
- implement backoff strategies

---

## 🧠 Architecture

```text
Request
  ↓
Middleware
  ↓
RateLimitService
  ↓
Redis (Lua Script)
  ↓
Atomic Execution
  ↓
Response
```

---

## 📁 Project Structure

```bash
src/
  modules/
    rate-limit/
      rateLimit.service.ts
      rateLimit.middleware.ts
      rateLimit.interface.ts
      rateLimit.constants.ts
      rateLimit.handler.ts

      scripts/
        sliding-window.lua

      luaLoader.ts

  configs/
    redis.ts

scripts/
  test-burst.js
  test-sliding.js
  test-expire.js
```

---

## 🔥 Lua Script (Core Logic)

```lua
ZREMRANGEBYSCORE → remove expired requests
ZCARD → count active requests
ZADD → insert current request
PEXPIRE → maintain TTL
```

All executed atomically.

---

## 🚀 Usage

### Apply middleware

```ts
app.use(
  rateLimit({
    windowMs: 60000,
    limit: 100,
    keyGenerator: (req) => req.ip,
  })
);
```

---

## 🧪 Testing

### Burst test

```bash
npm run test:burst
```

Expected result:

```json
{ "success": ~100, "limited": ~100 }
```

---

### Sliding window test

```bash
npm run test:sliding
```

---

### Expiration test

```bash
npm run test:expire
```

---

## ⚖️ Trade-offs

| Approach       | Pros               | Cons                     |
| -------------- | ------------------ | ------------------------ |
| Fixed Window   | Simple, fast       | Inaccurate at edges      |
| Sliding Window | Accurate           | Higher complexity        |
| Lua Script     | Atomic, consistent | Requires Redis scripting |

---

## 🧠 Key Insights

- Rate limiting is a **concurrency problem**, not just counting requests
- Redis alone is **not enough** without atomic execution
- Lua allows moving logic **closer to data layer**
- Sliding window provides **better fairness than fixed window**

---

## 🔮 Future Improvements

- Token Bucket algorithm (burst-friendly)
- Distributed rate limit across services
- Dynamic limits based on user roles (free vs premium)
- Observability (metrics, logging, alerting)

---

## 📌 Summary

This project demonstrates:

- Understanding of **distributed systems challenges**
- Ability to design **consistent and scalable backend components**
- Practical use of **Redis + Lua in production scenarios**

---

## 👤 Author

Built for learning, experimentation, and backend skill development.
