# Run this script to test your API directly
import asyncio
import aiohttp
import json

async def test_surfe_api():
    """Test Surfe API endpoints directly"""
    
    # Test 1: Basic connectivity
    print("1. Testing basic connectivity...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.surfe.com", timeout=aiohttp.ClientTimeout(total=5)) as response:
                print(f"   ✅ Basic connectivity: {response.status}")
    except Exception as e:
        print(f"   ❌ Basic connectivity failed: {e}")
        return
    
    # Test 2: Load your API keys
    print("\n2. Loading API keys...")
    try:
        import sys
        import os
        
        # Add your project directory to path
        project_dir = os.path.dirname(os.path.abspath(__file__))
        if project_dir not in sys.path:
            sys.path.append(project_dir)
        
        from utils.api_client import SURFE_API_KEYS, SURFE_API_BASE_URL
        print(f"   ✅ Loaded {len(SURFE_API_KEYS)} API keys")
        print(f"   📍 Base URL: {SURFE_API_BASE_URL}")
        
        if not SURFE_API_KEYS:
            print("   ❌ No API keys found!")
            return
            
    except Exception as e:
        print(f"   ❌ Failed to load API keys: {e}")
        return
    
    # Test 3: Test people endpoint (known working)
    print("\n3. Testing people endpoint (should work)...")
    try:
        headers = {
            "Authorization": f"Bearer {SURFE_API_KEYS[0]}",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{SURFE_API_BASE_URL}/v1/people/search/filters",
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                text = await response.text()
                print(f"   📡 People endpoint: {response.status}")
                if response.status == 200:
                    print(f"   ✅ People API working!")
                else:
                    print(f"   ❌ People API failed: {text[:200]}")
    except Exception as e:
        print(f"   ❌ People endpoint failed: {e}")
    
    # Test 4: Test different company endpoints
    print("\n4. Testing company endpoints...")
    
    company_endpoints = [
        "/v2/companies/search",
        "/v1/companies/search", 
        "/companies/search",
        "/v2/companies",
        "/v1/companies",
        "/companies"
    ]
    
    test_payload = {
        "filters": {"countries": ["US"]},
        "limit": 1
    }
    
    working_endpoints = []
    
    for endpoint in company_endpoints:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{SURFE_API_BASE_URL}{endpoint}",
                    headers=headers,
                    json=test_payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    text = await response.text()
                    print(f"   📡 POST {endpoint}: {response.status}")
                    
                    if response.status == 200:
                        print(f"   ✅ Working endpoint found!")
                        working_endpoints.append(endpoint)
                    elif response.status == 404:
                        print(f"   🚫 Not found")
                    elif response.status == 401:
                        print(f"   🔑 Unauthorized")
                    elif response.status == 403:
                        print(f"   ⛔ Forbidden")
                    else:
                        print(f"   ❌ Error: {text[:100]}")
                        
        except Exception as e:
            print(f"   ❌ {endpoint} failed: {e}")
    
    # Test 5: Try GET requests too
    print("\n5. Testing GET requests for company endpoints...")
    
    for endpoint in company_endpoints:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{SURFE_API_BASE_URL}{endpoint}",
                    headers=headers,
                    params={"countries": "US", "limit": 1},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    text = await response.text()
                    print(f"   📡 GET {endpoint}: {response.status}")
                    
                    if response.status == 200:
                        print(f"   ✅ Working GET endpoint found!")
                        working_endpoints.append(f"GET {endpoint}")
                    elif response.status != 404:  # Don't spam 404s
                        print(f"   ⚠️  {text[:100]}")
                        
        except Exception as e:
            print(f"   ❌ GET {endpoint} failed: {e}")
    
    # Summary
    print(f"\n📋 SUMMARY:")
    if working_endpoints:
        print(f"✅ Found {len(working_endpoints)} working company endpoints:")
        for ep in working_endpoints:
            print(f"   - {ep}")
    else:
        print("❌ No working company endpoints found!")
        print("   This suggests:")
        print("   1. Company search API may not be available")
        print("   2. Different API key permissions needed")
        print("   3. Different endpoint structure required")

# Run the test
if __name__ == "__main__":
    asyncio.run(test_surfe_api())