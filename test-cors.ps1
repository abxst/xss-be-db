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

# Check if wildcard
if ($response.Headers.'Access-Control-Allow-Origin' -eq '*') {
    Write-Host "❌ ERROR: Still returning wildcard '*'" -ForegroundColor Red
    Write-Host "   → Need to deploy new code!" -ForegroundColor Yellow
} elseif ($response.Headers.'Access-Control-Allow-Origin' -eq 'https://xss-fe.pages.dev') {
    Write-Host "✅ SUCCESS: Returning specific origin" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Unexpected origin: $($response.Headers.'Access-Control-Allow-Origin')" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Full Headers:" -ForegroundColor Cyan
$response.Headers | Format-Table -AutoSize

