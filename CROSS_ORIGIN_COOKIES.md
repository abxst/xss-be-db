# Cross-Origin Cookies Configuration

## 🎯 Mục Đích

Cho phép frontend từ **origin khác** (VD: `http://localhost:3000`) gọi API backend (`https://xsslab.hainth.edu.vn`) và **lưu/gửi cookies**.

## 🔒 Cookie Attributes

### Production (HTTPS)
```
Set-Cookie: auth_token=<token>; 
  Max-Age=604800; 
  Path=/; 
  HttpOnly; 
  SameSite=None; 
  Secure
```

### Giải thích từng attribute:

| Attribute | Giá trị | Mục đích |
|-----------|---------|----------|
| `HttpOnly` | - | ✅ Prevent JavaScript access (XSS protection) |
| `SameSite=None` | `None` | ✅ **Cho phép cookie được gửi cross-origin** |
| `Secure` | - | ✅ **Bắt buộc với SameSite=None** - Chỉ gửi qua HTTPS |
| `Path=/` | `/` | Cookie available cho tất cả paths |
| `Max-Age` | `604800` | Cookie expires sau 7 ngày |

## 📊 SameSite Values

| Value | Cross-Origin | Khi nào dùng |
|-------|--------------|--------------|
| `Strict` | ❌ Never | Same-site only (most secure) |
| `Lax` | ⚠️ GET only | Default, CSRF protection |
| `None` | ✅ Always | **Cross-origin with credentials** |

## 🌐 Cross-Origin Flow

### Scenario: Frontend localhost → Backend production

```
┌─────────────────────────┐
│  Frontend                │
│  http://localhost:3000   │
└───────────┬──────────────┘
            │ 1. Login Request
            │ POST /api/auth/login
            │ credentials: 'include'
            ▼
┌─────────────────────────────────┐
│  Backend                         │
│  https://xsslab.hainth.edu.vn   │
│                                  │
│  2. Set Cookie:                  │
│     SameSite=None; Secure        │
└───────────┬─────────────────────┘
            │ 3. Cookie saved in browser
            │    (cross-origin allowed)
            ▼
┌─────────────────────────┐
│  Browser Cookie Store    │
│  Domain: xsslab.hainth.  │
│  SameSite: None          │
│  Secure: true            │
└───────────┬──────────────┘
            │ 4. Subsequent requests
            │ Cookie auto-sent
            ▼
┌─────────────────────────────────┐
│  Backend verifies cookie        │
│  User authenticated ✅          │
└─────────────────────────────────┘
```

## ⚠️ Important Notes

### 1. HTTPS Required for Production
`SameSite=None` **PHẢI** đi kèm với `Secure` flag, nghĩa là:
- ✅ Work trên HTTPS (`https://xsslab.hainth.edu.vn`)
- ❌ KHÔNG work trên HTTP
- ⚠️ Localhost là exception (Chrome/Firefox cho phép)

### 2. Browser Compatibility
```javascript
// Modern browsers (2020+)
✅ Chrome 80+
✅ Firefox 69+
✅ Safari 13+
✅ Edge 80+
```

### 3. CORS Headers Required
Cookie cross-origin chỉ work khi backend trả về:
```
Access-Control-Allow-Origin: http://localhost:3000  (specific origin)
Access-Control-Allow-Credentials: true
```

**KHÔNG được dùng:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```
→ Browser sẽ BLOCK vì security violation

## 🔧 Configuration

### Backend
```typescript
// src/utils/response.ts
export function createTokenCookie(token: string): string {
  return [
    `auth_token=${token}`,
    'Max-Age=604800',
    'Path=/',
    'HttpOnly',
    'SameSite=None',  // ← Allow cross-origin
    'Secure',         // ← Required with SameSite=None
  ].join('; ');
}
```

### Frontend
```typescript
// src/services/api.ts
const config: RequestInit = {
  credentials: 'include',  // ← Always send cookies
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Environment Variables
```bash
# Backend (Cloudflare Workers)
CORS_ORIGIN="*, http://localhost:3000"
# Cho phép localhost và any origin
```

## 🧪 Testing

### 1. Test Login from localhost:3000
```javascript
// Frontend code
const response = await fetch('https://xsslab.hainth.edu.vn/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'pass123' })
});

// Check response headers
console.log(response.headers.get('Set-Cookie'));
// Should contain: SameSite=None; Secure
```

### 2. Verify Cookie in Browser DevTools
```
Application → Cookies → https://xsslab.hainth.edu.vn

Name: auth_token
Value: <JWT token>
Domain: xsslab.hainth.edu.vn
Path: /
SameSite: None
Secure: ✓
HttpOnly: ✓
```

### 3. Test Subsequent Request
```javascript
// Cookie should be sent automatically
const posts = await fetch('https://xsslab.hainth.edu.vn/api/posts/my', {
  credentials: 'include'  // Cookie sent automatically
});
```

## 🐛 Troubleshooting

### Cookie not being saved
**Problem:** Cookie appears in response but not saved in browser

**Check:**
1. ✅ Backend uses HTTPS? (Required for Secure flag)
2. ✅ Response has `Access-Control-Allow-Credentials: true`?
3. ✅ Response has specific origin, not `*`?
4. ✅ Frontend sends `credentials: 'include'`?

### Cookie not being sent
**Problem:** Cookie saved but not sent in requests

**Check:**
1. ✅ Request has `credentials: 'include'`?
2. ✅ Cookie's `SameSite=None`?
3. ✅ Cookie's `Secure` flag set?
4. ✅ Domain matches?

### CORS Error
```
Access to fetch ... has been blocked by CORS policy
```

**Solution:**
1. Check backend CORS config
2. Verify `CORS_ORIGIN` includes frontend origin
3. Ensure `Access-Control-Allow-Credentials: true` is set

## 📚 References

- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome SameSite Changes](https://www.chromium.org/updates/same-site/)
- [CORS with Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)

## ✅ Summary

| Requirement | Status | Config |
|-------------|--------|--------|
| Cross-Origin Cookie | ✅ | `SameSite=None` |
| HTTPS Only | ✅ | `Secure` |
| XSS Protection | ✅ | `HttpOnly` |
| CORS Headers | ✅ | `Access-Control-Allow-Credentials: true` |
| Origin Specific | ✅ | Return request origin, not `*` |

---

**Updated:** 2025-10-21  
**Status:** ✅ Production Ready

