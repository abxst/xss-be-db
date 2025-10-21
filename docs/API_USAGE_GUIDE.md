# 🚀 API Usage Guide

Hướng dẫn ngắn gọn về cách sử dụng XSS Lab API.

## 📋 Base Information

### Base URL

```
Local:      http://localhost:8787
Production: https://your-worker.workers.dev
```

### Authentication

API sử dụng **HTTP-only cookies** để lưu JWT token.

**Token được lưu tự động** sau khi login/register, không cần quản lý thủ công.

---

## 📤 Request Format

### Headers

```http
Content-Type: application/json
```

### Credentials

**Luôn luôn gửi cookies:**

```javascript
// Fetch
fetch(url, {
  credentials: 'include'  // Required!
});

// Axios
axios.defaults.withCredentials = true;
```

---

## 📥 Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 404 | Not Found |
| 409 | Conflict (duplicate data) |
| 500 | Server Error |

---

## 🔐 Authentication Endpoints

### Register

```javascript
POST /api/auth/register

Body:
{
  "username": "johndoe",    // 3-50 chars, alphanumeric
  "password": "pass123",    // 6+ chars
  "name": "John Doe"        // 1-100 chars
}

Response:
{
  "success": true,
  "user": {
    "uuid": "...",
    "username": "johndoe",
    "name": "John Doe"
  },
  "message": "Registration successful"
}
// Cookie: auth_token được set tự động
```

### Login

```javascript
POST /api/auth/login

Body:
{
  "username": "johndoe",
  "password": "pass123"
}

Response:
{
  "success": true,
  "user": { ... },
  "message": "Login successful"
}
// Cookie: auth_token được set tự động
```

### Logout

```javascript
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Logout successful"
}
// Cookie: auth_token được xóa
```

---

## 📝 Posts Endpoints

### Create Post (Auth Required)

```javascript
POST /api/posts

Body:
{
  "title": "My Post",      // 1-200 chars
  "content": "Content..."  // 1-10000 chars
}
```

### Get All Posts (Public)

```javascript
GET /api/posts?limit=20&offset=0
```

### Get My Posts (Auth Required)

```javascript
GET /api/posts/my?limit=20&offset=0
```

### Search Posts

```javascript
GET /api/posts/search?q=keyword&limit=20
```

### Get Single Post

```javascript
GET /api/posts/{post_uuid}
```

---

## 💬 Comments Endpoints

### Create Comment (Auth Required)

```javascript
POST /api/comments

Body:
{
  "content": "Great post!",     // 1-1000 chars
  "post_uuid": "post-uuid..."
}
```

### Get Post Comments

```javascript
GET /api/posts/{post_uuid}/comments
```

### Get My Comments (Auth Required)

```javascript
GET /api/comments/my
```

---

## 🏥 Health Check

```javascript
GET /api/health           // Full system health
GET /api/health/db        // Database connection
GET /api/health/db/detailed  // Database details
```

---

## 💻 Usage Examples

### JavaScript (Fetch)

```javascript
const API_BASE = 'http://localhost:8787';

// Helper function
async function api(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',  // Always include!
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  
  return res.json();
}

// Usage
await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'john', password: 'pass' })
});

await api('/api/posts', {
  method: 'POST',
  body: JSON.stringify({ title: 'Title', content: 'Content' })
});

const posts = await api('/api/posts');
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8787',
  withCredentials: true  // Always true!
});

// Usage
await api.post('/api/auth/login', { username: 'john', password: 'pass' });
await api.post('/api/posts', { title: 'Title', content: 'Content' });
const { data } = await api.get('/api/posts');
```

### cURL

```bash
# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass"}' \
  -c cookies.txt

# Create post (with cookie)
curl -X POST http://localhost:8787/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Title","content":"Content"}'

# Get posts
curl http://localhost:8787/api/posts -b cookies.txt
```

---

## ⚠️ Common Issues

### 1. Unauthorized Error

**Cause:** Cookie không được gửi

**Fix:**
```javascript
// Add credentials: 'include'
fetch(url, { credentials: 'include' });

// Or Axios
axios.defaults.withCredentials = true;
```

### 2. CORS Error

**Cause:** CORS_ORIGIN không match frontend domain

**Fix:** Set CORS_ORIGIN trong environment variables:
```bash
CORS_ORIGIN=http://localhost:3000
```

### 3. Validation Error

**Response:**
```json
{
  "success": false,
  "message": "Username must be at least 3 characters"
}
```

**Fix:** Check validation rules và sửa input.

---

## 📖 Related Documentation

- **[COOKIE_AUTH_GUIDE.md](./COOKIE_AUTH_GUIDE.md)** - Chi tiết về cookie authentication
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Full API reference
- **[VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md)** - Validation rules

---

## 🎯 Quick Reference

### Request Template

```javascript
fetch('http://localhost:8787/api/endpoint', {
  method: 'POST',
  credentials: 'include',  // Required for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

### Validation Rules

| Field | Min | Max | Pattern |
|-------|-----|-----|---------|
| username | 3 | 50 | alphanumeric, _, - |
| password | 6 | 100 | any |
| name | 1 | 100 | any |
| title | 1 | 200 | any |
| content (post) | 1 | 10000 | any |
| content (comment) | 1 | 1000 | any |

---

**Last Updated**: 2025-10-21  
**Version**: 2.0.0
