# ⚠️ CẢNH BÁO BẢO MẬT - WILDCARD CORS

## 🚨 NGUY HIỂM

Config hiện tại cho phép **BẤT KỲ DOMAIN NÀO** gọi API với credentials:

```bash
CORS_ORIGIN=*
```

### Rủi Ro:

#### 1. Cross-Site Request Forgery (CSRF)
```
Kẻ tấn công tạo website độc hại:
https://evil-site.com

→ User truy cập evil-site.com
→ evil-site.com gửi request đến API của bạn
→ Cookie của user được gửi kèm theo
→ API thực thi các hành động thay user!
```

#### 2. Data Leakage
```javascript
// evil-site.com
fetch('https://xsslab.hainth.edu.vn/api/posts/my', {
  credentials: 'include'  // ← Sử dụng cookie của nạn nhân
})
.then(r => r.json())
.then(data => {
  // Đánh cắp dữ liệu private của user!
  sendToAttacker(data);
});
```

#### 3. Unauthorized Actions
```javascript
// evil-site.com
// Xóa posts của user
fetch('https://xsslab.hainth.edu.vn/api/posts/123', {
  method: 'DELETE',
  credentials: 'include'
});

// Tạo spam comments
fetch('https://xsslab.hainth.edu.vn/api/comments', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    content: 'SPAM!!!',
    post_uuid: '...'
  })
});
```

---

## ✅ GIẢI PHÁP AN TOÀN

### Cho Development:
```bash
# List specific origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Cho Production:
```bash
# ONLY your domain
CORS_ORIGIN=https://xss-fe.pages.dev
```

### Cho Multiple Environments:
```bash
CORS_ORIGIN=http://localhost:3000,https://staging.example.com,https://xss-fe.pages.dev
```

---

## 🔒 Best Practices

### ✅ DO:
- List specific domains
- Use HTTPS in production
- Regularly review allowed origins
- Use CSRF tokens for sensitive actions

### ❌ DON'T:
- Use `*` in production
- Accept all origins with credentials
- Ignore security warnings

---

## 📊 Risk Matrix

| Config | Security | Use Case |
|--------|----------|----------|
| `*` | 🔴 **VERY HIGH RISK** | Never use! |
| `specific-domain` | 🟢 **SECURE** | Production ✅ |
| `domain1,domain2` | 🟢 **SECURE** | Multi-frontend ✅ |

---

## 🎯 Recommended Config

```bash
# Development + Production
CORS_ORIGIN=http://localhost:3000,https://xss-fe.pages.dev

# Chỉ cần thêm domain mới vào list khi cần
```

---

## 📚 Learn More

- [OWASP CSRF](https://owasp.org/www-community/attacks/csrf)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Best Practices](https://web.dev/cross-origin-resource-sharing/)

---

**Date**: 2025-10-21  
**Severity**: 🔴 CRITICAL  
**Action Required**: Change CORS_ORIGIN to specific domains

