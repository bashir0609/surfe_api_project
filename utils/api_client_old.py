import httpx
import json
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config.config import SURFE_API_BASE_URL
except ImportError:
    # Fallback: define it directly if import fails
    SURFE_API_BASE_URL = "https://api.surfe.com"

async def make_surfe_request(
    method: str, endpoint: str, api_key: str, json_data: dict = None, params: dict = None
):
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    url = f"{SURFE_API_BASE_URL}{endpoint}"
    
    # Debug logging
    print(f"🔍 DEBUG: Making {method} request to: {url}")
    print(f"🔍 DEBUG: Headers: {headers}")
    print(f"🔍 DEBUG: JSON Data: {json.dumps(json_data, indent=2) if json_data else 'None'}")
    print(f"🔍 DEBUG: Params: {params}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method, url, headers=headers, json=json_data, params=params, timeout=30.0
            )
            
            # Debug response
            print(f"🔍 DEBUG: Response Status: {response.status_code}")
            print(f"🔍 DEBUG: Response Headers: {dict(response.headers)}")
            
            response_text = response.text
            print(f"🔍 DEBUG: Raw Response: {response_text}")
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            print(f"❌ DEBUG: HTTP Status Error: {e.response.status_code}")
            print(f"❌ DEBUG: Error Response: {e.response.text}")
            
            try:
                error_details = e.response.json()
            except:
                error_details = {"details": e.response.text}
            return {"error": f"API request failed with status {e.response.status_code}", "details": error_details}
            
        except Exception as e:
            print(f"❌ DEBUG: Unexpected Error: {str(e)}")
            return {"error": "An unexpected error occurred during the API request.", "exception": str(e)}