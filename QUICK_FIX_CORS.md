# 🚨 Quick Fix: CORS Error

## ❌ Current Error

```
Access-Control-Allow-Origin' header in the response must not be 
the wildcard '*' when the request's credentials mode is 'include'
```

**Root Cause:** Backend vẫn đang chạy **code cũ**, trả về `*` thay vì specific origin.

---

## ✅ Fix (2 Bước)

### Bước 1: Deploy Code Mới

```bash
cd d:\code\xsslab\xss-be-db
wrangler deploy
```

**Output mong đợi:**
```
🌍  Uploading...
✨  Success! Uploaded 1 file (x.xx sec)
🌎  Deployment complete!
```

### Bước 2: Set Environment Variable

**Option A: CLI (Khuyên dùng)**
```bash
wrangler secret put CORS_ORIGIN
# Khi hỏi: https://xss-fe.pages.dev
```

**Option B: Dashboard**
1. https://dash.cloudflare.com
2. Workers & Pages → `xss-be-db`
3. Settings → Variables
4. Edit `CORS_ORIGIN`:
   ```
   https://xss-fe.pages.dev
   ```

---

## 🧪 Test

### PowerShell:
```powershell
.\test-cors.ps1
```

### Bash/Linux/Mac:
```bash
chmod +x test-cors.sh
./test-cors.sh
```

### Manual:
```bash
curl -i -X OPTIONS \
  -H "Origin: https://xss-fe.pages.dev" \
  https://xsslab.hainth.edu.vn/api/auth/login | grep -i "access-control"
```

**Kết quả đúng:**
```
access-control-allow-origin: https://xss-fe.pages.dev  ✅
access-control-allow-credentials: true  ✅
```

**Kết quả SAI (hiện tại):**
```
access-control-allow-origin: *  ❌
```

---

## 🎯 Summary

| Step | Command | Status |
|------|---------|--------|
| 1. Deploy code | `wrangler deploy` | ⏳ Pending |
| 2. Set CORS_ORIGIN | `wrangler secret put CORS_ORIGIN` | ⏳ Pending |
| 3. Test | `.\test-cors.ps1` hoặc `./test-cors.sh` | ⏳ Pending |
| 4. Verify frontend | Refresh https://xss-fe.pages.dev | ⏳ Pending |

---

## ⚠️ Troubleshooting

### Q: Sau khi deploy vẫn lỗi?
**A:** Cache issue. Clear browser cache và hard refresh (Ctrl+Shift+R)

### Q: `wrangler: command not found`?
**A:** 
```bash
npm install -g wrangler
wrangler login
```

### Q: CORS_ORIGIN đã set mà vẫn trả về `*`?
**A:** Code chưa deploy. Chạy `wrangler deploy` lại.

---

## 📞 Support

Nếu vẫn lỗi sau khi làm đủ 3 bước trên, check:
1. Code có được deploy thành công không?
2. Environment variable có đúng không?
3. Browser cache đã clear chưa?

Run test script để debug:
```bash
# Windows
.\test-cors.ps1

# Linux/Mac
./test-cors.sh
```

