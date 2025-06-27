from fastapi import APIRouter, Depends, HTTPException
from api.models import requests as req_models, responses as res_models
from core.dependencies import get_api_key
# UPDATED: Import the new surfe_client with rotation instead of old api_client
from utils.api_client import surfe_client
import json
from typing import Any
import logging

print("Loading company_search.py with API rotation") # DEBUG PRINT

# router = APIRouter(prefix="/api/v1/companies", tags=["Company"])
router = APIRouter(prefix="/api/v2/companies", tags=["Company"])

def safe_get_error_message(error_detail: Any) -> str:
    """
    Safely extract error message from various error detail formats
    """
    if isinstance(error_detail, dict):
        return error_detail.get("message", json.dumps(error_detail))
    elif isinstance(error_detail, str):
        return error_detail
    elif isinstance(error_detail, list):
        return "; ".join(str(item) for item in error_detail)
    else:
        return str(error_detail)

@router.post("/search", response_model=res_models.GenericResponse)
async def search_companies(request: req_models.CompanySearchRequest, api_key: str = Depends(get_api_key)):
    """
    Search for companies using Surfe API v2 with enhanced API rotation and flexible filtering
    """

    api_payload = None
    
    try:
        filters = request.filters
        
        # Convert the request to match Surfe v2 API format
        api_payload = {
            "filters": {},
            "limit": request.limit,
            "pageToken": request.pageToken
        }
        
        # Add filters that are present
        if filters.countries:
            api_payload["filters"]["countries"] = filters.countries
            
        if filters.domains:
            api_payload["filters"]["domains"] = filters.domains
            
        if filters.domainsExcluded:
            api_payload["filters"]["domainsExcluded"] = filters.domainsExcluded
            
        if filters.industries:
            api_payload["filters"]["industries"] = filters.industries
            
        if filters.employeeCount:
            api_payload["filters"]["employeeCount"] = {
                "from": filters.employeeCount.from_,
                "to": filters.employeeCount.to
            }
            
        if filters.revenue:
            api_payload["filters"]["revenue"] = {
                "from": filters.revenue.from_,
                "to": filters.revenue.to
            }
        
        # Ensure we have at least one filter
        if not api_payload["filters"]:
            raise HTTPException(
                status_code=400,
                detail={"error": "At least one filter is required for a search."}
            )

        # Debug logging
        print(f"🔍 Sending to Surfe API: {json.dumps(api_payload, indent=2)}")

        # UPDATED: Use the enhanced API client with rotation
        result = await surfe_client.make_request_with_rotation(
            "POST", 
            "/v2/companies/search", 
            json_data=api_payload,
            timeout=20,        # Reduced timeout
            max_retries=3,     # Fewer retries (instead of 5)
            retry_delay=0.5    # Faster retries
        )

        # Enhanced logging to see what happened
        print(f"📡 API Response received:")
        print(f"   Status Code: {result.get('status_code', 'No status code')}")
        print(f"   Has Error: {'error' in result}")
        print(f"   API Key Used: {surfe_client.get_last_api_key_masked()}")
        
        # Log response size instead of full response if it's large
        if len(str(result)) < 1000:
            print(f"   Full Response: {json.dumps(result, indent=2)}")
        else:
            print(f"   Response Keys: {list(result.keys())}")
            print(f"   Response Size: {len(str(result))} characters")

        # Check if the API returned an error
        if "error" in result:
            error_detail = result.get("error", "Unknown API error")
            status_code = result.get("status_code", 500)
            error_message = safe_get_error_message(error_detail)
            
            # Enhanced error response with rotation info
            raise HTTPException(
                status_code=status_code, 
                detail={
                    "error": f"Surfe API Error: {error_message}", 
                    "details": error_detail,
                    "status_code": status_code,
                    "api_key_used": surfe_client.get_last_api_key_masked(),
                    "rotation_info": {
                        "total_keys_available": len(surfe_client._key_manager.keys),
                        "keys_currently_available": len([k for k in surfe_client._key_manager.keys if not k.is_temporarily_disabled])
                    }
                }
            )

        # Return successful result with metadata
        return {
            "success": True, 
            "data": result,
            "metadata": {
                "api_key_used": surfe_client.get_last_api_key_masked(),
                "request_id": result.get("requestId", "unknown"),
                "total_results": result.get("totalCount", "unknown")
            }
        }

    except HTTPException as e:
        # Re-raise HTTPExceptions to let FastAPI handle them properly
        raise e
        
    except Exception as e:
        # Enhanced error logging with rotation info
        print(f"--- UNHANDLED EXCEPTION IN search_companies ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")
        print(f"Request data: {request.model_dump()}")
        print(f"API payload: {json.dumps(api_payload, indent=2) if api_payload else 'Not created'}")
        print(f"API Key used: {surfe_client.get_last_api_key_masked()}")
        
        # Get current API client statistics for debugging
        try:
            client_stats = surfe_client.get_stats()
            print(f"API Client Stats: {json.dumps(client_stats, indent=2)}")
        except:
            print("Could not retrieve API client statistics")
        
        print(f"---------------------------------------------")
        
        # Return enhanced error response
        raise HTTPException(
            status_code=500,
            detail={
                "error": "A critical server error occurred while processing your request.", 
                "exception": str(e),
                "type": type(e).__name__,
                "api_key_used": surfe_client.get_last_api_key_masked(),
                "suggestion": "Check the API diagnostics page for detailed troubleshooting"
            }
        )

# Optional: Add a status endpoint to check API rotation health
@router.get("/api-status", response_model=res_models.GenericResponse)
async def get_company_search_status(api_key: str = Depends(get_api_key)):
    """
    Get the current status of the API rotation system for company search
    """
    try:
        stats = surfe_client.get_stats()
        return {
            "success": True,
            "data": {
                "rotation_system": "active",
                "statistics": stats,
                "last_key_used": surfe_client.get_last_api_key_masked(),
                "endpoint_being_used": "/v2/companies/search"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to get API status: {str(e)}"
        }
    

logging.getLogger('utils.api_client').setLevel(logging.ERROR)