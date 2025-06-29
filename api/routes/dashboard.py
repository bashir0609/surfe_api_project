from fastapi import APIRouter, Depends
from api.models import responses as res_models
from core.dependencies import get_api_key
from core import job_manager
import logging
from datetime import datetime, timedelta
import json
import os

# Import the Redis client library
import redis
# from redis.commands.json.path import Path # Uncomment if you need advanced JSON path operations

from utils.api_client import surfe_client

print("Loading dashboard.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

# Create the router
router = APIRouter(prefix="/api", tags=["Dashboard"])

# --- Vercel KV / Redis Connection Setup ---
# Retrieve the Redis URL from environment variables.
# Vercel KV typically exposes this as KV_URL or REDIS_URL.
REDIS_URL = os.getenv("KV_URL") 
# You might want to add a fallback or raise an error if REDIS_URL is not set
# if not REDIS_URL:
#     logger.error("KV_URL environment variable is not set. Vercel KV connection will fail.")

redis_client = None
if REDIS_URL:
    try:
        # Initialize Redis client. decode_responses=True ensures strings are returned instead of bytes.
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        # Ping the server to test the connection immediately
        redis_client.ping()
        logger.info("Successfully connected to Vercel KV (Redis).")
    except Exception as e:
        logger.error(f"Failed to connect to Vercel KV (Redis): {e}")
else:
    logger.warning("KV_URL environment variable not found. Dashboard stats will NOT be persistent.")


# Key for storing the dashboard statistics in Vercel KV
DASHBOARD_STATS_KEY = "surfe_dashboard_stats"

def load_stats():
    """
    Loads dashboard statistics from Vercel KV.
    If KV is not connected, data is not found, or an error occurs,
    it returns default (zeroed) statistics.
    """
    if redis_client:
        try:
            # Attempt to retrieve the JSON string from KV
            stats_json = redis_client.get(DASHBOARD_STATS_KEY)
            if stats_json:
                # If data exists, parse it from JSON string to Python dictionary
                return json.loads(stats_json)
        except Exception as e:
            logger.error(f"Error loading stats from Vercel KV: {e}")
    
    # Default stats - used if KV connection fails, key not found, or any other error
    logger.info("Returning default dashboard stats (KV not available or data not found).")
    return {
        "companies_found": 0,
        "people_enriched": 0,
        "searches_performed": 0,
        "total_jobs": 0,
        "successful_jobs": 0,
        "failed_jobs": 0,
        "recent_activity": [],
        "last_updated": datetime.now().isoformat()
    }

def save_stats(stats):
    """
    Saves dashboard statistics to Vercel KV.
    Updates the 'last_updated' timestamp before saving.
    """
    if redis_client:
        try:
            stats["last_updated"] = datetime.now().isoformat()
            # Convert the Python dictionary to a JSON string and store it in KV
            redis_client.set(DASHBOARD_STATS_KEY, json.dumps(stats))
        except Exception as e:
            logger.error(f"Error saving stats to Vercel KV: {e}")
    else:
        logger.warning("Cannot save stats: Vercel KV (Redis) client not initialized.")

def add_activity(activity_type, description, details=None):
    """
    Adds an activity to the recent activity list and updates overall stats.
    This function now uses the KV-aware load_stats and save_stats.
    """
    stats = load_stats() # Load current stats from KV
    
    activity = {
        "type": activity_type,
        "description": description,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    # Ensure recent_activity is a list before inserting
    if "recent_activity" not in stats or not isinstance(stats["recent_activity"], list):
        stats["recent_activity"] = []

    stats["recent_activity"].insert(0, activity)
    
    # Keep only the latest 10 activities
    stats["recent_activity"] = stats["recent_activity"][:10]
    
    save_stats(stats) # Save updated stats to KV

@router.get("/dashboard/stats", response_model=res_models.GenericResponse)
async def get_dashboard_stats(api_key: str = Depends(get_api_key)):
    """
    Retrieves and returns dashboard statistics.
    FIXED: Better error handling and removed problematic API call.
    """
    try:
        stats = load_stats() # Loads stats from KV

        # Calculate success rate
        total_jobs = stats.get("total_jobs", 0)
        successful_jobs = stats.get("successful_jobs", 0)

        if total_jobs > 0:
            success_rate = round((successful_jobs / total_jobs) * 100)
        else:
            success_rate = 100  # Default when no jobs yet

        # Get current job manager status (assuming job_manager is still in-memory for current request)
        current_jobs = len(job_manager.jobs) if hasattr(job_manager, 'jobs') else 0

        # FIXED: Get active API key without making external API call
        active_api_key = "N/A"
        try:
            # Import here to avoid circular imports
            from utils.api_client import surfe_client
            active_api_key = surfe_client.get_last_api_key_masked()
            if active_api_key == "N/A (No API Key Used Yet)":
                # If no key has been used yet, just show that we have keys available
                if hasattr(surfe_client, '_key_manager') and surfe_client._key_manager.keys:
                    available_count = len([k for k in surfe_client._key_manager.keys if not k.is_temporarily_disabled])
                    active_api_key = f"{available_count} keys available"
                else:
                    active_api_key = "Not configured"
        except Exception as api_error:
            logger.warning(f"Could not get active API key: {api_error}")
            active_api_key = "Error getting key info"

        return {
            "success": True,
            "data": {
                "companies_found": stats.get("companies_found", 0),
                "people_enriched": stats.get("people_enriched", 0),
                "success_rate": success_rate,
                "current_jobs": current_jobs,
                "total_jobs": total_jobs,
                "recent_activity": stats.get("recent_activity", [])[:5],
                "last_updated": stats.get("last_updated"),
                "active_api_key": active_api_key
            }
        }

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        # FIXED: Return error response instead of fake success
        return {
            "success": False,
            "error": f"Failed to load dashboard stats: {str(e)}",
            "data": {
                "companies_found": 0,
                "people_enriched": 0,
                "success_rate": 0,
                "current_jobs": 0,
                "total_jobs": 0,
                "recent_activity": [],
                "active_api_key": "Error"
            }
        }

# dashboard.py - Updated for Option A activities without API key dependency
@router.post("/dashboard/activity")
async def log_activity(activity_data: dict):
    """
    Logs an activity and updates dashboard statistics for Option A activities.
    No API key needed - uses rotation system automatically.
    """
    try:
        activity_type = activity_data.get("activity_type", "")
        description = activity_data.get("description", "")
        count = activity_data.get("count", 1)
        
        stats = load_stats() # Load current stats from KV
        
        # Update counters for Option A: Search & Enrichment Activities
        if activity_type == "company_search":
            stats["company_searches"] = stats.get("company_searches", 0) + 1
            stats["companies_found"] = stats.get("companies_found", 0) + count  # Keep for backward compatibility
            
        elif activity_type == "people_search":
            stats["people_searches"] = stats.get("people_searches", 0) + 1
            
        elif activity_type == "company_enrichment":
            stats["company_enrichments"] = stats.get("company_enrichments", 0) + 1
            
        elif activity_type == "people_enrichment":
            stats["people_enrichments"] = stats.get("people_enrichments", 0) + 1
            stats["people_enriched"] = stats.get("people_enriched", 0) + count  # Keep for backward compatibility
            
        # Keep existing job tracking for other systems
        elif activity_type == "job_completed":
            stats["total_jobs"] = stats.get("total_jobs", 0) + 1
            stats["successful_jobs"] = stats.get("successful_jobs", 0) + 1
            
        elif activity_type == "job_failed":
            stats["total_jobs"] = stats.get("total_jobs", 0) + 1
            stats["failed_jobs"] = stats.get("failed_jobs", 0) + 1
        
        # Add to recent activity
        add_activity(activity_type, description, {"count": count})
        
        # Save updated stats to KV
        save_stats(stats)
        
        return {"success": True, "data": {"message": "Activity logged successfully"}}
        
    except Exception as e:
        logger.error(f"Error logging activity: {e}")
        return {"success": False, "data": {"error": str(e)}}

@router.post("/dashboard/reset")
async def reset_dashboard_stats(api_key: str = Depends(get_api_key)):
    """
    Resets all dashboard statistics to their default values in Vercel KV.
    """
    try:
        default_stats = {
            "companies_found": 0,
            "people_enriched": 0,
            "searches_performed": 0,
            "total_jobs": 0,
            "successful_jobs": 0,
            "failed_jobs": 0,
            "recent_activity": [],
            "last_updated": datetime.now().isoformat()
        }
        
        save_stats(default_stats) # Save default stats to KV
        
        return {"success": True, "data": {"message": "Dashboard stats reset successfully"}}
        
    except Exception as e:
        logger.error(f"Error resetting stats: {e}")
        return {"success": False, "data": {"error": str(e)}}
