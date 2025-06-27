from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from core.dependencies import get_api_key
from utils import api_client
import asyncio
import logging

print("Loading data_quality_test.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/test", tags=["Data Quality Test"])

class DomainTestRequest(BaseModel):
    domain: str

class LinkedInTestRequest(BaseModel):
    linkedinUrl: str
    domain: Optional[str] = None

@router.post("/compare-api-versions")
async def compare_v1_v2_data_quality(
    request: DomainTestRequest,
    api_key: str = Depends(get_api_key)
):
    """
    Compare data quality between v1 and v2 APIs for the same domain
    """
    domain = request.domain
    results = {
        "domain": domain,
        "v1_result": None,
        "v2_result": None,
        "comparison": {}
    }
    
    try:
        print(f"🔍 Testing domain: {domain}")
        
        # Test V1 API (deprecated but maybe better data?)
        try:
            print("📊 Testing V1 API...")
            v1_payload = {
                "domains": [domain],
                "organizations": [{"domain": domain, "externalID": "test_v1"}],
                "name": "Data Quality Test V1"
            }
            
            v1_start_response = await api_client.make_surfe_request(
                "POST", 
                "/v1/organizations/enrichments/bulk", 
                api_key, 
                json_data=v1_payload
            )
            print(f"V1 Start Response: {v1_start_response}")
            
            if v1_start_response and "id" in v1_start_response:
                # Poll V1 status
                v1_job_id = v1_start_response["id"]
                print(f"V1 Job ID: {v1_job_id}")
                
                for attempt in range(10):  # Shorter polling for test
                    await asyncio.sleep(2)
                    v1_status = await api_client.make_surfe_request(
                        "GET", 
                        f"/v1/organizations/enrichments/bulk/{v1_job_id}", 
                        api_key
                    )
                    print(f"V1 Attempt {attempt + 1}: {v1_status}")
                    
                    if v1_status and "organizations" in v1_status:
                        results["v1_result"] = v1_status
                        break
                        
        except Exception as e:
            print(f"V1 API Error: {e}")
            results["v1_result"] = {"error": str(e)}
        
        # Test V2 API (current)
        try:
            print("📊 Testing V2 API...")
            v2_payload = {
                "companies": [{"domain": domain, "externalID": "test_v2"}]
            }
            
            v2_start_response = await api_client.make_surfe_request(
                "POST", 
                "/v2/companies/enrich", 
                api_key, 
                json_data=v2_payload
            )
            print(f"V2 Start Response: {v2_start_response}")
            
            if v2_start_response and "enrichmentID" in v2_start_response:
                # Poll V2 status
                v2_job_id = v2_start_response["enrichmentID"]
                print(f"V2 Job ID: {v2_job_id}")
                
                for attempt in range(10):  # Shorter polling for test
                    await asyncio.sleep(2)
                    v2_status = await api_client.make_surfe_request(
                        "GET", 
                        f"/v2/companies/enrich/{v2_job_id}", 
                        api_key
                    )
                    print(f"V2 Attempt {attempt + 1}: {v2_status}")
                    
                    if v2_status and "companies" in v2_status:
                        results["v2_result"] = v2_status
                        break
                        
        except Exception as e:
            print(f"V2 API Error: {e}")
            results["v2_result"] = {"error": str(e)}
        
        # Compare results
        comparison = {}
        
        # Extract V1 data
        v1_company = None
        if results["v1_result"] and "organizations" in results["v1_result"]:
            orgs = results["v1_result"]["organizations"]
            if orgs and len(orgs) > 0:
                v1_company = orgs[0]
        
        # Extract V2 data  
        v2_company = None
        if results["v2_result"] and "companies" in results["v2_result"]:
            companies = results["v2_result"]["companies"]
            if companies and len(companies) > 0:
                v2_company = companies[0]
        
        if v1_company and v2_company:
            comparison = {
                "company_name": {
                    "v1": v1_company.get("name", "N/A"),
                    "v2": v2_company.get("name", "N/A"),
                    "same": v1_company.get("name") == v2_company.get("name")
                },
                "employee_count": {
                    "v1": v1_company.get("size", "N/A"),
                    "v2": v2_company.get("employeeCount", "N/A"),
                    "same": v1_company.get("size") == v2_company.get("employeeCount")
                },
                "description": {
                    "v1": (v1_company.get("description", "") or "")[:100] + "..." if v1_company.get("description") else "N/A",
                    "v2": (v2_company.get("description", "") or "")[:100] + "..." if v2_company.get("description") else "N/A",
                    "same": v1_company.get("description") == v2_company.get("description")
                },
                "industry": {
                    "v1": v1_company.get("industries", []),
                    "v2": v2_company.get("industry", "N/A"),
                    "same": False  # Different formats, hard to compare
                },
                "website": {
                    "v1": v1_company.get("website", "N/A"),
                    "v2": v2_company.get("websites", []),
                    "same": False  # Different formats
                }
            }
        
        results["comparison"] = comparison
        
        return {
            "success": True,
            "data": results,
            "summary": {
                "v1_has_data": v1_company is not None and bool(v1_company.get("name")),
                "v2_has_data": v2_company is not None and bool(v2_company.get("name")),
                "data_quality_better_in": determine_better_quality(v1_company, v2_company)
            }
        }
        
    except Exception as e:
        print(f"🚨 Error in comparison: {e}")
        raise HTTPException(status_code=500, detail={"error": str(e), "results": results})

@router.post("/linkedin-enrichment")
async def test_linkedin_enrichment(
    request: LinkedInTestRequest,
    api_key: str = Depends(get_api_key)
):
    """
    Test company enrichment using LinkedIn URL vs Domain
    """
    results = {
        "linkedinUrl": request.linkedinUrl,
        "domain": request.domain,
        "linkedin_result": None,
        "domain_result": None,
        "comparison": {}
    }
    
    try:
        print(f"🔍 Testing LinkedIn URL: {request.linkedinUrl}")
        
        # Test LinkedIn URL enrichment
        try:
            print("🔗 Testing LinkedIn URL enrichment...")
            linkedin_payload = {
                "companies": [
                    {
                        "linkedinUrl": request.linkedinUrl,
                        "externalID": "test_linkedin"
                    }
                ]
            }
            
            linkedin_start_response = await api_client.make_surfe_request(
                "POST", 
                "/v2/companies/enrich", 
                api_key, 
                json_data=linkedin_payload
            )
            print(f"LinkedIn Start Response: {linkedin_start_response}")
            
            if linkedin_start_response and "enrichmentID" in linkedin_start_response:
                linkedin_job_id = linkedin_start_response["enrichmentID"]
                print(f"LinkedIn Job ID: {linkedin_job_id}")
                
                # Poll for results
                for attempt in range(10):
                    await asyncio.sleep(3)
                    linkedin_status = await api_client.make_surfe_request(
                        "GET", 
                        f"/v2/companies/enrich/{linkedin_job_id}", 
                        api_key
                    )
                    print(f"LinkedIn Attempt {attempt + 1}: {linkedin_status}")
                    
                    if linkedin_status and "companies" in linkedin_status:
                        results["linkedin_result"] = linkedin_status
                        print("✅ LinkedIn enrichment completed")
                        break
                        
        except Exception as e:
            print(f"LinkedIn enrichment error: {e}")
            results["linkedin_result"] = {"error": str(e)}
        
        # Test Domain enrichment (if domain provided)
        if request.domain:
            try:
                print(f"🌐 Testing domain enrichment for: {request.domain}")
                domain_payload = {
                    "companies": [
                        {
                            "domain": request.domain,
                            "externalID": "test_domain"
                        }
                    ]
                }
                
                domain_start_response = await api_client.make_surfe_request(
                    "POST", 
                    "/v2/companies/enrich", 
                    api_key, 
                    json_data=domain_payload
                )
                print(f"Domain Start Response: {domain_start_response}")
                
                if domain_start_response and "enrichmentID" in domain_start_response:
                    domain_job_id = domain_start_response["enrichmentID"]
                    print(f"Domain Job ID: {domain_job_id}")
                    
                    # Poll for results
                    for attempt in range(10):
                        await asyncio.sleep(3)
                        domain_status = await api_client.make_surfe_request(
                            "GET", 
                            f"/v2/companies/enrich/{domain_job_id}", 
                            api_key
                        )
                        print(f"Domain Attempt {attempt + 1}: {domain_status}")
                        
                        if domain_status and "companies" in domain_status:
                            results["domain_result"] = domain_status
                            print("✅ Domain enrichment completed")
                            break
                            
            except Exception as e:
                print(f"Domain enrichment error: {e}")
                results["domain_result"] = {"error": str(e)}
        
        # Compare results
        comparison = {}
        
        # Extract LinkedIn result
        linkedin_company = None
        if results["linkedin_result"] and "companies" in results["linkedin_result"]:
            companies = results["linkedin_result"]["companies"]
            if companies and len(companies) > 0:
                linkedin_company = companies[0]
        
        # Extract Domain result
        domain_company = None
        if results["domain_result"] and "companies" in results["domain_result"]:
            companies = results["domain_result"]["companies"]
            if companies and len(companies) > 0:
                domain_company = companies[0]
        
        # Build comparison
        if linkedin_company:
            comparison["linkedin_method"] = {
                "company_name": linkedin_company.get("name", "N/A"),
                "employee_count": linkedin_company.get("employeeCount", "N/A"),
                "industry": linkedin_company.get("industry", "N/A"),
                "description": (linkedin_company.get("description", "") or "")[:100] + "..." if linkedin_company.get("description") else "N/A",
                "website": linkedin_company.get("websites", []),
                "has_data": bool(linkedin_company.get("name"))
            }
        
        if domain_company:
            comparison["domain_method"] = {
                "company_name": domain_company.get("name", "N/A"),
                "employee_count": domain_company.get("employeeCount", "N/A"),
                "industry": domain_company.get("industry", "N/A"),
                "description": (domain_company.get("description", "") or "")[:100] + "..." if domain_company.get("description") else "N/A",
                "website": domain_company.get("websites", []),
                "has_data": bool(domain_company.get("name"))
            }
        
        results["comparison"] = comparison
        
        # Determine which method is better
        linkedin_quality = "good" if linkedin_company and linkedin_company.get("name") else "poor"
        domain_quality = "good" if domain_company and domain_company.get("name") else "poor"
        
        better_method = "linkedin" if linkedin_quality == "good" and domain_quality == "poor" else \
                       "domain" if domain_quality == "good" and linkedin_quality == "poor" else \
                       "both" if linkedin_quality == "good" and domain_quality == "good" else \
                       "neither"
        
        return {
            "success": True,
            "data": results,
            "summary": {
                "linkedin_has_data": linkedin_company is not None and bool(linkedin_company.get("name")) if linkedin_company else False,
                "domain_has_data": domain_company is not None and bool(domain_company.get("name")) if domain_company and request.domain else False,
                "better_method": better_method,
                "linkedin_supported": linkedin_company is not None,
                "recommendation": get_recommendation(better_method, linkedin_company, domain_company)
            }
        }
        
    except Exception as e:
        print(f"🚨 Error in LinkedIn test: {e}")
        raise HTTPException(status_code=500, detail={"error": str(e), "results": results})

def determine_better_quality(v1_data: Optional[Dict[str, Any]], v2_data: Optional[Dict[str, Any]]) -> str:
    """Determine which API version has better data quality"""
    if not v1_data and not v2_data:
        return "neither"
    elif not v1_data:
        return "v2"
    elif not v2_data:
        return "v1"
    
    # Score based on data completeness
    v1_score = 0
    v2_score = 0
    
    # Company name
    v1_name = v1_data.get("name", "")
    v2_name = v2_data.get("name", "")
    if v1_name and str(v1_name).strip():
        v1_score += 2
    if v2_name and str(v2_name).strip():
        v2_score += 2
    
    # Description
    v1_desc = v1_data.get("description", "")
    v2_desc = v2_data.get("description", "")
    if v1_desc and str(v1_desc).strip():
        v1_score += 1
    if v2_desc and str(v2_desc).strip():
        v2_score += 1
    
    # Employee count
    if v1_data.get("size"):
        v1_score += 1
    if v2_data.get("employeeCount"):
        v2_score += 1
    
    # Industry info
    if v1_data.get("industries"):
        v1_score += 1
    if v2_data.get("industry"):
        v2_score += 1
    
    if v1_score > v2_score:
        return "v1"
    elif v2_score > v1_score:
        return "v2"
    else:
        return "equal"

def get_recommendation(better_method: str, linkedin_data: Optional[Dict[str, Any]], domain_data: Optional[Dict[str, Any]]) -> str:
    """Generate a recommendation based on test results"""
    if better_method == "linkedin":
        return "✅ Use LinkedIn URLs for better data quality"
    elif better_method == "domain":
        return "✅ Domain enrichment works better for this case"
    elif better_method == "both":
        return "✅ Both methods work - choose based on your data source"
    elif linkedin_data and not linkedin_data.get("name"):
        return "⚠️ LinkedIn URLs are supported but returned empty data"
    else:
        return "❌ Neither method returned good data - check API access or try different companies"