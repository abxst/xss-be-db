# Test CORS Logic

## Config: `CORS_ORIGIN=*,http://localhost:3000,https://myapp.com`

### Parse Result:
```
allowedOrigins = ['*', 'http://localhost:3000', 'https://myapp.com']
hasWildcard = true
specificOrigins = ['http://localhost:3000', 'https://myapp.com']
```

### Test Cases:

#### Case 1: Request from localhost:3000
```
requestOrigin = 'http://localhost:3000'

Logic:
- hasWildcard = true
- specificOrigins.length = 2 > 0
- requestOrigin exists
→ Case 2 matches
→ Return: 'http://localhost:3000' ✅
→ Set credentials: true ✅
```

#### Case 2: Request from localhost:5173
```
requestOrigin = 'http://localhost:5173'

Logic:
- hasWildcard = true
- specificOrigins.length = 2 > 0
- requestOrigin exists
→ Case 2 matches
→ Return: 'http://localhost:5173' ✅ (Dev mode allows any)
→ Set credentials: true ✅
```

#### Case 3: Request without Origin header
```
requestOrigin = null

Logic:
- hasWildcard = true
- specificOrigins.length = 2 > 0
- requestOrigin is null
→ Case 2 matches (no requestOrigin branch)
→ Return: specificOrigins[0] = 'http://localhost:3000' ✅
→ Set credentials: true ✅
```

#### Case 4: Preflight (OPTIONS) request
```
requestOrigin = 'http://localhost:3000'

Same as Case 1
→ Return: 'http://localhost:3000' ✅
→ Set credentials: true ✅
```

## Expected Headers:

### For localhost:3000 request:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Cookie
```

### For preflight:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Cookie
Access-Control-Max-Age: 86400
```

## Verify on Production:

```bash
# Test preflight
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  https://xsslab.hainth.edu.vn/api/auth/login

# Should see:
# Access-Control-Allow-Origin: http://localhost:3000  ✅
# Access-Control-Allow-Credentials: true  ✅
# NOT: Access-Control-Allow-Origin: *  ❌
```

## If Still Returns '*':

Possible causes:
1. Environment variable not updated on Cloudflare
2. CORS_ORIGIN value is actually just `*` (not the full string)
3. Caching issue - need to redeploy

Fix:
```bash
cd xss-be-db
wrangler deploy
```

