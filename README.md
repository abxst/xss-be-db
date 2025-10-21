# XSS Lab - Backend API with D1 Database

API backend cho XSS Lab sử dụng Cloudflare Workers và D1 Database với JWT authentication.

## 🚀 Tính năng

- ✅ **Authentication**: Đăng ký, đăng nhập với JWT
- ✅ **Posts**: Tạo, xem, tìm kiếm bài viết
- ✅ **Comments**: Comment trên posts
- ✅ **D1 Database**: SQLite serverless trên Cloudflare
- ✅ **Password Hashing**: SHA-256 encryption
- ✅ **CORS Support**: API ready cho frontend

## 📁 Cấu trúc Project

```
xss-be-db/
├── src/
│   ├── index.ts              # Main entry point
│   ├── router/
│   │   └── routes.ts         # API routing với switch case
│   ├── handlers/
│   │   ├── auth.ts           # Register, Login
│   │   ├── posts.ts          # Post CRUD operations
│   │   └── comments.ts       # Comment operations
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── config/
│   │   └── env.ts            # Environment config helper
│   ├── utils/
│   │   ├── jwt.ts            # JWT sign & verify
│   │   ├── crypto.ts         # Password hashing, UUID
│   │   ├── validation.ts     # Input validation
│   │   └── response.ts       # API response helpers
│   └── types/
│       └── api.ts            # TypeScript types
├── migrations/
│   ├── 0001_create_tables.sql    # Database schema
│   ├── 0002_seed_data.sql        # Sample data
│   └── README.md                  # Database docs
├── wrangler.json             # Cloudflare config với env vars
├── docs/                     # Documentation
│   ├── API_DOCUMENTATION.md  # API docs chi tiết
│   ├── ENV_SETUP.md          # Hướng dẫn setup environment
│   ├── REFACTOR_SUMMARY.md   # Refactoring summary
│   └── HEALTH_CHECK_EXAMPLES.md  # Health check examples
└── README.md                 # File này
```

## 🛠️ Cài đặt

### 1. Clone và cài dependencies

```bash
cd d:\code\xsslab\xss-be-db
npm install
```

### 2. Cấu hình D1 Database

Database đã được cấu hình sẵn trong `wrangler.json`:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_id": "4da88092-1a1d-4a1f-83e9-c853735f2099",
      "database_name": "xsslab"
    }
  ]
}
```

### 3. Chạy migrations

**Local development:**
```bash
npm run seedLocalD1
# hoặc
wrangler d1 migrations apply DB --local
```

**Production:**
```bash
npm run predeploy
# hoặc
wrangler d1 migrations apply DB --remote
```

### 4. Cấu hình Environment Variables

File `wrangler.json` đã có sẵn các biến môi trường:

```json
{
  "vars": {
    "JWT_SECRET": "your-super-secret-jwt-key-change-this-in-production-12345678",
    "CORS_ORIGIN": "*",
    "API_VERSION": "1.0.0",
    "NODE_ENV": "development"
  }
}
```

⚠️ **Quan trọng cho Production**:

```bash
# Sử dụng Cloudflare secrets (khuyến nghị)
wrangler secret put JWT_SECRET
# Nhập secret key mạnh khi được hỏi

wrangler secret put CORS_ORIGIN
# Enter: https://yourdomain.com
```

📖 **Chi tiết đầy đủ**: Xem [ENV_SETUP.md](./docs/ENV_SETUP.md)

## 🏃 Chạy Project

### Development (Local)

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:8787`

### Deploy lên Cloudflare

```bash
npm run deploy
```

## 📖 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### Posts

- `POST /api/posts` - Tạo post mới (🔒 cần auth)
- `GET /api/posts` - Lấy tất cả posts (public)
- `GET /api/posts/my` - Lấy posts của mình (🔒 cần auth)
- `GET /api/posts/search?q=keyword` - Tìm kiếm posts
- `GET /api/posts/:post_uuid` - Chi tiết một post

### Comments

- `POST /api/comments` - Tạo comment (🔒 cần auth)
- `GET /api/posts/:post_uuid/comments` - Lấy comments của post
- `GET /api/comments/my` - Lấy comments của mình (🔒 cần auth)

**Chi tiết đầy đủ xem tại:** [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🧪 Test API

### Sử dụng cURL

```bash
# 1. Đăng ký
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","name":"Test User"}'

# 2. Đăng nhập và lấy token
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 3. Tạo post (thay YOUR_TOKEN)
curl -X POST http://localhost:8787/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Hello","content":"My first post"}'

# 4. Xem tất cả posts
curl http://localhost:8787/api/posts
```

### Sử dụng JavaScript

```javascript
const API_URL = 'http://localhost:8787';

// Đăng ký
async function register() {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'test',
      password: '123456',
      name: 'Test User'
    })
  });
  const data = await res.json();
  return data.token;
}

// Tạo post
async function createPost(token) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'My Post',
      content: 'Content here'
    })
  });
  return await res.json();
}
```

## 🗄️ Database Schema

### Users Table
```sql
uuid TEXT PRIMARY KEY
username TEXT NOT NULL UNIQUE
password TEXT NOT NULL (hashed)
name TEXT NOT NULL
time_create INTEGER NOT NULL
last_login INTEGER
```

### Posts Table
```sql
post_uuid TEXT PRIMARY KEY
title TEXT NOT NULL
content TEXT NOT NULL
time_create INTEGER NOT NULL
user_uuid TEXT (FK -> users.uuid)
```

### Comments Table
```sql
comment_id TEXT PRIMARY KEY
content TEXT NOT NULL
user_uuid TEXT (FK -> users.uuid)
post_uuid TEXT (FK -> posts.post_uuid)
```

## 🔐 Security

1. **Password**: Hash bằng SHA-256
2. **JWT**: Token expires sau 7 ngày
3. **Foreign Keys**: CASCADE DELETE để đảm bảo data integrity
4. **Validation**: Input validation ở tất cả endpoints

⚠️ **Lưu ý**: Đây là XSS Lab, nên có chủ ý để một số lỗ hổng XSS. Không dùng code này cho production thực tế!

## 📝 NPM Scripts

```bash
npm run dev          # Chạy local dev server
npm run deploy       # Deploy lên Cloudflare
npm run check        # Type check và dry-run deploy
npm run seedLocalD1  # Apply migrations local
npm run predeploy    # Apply migrations remote
npm run cf-typegen   # Generate types
```

## 🌐 CORS

API đã bật CORS cho tất cả origins. Nếu cần giới hạn, sửa trong `src/utils/response.ts`:

```typescript
'Access-Control-Allow-Origin': '*'  // Đổi thành domain cụ thể
```

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🤝 Contributing

Đây là project học tập về XSS. Mọi đóng góp đều được chào đón!

## 📄 License

MIT License

---

**Made with ☕ for learning XSS security**
