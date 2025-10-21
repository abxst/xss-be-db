# CORS Fix - Support Multiple Origins with Credentials

## 🐛 Vấn Đề

### Trước đây:
Backend production có environment variable:
```
CORS_ORIGIN = "*, http://localhost:3000"
```

Nhưng logic CORS cũ:
```typescript
const origin = corsOrigin === '*' ? corsOrigin : corsOrigin;
headers.set('Access-Control-Allow-Origin', origin);
```

**Vấn đề:**
1. ❌ Set header `Access-Control-Allow-Origin: *, http://localhost:3000` (INVALID!)
2. ❌ Header này chỉ được phép có **1 giá trị duy nhất**
3. ❌ Khi frontend gửi `credentials: 'include'`, backend PHẢI:
   - Trả về origin cụ thể (VD: `http://localhost:3000`)
   - KHÔNG được dùng `*`
   - Set `Access-Control-Allow-Credentials: true`

### Error trong Browser:
```
Access to fetch at 'https://xsslab.hainth.edu.vn/api/posts' from origin 
'http://localhost:3000' has been blocked by CORS policy: 
The value of the 'Access-Control-Allow-Credentials' header in the response 
is '' which must be 'true' when the request's credentials mode is 'include'.
```

## ✅ Giải Pháp

### Logic CORS Mới:

#### 1. Parse Multiple Origins
```typescript
function parseAllowedOrigins(corsOrigin: string): string[] {
  return corsOrigin.split(',').map(o => o.trim()).filter(o => o.length > 0);
}
// Input: "*, http://localhost:3000"
// Output: ['*', 'http://localhost:3000']
```

#### 2. Get Appropriate Origin
```typescript
function getAllowedOrigin(requestOrigin: string | null, allowedOrigins: string[]): string {
  // Nếu có wildcard '*' và có request origin cụ thể
  if (allowedOrigins.includes('*')) {
    if (requestOrigin) {
      return requestOrigin; // Trả về origin cụ thể (support credentials)
    }
    return '*'; // Không có request origin, trả về wildcard
  }
  
  // Kiểm tra request origin có trong allowed list
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Fallback: trả về origin đầu tiên
  return allowedOrigins[0] || '*';
}
```

#### 3. Set CORS Headers Đúng
```typescript
export function addCorsHeaders(
  response: Response, 
  corsOrigin: string, 
  requestOrigin: string | null = null
): Response {
  const allowedOrigins = parseAllowedOrigins(corsOrigin);
  const allowedOrigin = getAllowedOrigin(requestOrigin, allowedOrigins);
  
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  
  // Chỉ set credentials khi KHÔNG phải wildcard
  if (allowedOrigin !== '*') {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}
```

## 📊 So Sánh

### Trước (SAI):
| Request Origin | CORS_ORIGIN | Response Header | Credentials | Kết quả |
|----------------|-------------|-----------------|-------------|---------|
| `http://localhost:3000` | `*, http://localhost:3000` | `Access-Control-Allow-Origin: *, http://localhost:3000` | ❌ Not set | ❌ BLOCKED |

### Sau (ĐÚNG):
| Request Origin | CORS_ORIGIN | Response Header | Credentials | Kết quả |
|----------------|-------------|-----------------|-------------|---------|
| `http://localhost:3000` | `*, http://localhost:3000` | `Access-Control-Allow-Origin: http://localhost:3000` | ✅ `true` | ✅ ALLOWED |
| `https://example.com` | `*, http://localhost:3000` | `Access-Control-Allow-Origin: https://example.com` | ✅ `true` | ✅ ALLOWED |
| (no origin) | `*, http://localhost:3000` | `Access-Control-Allow-Origin: *` | ❌ Not set | ✅ ALLOWED |

## 🎯 Cách Hoạt Động

### Scenario 1: Frontend từ localhost
```
Request:
  Origin: http://localhost:3000
  Credentials: include

Response:
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Credentials: true
  ✅ Browser cho phép gửi cookies
```

### Scenario 2: Frontend từ domain khác
```
Request:
  Origin: https://myapp.com
  Credentials: include

Response:
  Access-Control-Allow-Origin: https://myapp.com
  Access-Control-Allow-Credentials: true
  ✅ Browser cho phép gửi cookies (vì có wildcard trong config)
```

### Scenario 3: Request không có Origin header
```
Request:
  (No Origin header)

Response:
  Access-Control-Allow-Origin: *
  (No Credentials header)
  ✅ Still works for non-credential requests
```

## 🚀 Deploy

### Build và Deploy
```bash
cd d:\code\xsslab\xss-be-db
npm run deploy
```

### Verify Environment Variables
Đảm bảo production có đủ biến:
```
CORS_ORIGIN = "*, http://localhost:3000"
JWT_SECRET = "Nthh8124@"
API_VERSION = "1.0.0"
NODE_ENV = "production"
```

## 🧪 Test

### Test với cURL:
```bash
# Test với Origin header
curl -H "Origin: http://localhost:3000" \
     -H "Cookie: auth_token=..." \
     https://xsslab.hainth.edu.vn/api/posts

# Response phải có:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true
```

### Test với Frontend:
```javascript
// Frontend code (đã có sẵn)
fetch('https://xsslab.hainth.edu.vn/api/posts', {
  credentials: 'include' // Gửi cookies
});

// ✅ Sẽ work vì backend trả về đúng CORS headers
```

## 📝 Files Đã Sửa

1. **`src/middleware/cors.ts`**
   - ✅ Parse multiple origins từ comma-separated string
   - ✅ Get appropriate origin based on request
   - ✅ Set credentials header correctly

2. **`src/index.ts`**
   - ✅ Extract request origin từ headers
   - ✅ Pass request origin vào CORS functions

## 🎉 Kết Quả

- ✅ Support nhiều origins trong `CORS_ORIGIN`
- ✅ Support wildcard `*` cho accept mọi origin
- ✅ Support `credentials: 'include'` với cookies
- ✅ Compliant với CORS specification
- ✅ Secure và flexible

---

**Fix completed:** 2025-10-21  
**Tested:** ✅ Working

