# 🍪 Cookie-Based Authentication Guide

Hướng dẫn sử dụng HTTP-only Cookie authentication với XSS Lab API.

## 📝 Tổng Quan

API sử dụng **HTTP-only cookies** để lưu trữ JWT token, thay vì trả token trong response body. Cách này an toàn hơn vì:

- ✅ **Ngăn XSS attacks**: JavaScript không thể truy cập cookie (HttpOnly flag)
- ✅ **Tự động gửi token**: Browser tự động gửi cookie với mọi request
- ✅ **CSRF protection**: SameSite=Lax flag ngăn CSRF attacks
- ✅ **Secure**: Có thể bật Secure flag cho HTTPS

---

## 🔧 Cấu Hình

### 1. CORS Configuration

**File: `.dev.vars`** (local development)
```bash
# Allow frontend domain (NOT wildcard!)
CORS_ORIGIN=http://localhost:3000

# Multiple domains (comma-separated)
# CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**Production (Cloudflare Dashboard):**
```
CORS_ORIGIN=https://yourdomain.com
```

⚠️ **Quan trọng**: 
- KHÔNG dùng wildcard `*` khi dùng credentials
- Phải specify chính xác domain của frontend

---

## 🔑 Cookie Properties

```
Set-Cookie: auth_token=<JWT_TOKEN>; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
```

| Property | Value | Purpose |
|----------|-------|---------|
| `Max-Age` | 604800 (7 days) | Cookie expiration |
| `Path` | `/` | Available for all paths |
| `HttpOnly` | true | JavaScript cannot access |
| `SameSite` | `Lax` | CSRF protection |
| `Secure` | false (dev) | HTTPS only (enable for prod) |

---

## 🚀 Frontend Integration

### JavaScript (Fetch API)

#### Setup

```javascript
const API_BASE = 'http://localhost:8787';

// Helper function with credentials
async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include',  // ⭐ IMPORTANT: Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return await response.json();
}
```

#### Register

```javascript
async function register(username, password, name) {
  try {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name })
    });

    // Cookie được tự động lưu bởi browser
    console.log('Registered:', data.user);
    console.log(data.message); // "Registration successful"
    // NO token in response!
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
}

// Usage
await register('johndoe', 'password123', 'John Doe');
```

#### Login

```javascript
async function login(username, password) {
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // Cookie được tự động lưu
    console.log('Logged in:', data.user);
    return data;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

// Usage
await login('johndoe', 'password123');
```

#### Logout

```javascript
async function logout() {
  try {
    const data = await apiRequest('/api/auth/logout', {
      method: 'POST'
    });

    // Cookie được tự động xóa
    console.log(data.message); // "Logout successful"
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
}

// Usage
await logout();
```

#### Authenticated Requests

```javascript
// Cookie tự động được gửi, không cần thêm header
async function createPost(title, content) {
  return await apiRequest('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content })
  });
}

async function getPosts() {
  return await apiRequest('/api/posts');
}

// Usage - Cookie tự động được gửi!
const post = await createPost('My Post', 'Content here');
const posts = await getPosts();
```

---

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8787',
  withCredentials: true,  // ⭐ IMPORTANT: Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register
async function register(username, password, name) {
  const { data } = await api.post('/api/auth/register', {
    username,
    password,
    name
  });
  
  // Cookie tự động lưu
  return data;
}

// Login
async function login(username, password) {
  const { data } = await api.post('/api/auth/login', {
    username,
    password
  });
  
  return data;
}

// Logout
async function logout() {
  const { data } = await api.post('/api/auth/logout');
  return data;
}

// Authenticated requests - Cookie tự động gửi!
async function createPost(title, content) {
  const { data } = await api.post('/api/posts', { title, content });
  return data;
}

// Usage
await register('john', 'pass123', 'John Doe');
await login('john', 'pass123');
await createPost('Title', 'Content');
await logout();
```

---

### React Example

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper function
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:8787${endpoint}`, {
    ...options,
    credentials: 'include',  // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Auth Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (cookie exists and valid)
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Try to get user's own posts (requires auth)
      await apiRequest('/api/posts/my');
      // If successful, user is logged in
      setLoading(false);
    } catch (error) {
      // Not logged in
      setUser(null);
      setLoading(false);
    }
  }

  async function register(username, password, name) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name })
    });
    setUser(data.user);
    return data;
  }

  async function login(username, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setUser(data.user);
    return data;
  }

  async function logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in component
function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(username, password);
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input 
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Vue 3 Example

```javascript
// composables/useAuth.js
import { ref } from 'vue';

const user = ref(null);
const loading = ref(true);

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:8787${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

export function useAuth() {
  async function register(username, password, name) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name })
    });
    user.value = data.user;
    return data;
  }

  async function login(username, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    user.value = data.user;
    return data;
  }

  async function logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    user.value = null;
  }

  return {
    user,
    loading,
    register,
    login,
    logout
  };
}

// Usage in component
<script setup>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { login } = useAuth();
const username = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await login(username.value, password.value);
    // Redirect
  } catch (error) {
    alert(error.message);
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit">Login</button>
  </form>
</template>
```

---

## 🔐 Security Features

### 1. HttpOnly Flag
```
HttpOnly
```
- JavaScript **KHÔNG THỂ** truy cập cookie
- Ngăn XSS attacks steal token
- Cookie chỉ được browser gửi tự động

### 2. SameSite Protection
```
SameSite=Lax
```
- Ngăn CSRF attacks
- Cookie không được gửi trong cross-site POST requests
- Được gửi trong navigation (click link, form GET)

### 3. Secure Flag (Production)
```
Secure  // Uncomment for production
```
- Cookie chỉ được gửi qua HTTPS
- Ngăn man-in-the-middle attacks

### 4. Path Restriction
```
Path=/
```
- Cookie available cho tất cả API paths
- Có thể giới hạn thành `Path=/api` nếu cần

---

## ⚠️ Important Notes

### CORS Configuration

**❌ KHÔNG ĐƯỢC:**
```javascript
// WRONG - Wildcard không work với credentials
CORS_ORIGIN=*
withCredentials: true
// Browser sẽ block!
```

**✅ ĐÚNG:**
```javascript
// CORRECT - Specific origin
CORS_ORIGIN=http://localhost:3000
withCredentials: true
// Works!
```

### Multiple Origins

Nếu có nhiều frontend domains:

```bash
# .dev.vars
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://app.yourdomain.com
```

API sẽ check origin của request và chỉ allow nếu match.

---

## 🧪 Testing

### Browser DevTools

1. **Check Cookie được set:**
```
Application → Cookies → http://localhost:8787
```

Sẽ thấy:
```
Name: auth_token
Value: eyJhbGc...
Path: /
HttpOnly: ✓
SameSite: Lax
```

2. **Check Cookie được gửi:**
```
Network → Request → Headers → Cookie: auth_token=eyJhbGc...
```

### cURL

```bash
# Login và lưu cookie
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}' \
  -c cookies.txt

# Sử dụng cookie cho request khác
curl http://localhost:8787/api/posts \
  -b cookies.txt

# Logout
curl -X POST http://localhost:8787/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## 🔄 Migration from Token-based

### Before (Token in Response)

```javascript
// Old way
const { token } = await login(username, password);
localStorage.setItem('auth_token', token);

// Send token in header
fetch('/api/posts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### After (Cookie-based)

```javascript
// New way
await login(username, password);
// No token in response, no localStorage

// No Authorization header needed
fetch('/api/posts', {
  credentials: 'include'  // Just send cookies
});
```

**Changes needed:**
1. Remove `localStorage` token management
2. Add `credentials: 'include'` to all requests
3. Update CORS_ORIGIN to specific domain

---

## 🆘 Troubleshooting

### Error: "Unauthorized" sau khi login

**Cause:** Cookie không được gửi

**Solutions:**
```javascript
// Check credentials option
fetch('/api/posts', {
  credentials: 'include'  // ← Missing this?
});

// Axios
axios.defaults.withCredentials = true;
```

### Error: CORS error

**Cause:** Wildcard CORS với credentials

**Solution:**
```bash
# Change from:
CORS_ORIGIN=*

# To specific domain:
CORS_ORIGIN=http://localhost:3000
```

### Cookie không được set

**Cause:** Domain mismatch

**Check:**
1. Frontend domain matches CORS_ORIGIN
2. API URL correct
3. Browser allows cookies (not in incognito with strict settings)

---

## 📖 Related Documentation

- [API Usage Guide](./API_USAGE_GUIDE.md) - General API usage
- [API Documentation](./API_DOCUMENTATION.md) - All endpoints
- [ENV Setup](./ENV_SETUP.md) - Environment configuration

---

**Last Updated**: 2025-10-21  
**Version**: 2.0.0 (Cookie-based Auth)

