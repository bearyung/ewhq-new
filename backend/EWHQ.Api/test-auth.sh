#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing EWHQ API Authentication"
echo "==============================="

# API URL
API_URL="http://localhost:5125/api"

# Test 1: Login with valid credentials
echo -e "\n${GREEN}Test 1: Login with valid credentials${NC}"
echo "Request:"
echo 'curl -X POST http://localhost:5125/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@ewhq.com\",\"password\":\"PASSWORD\"}"'

echo -e "\nResponse:"
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ewhq.com",
    "password": "|7Clj*ySIkzm"
  }')

echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE

# Extract token if login successful
TOKEN=$(echo $RESPONSE | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "\n${GREEN}✓ Login successful!${NC}"
    echo "Token (first 50 chars): ${TOKEN:0:50}..."
    
    # Test 2: Use token to make authenticated request
    echo -e "\n${GREEN}Test 2: Make authenticated request${NC}"
    echo "Note: This endpoint doesn't exist yet, but shows how to use the token"
    echo "Request:"
    echo "curl -X GET http://localhost:5125/api/users \\"
    echo "  -H \"Authorization: Bearer \$TOKEN\""
    
else
    echo -e "\n${RED}✗ Login failed!${NC}"
fi

# Test 3: Login with invalid credentials
echo -e "\n${GREEN}Test 3: Login with invalid credentials${NC}"
echo "Request:"
echo 'curl -X POST http://localhost:5125/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@ewhq.com\",\"password\":\"wrongpassword\"}"'

echo -e "\nResponse:"
curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ewhq.com",
    "password": "wrongpassword"
  }' | jq '.' 2>/dev/null || echo "Login failed as expected"

echo -e "\n==============================="