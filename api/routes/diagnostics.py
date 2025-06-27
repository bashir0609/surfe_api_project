from fastapi import APIRouter, Depends, HTTPException
from core.dependencies import get_api_key
from utils.api_client import surfe_client, SURFE_API_KEYS, SURFE_API_BASE_URL
from api.models import responses as res_models
import logging
import aiohttp
import asyncio
import socket
import ssl
import time
import json
from datetime import datetime
from typing import Dict, Any

print("Loading enhanced diagnostics.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/diagnostics", tags=["Diagnostics"])

async def quick_connectivity_test():
    """Quick connectivity test for network issues"""
    results = {
        "dns_test": {},
        "http_test": {},
        "ssl_test": {},
        "timestamp": datetime.now().isoformat()
    }
    
    # DNS Test
    try:
        start_time = time.time()
        ip_addresses = socket.gethostbyname_ex("api.surfe.com")[2]
        dns_time = (time.time() - start_time) * 1000
        results["dns_test"] = {
            "success": True,
            "ip_addresses": ip_addresses,
            "resolution_time_ms": round(dns_time, 2),
            "error": None
        }
    except Exception as e:
        results["dns_test"] = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
    
    # HTTP Test
    try:
        start_time = time.time()
        timeout = aiohttp.ClientTimeout(total=10, connect=5)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get("https://api.surfe.com") as response:
                http_time = (time.time() - start_time) * 1000
                results["http_test"] = {
                    "success": True,
                    "status_code": response.status,
                    "response_time_ms": round(http_time, 2),
                    "headers": dict(response.headers),
                    "error": None
                }
    except Exception as e:
        results["http_test"] = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
    
    # SSL Test
    try:
        results["ssl_test"] = {
            "ssl_version": ssl.OPENSSL_VERSION,
            "success": True
        }
    except Exception as e:
        results["ssl_test"] = {
            "success": False,
            "error": str(e)
        }
    
    return results

@router.get("/filters", response_model=res_models.GenericResponse)
async def get_available_filters(api_key: str = Depends(get_api_key)):
    """Get available search filters from Surfe API with enhanced error handling"""
    try:
        logger.info("🔍 Getting available filters from Surfe API with rotation")
        
        # Test connectivity first
        connectivity = await quick_connectivity_test()
        if not connectivity["dns_test"]["success"] or not connectivity["http_test"]["success"]:
            logger.error(f"❌ Connectivity issues detected: {connectivity}")
            return {
                "success": False,
                "error": "Network connectivity issue detected",
                "connectivity_test": connectivity,
                "data": None
            }
        
        # Try the API call with rotation
        result = await surfe_client.make_request_with_rotation(
            "GET", 
            "/v1/people/search/filters", 
            timeout=30,
            max_retries=3
        )
        
        if "error" in result:
            logger.error(f"❌ Surfe API error: {result}")
            return {
                "success": False,
                "error": result.get("error", "Unknown API error"),
                "status_code": result.get("status_code"),
                "api_key_used": surfe_client.get_last_api_key_masked(),
                "connectivity_test": connectivity,
                "data": None
            }
        
        logger.info("✅ Successfully retrieved filters")
        return {
            "success": True, 
            "data": result,
            "api_key_used": surfe_client.get_last_api_key_masked(),
            "connectivity_test": connectivity
        }
        
    except Exception as e:
        logger.error(f"❌ Exception getting filters: {str(e)}")
        connectivity = await quick_connectivity_test()
        return {
            "success": False,
            "error": f"Failed to get filters: {str(e)}",
            "exception_type": type(e).__name__,
            "connectivity_test": connectivity,
            "data": None
        }

@router.get("/health", response_model=res_models.GenericResponse)
async def health_check():
    """Enhanced health check with connectivity and API statistics"""
    try:
        # Basic connectivity test
        connectivity = await quick_connectivity_test()
        
        # Get API client statistics
        api_stats = surfe_client.get_stats()
        
        # Determine overall health
        is_healthy = (
            connectivity["dns_test"]["success"] and 
            connectivity["http_test"]["success"] and
            api_stats["available_keys"] > 0
        )
        
        return {
            "success": True,
            "data": {
                "status": "healthy" if is_healthy else "degraded",
                "service": "Surfe API Diagnostics",
                "connectivity": connectivity,
                "api_statistics": api_stats,
                "configuration": {
                    "base_url": SURFE_API_BASE_URL,
                    "total_keys": len(SURFE_API_KEYS),
                    "available_keys": api_stats["available_keys"]
                },
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "data": {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        }

@router.get("/connectivity", response_model=res_models.GenericResponse)
async def test_connectivity():
    """Comprehensive connectivity test for network troubleshooting"""
    try:
        logger.info("🌐 Running comprehensive connectivity test")
        
        # Quick connectivity test
        connectivity = await quick_connectivity_test()
        
        # Test different URLs
        url_tests = {}
        test_urls = [
            "https://api.surfe.com",
            "https://surfe.com",
            "https://app.surfe.com",
            "http://api.surfe.com"  # Test HTTP vs HTTPS
        ]
        
        for url in test_urls:
            try:
                start_time = time.time()
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                        response_time = (time.time() - start_time) * 1000
                        url_tests[url] = {
                            "success": True,
                            "status_code": response.status,
                            "response_time_ms": round(response_time, 2)
                        }
            except Exception as e:
                url_tests[url] = {
                    "success": False,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
        
        # Generate diagnosis
        issues = []
        recommendations = []
        
        if not connectivity["dns_test"]["success"]:
            issues.append("DNS resolution failing")
            recommendations.append("Check internet connection and DNS settings")
        
        if not connectivity["http_test"]["success"]:
            issues.append("HTTP connectivity failing")
            recommendations.append("Check firewall and network access to api.surfe.com")
        
        working_urls = [url for url, result in url_tests.items() if result["success"]]
        
        return {
            "success": True,
            "data": {
                "basic_connectivity": connectivity,
                "url_tests": url_tests,
                "working_urls": working_urls,
                "issues_detected": issues,
                "recommendations": recommendations,
                "overall_status": "OK" if not issues else "ISSUES_DETECTED"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Connectivity test failed: {str(e)}")
        return {
            "success": False,
            "error": f"Connectivity test failed: {str(e)}"
        }

@router.get("/api-key-test", response_model=res_models.GenericResponse)
async def test_api_key(api_key: str = Depends(get_api_key)):
    """Test API key validity with enhanced rotation system"""
    try:
        logger.info("🔑 Testing API key validity with rotation")
        
        # Get initial stats
        initial_stats = surfe_client.get_stats()
        
        # Test connectivity first
        connectivity = await quick_connectivity_test()
        if not connectivity["dns_test"]["success"] or not connectivity["http_test"]["success"]:
            return {
                "success": False,
                "data": {
                    "valid": False,
                    "error": "Network connectivity issue - cannot test API key",
                    "connectivity_test": connectivity
                }
            }
        
        # Make a simple request to test all keys
        result = await surfe_client.make_request_with_rotation(
            "GET", 
            "/v1/people/search/filters", 
            timeout=15,
            max_retries=2
        )
        
        # Get final stats to see what happened
        final_stats = surfe_client.get_stats()
        
        if "error" in result:
            status_code = result.get("status_code")
            error_msg = result.get("error", "Unknown error")
            
            # Analyze the error
            if status_code == 401:
                error_analysis = "API key is invalid or expired"
            elif status_code == 403:
                error_analysis = "API key lacks necessary permissions"
            elif status_code == 429:
                error_analysis = "Rate limited - too many requests"
            else:
                error_analysis = f"API error (status {status_code})"
            
            return {
                "success": False,
                "data": {
                    "valid": False,
                    "error": error_msg,
                    "error_analysis": error_analysis,
                    "status_code": status_code,
                    "api_key_used": surfe_client.get_last_api_key_masked(),
                    "api_stats": final_stats,
                    "connectivity_test": connectivity
                }
            }
        
        logger.info("✅ API key test successful")
        return {
            "success": True,
            "data": {
                "valid": True,
                "message": "API key is valid and working",
                "api_key_used": surfe_client.get_last_api_key_masked(),
                "response_preview": str(result)[:200] + "..." if len(str(result)) > 200 else str(result),
                "api_stats": final_stats,
                "connectivity_test": connectivity
            }
        }
        
    except Exception as e:
        logger.error(f"❌ API key test exception: {str(e)}")
        return {
            "success": False,
            "data": {
                "valid": False,
                "error": f"API key test failed: {str(e)}",
                "exception_type": type(e).__name__
            }
        }

@router.get("/api-stats", response_model=res_models.GenericResponse)
async def get_api_statistics(api_key: str = Depends(get_api_key)):
    """Get detailed API usage statistics"""
    try:
        stats = surfe_client.get_stats()
        return {
            "success": True,
            "data": {
                "statistics": stats,
                "configuration": {
                    "base_url": SURFE_API_BASE_URL,
                    "total_keys_configured": len(SURFE_API_KEYS)
                },
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to get API statistics: {str(e)}"
        }

@router.post("/test-endpoints", response_model=res_models.GenericResponse)
async def test_different_endpoints(api_key: str = Depends(get_api_key)):
    """Test different API endpoints to find working ones"""
    try:
        logger.info("🧪 Testing different API endpoints")
        
        if not SURFE_API_KEYS:
            return {
                "success": False,
                "error": "No API keys available for testing"
            }
        
        test_key = SURFE_API_KEYS[0]
        headers = {
            "Authorization": f"Bearer {test_key}",
            "Content-Type": "application/json"
        }
        
        # Test different base URLs and endpoints
        base_urls = [
            "https://api.surfe.com",
            "https://surfe.com/api",
            "https://app.surfe.com/api"
        ]
        
        endpoints = [
            ("/v1/people/search/filters", "GET", None),
            ("/v2/people/search/filters", "GET", None),
            ("/people/search/filters", "GET", None),
            ("/v1/companies/search", "POST", {"filters": {"countries": ["US"]}, "limit": 1}),
            ("/v2/companies/search", "POST", {"filters": {"countries": ["US"]}, "limit": 1})
        ]
        
        results = {}
        working_combinations = []
        
        for base_url in base_urls:
            base_results = {}
            
            for endpoint, method, payload in endpoints:
                full_url = f"{base_url}{endpoint}"
                
                try:
                    start_time = time.time()
                    async with aiohttp.ClientSession() as session:
                        request_kwargs = {"headers": headers}
                        if payload:
                            request_kwargs["json"] = payload
                        
                        async with session.request(
                            method,
                            full_url,
                            timeout=aiohttp.ClientTimeout(total=10),
                            **request_kwargs
                        ) as response:
                            response_time = (time.time() - start_time) * 1000
                            response_text = await response.text()
                            
                            success = 200 <= response.status < 300
                            
                            base_results[f"{method} {endpoint}"] = {
                                "status_code": response.status,
                                "success": success,
                                "response_time_ms": round(response_time, 2),
                                "response_preview": response_text[:150],
                                "error": None
                            }
                            
                            if success:
                                working_combinations.append({
                                    "base_url": base_url,
                                    "endpoint": endpoint,
                                    "method": method,
                                    "full_url": full_url,
                                    "status_code": response.status
                                })
                                
                except Exception as e:
                    base_results[f"{method} {endpoint}"] = {
                        "status_code": None,
                        "success": False,
                        "error": str(e),
                        "error_type": type(e).__name__
                    }
            
            results[base_url] = base_results
        
        return {
            "success": True,
            "data": {
                "current_configuration": {
                    "base_url": SURFE_API_BASE_URL,
                    "using_rotation": True
                },
                "test_results": results,
                "working_combinations": working_combinations,
                "summary": {
                    "total_tests": sum(len(base_results) for base_results in results.values()),
                    "working_endpoints": len(working_combinations),
                    "recommendations": [
                        f"Found {len(working_combinations)} working endpoint combinations"
                        if working_combinations
                        else "No working endpoints found - check API keys and network connectivity"
                    ]
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Endpoint testing failed: {str(e)}")
        return {
            "success": False,
            "error": f"Endpoint testing failed: {str(e)}"
        }

@router.post("/reset-keys", response_model=res_models.GenericResponse)
async def reset_api_keys(api_key: str = Depends(get_api_key)):
    """Reset all API key cooldowns (emergency use)"""
    try:
        logger.info("🔄 Resetting all API key cooldowns")
        surfe_client.reset_key_cooldowns()
        
        return {
            "success": True,
            "data": {
                "message": "All API key cooldowns have been reset",
                "timestamp": datetime.now().isoformat(),
                "stats_after_reset": surfe_client.get_stats()
            }
        }
    except Exception as e:
        logger.error(f"❌ Failed to reset API keys: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to reset API keys: {str(e)}"
        }

@router.get("/full-diagnosis", response_model=res_models.GenericResponse)
async def run_full_diagnosis(api_key: str = Depends(get_api_key)):
    """Run comprehensive diagnosis of all API systems"""
    try:
        logger.info("🔍 Running full system diagnosis")
        
        # Run all diagnostic tests
        connectivity = await quick_connectivity_test()
        
        # Test API key
        api_test_result = await test_api_key(api_key)
        
        # Get statistics
        stats = surfe_client.get_stats()
        
        # Generate overall diagnosis
        issues = []
        recommendations = []
        
        if not connectivity["dns_test"]["success"]:
            issues.append("DNS resolution failing")
            recommendations.append("Check internet connection and DNS settings")
        
        if not connectivity["http_test"]["success"]:
            issues.append("HTTP connectivity failing")
            recommendations.append("Check firewall settings and network access")
        
        if not api_test_result["success"] or not api_test_result["data"]["valid"]:
            issues.append("API key validation failing")
            recommendations.append("Check API key validity and permissions")
        
        if stats["available_keys"] == 0:
            issues.append("No API keys available")
            recommendations.append("Check API key configuration and cooldown status")
        
        overall_status = "HEALTHY" if not issues else "ISSUES_DETECTED"
        
        return {
            "success": True,
            "data": {
                "overall_status": overall_status,
                "connectivity_test": connectivity,
                "api_key_test": api_test_result,
                "api_statistics": stats,
                "configuration": {
                    "base_url": SURFE_API_BASE_URL,
                    "total_keys": len(SURFE_API_KEYS),
                    "available_keys": stats["available_keys"]
                },
                "issues_detected": issues,
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Full diagnosis failed: {str(e)}")
        return {
            "success": False,
            "error": f"Full diagnosis failed: {str(e)}"
        }