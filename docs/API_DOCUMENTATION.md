# API Documentation - XSS Lab

API documentation cho hệ thống XSS Lab với JWT authentication.

## Base URL

```
Local: http://localhost:8787
Production: https://your-worker.workers.dev
```

## Authentication

Hầu hết các endpoints yêu cầu JWT token. Sau khi đăng nhập hoặc đăng ký, bạn sẽ nhận được token. Sử dụng token này trong header:

```
Authorization: Bearer <your-jwt-token>
```

Token có thời hạn 7 ngày.

---

## 📋 Endpoints

### 🏠 Health Check

#### GET `/`

Kiểm tra trạng thái API và xem danh sách endpoints.

**Response:**
```json
{
  "success": true,
  "message": "XSS Lab API is running",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

## 🏥 Health & Monitoring

### 1. Full System Health Check

#### GET `/api/health`

Kiểm tra tất cả services (API + Database).

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "api": {
      "status": "healthy"
    },
    "database": {
      "status": "healthy",
      "responseTime": "5ms"
    }
  }
}
```

**Response khi database lỗi (503):**
```json
{
  "status": "degraded",
  "services": {
    "api": {
      "status": "healthy"
    },
    "database": {
      "status": "unhealthy",
      "error": "Connection failed"
    }
  }
}
```

### 2. Database Connection Check

#### GET `/api/health/db`

Kiểm tra kết nối database cơ bản.

**Response (200):**
```json
{
  "success": true,
  "database": {
    "status": "healthy",
    "connected": true,
    "responseTime": "3ms",
    "message": "Database connection is working properly"
  }
}
```

**Response khi lỗi (503):**
```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "no such table: users"
}
```

### 3. Detailed Database Health Check

#### GET `/api/health/db/detailed`

Kiểm tra database chi tiết (bảng, số lượng records).

**Response (200):**
```json
{
  "success": true,
  "timestamp": "2025-10-21T10:30:00.000Z",
  "database": {
    "status": "healthy",
    "connected": true,
    "responseTime": "8ms",
    "tables": {
      "users": {
        "exists": true,
        "count": 5
      },
      "posts": {
        "exists": true,
        "count": 12
      },
      "comments": {
        "exists": true,
        "count": 34
      }
    }
  }
}
```

**Use Case:**
- Monitoring dashboard
- Pre-deployment checks
- Debugging database issues
- Verify migrations ran successfully

---

## 🔐 Authentication

### 1. Đăng ký (Register)

#### POST `/api/auth/register`

Tạo tài khoản mới.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123",
  "name": "Test User"
}
```

**Validation:**
- `username`: tối thiểu 3 ký tự, duy nhất
- `password`: tối thiểu 6 ký tự
- `name`: bắt buộc

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "username": "testuser",
    "name": "Test User"
  }
}
```

### 2. Đăng nhập (Login)

#### POST `/api/auth/login`

Đăng nhập vào hệ thống.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "username": "testuser",
    "name": "Test User"
  }
}
```

---

## 📝 Posts

### 1. Tạo Post

#### POST `/api/posts`

**🔒 Yêu cầu authentication**

Tạo bài viết mới.

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post"
}
```

**Response (201):**
```json
{
  "success": true,
  "post": {
    "post_uuid": "abc123...",
    "title": "My First Post",
    "content": "This is the content of my post",
    "time_create": 1729516800,
    "user_uuid": "123e4567...",
    "username": "testuser",
    "user_name": "Test User"
  }
}
```

### 2. Lấy Tất Cả Posts (Public Feed)

#### GET `/api/posts?limit=20&offset=0`

Lấy danh sách tất cả posts (không cần đăng nhập).

**Query Parameters:**
- `limit` (optional): Số lượng posts trả về (mặc định: 20)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)

**Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "post_uuid": "abc123...",
      "title": "My First Post",
      "content": "This is the content",
      "time_create": 1729516800,
      "user_uuid": "123e4567...",
      "username": "testuser",
      "user_name": "Test User"
    }
  ]
}
```

### 3. Lấy Posts Của Mình

#### GET `/api/posts/my?limit=20&offset=0`

**🔒 Yêu cầu authentication**

Lấy danh sách posts của người dùng hiện tại.

**Query Parameters:**
- `limit` (optional): Số lượng posts (mặc định: 20)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)

**Response (200):**
```json
{
  "success": true,
  "posts": [ ... ]
}
```

### 4. Tìm Kiếm Posts

#### GET `/api/posts/search?q=keyword&limit=20&offset=0`

Tìm kiếm posts theo title hoặc content.

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng kết quả (mặc định: 20)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)

**Response (200):**
```json
{
  "success": true,
  "posts": [ ... ]
}
```

### 5. Lấy Chi Tiết Một Post

#### GET `/api/posts/:post_uuid`

Lấy thông tin chi tiết của một post.

**Response (200):**
```json
{
  "success": true,
  "post": {
    "post_uuid": "abc123...",
    "title": "My First Post",
    "content": "This is the content",
    "time_create": 1729516800,
    "user_uuid": "123e4567...",
    "username": "testuser",
    "user_name": "Test User"
  }
}
```

---

## 💬 Comments

### 1. Tạo Comment

#### POST `/api/comments`

**🔒 Yêu cầu authentication**

Tạo comment mới cho một post.

**Request Body:**
```json
{
  "content": "Great post!",
  "post_uuid": "abc123..."
}
```

**Response (201):**
```json
{
  "success": true,
  "comment": {
    "comment_id": "xyz789...",
    "content": "Great post!",
    "user_uuid": "123e4567...",
    "post_uuid": "abc123...",
    "username": "testuser",
    "user_name": "Test User"
  }
}
```

### 2. Lấy Comments Của Post

#### GET `/api/posts/:post_uuid/comments`

Lấy tất cả comments của một post.

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "comment_id": "xyz789...",
      "content": "Great post!",
      "user_uuid": "123e4567...",
      "post_uuid": "abc123...",
      "username": "testuser",
      "user_name": "Test User"
    }
  ]
}
```

### 3. Lấy Comments Của Mình

#### GET `/api/comments/my`

**🔒 Yêu cầu authentication**

Lấy tất cả comments của người dùng hiện tại.

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "comment_id": "xyz789...",
      "content": "Great post!",
      "user_uuid": "123e4567...",
      "post_uuid": "abc123...",
      "username": "testuser",
      "user_name": "Test User",
      "post_title": "My First Post"
    }
  ]
}
```

---

## ❌ Error Responses

Tất cả error responses có format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (optional)"
}
```

### Common HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `409` - Conflict (username đã tồn tại)
- `500` - Internal Server Error

---

## 🔧 Example Usage

### JavaScript/Fetch

```javascript
// Đăng ký
const register = async () => {
  const response = await fetch('http://localhost:8787/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123',
      name: 'Test User'
    })
  });
  const data = await response.json();
  const token = data.token;
  return token;
};

// Tạo post với authentication
const createPost = async (token) => {
  const response = await fetch('http://localhost:8787/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'My Post',
      content: 'Post content here'
    })
  });
  return await response.json();
};

// Sử dụng
const token = await register();
await createPost(token);
```

### cURL

```bash
# Đăng ký
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","name":"Test User"}'

# Đăng nhập
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Tạo post (cần token)
curl -X POST http://localhost:8787/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Post","content":"Content here"}'

# Lấy tất cả posts
curl http://localhost:8787/api/posts

# Tạo comment
curl -X POST http://localhost:8787/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Great post!","post_uuid":"POST_UUID_HERE"}'
```

---

## 🔒 Security Notes

1. **Password Hashing**: Passwords được hash bằng SHA-256 trước khi lưu vào database
2. **JWT Secret**: Đổi `JWT_SECRET` trong `wrangler.json` khi deploy production
3. **CORS**: API cho phép tất cả origins (`*`). Cân nhắc giới hạn trong production
4. **XSS Protection**: Đây là XSS Lab nên cẩn thận với input validation!

---

## 📦 Database Schema

Xem chi tiết trong `migrations/README.md`

- **users**: uuid, username, password, name, time_create, last_login
- **posts**: post_uuid, title, content, time_create, user_uuid
- **comments**: comment_id, content, user_uuid, post_uuid

