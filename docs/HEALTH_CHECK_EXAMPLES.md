# 🏥 Health Check API Examples

Các ví dụ sử dụng Health Check endpoints để monitor database và system.

## 📖 Tổng Quan

Project có 3 health check endpoints:

1. **`GET /api/health`** - Full system health (API + Database)
2. **`GET /api/health/db`** - Database connection check (nhanh)
3. **`GET /api/health/db/detailed`** - Database detailed check (chi tiết)

---

## 🚀 Sử dụng

### 1. Full System Health Check

Kiểm tra tất cả services đang hoạt động.

#### cURL

```bash
curl http://localhost:8787/api/health
```

#### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:8787/api/health');
const health = await response.json();

console.log(health);
// {
//   "status": "healthy",
//   "timestamp": "2025-10-21T10:30:00.000Z",
//   "version": "1.0.0",
//   "environment": "development",
//   "services": {
//     "api": { "status": "healthy" },
//     "database": {
//       "status": "healthy",
//       "responseTime": "5ms"
//     }
//   }
// }

if (health.status === 'healthy') {
  console.log('✅ All systems operational');
} else {
  console.log('⚠️ System degraded:', health);
}
```

#### Response khi Database lỗi

```json
{
  "status": "degraded",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "api": {
      "status": "healthy"
    },
    "database": {
      "status": "unhealthy",
      "error": "D1_ERROR: no such table: users"
    }
  }
}
```

**HTTP Status Code:**
- `200` - System healthy
- `503` - System degraded/unhealthy

---

### 2. Basic Database Check

Kiểm tra nhanh xem database có kết nối được không.

#### cURL

```bash
curl http://localhost:8787/api/health/db
```

#### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:8787/api/health/db');
const dbHealth = await response.json();

console.log(dbHealth);
// {
//   "success": true,
//   "database": {
//     "status": "healthy",
//     "connected": true,
//     "responseTime": "3ms",
//     "message": "Database connection is working properly"
//   }
// }

if (dbHealth.success) {
  console.log(`✅ Database OK (${dbHealth.database.responseTime})`);
}
```

#### Response khi lỗi

```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "no such table: users"
}
```

**HTTP Status Code:**
- `200` - Database connected
- `503` - Database connection failed

---

### 3. Detailed Database Check

Kiểm tra chi tiết: tables tồn tại, số lượng records.

#### cURL

```bash
curl http://localhost:8787/api/health/db/detailed
```

#### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:8787/api/health/db/detailed');
const detailed = await response.json();

console.log(detailed);
// {
//   "success": true,
//   "timestamp": "2025-10-21T10:30:00.000Z",
//   "database": {
//     "status": "healthy",
//     "connected": true,
//     "responseTime": "8ms",
//     "tables": {
//       "users": { "exists": true, "count": 5 },
//       "posts": { "exists": true, "count": 12 },
//       "comments": { "exists": true, "count": 34 }
//     }
//   }
// }

// Kiểm tra từng bảng
const { tables } = detailed.database;
console.log(`Users: ${tables.users.count}`);
console.log(`Posts: ${tables.posts.count}`);
console.log(`Comments: ${tables.comments.count}`);
```

#### Response khi Tables chưa tạo

```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "no such table: users"
}
```

**Lưu ý:** Endpoint này cần migrations đã chạy. Nếu lỗi "no such table", chạy:

```bash
npm run seedLocalD1
```

---

## 🔍 Use Cases

### 1. Pre-Deployment Verification

Trước khi deploy, verify database schema:

```bash
#!/bin/bash
# pre-deploy.sh

echo "Checking database health..."
response=$(curl -s http://localhost:8787/api/health/db/detailed)

if echo "$response" | grep -q '"status":"healthy"'; then
  echo "✅ Database healthy, proceeding with deployment"
  npm run deploy
else
  echo "❌ Database check failed:"
  echo "$response"
  exit 1
fi
```

### 2. Monitoring Dashboard

```javascript
// Simple monitoring component
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    
    // Update UI
    document.getElementById('api-status').textContent = 
      health.services.api.status;
    document.getElementById('db-status').textContent = 
      health.services.database.status;
    document.getElementById('db-response-time').textContent = 
      health.services.database.responseTime || 'N/A';
    
    // Set colors
    const isHealthy = health.status === 'healthy';
    document.body.className = isHealthy ? 'status-healthy' : 'status-degraded';
    
  } catch (error) {
    console.error('Health check failed:', error);
    document.body.className = 'status-error';
  }
}

// Check every 30 seconds
setInterval(checkHealth, 30000);
checkHealth(); // Initial check
```

### 3. CI/CD Health Check

GitHub Actions example:

```yaml
# .github/workflows/health-check.yml
name: Health Check

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API Health
        run: |
          response=$(curl -s https://your-api.workers.dev/api/health)
          status=$(echo $response | jq -r '.status')
          
          if [ "$status" != "healthy" ]; then
            echo "::error::API health check failed: $response"
            # Send alert (Slack, email, etc.)
            exit 1
          fi
          
          echo "✅ Health check passed"
```

### 4. Load Balancer Health Check

Nếu dùng load balancer, configure health check:

```nginx
# Nginx upstream health check
upstream api_backend {
    server api1.example.com;
    server api2.example.com;
    
    # Health check
    check interval=3000 rise=2 fall=3 timeout=1000 type=http;
    check_http_send "GET /api/health/db HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx;
}
```

### 5. Post-Migration Verification

Sau khi chạy migration, verify:

```bash
#!/bin/bash
# verify-migration.sh

echo "Running migrations..."
wrangler d1 migrations apply DB --local

echo "Waiting for database..."
sleep 2

echo "Verifying database structure..."
response=$(curl -s http://localhost:8787/api/health/db/detailed)

# Check if all tables exist
users_exists=$(echo "$response" | jq -r '.database.tables.users.exists')
posts_exists=$(echo "$response" | jq -r '.database.tables.posts.exists')
comments_exists=$(echo "$response" | jq -r '.database.tables.comments.exists')

if [ "$users_exists" = "true" ] && \
   [ "$posts_exists" = "true" ] && \
   [ "$comments_exists" = "true" ]; then
  echo "✅ All tables created successfully"
  
  # Show counts
  users_count=$(echo "$response" | jq -r '.database.tables.users.count')
  posts_count=$(echo "$response" | jq -r '.database.tables.posts.count')
  comments_count=$(echo "$response" | jq -r '.database.tables.comments.count')
  
  echo "  - Users: $users_count"
  echo "  - Posts: $posts_count"
  echo "  - Comments: $comments_count"
else
  echo "❌ Migration verification failed:"
  echo "$response" | jq '.'
  exit 1
fi
```

---

## 📊 Monitoring Metrics

### Response Time Tracking

```javascript
// Track database response times
const responseTimes = [];

async function trackDatabasePerformance() {
  const start = Date.now();
  const response = await fetch('/api/health/db');
  const clientTime = Date.now() - start;
  
  const data = await response.json();
  const serverTime = parseInt(data.database.responseTime);
  
  responseTimes.push({
    timestamp: new Date(),
    clientTime,
    serverTime,
    networkLatency: clientTime - serverTime
  });
  
  // Keep last 100 measurements
  if (responseTimes.length > 100) {
    responseTimes.shift();
  }
  
  // Calculate average
  const avgServerTime = responseTimes.reduce(
    (sum, t) => sum + t.serverTime, 0
  ) / responseTimes.length;
  
  console.log(`Avg DB response time: ${avgServerTime.toFixed(2)}ms`);
}
```

### Uptime Monitoring

```javascript
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

async function monitorUptime() {
  try {
    const response = await fetch('/api/health', {
      timeout: 5000
    });
    
    if (response.ok) {
      const health = await response.json();
      
      if (health.status === 'healthy') {
        consecutiveFailures = 0;
        console.log('✅ System healthy');
      } else {
        consecutiveFailures++;
        console.warn('⚠️ System degraded:', health);
      }
    } else {
      consecutiveFailures++;
      console.error('❌ Health check returned:', response.status);
    }
    
    if (consecutiveFailures >= MAX_FAILURES) {
      alert('🚨 ALERT: System has been unhealthy for ' + 
            consecutiveFailures + ' consecutive checks!');
      // Send notification
    }
    
  } catch (error) {
    consecutiveFailures++;
    console.error('❌ Health check failed:', error);
  }
}

// Check every minute
setInterval(monitorUptime, 60000);
```

---

## 🔧 Troubleshooting

### Error: "no such table: users"

**Nguyên nhân:** Migrations chưa chạy

**Giải pháp:**
```bash
# Local
npm run seedLocalD1

# Production
npm run predeploy
```

### Error: "Database connection failed"

**Nguyên nhân:** D1 binding không đúng

**Kiểm tra:**
1. `wrangler.json` có `d1_databases` binding
2. Database ID đúng
3. Local: Wrangler dev đang chạy

### Error: 503 Service Unavailable

**Nguyên nhân:** Worker không kết nối được database

**Debug:**
```bash
# Check wrangler logs
wrangler tail

# Test local
npm run dev
curl http://localhost:8787/api/health/db
```

---

## 📈 Best Practices

1. **Separate Health Checks**: Dùng `/api/health/db` cho quick checks, `/api/health/db/detailed` khi cần debug
2. **Caching**: Không cache health check responses
3. **Timeouts**: Set reasonable timeouts (1-5 seconds)
4. **Alerting**: Alert khi consecutive failures > 3
5. **Logging**: Log tất cả health check failures
6. **Dependencies**: Monitor cả upstream dependencies (nếu có)

---

## 🎯 Quick Reference

| Endpoint | Purpose | Speed | Use Case |
|----------|---------|-------|----------|
| `/api/health` | Full system | Medium | Load balancer |
| `/api/health/db` | DB connection | Fast | Quick check |
| `/api/health/db/detailed` | DB details | Slow | Debugging |

**Recommended Check Intervals:**
- Production: Every 30-60 seconds
- Development: Every 5 minutes
- CI/CD: Before/after deployment

---

**Updated**: 2025-10-21

