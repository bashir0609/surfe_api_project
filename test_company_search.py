# Test your rotation system directly
import asyncio
from utils.api_client import surfe_client

async def test_company_search():
    test_payload = {
        "filters": {"countries": ["US"]},
        "limit": 1
    }
    
    result = await surfe_client.make_request_with_rotation(
        "POST", 
        "/v2/companies/search", 
        json_data=test_payload
    )
    
    print("Result:", result)

# Run it
asyncio.run(test_company_search())