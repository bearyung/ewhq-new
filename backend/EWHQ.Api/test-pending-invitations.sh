#!/bin/bash

echo "Testing Pending Invitations API"
echo "================================"

BASE_URL="http://localhost:5125/api"
TEAM_ID="4ae22f1b-f564-4850-b3d8-8e7d6473059e"

echo "1. Testing teams endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/teams/$TEAM_ID"

echo "2. Testing team members endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/teams/$TEAM_ID/members"

echo "3. Testing pending invitations endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/teams/$TEAM_ID/pending-invitations"

echo "4. Testing CORS for pending invitations..."
curl -s -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -w "Status: %{http_code}\n" \
  "$BASE_URL/teams/$TEAM_ID/pending-invitations"

echo "================================"
echo "All endpoints should return 401 (Unauthorized) without auth token"
echo "CORS OPTIONS should return 204 (No Content) with proper headers"
echo "This confirms the endpoints exist and are properly configured"