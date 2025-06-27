# https://claude.ai/public/artifacts/818d3712-67a5-44b4-a0e3-ff5c083de1b2

# Chat Continuation - Surfe API Key Rotation Overhaul

## Project Context
**Repository**: surfe_api_project (FastAPI + Vercel deployment)  
**Issue**: API key rotation system not working consistently across all pages  
**Decision**: Comprehensive overhaul for better long-term solution  

## Current Project Status

### ✅ What's Working
- CSS loading issue FIXED (main.py update resolved static file serving)
- Company Search page uses rotation system correctly
- Diagnostics page uses rotation system correctly
- Basic rotation logic exists in `utils/api_client.py`

### ❌ What's Broken
- **Company Enrichment**: Uses old `api_client.make_surfe_request()` (no rotation)
- **People Search**: Uses old `api_client.make_surfe_request()` (no rotation)
- **People Enrichment**: Uses old `api_client.make_surfe_request()` (no rotation)
- **Background tasks**: Enrichment tasks bypass rotation system
- **Dashboard**: Makes direct API calls without rotation

### 🔧 Root Cause
Two conflicting API client systems exist:
- **NEW (with rotation)**: `surfe_client.make_request_with_rotation()`
- **OLD (single key)**: `make_surfe_request()`

Most pages still use the old system!

## Comprehensive Overhaul Plan

### Phase 1: Core API Client Refactoring ⭐ START HERE
**Files to modify:**
- `utils/api_client.py` - Unify API systems, remove old functions
- `core/dependencies.py` - Clean up API key dependencies
- `core/background_tasks.py` - Make rotation-aware

**Goals:**
- Single unified API client with rotation
- Better quota detection and error handling
- Async optimization throughout

### Phase 2: Backend Route Modernization
**Files to update:**
- `api/routes/company_enrichment.py` - Switch to rotation system
- `api/routes/people_search.py` - Switch to rotation system  
- `api/routes/people_enrichment.py` - Switch to rotation system
- `api/routes/dashboard.py` - Switch to rotation system

**Goals:**
- All routes use unified rotation system
- Consistent error responses
- Background tasks support rotation

### Phase 3: Frontend Integration Layer
**Files to create/update:**
- `static/js/api-client.js` - Unified frontend API client
- `static/js/rotation-monitor.js` - Real-time key status
- Update all page JS files for better error handling

**Goals:**
- Frontend awareness of rotation status
- Graceful error handling
- Real-time user feedback

### Phase 4: Dashboard & Monitoring
**Features to add:**
- Real-time API key status display
- Usage analytics per endpoint
- Manual key management controls
- Overall API health monitoring

### Phase 5: Advanced Features
- Smart key prioritization
- Endpoint-specific routing
- Rate limit prediction
- Automated key discovery

## Technical Implementation Details

### Current API Key Loading
```python
# From utils/api_client.py
SURFE_API_KEYS = [
    SURFE_API_KEY_1, SURFE_API_KEY_2, SURFE_API_KEY_3, 
    SURFE_API_KEY_4, SURFE_API_KEY_5
]
```

### Current Rotation System (working)
```python
# In utils/api_client.py
surfe_client = SurfeClient()
result = await surfe_client.make_request_with_rotation(
    "POST", "/v2/companies/search", json_data=payload
)
```

### Files Using OLD System (need migration)
1. `api/routes/people_search.py:73` - `await api_client.make_surfe_request(...)`
2. `api/routes/company_enrichment.py:45` - Background task uses old system
3. `api/routes/people_enrichment.py:89` - Background task uses old system
4. `core/background_tasks.py:15` - `await api_client.make_surfe_request(...)`

## Implementation Priority

### 🚨 Critical (Fix First)
1. **Background tasks rotation** - Enrichment jobs failing silently
2. **People Search migration** - High-traffic endpoint
3. **Error propagation** - Users don't see rotation failures

### 🔧 Important (Fix Second)  
1. **Dashboard monitoring** - Visibility into key health
2. **Frontend error handling** - Better user experience
3. **Unified error responses** - Consistent API behavior

### 🎯 Nice-to-Have (Later)
1. **Smart prioritization** - Use best keys first
2. **Predictive rotation** - Switch before limits hit
3. **Advanced monitoring** - Request rates, success metrics

## Key Questions to Address

1. **Error Handling Strategy**: Fail fast vs aggressive retry?
2. **Monitoring Level**: Basic status vs detailed analytics?
3. **Implementation Order**: Backend-first vs full-stack approach?
4. **Backward Compatibility**: Maintain existing interfaces during migration?

## Files to Review in New Chat

If continuing in a new chat, ask Claude to examine these key files:
- `utils/api_client.py` (current rotation implementation)
- `api/routes/company_search.py` (working rotation example)
- `api/routes/people_search.py` (needs rotation migration)
- `core/background_tasks.py` (needs rotation migration)
- `static/js/shared.js` (frontend API client)

## Environment Variables
```bash
SURFE_API_KEY_1=...
SURFE_API_KEY_2=...
SURFE_API_KEY_3=...
SURFE_API_KEY_4=...
SURFE_API_KEY_5=...
KV_URL=... (for dashboard stats)
```

## Quick Start Commands
```bash
# Test current rotation
python test_company_search.py

# Debug API key status  
curl https://your-app.vercel.app/debug/static

# Check which routes work
curl https://your-app.vercel.app/debug/routes
```

## Next Steps for New Chat
1. **Confirm the plan**: Review this continuation doc
2. **Start Phase 1**: Migrate background_tasks.py to use rotation
3. **Test thoroughly**: Ensure enrichment jobs work with rotation
4. **Move to Phase 2**: Migrate remaining route files
5. **Add monitoring**: Dashboard integration for key status

---
**Last Updated**: Current chat session  
**Status**: Ready to begin comprehensive overhaul  
**Priority**: Start with background tasks and route migration
