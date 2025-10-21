#!/bin/bash
# Test CORS on production

echo -e "\033[1;33mTesting CORS on production...\033[0m"
echo ""

echo -e "\033[1;36m1. Testing OPTIONS (preflight) request...\033[0m"
response=$(curl -i -X OPTIONS \
  -H "Origin: https://xss-fe.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  https://xsslab.hainth.edu.vn/api/auth/login 2>/dev/null)

echo "$response"
echo ""

# Extract Access-Control-Allow-Origin
origin=$(echo "$response" | grep -i "access-control-allow-origin:" | awk '{print $2}' | tr -d '\r')

if [ "$origin" = "*" ]; then
    echo -e "\033[1;31m❌ ERROR: Still returning wildcard '*'\033[0m"
    echo -e "\033[1;33m   → Need to deploy new code!\033[0m"
    echo ""
    echo -e "\033[1;33mRun: wrangler deploy\033[0m"
elif [ "$origin" = "https://xss-fe.pages.dev" ]; then
    echo -e "\033[1;32m✅ SUCCESS: Returning specific origin\033[0m"
    credentials=$(echo "$response" | grep -i "access-control-allow-credentials:" | awk '{print $2}' | tr -d '\r')
    if [ "$credentials" = "true" ]; then
        echo -e "\033[1;32m✅ Credentials enabled\033[0m"
        echo ""
        echo -e "\033[1;32m🎉 CORS is configured correctly!\033[0m"
    else
        echo -e "\033[1;31m❌ Credentials not enabled\033[0m"
    fi
else
    echo -e "\033[1;33m⚠️  WARNING: Unexpected origin: $origin\033[0m"
fi

