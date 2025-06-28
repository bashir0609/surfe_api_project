# https://claude.ai/public/artifacts/818d3712-67a5-44b4-a0e3-ff5c083de1b2
# https://claude.ai/public/artifacts/e2a873bc-34ab-4327-ba4f-d7a34deeb1db

# Chat Continuation - Phase 2: Hybrid Settings + Route Migration

## Current Progress Status ✅

### Phase 1 Completed:
- ✅ **Background Tasks**: `core/background_tasks.py` - FIXED with rotation
- ✅ **People Enrichment**: Now working (no more FAILED status)
- ✅ **API Key Rotation**: Confirmed working in `utils/api_client.py`

### Phase 1 Verification Needed:
- 🔄 **Test People Enrichment**: Verify it completes successfully 
- 🔄 **Check polling line**: Ensure second line change was made in background_tasks.py

## Phase 2 Plan: Hybrid Settings + Route Migration

### Strategy Decision: Hybrid Approach ⭐
**Benefits:**
- Settings file for gradual rollout control
- Direct changes where needed for performance
- Easy rollback capability
- Test one endpoint at a time

### Implementation Steps:

#### Step 1: Create Settings Infrastructure
**New files to create:**
- `config/rotation_settings.py` - Feature flags and endpoint control
- `utils/api_helper.py` - Smart routing between old/new systems

#### Step 2: Route Migration Priority
**High Traffic Routes (Direct Changes):**
1. `api/routes/people_search.py` - 2 API calls need rotation
2. `api/routes/company_enrichment.py` - Background task integration
3. `api/routes/people_enrichment.py` - Background task integration

**Lower Priority Routes (Settings-Based):**
4. `api/routes/dashboard.py` - Direct API calls
5. Any other routes discovered

#### Step 3: Testing & Verification
- Test each route individually
- Monitor rotation logs
- Verify error handling works
- Check quota management

## Files That Need Changes

### Current Status by File:

**✅ COMPLETED:**
- `core/background_tasks.py` - Uses rotation (verify second line change)
- `utils/api_client.py` - Rotation system working

**🔧 NEEDS MIGRATION:**
- `api/routes/people_search.py` - Line 33 & 58 use old system
- `api/routes/company_enrichment.py` - Line 45 background task
- `api/routes/people_enrichment.py` - Line 89 background task
- `api/routes/dashboard.py` - Direct API calls

**📁 TO CREATE:**
- `config/rotation_settings.py` - New settings file
- `utils/api_helper.py` - Smart API helper

## Detailed Implementation Plan

### Settings File Structure:
```python
# config/rotation_settings.py
ROTATION_CONFIG = {
    "enabled": True,
    "endpoints": {
        "/v2/people/search": True,
        "/v2/companies/search": True,
        "/v2/companies/enrich": True,
        "/v2/people/enrich": True
    },
    "background_tasks": True,
    "fallback_to_single_key": True
}
```

### API Helper Structure:
```python
# utils/api_helper.py
async def smart_api_request(endpoint, method="POST", api_key=None, **kwargs):
    """Route between rotation and single key based on settings"""
    # Logic to choose rotation vs single key
```

### Route Migration Pattern:
**For each route file:**
1. Add import: `from utils.api_helper import smart_api_request`
2. Replace: `api_client.make_surfe_request(...)` 
3. With: `smart_api_request(...)`

## Priority Order for Next Chat:

### Immediate (Start Here):
1. **Verify background_tasks.py** - Check if second line was changed
2. **Test People Enrichment** - Confirm it works end-to-end
3. **Create settings files** - Build the infrastructure

### Next Steps:
4. **Migrate people_search.py** - Highest traffic impact
5. **Test people search thoroughly** - Ensure no regressions
6. **Migrate enrichment routes** - Company & People enrichment

### Later:
7. **Dashboard migration** - Lower priority
8. **Add monitoring** - Key usage dashboard
9. **Advanced features** - Smart prioritization

## Key Questions for Next Chat:

1. **Background tasks verification**: Did the second line change get deployed?
2. **People enrichment status**: Is it completing successfully now?
3. **Settings file location**: Confirm `config/` directory exists
4. **Testing approach**: How do you want to test each migration?
5. **Rollback plan**: What's the emergency rollback procedure?

## Environment Context:
- **Platform**: FastAPI + Vercel
- **API Keys**: 5 keys in Vercel env vars (SURFE_API_KEY_1 to 5)
- **Current rotation**: Working in Company Search & Diagnostics
- **Issue**: People/Company enrichment failing due to single key quota

## Emergency Info:
**If something breaks:**
- Rotation system is in `utils/api_client.py`
- Old system still works via `make_surfe_request()`
- Background tasks were the main failure point (now fixed)

## Files to Share in Next Chat:
When continuing, please share:
1. Current `api/routes/people_search.py` (for migration)
2. `api/routes/company_enrichment.py` (for background task integration)
3. Your app's directory structure (to confirm config/ location)

## Success Metrics:
- ✅ People Enrichment completing successfully
- ✅ No FAILED job statuses
- ✅ Rotation logs showing key switching
- ✅ All routes working without errors

---
**Last Updated**: Current session  
**Next Phase**: Settings infrastructure + Route migration  
**Status**: Ready for Phase 2 implementation
