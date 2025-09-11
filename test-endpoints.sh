#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_test() { echo -e "${BLUE}[TEST]${NC} $1"; }

# Configuration
BASE_URL=${1:-"https://167.172.83.55"}
TIMEOUT=10

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local auth_header=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log_test "Testing: $description"
    echo "  URL: $method $BASE_URL$endpoint"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /dev/null --connect-timeout $TIMEOUT"
    
    if [ "$method" = "POST" ]; then
        curl_cmd="$curl_cmd -X POST -H 'Content-Type: application/json' -d '{}'"
    elif [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -X PUT -H 'Content-Type: application/json' -d '{}'"
    elif [ "$method" = "DELETE" ]; then
        curl_cmd="$curl_cmd -X DELETE"
    fi
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer test-token'"
    fi
    
    local status_code
    status_code=$(eval "$curl_cmd '$BASE_URL$endpoint'" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Start testing
log_info "PPID Master API Endpoint Testing"
log_info "Base URL: $BASE_URL"
log_info "Timeout: ${TIMEOUT}s"
echo ""

# Health check
test_endpoint "GET" "/api/health" "200" "Health Check"

# Authentication endpoints
test_endpoint "POST" "/api/auth/login" "400" "Login (no credentials)"
test_endpoint "POST" "/api/auth/register" "400" "Register (no data)"
test_endpoint "GET" "/api/auth/me" "401" "Get current user (no auth)"
test_endpoint "POST" "/api/auth/logout" "401" "Logout (no auth)"

# Settings endpoints
test_endpoint "GET" "/api/settings" "200" "Get settings"
test_endpoint "POST" "/api/settings" "401" "Update settings (no auth)"

# Public information endpoints
test_endpoint "GET" "/api/informasi" "200" "Get public information"
test_endpoint "POST" "/api/informasi" "401" "Create information (no auth)"

# Categories
test_endpoint "GET" "/api/kategori" "200" "Get categories"
test_endpoint "POST" "/api/kategori" "401" "Create category (no auth)"

# Pages
test_endpoint "GET" "/api/pages" "200" "Get pages"
test_endpoint "POST" "/api/pages" "401" "Create page (no auth)"

# Statistics
test_endpoint "GET" "/api/stats/public" "200" "Public statistics"

# Protected endpoints (should return 401 without auth)
test_endpoint "GET" "/api/permintaan" "401" "Get requests (no auth)"
test_endpoint "POST" "/api/permintaan" "401" "Create request (no auth)"
test_endpoint "GET" "/api/keberatan" "401" "Get objections (no auth)"
test_endpoint "POST" "/api/keberatan" "401" "Create objection (no auth)"

# Chat endpoints
test_endpoint "GET" "/api/chat-list" "401" "Get chat list (no auth)"
test_endpoint "GET" "/api/ppid-chat" "401" "Get PPID chat (no auth)"

# Admin endpoints
test_endpoint "GET" "/api/admin/stats" "401" "Admin stats (no auth)"
test_endpoint "GET" "/api/admin/users" "401" "Admin users (no auth)"
test_endpoint "POST" "/api/admin/assign-ppid" "401" "Assign PPID (no auth)"

# Account management
test_endpoint "GET" "/api/accounts" "401" "Get accounts (no auth)"
test_endpoint "POST" "/api/accounts" "401" "Create account (no auth)"
test_endpoint "GET" "/api/accounts/pending" "401" "Pending accounts (no auth)"

# Upload endpoints
test_endpoint "POST" "/api/upload" "401" "Upload file (no auth)"
test_endpoint "POST" "/api/upload/image" "401" "Upload image (no auth)"

# Test specific endpoints that might exist
test_endpoint "GET" "/api/laporan" "401" "Reports (no auth)"
test_endpoint "GET" "/api/chat/unread" "401" "Unread chats (no auth)"

# Test 404 endpoints
test_endpoint "GET" "/api/nonexistent" "404" "Non-existent endpoint"
test_endpoint "GET" "/api/test/invalid" "404" "Invalid test endpoint"

# Frontend routes (should return 200 for HTML)
test_endpoint "GET" "/" "200" "Homepage"
test_endpoint "GET" "/login" "200" "Login page"
test_endpoint "GET" "/register" "200" "Register page"

# Static assets (might return 404 if not found, which is normal)
test_endpoint "GET" "/favicon.ico" "200|404" "Favicon"
test_endpoint "GET" "/robots.txt" "200|404" "Robots.txt"

# Summary
echo "=================================================="
log_info "TEST SUMMARY"
echo "=================================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi