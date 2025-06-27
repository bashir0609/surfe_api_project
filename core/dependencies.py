import json
import random
from fastapi import Header, HTTPException

print("Loading dependencies.py") # DEBUG PRINT

def get_api_key() -> str:
    """
    Dependency that provides an active Surfe API key.
    It now leverages the key management logic from utils.api_client.
    """
    key_info = surfe_client._key_manager.get_next_available_key()
    
    if not key_info:
        logger.error("No active Surfe API keys are available or all are temporarily disabled.")
        raise HTTPException(status_code=500, detail="No active Surfe API keys available for use.")
    
    # Mark the key as used (this will be further managed by make_request_with_rotation)
    # The _key_manager.get_next_available_key() already marks it as used and increments total_requests.
    
    return key_info.key
