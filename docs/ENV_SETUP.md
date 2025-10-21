# Hướng Dẫn Cấu Hình Environment Variables

## 📝 Tổng Quan

Project này sử dụng environment variables để quản lý các thông tin nhạy cảm và cấu hình. Các biến môi trường được quản lý qua Cloudflare Workers `vars` trong `wrangler.json`.

## 🔧 Các Biến Môi Trường

### 1. JWT_SECRET (Bắt buộc)
- **Mô tả**: Khóa bí mật để ký và verify JWT tokens
- **Giá trị mặc định**: `your-super-secret-jwt-key-change-this-in-production-12345678`
- **⚠️ Quan trọng**: Đổi giá trị này trước khi deploy production!
- **Khuyến nghị**: Sử dụng chuỗi ngẫu nhiên dài ít nhất 32 ký tự

### 2. CORS_ORIGIN
- **Mô tả**: Danh sách origins được phép truy cập API
- **Giá trị mặc định**: `*` (cho phép tất cả origins)
- **Format**: 
  - Single origin: `https://yourdomain.com`
  - Multiple origins: `https://yourdomain.com,https://www.yourdomain.com`
  - All origins: `*`
- **Khuyến nghị production**: Giới hạn origins cụ thể thay vì `*`

### 3. API_VERSION
- **Mô tả**: Phiên bản của API
- **Giá trị mặc định**: `1.0.0`
- **Format**: Semantic versioning (MAJOR.MINOR.PATCH)

### 4. NODE_ENV
- **Mô tả**: Môi trường chạy
- **Giá trị**: `development`, `production`, `staging`
- **Giá trị mặc định**: `development`

## 🚀 Cấu Hình

### Development (Local)

Sử dụng `wrangler.json` để cấu hình:

```json
{
  "vars": {
    "JWT_SECRET": "your-local-jwt-secret-for-development",
    "CORS_ORIGIN": "*",
    "API_VERSION": "1.0.0",
    "NODE_ENV": "development"
  }
}
```

### Production (Cloudflare)

**Phương pháp 1: Sử dụng Cloudflare Secrets (Khuyến nghị)**

```bash
# Set JWT secret (sẽ được mã hóa và không hiển thị trong wrangler.json)
wrangler secret put JWT_SECRET
# Nhập secret key khi được hỏi

# Set các biến khác
wrangler secret put CORS_ORIGIN
wrangler secret put API_VERSION
wrangler secret put NODE_ENV
```

**Phương pháp 2: Sử dụng Cloudflare Dashboard**

1. Đăng nhập vào Cloudflare Dashboard
2. Chọn Workers & Pages
3. Chọn worker của bạn (`xss-be-db`)
4. Vào tab Settings → Variables
5. Thêm các biến:
   - `JWT_SECRET`: (Text, Encrypt)
   - `CORS_ORIGIN`: (Text)
   - `API_VERSION`: (Text)
   - `NODE_ENV`: (Text)

**Phương pháp 3: Sử dụng wrangler.json (Không khuyến nghị cho production)**

```json
{
  "vars": {
    "JWT_SECRET": "your-production-jwt-secret",
    "CORS_ORIGIN": "https://yourdomain.com",
    "API_VERSION": "1.0.0",
    "NODE_ENV": "production"
  }
}
```

⚠️ **Lưu ý**: Nếu dùng phương pháp này, KHÔNG commit `wrangler.json` có chứa JWT_SECRET thật lên Git!

## 🔐 Best Practices

### 1. JWT Secret

```bash
# Tạo JWT secret ngẫu nhiên mạnh (Linux/Mac)
openssl rand -base64 32

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. CORS Configuration

**Development:**
```json
"CORS_ORIGIN": "*"
```

**Production - Single Domain:**
```json
"CORS_ORIGIN": "https://yourdomain.com"
```

**Production - Multiple Domains:**
```json
"CORS_ORIGIN": "https://yourdomain.com,https://app.yourdomain.com,https://admin.yourdomain.com"
```

### 3. Environment Separation

**Development:**
```json
{
  "vars": {
    "JWT_SECRET": "dev-secret-key-not-for-production",
    "CORS_ORIGIN": "*",
    "NODE_ENV": "development"
  }
}
```

**Production:**
```bash
wrangler secret put JWT_SECRET
# Enter: <strong-random-secret>

wrangler secret put CORS_ORIGIN
# Enter: https://yourdomain.com

wrangler secret put NODE_ENV
# Enter: production
```

## 📂 File Reference

### env.example.txt
File mẫu chứa tất cả các biến môi trường. Copy và điền giá trị thực:

```bash
# Tạo file .env từ template (chỉ để tham khảo)
cp env.example.txt .env
# Chỉnh sửa .env với giá trị thực của bạn
```

⚠️ **Lưu ý**: Cloudflare Workers không đọc file `.env`. Bạn phải cấu hình qua `wrangler.json` hoặc Cloudflare Dashboard.

### src/config/env.ts
File này xử lý việc đọc environment variables:

```typescript
import { getEnvConfig } from '../config/env';

const config = getEnvConfig(env);
console.log(config.JWT_SECRET);
console.log(config.CORS_ORIGIN);
```

## 🔍 Kiểm Tra Cấu Hình

### Local Development

```bash
# Chạy local và check console
npm run dev

# API sẽ trả về environment info tại /
curl http://localhost:8787/
```

Response sẽ hiển thị:
```json
{
  "version": "1.0.0",
  "environment": "development"
}
```

### Production

```bash
# Deploy và test
npm run deploy
curl https://your-worker.workers.dev/
```

## ⚠️ Security Warnings

1. **KHÔNG BAO GIỜ** commit file chứa JWT_SECRET thật vào Git
2. **KHÔNG BAO GIỜ** share JWT_SECRET qua email, chat, hoặc nơi không bảo mật
3. **LUÔN LUÔN** sử dụng Cloudflare Secrets cho production
4. **THAY ĐỔI** JWT_SECRET nếu bị lộ
5. **GIỚI HẠN** CORS origins trong production (không dùng `*`)

## 📚 Tài Liệu Liên Quan

- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

## 🆘 Troubleshooting

### Lỗi: "JWT verification failed"
- Kiểm tra JWT_SECRET có giống nhau giữa nơi tạo token và verify không
- Đảm bảo không có khoảng trắng thừa trong JWT_SECRET

### Lỗi: "CORS error"
- Kiểm tra CORS_ORIGIN có chứa origin của frontend không
- Đảm bảo format đúng (có https://, không có trailing slash)

### Lỗi: "Environment variable not found"
- Kiểm tra biến đã được set trong wrangler.json hoặc Cloudflare Dashboard
- Deploy lại sau khi thay đổi variables

---

**Cập nhật lần cuối**: 2025-10-21

