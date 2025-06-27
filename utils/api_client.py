# ==============================================================================
# File: surfe_api_project/utils/api_client.py - COMPLETE WORKING VERSION
# ==============================================================================

import aiohttp
import json
import logging
from typing import Optional, Dict, Any, List, Set
import os
import time
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass, field

print("Loading enhanced api_client.py") # DEBUG PRINT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import base URL from centralized config
try:
    from config.config import SURFE_API_BASE_URL
except ImportError:
    SURFE_API_BASE_URL = "https://api.surfe.com"

# STEP 1: Load API keys first
def load_api_keys():
    """Load API keys from environment variables"""
    keys_found = []
    
    # Try numbered environment variables
    for i in range(1, 11):
        env_var_name = f"SURFE_API_KEY_{i}"
        api_key_value = os.getenv(env_var_name)
        if api_key_value and api_key_value.strip():
            keys_found.append(api_key_value.strip())
            logger.info(f"Loaded API key from {env_var_name}")
    
    # Try single environment variable
    single_key = os.getenv("SURFE_API_KEY")
    if single_key and single_key.strip():
        keys_found.append(single_key.strip())
        logger.info("Loaded API key from SURFE_API_KEY")
    
    # Remove duplicates while preserving order
    unique_keys = []
    for key in keys_found:
        if key not in unique_keys:
            unique_keys.append(key)
    
    return unique_keys

# Load the keys immediately
SURFE_API_KEYS = load_api_keys()

# STEP 2: Define classes
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
    """Manages API key rotation"""
    keys: List[ApiKeyInfo] = field(default_factory=list)
    current_index: int = 0
    
    def add_key(self, key: str):
        """Add a new API key to the manager"""
        if not any(k.key == key for k in self.keys):
            self.keys.append(ApiKeyInfo(key=key))
            logger.info(f"Key Manager: Added key ...{key[-5:]}. Total keys: {len(self.keys)}")
    
    def get_next_available_key(self) -> Optional[ApiKeyInfo]:
        """Get the next available API key"""
        if not self.keys:
            return None
        
        for _ in range(len(self.keys)):
            key_info = self.keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.keys)
            
            if key_info.is_temporarily_disabled:
                if key_info.quota_reset_time and datetime.now() > key_info.quota_reset_time:
                    key_info.is_temporarily_disabled = False
                    key_info.quota_reset_time = None
            
            if not key_info.is_temporarily_disabled:
                key_info.last_used = datetime.now()
                key_info.total_requests += 1
                return key_info
        
        return None
    
    def mark_key_quota_exceeded(self, key: str, cooldown_minutes: int = 60):
        """Mark a key as having exceeded quota"""
        for key_info in self.keys:
            if key_info.key == key:
                key_info.is_temporarily_disabled = True
                key_info.quota_reset_time = datetime.now() + timedelta(minutes=cooldown_minutes)
                key_info.failed_attempts += 1
                break
    
    def mark_key_successful(self, key: str):
        """Mark a key as successful"""
        for key_info in self.keys:
            if key_info.key == key:
                key_info.successful_requests += 1
                if key_info.is_temporarily_disabled:
                    key_info.is_temporarily_disabled = False
                    key_info.quota_reset_time = None
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
                "is_disabled": key_info.is_temporarily_disabled
            }
        return stats

# STEP 3: Create the manager instance FIRST
api_key_manager = ApiKeyManager()

# STEP 4: Initialize with keys
if not SURFE_API_KEYS:
    logger.warning("WARNING: No Surfe API keys found.")
    SURFE_API_KEYS = ["dummy_key_for_development"]
    logger.warning("Added dummy API key to prevent crashes.")

# Add keys to the manager
for key in SURFE_API_KEYS:
    api_key_manager.add_key(key)

logger.info(f"Successfully loaded {len(SURFE_API_KEYS)} Surfe API keys")

# STEP 5: Request function
async def make_surfe_request(
    method: str,
    endpoint: str,
    api_key: str,
    json_data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    timeout: int = 30
) -> Dict[str, Any]:
    """Make requests to the Surfe API"""
    url = f"{SURFE_API_BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

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
                response_text = await response.text()

                if 200 <= response.status < 300:
                    try:
                        return json.loads(response_text)
                    except json.JSONDecodeError:
                        return {"error": "Invalid JSON response", "status_code": response.status}
                else:
                    try:
                        error_data = json.loads(response_text)
                        return {"error": error_data, "status_code": response.status}
                    except json.JSONDecodeError:
                        return {"error": response_text, "status_code": response.status}

    except asyncio.TimeoutError:
        return {"error": f"Request timeout after {timeout} seconds", "status_code": 408}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}", "status_code": 500}

# STEP 6: Enhanced client
class SurfeClient:
    """Enhanced Surfe API client with key rotation"""
    
    def __init__(self):
        self._key_manager = api_key_manager
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
        """Make request with intelligent key rotation"""
        if max_retries is None:
            max_retries = len(self._key_manager.keys) * 2
            
        if not self._key_manager.keys:
            return {"error": "No API keys available", "status_code": 500}

        self._request_count += 1
        
        for attempt in range(max_retries):
            key_info = self._key_manager.get_next_available_key()
            
            if not key_info:
                await asyncio.sleep(retry_delay)
                continue
                
            self._last_api_key_used = key_info.key

            response_data = await make_surfe_request(
                method=method,
                endpoint=endpoint,
                api_key=key_info.key,
                json_data=json_data,
                params=params,
                timeout=timeout
            )

            status_code = response_data.get("status_code")
            
            if status_code is None or 200 <= status_code < 300:
                self._key_manager.mark_key_successful(key_info.key)
                return response_data
            elif status_code == 401:
                self._key_manager.mark_key_quota_exceeded(key_info.key, cooldown_minutes=99999)
                return response_data
            elif status_code == 403:
                self._key_manager.mark_key_quota_exceeded(key_info.key, cooldown_minutes=60)
                await asyncio.sleep(retry_delay)
                continue
            elif status_code in [429, 500, 502, 503, 504]:
                await asyncio.sleep(retry_delay * (2 ** min(attempt, 3)))
                continue
            else:
                return response_data

        return {"error": "All API keys failed", "status_code": 500}

    def get_last_api_key_masked(self) -> str:
        """Get masked version of last used API key"""
        if self._last_api_key_used:
            return f"...{self._last_api_key_used[-5:]}"
        return "N/A"

    def get_stats(self) -> Dict[str, Any]:
        """Get usage statistics"""
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
        """Reset all key cooldowns"""
        for key_info in self._key_manager.keys:
            key_info.is_temporarily_disabled = False
            key_info.quota_reset_time = None

# STEP 7: Create global client instance
surfe_client = SurfeClient()

# STEP 8: Backward compatibility functions
async def make_request(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Convenience function using the global client"""
    return await surfe_client.make_request_with_rotation(method, endpoint, **kwargs)

def get_client_stats() -> Dict[str, Any]:
    """Get statistics from the global client"""
    return surfe_client.get_stats()

def reset_all_keys() -> None:
    """Reset all key cooldowns"""
    surfe_client.reset_key_cooldowns()
