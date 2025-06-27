# ==============================================================================
# File: surfe_api_project/utils/api_client.py - Enhanced API Client with Rotation
# ==============================================================================

import aiohttp
import json
import logging
from typing import Optional, Dict, Any, List, Set
import itertools
import os
import time
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass, field

print("Loading enhanced api_client.py") # DEBUG PRINT

# Configure logging to show INFO and DEBUG messages
logging.basicConfig(level=logging.INFO) # Changed to INFO, will log all below it
logger = logging.getLogger(__name__)


# --- API Key Management ---
@dataclass
class ApiKeyInfo:
    """Tracks information about each API key"""
    key: str
    last_used: Optional[datetime] = None
    quota_reset_time: Optional[datetime] = None
    failed_attempts: int = 0
    is_temporarily_disabled: bool = False
    total_requests: int = 0
    successful_requests: int = 0

@dataclass
class ApiKeyManager:
    """Manages API key rotation and health tracking"""
    keys: List[ApiKeyInfo] = field(default_factory=list)
    current_index: int = 0
    _disabled_keys: Set[str] = field(default_factory=set)
    
    def add_key(self, key: str):
        """Add a new API key to the manager"""
        if not any(k.key == key for k in self.keys):
            self.keys.append(ApiKeyInfo(key=key))
            logger.info(f"Key Manager: Added key ...{key[-5:]}. Total keys: {len(self.keys)}")
    
    def get_next_available_key(self) -> Optional[ApiKeyInfo]:
        """Get the next available API key, skipping disabled ones"""
        if not self.keys:
            logger.warning("Key Manager: No API keys registered.")
            return None
        
        initial_index = self.current_index
        attempts = 0
        while attempts < len(self.keys):
            key_info = self.keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.keys)
            
            logger.debug(f"Key Manager: Checking key ...{key_info.key[-5:]}. Current index: {self.current_index}. Is disabled: {key_info.is_temporarily_disabled}")

            # Check if key is temporarily disabled and if cooldown period has passed
            if key_info.is_temporarily_disabled:
                if key_info.quota_reset_time and datetime.now() > key_info.quota_reset_time:
                    key_info.is_temporarily_disabled = False
                    key_info.quota_reset_time = None
                    logger.info(f"Key Manager: Re-enabled API key ...{key_info.key[-5:]} after cooldown.")
                else:
                    logger.debug(f"Key Manager: Key ...{key_info.key[-5:]} is still disabled. Cooldown until: {key_info.quota_reset_time}")
            
            if not key_info.is_temporarily_disabled:
                key_info.last_used = datetime.now()
                key_info.total_requests += 1
                logger.debug(f"Key Manager: Returning available key ...{key_info.key[-5:]}")
                return key_info
            
            attempts += 1
            if attempts == len(self.keys): # If we've circled back to the start and all are disabled
                logger.warning("Key Manager: All API keys are currently disabled or on cooldown.")
                break # Exit loop
        
        logger.warning("Key Manager: No available keys found after checking all options.")
        return None  # All keys are disabled
    
    def mark_key_quota_exceeded(self, key: str, cooldown_minutes: int = 60):
        """Mark a key as having exceeded quota with cooldown"""
        for key_info in self.keys:
            if key_info.key == key:
                key_info.is_temporarily_disabled = True
                key_info.quota_reset_time = datetime.now() + timedelta(minutes=cooldown_minutes)
                key_info.failed_attempts += 1
                logger.warning(f"Key Manager: Disabled API key ...{key[-5:]} for {cooldown_minutes} minutes due to quota.")
                break
    
    def mark_key_failed(self, key: str):
        """Mark a key as failed (for tracking purposes), and temporarily disable it for a short period."""
        for key_info in self.keys:
            if key_info.key == key:
                key_info.failed_attempts += 1
                key_info.is_temporarily_disabled = True # Temporarily disable for any failure
                key_info.quota_reset_time = datetime.now() + timedelta(minutes=5) # Short 5-min cooldown
                logger.warning(f"Key Manager: Marked API key ...{key[-5:]} as failed and disabled for 5 minutes.")
                break
    
    def mark_key_successful(self, key: str):
        """Mark a key as successful and re-enable it if it was temporarily disabled."""
        for key_info in self.keys:
            if key_info.key == key:
                key_info.successful_requests += 1
                if key_info.is_temporarily_disabled:
                    key_info.is_temporarily_disabled = False
                    key_info.quota_reset_time = None
                    logger.info(f"Key Manager: Re-enabled API key ...{key[-5:]} due to success.")
                break
    
    def get_key_stats(self) -> Dict[str, Dict[str, Any]]:
        """Get statistics for all keys"""
        stats = {}
        for key_info in self.keys:
            masked_key = f"...{key_info.key[-5:]}"
            stats[masked_key] = {
                "total_requests": key_info.total_requests,
                "successful_requests": key_info.successful_requests,
                "failed_attempts": key_info.failed_attempts,
                "success_rate": (key_info.successful_requests / key_info.total_requests * 100) if key_info.total_requests > 0 else 0,
                "is_disabled": key_info.is_temporarily_disabled,
                "last_used": key_info.last_used.isoformat() if key_info.last_used else None,
                "quota_reset_time": key_info.quota_reset_time.isoformat() if key_info.quota_reset_time else None
            }
        return stats

# FIXED: More robust environment variable loading with multiple fallback methods
def load_api_keys():
    """Load API keys from environment variables with multiple fallback methods"""
    keys_found = []
    
    # Method 1: Try numbered environment variables
    ENV_VAR_KEY_NAMES = [f"SURFE_API_KEY_{i}" for i in range(1, 11)]  # Check up to 10 keys
    
    for env_var_name in ENV_VAR_KEY_NAMES:
        api_key_value = os.getenv(env_var_name)
        if api_key_value and api_key_value.strip():
            keys_found.append(api_key_value.strip())
            logger.info(f"Loaded API key from {env_var_name}")
    
    # Method 2: Try single environment variable
    single_key = os.getenv("SURFE_API_KEY")
    if single_key and single_key.strip():
        keys_found.append(single_key.strip())
        logger.info("Loaded API key from SURFE_API_KEY")
    
    # Method 3: Try comma-separated list
    keys_list = os.getenv("SURFE_API_KEYS")
    if keys_list:
        for key in keys_list.split(','):
            key = key.strip()
            if key:
                keys_found.append(key)
        logger.info(f"Loaded {len(keys_list.split(','))} API keys from SURFE_API_KEYS")
    
    # Method 4: Fallback - try to load from JSON file (local development)
    if not keys_found:
        try:
            json_file_path = os.path.join(os.path.dirname(__file__), '..', 'api_keys.json')
            if os.path.exists(json_file_path):
                with open(json_file_path, 'r') as f:
                    keys_data = json.load(f)
                    for key, value in keys_data.items():
                        if key.startswith("surfe_api_key") and isinstance(value, str):
                            keys_found.append(value.strip())
                logger.info(f"Loaded {len(keys_found)} API keys from api_keys.json")
        except Exception as e:
            logger.warning(f"Could not load from api_keys.json: {e}")
    
    # Remove duplicates while preserving order
    unique_keys = []
    for key in keys_found:
        if key not in unique_keys:
            unique_keys.append(key)
    
    return unique_keys

# Load the keys
SURFE_API_KEYS = load_api_keys()

# FIXED: Better error handling - warn instead of crash
if not SURFE_API_KEYS:
    logger.warning(
        "WARNING: No Surfe API keys found. Please set environment variables: "
        "SURFE_API_KEY_1, SURFE_API_KEY_2, etc. or SURFE_API_KEY or SURFE_API_KEYS"
    )
    # Add a dummy key to prevent crashes during development
    SURFE_API_KEYS = ["dummy_key_for_development"]
    logger.warning("Added dummy API key to prevent crashes. Application may not work properly.")
else:
    # Initialize the API key manager with loaded keys
    for key in SURFE_API_KEYS:
        api_key_manager.add_key(key)
    logger.info(f"Successfully loaded {len(SURFE_API_KEYS)} Surfe API keys")

# Import base URL from centralized config
try:
    from config.config import SURFE_API_BASE_URL
except ImportError:
    SURFE_API_BASE_URL = "https://api.surfe.com"

# Moved logger initialization below config import
# logger = logging.getLogger(__name__) # Already initialized globally above

async def make_surfe_request(
    method: str,
    endpoint: str,
    api_key: str,
    json_data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    timeout: int = 30
) -> Dict[str, Any]:
    """
    Handles making requests to the external Surfe API with enhanced error handling and logging.
    """
    url = f"{SURFE_API_BASE_URL}{endpoint}"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Log request details
    logger.info(f"🔍 Making {method} request to: {url}")
    logger.info(f"🔍 Using API key: ...{api_key[-5:]}")
    logger.debug(f"🔍 JSON Data: {json.dumps(json_data, indent=2) if json_data else 'None'}") # Debug level for data
    logger.debug(f"🔍 Params: {params}") # Debug level for params

    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                params=params,
                timeout=aiohttp.ClientTimeout(total=timeout)
            ) as response:

                logger.info(f"🔍 Response Status: {response.status}")
                logger.debug(f"🔍 Response Headers: {dict(response.headers)}") # Debug level for headers

                response_text = await response.text()
                logger.debug(f"🔍 Raw Response: {response_text}") # Debug level for raw response

                if 200 <= response.status < 300:
                    try:
                        result = json.loads(response_text)
                        logger.info("✅ Request successful")
                        return result
                    except json.JSONDecodeError as e:
                        logger.error(f"❌ JSON Decode Error in successful response: {str(e)}. Raw: {response_text}")
                        return {"error": f"Invalid JSON response from Surfe API: {str(e)}", "status_code": response.status}
                else:
                    logger.error(f"❌ HTTP Status Error: {response.status}")
                    try:
                        error_data = json.loads(response_text)
                        logger.error(f"❌ Error Response from Surfe API: {error_data}")
                        return {"error": error_data, "status_code": response.status}
                    except json.JSONDecodeError:
                        logger.error(f"❌ Raw Error Response (non-JSON) from Surfe API: {response_text}")
                        return {"error": response_text, "status_code": response.status}

    except asyncio.TimeoutError:
        logger.error(f"❌ Request timeout after {timeout} seconds")
        return {"error": f"Request timeout after {timeout} seconds", "status_code": 408}
    except aiohttp.ClientError as e:
        logger.error(f"❌ AIOHTTP Client Error (Network/Connection): {str(e)}")
        return {"error": f"Network or client error: {str(e)}", "status_code": 503}
    except Exception as e:
        logger.error(f"❌ Unexpected Error in make_surfe_request: {str(e)}", exc_info=True)
        return {"error": f"An unexpected error occurred in API client: {str(e)}", "status_code": 500}

class SurfeClient:
    """Enhanced Surfe API client with intelligent key rotation and health tracking"""
    
    def __init__(self, key_manager: ApiKeyManager = api_key_manager):
        self._key_manager = key_manager
        self._last_api_key_used: Optional[str] = None
        self._request_count = 0
        
    async def make_request_with_rotation(
            self,
            method: str,
            endpoint: str,
            json_data: Optional[Dict[str, Any]] = None,
            params: Optional[Dict[str, Any]] = None,
            max_retries: Optional[int] = None,
            timeout: int = 30,
            retry_delay: float = 1.0
        ) -> Dict[str, Any]:
            """
            Makes a request to the Surfe API with intelligent key rotation and exponential backoff.
            """
            if max_retries is None:
                max_retries = len(self._key_manager.keys) * 2
                
            if not self._key_manager.keys:
                logger.critical("No API keys are available for making requests.")
                return {"error": "No API keys loaded to make request.", "status_code": 500}

            self._request_count += 1
            
            for attempt in range(max_retries):
                key_info = self._key_manager.get_next_available_key()
                
                if not key_info:
                    logger.warning(f"Rotation: All API keys are temporarily disabled. Attempt {attempt + 1}/{max_retries}. Waiting before retrying...")
                    await asyncio.sleep(retry_delay * (2 ** min(attempt, 5)))  # Exponential backoff, max 32s
                    continue
                    
                self._last_api_key_used = key_info.key
                logger.info(f"Rotation: Attempt {attempt + 1}/{max_retries}: Using key ...{key_info.key[-5:]} for {endpoint}")

                response_data = await make_surfe_request(
                    method=method,
                    endpoint=endpoint,
                    api_key=key_info.key,
                    json_data=json_data,
                    params=params,
                    timeout=timeout
                )

                status_code = response_data.get("status_code")
                error_info = response_data.get("error")

                # FIXED: Better success detection
                # Check if response has status_code first, then check for actual data
                if status_code is not None:
                    # Handle successful responses (200-299)
                    if 200 <= status_code < 300:
                        self._key_manager.mark_key_successful(key_info.key)
                        logger.info(f"Rotation: ✅ Request successful with key ...{key_info.key[-5:]}. Status: {status_code}")
                        return response_data
                    # Handle specific errors that should disable keys
                    elif status_code == 401: # Unauthorized - definitely a bad key
                        logger.error(f"Rotation: ❌ Unauthorized (401) for key ...{key_info.key[-5:]}. Disabling key permanently.")
                        # Mark as permanently disabled by setting very long cooldown
                        self._key_manager.mark_key_quota_exceeded(key_info.key, cooldown_minutes=99999) 
                        return response_data # Return immediately, this key is useless
                    elif status_code == 403:
                        if self._is_quota_exceeded_error(error_info):
                            logger.warning(f"Rotation: Quota exceeded (403) for key ...{key_info.key[-5:]}. Rotating to next key.")
                            self._key_manager.mark_key_quota_exceeded(key_info.key, cooldown_minutes=60) # Keep 60 min cooldown for 403
                            await asyncio.sleep(retry_delay)  # Brief pause before trying next key
                            continue
                        else:
                            logger.error(f"Rotation: 403 Forbidden (not quota-related) from Surfe API for key ...{key_info.key[-5:]}: {error_info}. Marking failed.")
                            self._key_manager.mark_key_failed(key_info.key) # Mark failed for a short cooldown
                            return response_data # Might return the error
                    # Handle server errors (5xx)
                    elif status_code in [500, 502, 503, 504]:
                        logger.warning(f"Rotation: Server error ({status_code}) from Surfe API with key ...{key_info.key[-5:]}. Retrying with backoff.")
                        self._key_manager.mark_key_failed(key_info.key) # Mark failed for short cooldown
                        await asyncio.sleep(retry_delay * (2 ** min(attempt, 3)))  # Exponential backoff for server errors
                        continue
                    # Handle rate limiting (429)
                    elif status_code == 429:
                        logger.warning(f"Rotation: Rate limited (429) from Surfe API for key ...{key_info.key[-5:]}. Implementing backoff strategy.")
                        self._key_manager.mark_key_quota_exceeded(key_info.key, cooldown_minutes=5)  # Shorter cooldown for rate limiting
                        await asyncio.sleep(retry_delay * (2 ** min(attempt, 4)))
                        continue
                    # Handle other client errors (400, 404, etc.)
                    else:
                        logger.error(f"Rotation: Non-retryable error ({status_code}) from Surfe API for key ...{key_info.key[-5:]}: {error_info}. Marking failed.")
                        self._key_manager.mark_key_failed(key_info.key) # Mark failed for short cooldown
                        return response_data
                else: # No status code - means underlying request error
                    # If response_data has actual business data (not just error), it's successful
                    if not error_info and self._has_business_data(response_data):
                        self._key_manager.mark_key_successful(key_info.key)
                        logger.info(f"Rotation: ✅ Request successful with key ...{key_info.key[-5:]} (no status code, but has data).")
                        return response_data
                    else:
                        # No status code and no business data = error
                        logger.error(f"Rotation: Request failed with no status code for key ...{key_info.key[-5:]}: {error_info}. Marking failed.")
                        self._key_manager.mark_key_failed(key_info.key) # Mark failed for short cooldown
                        return response_data

            # All retries exhausted
            logger.error(f"Rotation: Failed to complete API request after {max_retries} attempts. All keys might be disabled.")
            return {"error": "All API keys failed or max retries reached.", "status_code": 500}

    def _has_business_data(self, response_data: Dict[str, Any]) -> bool:
        """Check if response contains actual business data (indicates success)"""
        if not isinstance(response_data, dict):
            return False
        
        # Check for common Surfe API success indicators
        success_indicators = [
            "companies",      # Company search results
            "people",         # People search results
            "data",           # General data response
            "results",        # Generic results
            "filters",        # Filter response
            "companyDomains", # Company domains
            "totalCount",     # Count of results
            "nextPageToken"   # Pagination token
        ]
        
        return any(key in response_data for key in success_indicators)

    def _is_quota_exceeded_error(self, error_info: Any) -> bool:
        """Check if the error indicates quota exceeded"""
        if isinstance(error_info, dict):
            message = str(error_info.get("message", "")).lower()
            return any(keyword in message for keyword in [
                "quota", "limit", "exceeded", "rate", "throttle", "usage"
            ])
        elif isinstance(error_info, str):
            return any(keyword in error_info.lower() for keyword in [
                "quota", "limit", "exceeded", "rate", "throttle", "usage"
            ])
        return False

    def get_last_api_key_masked(self) -> str:
        """Returns a masked version of the last API key used."""
        if self._last_api_key_used:
            return f"...{self._last_api_key_used[-5:]}"
        return "N/A (No API Key Used Yet)"

    def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics about API usage"""
        key_stats = self._key_manager.get_key_stats()
        total_requests = sum(stats["total_requests"] for stats in key_stats.values())
        successful_requests = sum(stats["successful_requests"] for stats in key_stats.values())
        
        return {
            "total_client_requests": self._request_count,
            "total_api_requests": total_requests,
            "successful_requests": successful_requests,
            "overall_success_rate": (successful_requests / total_requests * 100) if total_requests > 0 else 0,
            "available_keys": len([k for k in self._key_manager.keys if not k.is_temporarily_disabled]),
            "disabled_keys": len([k for k in self._key_manager.keys if k.is_temporarily_disabled]),
            "last_key_used": self.get_last_api_key_masked(),
            "key_details": key_stats
        }

    def reset_key_cooldowns(self):
        """Manually reset all key cooldowns (for testing or emergency use)"""
        for key_info in self._key_manager.keys:
            key_info.is_temporarily_disabled = False
            key_info.quota_reset_time = None
        logger.info("All API key cooldowns have been reset.")

    async def health_check(self, endpoint: str = "/health") -> Dict[str, Any]:
        """Perform a health check using available keys"""
        results = []
        for key_info in self._key_manager.keys:
            if not key_info.is_temporarily_disabled:
                # Use a specific health check endpoint if available, otherwise a lightweight one
                test_endpoint = endpoint if endpoint != "/health" else "/v2/companies/search"
                test_json_data = {"filters": {"domain": {"operator": "eq", "value": "google.com"}}, "limit": 1} if test_endpoint == "/v2/companies/search" else None

                result = await make_surfe_request("POST" if test_endpoint == "/v2/companies/search" else "GET", 
                                                test_endpoint, 
                                                key_info.key, 
                                                json_data=test_json_data, 
                                                timeout=10)
                
                status_code = result.get("status_code", 0)
                is_healthy = 200 <= status_code < 300 or self._has_business_data(result) # Check for 2xx or actual data
                
                results.append({
                    "key": f"...{key_info.key[-5:]}",
                    "status": "healthy" if is_healthy else "unhealthy",
                    "response": result
                })
            else:
                results.append({
                    "key": f"...{key_info.key[-5:]}",
                    "status": "disabled",
                    "response": {"error": "Key temporarily disabled"}
                })
        return {"health_check_results": results}

# Create a globally accessible instance of the enhanced SurfeClient
surfe_client = SurfeClient()

# Convenience functions for backward compatibility
async def make_request(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Convenience function that uses the global surfe_client instance"""
    return await surfe_client.make_request_with_rotation(method, endpoint, **kwargs)

def get_client_stats() -> Dict[str, Any]:
    """Get statistics from the global client instance"""
    return surfe_client.get_stats()

def reset_all_keys() -> None:
    """Reset all key cooldowns"""
    surfe_client.reset_key_cooldowns()
