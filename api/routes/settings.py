from fastapi import APIRouter, HTTPException
from utils.api_client import surfe_client, api_key_manager, SURFE_API_KEYS
import logging
from typing import Dict, Any
import os

router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])
logger = logging.getLogger(__name__)

@router.post("/select-key")
async def select_api_key(data: Dict[str, str]):
    """Select a specific API key to use"""
    try:
        masked_key = data.get("masked_key")
        if not masked_key:
            raise HTTPException(status_code=400, detail="No key provided")

        # Find the actual key from the masked version
        actual_key = None
        for key_info in api_key_manager.keys:
            if f"...{key_info.key[-5:]}" == masked_key:
                actual_key = key_info.key
                break

        if not actual_key:
            raise HTTPException(status_code=404, detail="Key not found")

        # Force the client to use this key
        surfe_client._last_api_key_used = actual_key
        
        # Reset the key's disabled status if it was disabled
        for key_info in api_key_manager.keys:
            if key_info.key == actual_key:
                key_info.is_temporarily_disabled = False
                key_info.quota_reset_time = None
                break

        return {
            "success": True,
            "data": {
                "message": "API key selected successfully",
                "masked_key": masked_key
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error selecting API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add-key")
async def add_api_key(data: Dict[str, str]):
    """Add a new API key"""
    try:
        new_key = data.get("api_key")
        if not new_key:
            raise HTTPException(status_code=400, detail="No API key provided")

        # Check if key already exists
        if any(key_info.key == new_key for key_info in api_key_manager.keys):
            raise HTTPException(status_code=400, detail="API key already exists")

        # Add the key to the manager
        api_key_manager.add_key(new_key)

        # Add to SURFE_API_KEYS list if not present
        if new_key not in SURFE_API_KEYS:
            SURFE_API_KEYS.append(new_key)

        return {
            "success": True,
            "data": {
                "message": "API key added successfully",
                "masked_key": f"...{new_key[-5:]}"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remove-key")
async def remove_api_key(data: Dict[str, str]):
    """Remove an API key"""
    try:
        masked_key = data.get("masked_key")
        if not masked_key:
            raise HTTPException(status_code=400, detail="No key provided")

        # Find and remove the key
        key_to_remove = None
        for key_info in api_key_manager.keys:
            if f"...{key_info.key[-5:]}" == masked_key:
                key_to_remove = key_info
                break

        if not key_to_remove:
            raise HTTPException(status_code=404, detail="Key not found")

        # Remove from manager
        api_key_manager.keys.remove(key_to_remove)

        # Remove from SURFE_API_KEYS list
        if key_to_remove.key in SURFE_API_KEYS:
            SURFE_API_KEYS.remove(key_to_remove.key)

        return {
            "success": True,
            "data": {
                "message": "API key removed successfully",
                "masked_key": masked_key
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current-key")
async def get_current_key():
    """Get the currently selected API key"""
    try:
        current_key = surfe_client.get_last_api_key_masked()
        return {
            "success": True,
            "data": {
                "current_key": current_key
            }
        }
    except Exception as e:
        logger.error(f"Error getting current key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list-keys")
async def list_api_keys():
    """Get list of all API keys with their status"""
    try:
        stats = surfe_client.get_stats()
        return {
            "success": True,
            "data": {
                "current_key": surfe_client.get_last_api_key_masked(),
                "keys": stats["key_details"]
            }
        }
    except Exception as e:
        logger.error(f"Error listing API keys: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
