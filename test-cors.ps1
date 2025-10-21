# Test CORS on production
Write-Host "Testing CORS on production..." -ForegroundColor Yellow
Write-Host ""

# Test preflight request
Write-Host "1. Testing OPTIONS (preflight) request..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "https://xsslab.hainth.edu.vn/api/auth/login" `
    -Method OPTIONS `
    -Headers @{
        "Origin" = "https://xss-fe.pages.dev"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
    } `
    -SkipHttpErrorCheck

Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host ""
Write-Host "CORS Headers:" -ForegroundColor Green
$response.Headers.'Access-Control-Allow-Origin'
$response.Headers.'Access-Control-Allow-Credentials'
$response.Headers.'Access-Control-Allow-Methods'
Write-Host ""

# Check result
$allowOrigin = $response.Headers.'Access-Control-Allow-Origin'

if ($allowOrigin -eq '*') {
    Write-Host "⚠️  WILDCARD MODE: Returning '*' (credentials won't work!)" -ForegroundColor Yellow
    Write-Host "   → This means old code is still running" -ForegroundColor Red
    Write-Host "   → Run: wrangler deploy" -ForegroundColor Cyan
} elseif ($allowOrigin -eq 'https://xss-fe.pages.dev') {
    Write-Host "✅ SUCCESS: Returning request origin" -ForegroundColor Green
    Write-Host "   → CORS is working correctly!" -ForegroundColor Green
    if ($response.Headers.'Access-Control-Allow-Credentials' -eq 'true') {
        Write-Host "   ✅ Credentials enabled" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Returning origin: $allowOrigin" -ForegroundColor Green
    if ($response.Headers.'Access-Control-Allow-Credentials' -eq 'true') {
        Write-Host "   ✅ Credentials enabled" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Full Headers:" -ForegroundColor Cyan
$response.Headers | Format-Table -AutoSize

