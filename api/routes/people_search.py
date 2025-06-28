# ==============================================================================
# QUICK FIX: Update your existing people_search.py file
# ==============================================================================

# File: api/routes/people_search.py (or wherever your people routes are)

from fastapi import APIRouter, Depends, HTTPException
from api.models import requests as req_models, responses as res_models
from core.dependencies import get_api_key
from utils import api_client
from utils.api_client import surfe_client
import logging

print("Loading people_search.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

# Your existing router - make sure this prefix matches your app setup
router = APIRouter(prefix="/api", tags=["People"])  # Changed from "/api/v1/people" to "/api"

# ADD THIS NEW ENDPOINT (v2)
@router.post("/v2/people/search", response_model=res_models.GenericResponse)
async def search_people_v2(request_data: dict, api_key: str = Depends(get_api_key)):
    """
    Search for people using Surfe API v2 structure
    """
    try:
        logger.info(f"🔍 People Search v2 Request: {request_data}")
        
        # Validate that we have some filters
        has_company_filters = bool(request_data.get("companies"))
        has_people_filters = bool(request_data.get("people"))
        
        if not has_company_filters and not has_people_filters:
            raise HTTPException(
                status_code=400, 
                detail="At least one company or people filter must be provided"
            )
        
        # Make request to Surfe API v2
        result = await surfe_client.make_request_with_rotation(
            "POST", 
            "/v2/people/search", 
            json_data=request_data
        )
        
        if "error" in result:
            error_detail = result.get("details", result.get("error", "An unknown API error occurred."))
            logger.error(f"❌ Surfe API Error: {error_detail}")
            raise HTTPException(status_code=500, detail=error_detail)
        
        logger.info(f"✅ People Search v2 Success: Found {len(result.get('people', []))} people")
        return {"success": True, "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in people search v2: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# UPDATE YOUR EXISTING v1 ENDPOINT (change prefix)
@router.post("/v1/people/search", response_model=res_models.GenericResponse)  # Changed from just "/search"
async def search_people_v1(request: req_models.PeopleSearchRequest, api_key: str = Depends(get_api_key)):
    """
    Your existing v1 endpoint - updated to work with v2 API
    """
    try:
        # Convert v1 format to v2 format
        v2_data = convert_v1_to_v2_dict(request.model_dump())
        
        logger.info(f"🔄 Converting v1 to v2: {request.model_dump()} -> {v2_data}")
        
        # Call the v2 endpoint logic
        result = await surfe_client.make_request_with_rotation(
            "POST", 
            "/v2/people/search",
            json_data=v2_data
        )
        
        if "error" in result:
            error_detail = result.get("details", result.get("error", "An unknown API error occurred."))
            raise HTTPException(status_code=500, detail=error_detail)
        
        return {"success": True, "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in v1 people search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in v1 endpoint: {str(e)}")

def convert_v1_to_v2_dict(v1_data: dict) -> dict:
    """
    Convert v1 request format to v2 format
    """
    v2_data = {
        "companies": {},
        "people": {},
        "limit": v1_data.get("limit", 10),
        "peoplePerCompany": v1_data.get("people_per_company", 1),
        "pageToken": ""
    }
    
    filters = v1_data.get("filters", {})
    
    # Map v1 filters to v2 structure
    if "industries" in filters:
        v2_data["companies"]["industries"] = filters["industries"]
    
    if "seniorities" in filters:
        v2_data["people"]["seniorities"] = filters["seniorities"]
    
    if "locations" in filters:
        v2_data["people"]["countries"] = filters["locations"]
    
    if "job_titles" in filters:
        v2_data["people"]["jobTitles"] = filters["job_titles"]
    
    if "departments" in filters:
        v2_data["people"]["departments"] = filters["departments"]
    
    # Handle other mappings
    if "company_domains" in filters:
        v2_data["companies"]["domains"] = filters["company_domains"]
    
    if "company_names" in filters:
        v2_data["companies"]["names"] = filters["company_names"]
    
    return v2_data

# ==============================================================================
# ALTERNATIVE: If you want to keep your current structure, add this to main.py
# ==============================================================================

# In your main.py file, add this route directly:

# from fastapi import FastAPI
# app = FastAPI()

# @app.post("/api/v2/people/search")
# async def search_people_v2_direct(request_data: dict, api_key: str = Depends(get_api_key)):
#     """Quick fix - add v2 endpoint directly to main app"""
#     try:
#         # Your v2 logic here (same as above)
#         result = await api_client.make_surfe_request(
#             "POST", 
#             "/v2/people/search", 
#             api_key, 
#             json_data=request_data
#         )
#         
#         if "error" in result:
#             raise HTTPException(status_code=500, detail=result["error"])
#         
#         return {"success": True, "data": result}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# ROUTER REGISTRATION FIX
# ==============================================================================

# Make sure in your main.py, you include the router like this:
# from api.routes import people_search
# app.include_router(people_search.router)

# If your router prefix is causing issues, try this in main.py:
# app.include_router(people_search.router, prefix="", tags=["People"])
