# ==============================================================================
# File: core/dependencies.py - FIXED VERSION
# ==============================================================================

import json
import random
from fastapi import Header, HTTPException
import logging

print("Loading dependencies.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

def get_api_key() -> str:
    """
    Dependency that provides an active Surfe API key.
    Now prioritizes the manually selected API key from surfe_client._last_api_key_used.
    Falls back to rotation or environment keys if no manual selection.
    """
    try:
        # Import here to avoid circular imports
        from utils.api_client import SURFE_API_KEYS, api_key_manager, surfe_client
        
        # Use manually selected key if set and available
        last_key = surfe_client.get_last_successful_key()
        if last_key:
            return last_key
        
        if not SURFE_API_KEYS:
            logger.error("No Surfe API keys available in dependencies.")
            raise HTTPException(status_code=500, detail="No Surfe API keys configured.")
        
        # Try to get an available key from the manager
        try:
            key_info = api_key_manager.get_next_available_key()
            if key_info:
                return key_info.key
        except Exception as e:
            logger.warning(f"Key manager failed: {e}. Using fallback method.")
        
        # Fallback: return the first available key
        return SURFE_API_KEYS[0]
        
    except ImportError as e:
        logger.error(f"Failed to import API keys: {e}")
        raise HTTPException(status_code=500, detail="API key configuration error.")
    except Exception as e:
        logger.error(f"Unexpected error in get_api_key: {e}")
        raise HTTPException(status_code=500, detail="Failed to obtain API key.")
