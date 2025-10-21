# 📚 Documentation

Thư mục này chứa tất cả tài liệu của XSS Lab Backend API.

## 📖 Danh Sách Tài Liệu

### 1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**API Reference hoàn chỉnh**

Tài liệu chi tiết về tất cả API endpoints:
- 🔐 Authentication (Register, Login)
- 📝 Posts (Create, Read, Search)
- 💬 Comments (Create, Read)
- 🏥 Health Check (System, Database)

**Nội dung:**
- Request/Response examples
- cURL và JavaScript examples
- Error codes và handling
- Security notes

**Dùng cho:** Frontend developers, API consumers

---

### 2. [ENV_SETUP.md](./ENV_SETUP.md)
**Hướng dẫn cấu hình Environment Variables**

Chi tiết về setup và quản lý environment variables:
- JWT_SECRET configuration
- CORS_ORIGIN settings
- Local vs Production setup
- Cloudflare Secrets guide

**Nội dung:**
- Các biến môi trường available
- Best practices
- Troubleshooting
- Security warnings

**Dùng cho:** DevOps, Developers setup project

---

### 3. [HEALTH_CHECK_EXAMPLES.md](./HEALTH_CHECK_EXAMPLES.md)
**Health Check & Monitoring Examples**

Ví dụ chi tiết về health check endpoints:
- Full system health check
- Database connection check
- Detailed database inspection

**Nội dung:**
- Use cases (monitoring, CI/CD, load balancer)
- JavaScript examples
- Bash script examples
- Best practices

**Dùng cho:** DevOps, Site Reliability Engineers, Monitoring setup

---

### 4. [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)
**Refactoring Summary - Technical Details**

Chi tiết về refactoring đã thực hiện:
- Environment variables migration
- Router từ if-else sang switch-case
- Code organization improvements

**Nội dung:**
- Before/After comparisons
- Code metrics
- Migration guide
- Technical decisions

**Dùng cho:** Developers muốn hiểu architecture, Code reviewers

---

### 5. [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md)
**Input Validation System Guide**

Hướng dẫn sử dụng validation system:
- Validation rules và types
- Built-in validators
- Custom validation
- Best practices

**Nội dung:**
- Validation architecture
- Usage examples
- Error handling
- Testing validation

**Dùng cho:** Backend developers, API implementers

---

### 6. [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md)
**Hướng Dẫn Gọi API - Complete Guide**

Hướng dẫn chi tiết cách gọi API:
- Request/Response structure
- Authentication flow
- Examples với nhiều ngôn ngữ
- Error handling patterns

**Nội dung:**
- JavaScript/Fetch examples
- cURL commands
- Python requests
- Axios setup
- Best practices
- Common errors & solutions

**Dùng cho:** Frontend developers, Mobile developers, API consumers

---

### 7. [COOKIE_AUTH_GUIDE.md](./COOKIE_AUTH_GUIDE.md)
**🍪 Cookie-Based Authentication Guide**

Hướng dẫn sử dụng HTTP-only cookie authentication:
- Cookie properties và security
- CORS configuration
- Frontend integration examples
- Migration từ token-based

**Nội dung:**
- React, Vue examples
- Fetch API với credentials
- Axios configuration
- Security features
- Troubleshooting

**Dùng cho:** Frontend developers implementing auth

---

### 8. [CORS_GUIDE.md](./CORS_GUIDE.md)
**🌐 CORS Configuration Complete Guide**

Hướng dẫn đầy đủ về cấu hình CORS:
- 3 CORS modes (Wildcard, Specific, Dev Wildcard)
- Security considerations
- Development vs Production setup
- Testing và troubleshooting

**Nội dung:**
- CORS modes comparison
- Configuration examples
- Security warnings
- How CORS works internally
- Production checklist

**Dùng cho:** Developers setup CORS, DevOps deployment

---

## 🚀 Quick Start

### Cho Frontend Developers - Bắt Đầu Gọi API
→ Đọc [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) - **START HERE!**

### Cho Frontend Developers - API Reference
→ Đọc [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Cho Backend Developers Setup Project
→ Đọc [ENV_SETUP.md](./ENV_SETUP.md)

### Cho Backend Developers - Validation
→ Đọc [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md)

### Cho DevOps/Monitoring
→ Đọc [HEALTH_CHECK_EXAMPLES.md](./HEALTH_CHECK_EXAMPLES.md)

### Cho Code Review/Architecture Understanding
→ Đọc [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)

---

## 📂 Document Organization

```
docs/
├── README.md                      # File này - index của docs
├── API_USAGE_GUIDE.md             # ⭐ Hướng dẫn gọi API (START HERE!)
├── COOKIE_AUTH_GUIDE.md           # 🍪 Cookie-based authentication
├── CORS_GUIDE.md                  # 🌐 CORS configuration guide
├── API_DOCUMENTATION.md           # API reference chi tiết
├── VALIDATION_GUIDE.md            # Input validation guide
├── ENV_SETUP.md                   # Environment setup
├── HEALTH_CHECK_EXAMPLES.md       # Health check guide
└── REFACTOR_SUMMARY.md            # Technical refactoring details
```

---

## 🔗 Related Documentation

- **Main README**: `../README.md` - General project overview
- **Migrations**: `../migrations/README.md` - Database schema docs
- **TypeScript Config**: `../tsconfig.json` - TypeScript configuration
- **Wrangler Config**: `../wrangler.json` - Cloudflare Workers config

---

## 📝 Contributing to Docs

Khi thêm hoặc sửa documentation:

1. **API changes**: Update `API_DOCUMENTATION.md`
2. **Environment variables**: Update `ENV_SETUP.md`
3. **New monitoring features**: Update `HEALTH_CHECK_EXAMPLES.md`
4. **Architecture changes**: Update `REFACTOR_SUMMARY.md`
5. **General project info**: Update `../README.md`

### Format Guidelines

- Sử dụng Markdown với syntax highlighting
- Thêm emojis cho dễ đọc (✅ ❌ 🔐 📝 💬)
- Code examples phải có syntax highlight
- Thêm HTTP status codes cho API endpoints
- Include both cURL và JavaScript examples

---

## 🔍 Search Guide

**Tìm API endpoint:**
```
API_DOCUMENTATION.md → Ctrl+F → endpoint name
```

**Tìm environment variable:**
```
ENV_SETUP.md → Ctrl+F → variable name
```

**Tìm health check example:**
```
HEALTH_CHECK_EXAMPLES.md → Ctrl+F → use case
```

**Tìm code architecture:**
```
REFACTOR_SUMMARY.md → Ctrl+F → feature name
```

---

## 📊 Documentation Stats

| Document | Lines | Topics | Audience |
|----------|-------|--------|----------|
| API_USAGE_GUIDE.md | ~300 | 10 | Frontend/Mobile Dev ⭐ |
| COOKIE_AUTH_GUIDE.md | ~550 | 12 | Frontend Dev 🍪 |
| CORS_GUIDE.md | ~400 | 15 | DevOps/All Developers 🌐 |
| API_DOCUMENTATION.md | ~540 | 15 | Frontend Dev |
| VALIDATION_GUIDE.md | ~480 | 12 | Backend Dev |
| HEALTH_CHECK_EXAMPLES.md | ~480 | 10 | SRE/Monitoring |
| REFACTOR_SUMMARY.md | ~400 | 6 | Backend Dev |
| ENV_SETUP.md | ~230 | 8 | DevOps |

**Total Documentation**: ~3,380 lines

---

## 🆘 Need Help?

1. **Cách gọi API** → Read `API_USAGE_GUIDE.md` ⭐
2. **CORS errors/setup** → Check `CORS_GUIDE.md` 🌐
3. **API endpoints details** → Read `API_DOCUMENTATION.md`
4. **Validation errors** → Check `VALIDATION_GUIDE.md`
5. **Setup problems** → Check `ENV_SETUP.md` troubleshooting section
6. **Monitoring issues** → See `HEALTH_CHECK_EXAMPLES.md` troubleshooting
7. **Architecture questions** → Review `REFACTOR_SUMMARY.md`

---

**Last Updated**: 2025-10-21
**Version**: 1.0.0

