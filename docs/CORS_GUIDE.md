# 🌐 CORS Configuration Guide

## 📋 CORS_ORIGIN Configuration

**QUAN TRỌNG:** API chỉ hỗ trợ **SPECIFIC ORIGINS** (không hỗ trợ wildcard `*`).

Điều này đảm bảo:
- ✅ Cookie authentication hoạt động
- ✅ Secure by default
- ✅ CORS credentials luôn được bật

## 🎯 Configuration Modes

API hỗ trợ 2 modes dựa trên config `CORS_ORIGIN`:

### 1️⃣ Single Origin (Recommended for Production)

```bash
# Production - Single origin
CORS_ORIGIN=https://xss-fe.pages.dev

# Or your domain
CORS_ORIGIN=https://myapp.com
```

**Behavior:**
- ✅ Chỉ allow origin này
- ✅ Cho phép credentials (cookies) ✨
- ✅ An toàn nhất cho production

**Use Case:**
- 🏭 **Production environment**
- Single frontend deployment

---

### 2️⃣ Multiple Origins (Development + Production)

```bash
# Development + Production
CORS_ORIGIN=http://localhost:3000,https://xss-fe.pages.dev

# Multiple frontends
CORS_ORIGIN=https://web.myapp.com,https://mobile.myapp.com,https://admin.myapp.com
```

**Behavior:**
- ✅ Chỉ allow origins trong list
- ✅ Cho phép credentials (cookies) ✨
- ✅ An toàn - không có wildcard

**Use Case:**
- 🛠️ **Development + Production**
- Multiple frontend deployments

**Frontend:**
```javascript
// From listed origins ✅
fetch('https://api.example.com/api/posts/my', {
  credentials: 'include'  // ✅ OK
})

// From unlisted origin ❌
// Request sẽ bị block!
```

---

## 🎯 Recommendations

### Development Only:
```bash
CORS_ORIGIN=http://localhost:3000
```

### Development + Staging:
```bash
CORS_ORIGIN=http://localhost:3000,https://staging-frontend.vercel.app
```

### Production:
```bash
# Single frontend
CORS_ORIGIN=https://xss-fe.pages.dev

# Multiple frontends
CORS_ORIGIN=https://app.example.com,https://mobile.example.com
```

### ⚠️ KHÔNG HỖ TRỢ Wildcard

```bash
# ❌ KHÔNG hợp lệ - wildcard sẽ bị loại bỏ
CORS_ORIGIN=*

# ❌ KHÔNG hợp lệ - wildcard bị ignore
CORS_ORIGIN=*,http://localhost:3000

# ✅ Đúng - chỉ specific origins
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 Comparison Table

| Mode | Config | Any Origin | Credentials | Security | Use Case |
|------|--------|-----------|-------------|----------|----------|
| **Single Origin** | `domain` | ❌ | ✅ | 🟢 Secure | 🏭 Production |
| **Multiple Origins** | `domain1,domain2` | ❌ | ✅ | 🟢 Secure | Dev + Production |

---

## 🔧 Configuration Examples

### Example 1: Multiple Frontends
```bash
CORS_ORIGIN=https://web.myapp.com,https://mobile.myapp.com,https://admin.myapp.com
```

### Example 2: Dev + Production Frontend
```bash
# Development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Production
CORS_ORIGIN=https://myapp.com,https://www.myapp.com
```

### Example 3: Cloudflare Pages Frontend
```bash
CORS_ORIGIN=https://xss-fe.pages.dev
```

---

## ⚠️ Security Warnings

### ❌ Wildcard KHÔNG được hỗ trợ:
```bash
# ❌ Wildcard bị loại bỏ tự động
CORS_ORIGIN=*

# ❌ Wildcard bị ignore, chỉ giữ specific origins
CORS_ORIGIN=*,https://myapp.com
# → Kết quả: chỉ còn https://myapp.com
```

**Why?** API này dùng cookie authentication, KHÔNG thể dùng wildcard.

### ✅ Chỉ dùng Specific Origins:
```bash
# Specific origins only
CORS_ORIGIN=https://myapp.com,https://www.myapp.com
```

---

## 🧪 Testing CORS

### Test with cURL:

```bash
# Test from specific origin
curl -i -H "Origin: http://localhost:3000" \
  https://xsslab.hainth.edu.vn/api/health

# Expected response headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true
```

### Test with JavaScript:

```javascript
// Console in browser
fetch('https://xsslab.hainth.edu.vn/api/health', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## 🐛 Troubleshooting

### Error: "CORS policy: credentials mode is 'include'"

**Cause:** CORS_ORIGIN is `*` (wildcard alone)

**Fix:**
```bash
# Change from:
CORS_ORIGIN=*

# To:
CORS_ORIGIN=http://localhost:3000
```

### Error: "Origin not allowed"

**Cause:** Request origin không có trong CORS_ORIGIN list

**Fix:** Add origin to list
```bash
# Before:
CORS_ORIGIN=http://localhost:3000

# After:
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Frontend: Different ports for dev?

**Option A:** List all ports
```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

**Option B:** Use dev wildcard (less safe)
```bash
CORS_ORIGIN=*, http://localhost:3000
```

---

## 🔍 How It Works Internally

### Request Flow:

```
1. Browser sends request with Origin header
   Origin: http://localhost:3000

2. Server checks CORS_ORIGIN config
   CORS_ORIGIN = "http://localhost:3000,https://myapp.com"

3. Server matches request origin
   ✅ Match found!

4. Server responds with:
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Credentials: true

5. Browser allows JavaScript to access response
```

### Preflight Request (OPTIONS):

```
1. Browser sends OPTIONS request
   Origin: http://localhost:3000
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: content-type

2. Server responds:
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, Cookie
   Access-Control-Allow-Credentials: true
   Access-Control-Max-Age: 86400

3. Browser caches preflight for 24 hours
4. Browser sends actual request
```

---

## 📚 Related Documentation

- [COOKIE_AUTH_GUIDE.md](./COOKIE_AUTH_GUIDE.md) - Cookie authentication
- [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) - How to call API
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Remove wildcard from CORS_ORIGIN
- [ ] Add all legitimate frontend domains
- [ ] Test from each domain
- [ ] Verify credentials work
- [ ] Check preflight caching
- [ ] Monitor for CORS errors in logs

---

**Last Updated**: 2025-10-21  
**Version**: 1.0.0

