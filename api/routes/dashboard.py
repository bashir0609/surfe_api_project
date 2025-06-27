from fastapi import APIRouter, Depends
from api.models import responses as res_models
from core.dependencies import get_api_key
from core import job_manager
import logging
from datetime import datetime, timedelta
import json
import os
from utils.api_client import surfe_client

print("Loading dashboard.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

# Create the router
router = APIRouter(prefix="/api", tags=["Dashboard"])

# Simple in-memory storage for demo (in production, use a database)
STATS_FILE = "dashboard_stats.json"

def load_stats():
    """Load stats from file"""
    try:
        if os.path.exists(STATS_FILE):
            with open(STATS_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading stats: {e}")
    
    # Default stats
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
    """Save stats to file"""
    try:
        stats["last_updated"] = datetime.now().isoformat()
        with open(STATS_FILE, 'w') as f:
            json.dump(stats, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving stats: {e}")

def add_activity(activity_type, description, details=None):
    """Add an activity to recent activity"""
    stats = load_stats()
    
    activity = {
        "type": activity_type,
        "description": description,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    stats["recent_activity"].insert(0, activity)
    
    # Keep only last 10 activities
    stats["recent_activity"] = stats["recent_activity"][:10]
    
    save_stats(stats)

@router.get("/dashboard/stats", response_model=res_models.GenericResponse)
async def get_dashboard_stats(api_key: str = Depends(get_api_key)):
    """Get dashboard statistics"""
    try:
        stats = load_stats()

        # Calculate success rate
        total_jobs = stats.get("total_jobs", 0)
        successful_jobs = stats.get("successful_jobs", 0)

        if total_jobs > 0:
            success_rate = round((successful_jobs / total_jobs) * 100)
        else:
            success_rate = 100  # Default when no jobs yet

        # Get current job manager status
        current_jobs = len(job_manager.jobs) if hasattr(job_manager, 'jobs') else 0

        # --- ADD THIS NEW BLOCK HERE ---
        # This will force surfe_client.make_request_with_rotation to run,
        # ensuring _last_api_key_used is populated.
        # We use a very lightweight API call (e.g., companies search with limit 1 and no specific filters)
        # or a diagnostics endpoint if Surfe API has one.
        try:
            await surfe_client.make_request_with_rotation(
                "POST",
                "/v2/companies/search", # Use a known valid, lightweight endpoint
                json_data={"filters": {}, "limit": 1} # Minimal payload
            )
            logger.info("Dashboard stats endpoint successfully triggered API client to use an active_api_key.")
        except Exception as api_call_e:
            logger.warning(f"Dashboard stats endpoint failed to trigger API client for active_api_key: {api_call_e}")
            # This is non-critical for dashboard display, so we just log the warning.
        # --- END NEW BLOCK ---

        # Get the masked active API key from the SurfeClient instance
        # This line should be *after* the new try/except block.
        active_api_key = surfe_client.get_last_api_key_masked()

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
                "active_api_key": active_api_key # This will now be populated
            }
        }

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        # Ensure active_api_key is also included in the error response if possible
        return {
            "success": True, # Still return success to allow dashboard to load, but with default data
            "data": {
                "companies_found": 0,
                "people_enriched": 0,
                "success_rate": 0,
                "current_jobs": 0,
                "total_jobs": 0,
                "recent_activity": [],
                "error": str(e),
                "active_api_key": surfe_client.get_last_api_key_masked() # Reflect state after any (failed) attempt
            }
        }

@router.post("/dashboard/activity")
async def log_activity(
    activity_data: dict,
    api_key: str = Depends(get_api_key)
):
    """Log an activity and update stats"""
    try:
        activity_type = activity_data.get("activity_type", "")
        description = activity_data.get("description", "")
        count = activity_data.get("count", 0)
        
        stats = load_stats()
        
        # Update counters based on activity type
        if activity_type == "company_search":
            stats["companies_found"] = stats.get("companies_found", 0) + count
            stats["searches_performed"] = stats.get("searches_performed", 0) + 1
            
        elif activity_type == "people_search":
            stats["searches_performed"] = stats.get("searches_performed", 0) + 1
            
        elif activity_type == "people_enrichment":
            stats["people_enriched"] = stats.get("people_enriched", 0) + count
            
        elif activity_type == "job_completed":
            stats["total_jobs"] = stats.get("total_jobs", 0) + 1
            stats["successful_jobs"] = stats.get("successful_jobs", 0) + 1
            
        elif activity_type == "job_failed":
            stats["total_jobs"] = stats.get("total_jobs", 0) + 1
            stats["failed_jobs"] = stats.get("failed_jobs", 0) + 1
        
        # Add to recent activity
        add_activity(activity_type, description, {"count": count})
        
        # Save updated stats
        save_stats(stats)
        
        return {"success": True, "data": {"message": "Activity logged successfully"}}
        
    except Exception as e:
        logger.error(f"Error logging activity: {e}")
        return {"success": False, "data": {"error": str(e)}}

@router.post("/dashboard/reset")
async def reset_dashboard_stats(api_key: str = Depends(get_api_key)):
    """Reset all dashboard statistics"""
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
        
        save_stats(default_stats)
        
        return {"success": True, "data": {"message": "Dashboard stats reset successfully"}}
        
    except Exception as e:
        logger.error(f"Error resetting stats: {e}")
        return {"success": False, "data": {"error": str(e)}}