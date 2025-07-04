# core/background_tasks.py - Updated imports
import asyncio
from core import job_manager
from utils.api_client import surfe_client
from utils import api_client  # Need this for direct key usage in polling
import logging

logger = logging.getLogger(__name__)

print("Loading background_tasks.py") # DEBUG PRINT

# core/background_tasks.py - Fixed with key consistency
async def run_enrichment_task(job_id: str, start_endpoint: str, status_endpoint_template: str, payload: dict):
    print(f"🔥 BACKGROUND TASK STARTED: job_id={job_id}")
    print(f"🔥 BACKGROUND TASK: endpoint={start_endpoint}")
    print(f"🔥 BACKGROUND TASK: payload={payload}")
    
    try:
        job_manager.update_job_status(job_id, "running")
        
        print(f"🔥 About to call Surfe API with endpoint: {start_endpoint}")
        
        # Submit enrichment job using rotation
        start_response = await surfe_client.make_request_with_rotation("POST", start_endpoint, json_data=payload)
        
        # ✅ CRITICAL: Get the key that was successful for initial request
        successful_key = surfe_client.get_last_successful_key()
        print(f"🔥 Surfe API response received: {start_response}")
        print(f"🔥 Will use same key for polling: {successful_key[:10]}...{successful_key[-4:]}")
        
        if not start_response:
            error_msg = "No response from Surfe API"
            print(f"🔥 ERROR: {error_msg}")
            job_manager.update_job_status(job_id, "failed", {"error": error_msg})
            return
        
        # Get the enrichment ID
        enrichment_id = start_response.get("enrichmentID") or start_response.get("id")
        print(f"🔥 Got enrichment_id: {enrichment_id}")

        if not enrichment_id:
            error_msg = f"Surfe API did not return enrichment ID. Response: {start_response}"
            print(f"🔥 ERROR: {error_msg}")
            job_manager.update_job_status(job_id, "failed", {"error": error_msg})
            return
        
        # Build status endpoint URL
        status_endpoint = status_endpoint_template.format(id=enrichment_id)
        print(f"🔥 Will poll status at: {status_endpoint}")
        
        # Poll for completion using SAME KEY for consistency
        for attempt in range(20):
            print(f"🔥 Polling attempt {attempt + 1}/20")
            await asyncio.sleep(3)
            
            # ✅ CRITICAL: Use same key that created the job to avoid 404s
            # We need to import api_client for direct key usage
            from utils import api_client
            status_response = await api_client.make_surfe_request("GET", status_endpoint, successful_key)
            print(f"🔥 Status response attempt {attempt + 1}: {status_response}")
            
            if not status_response:
                print(f"🔥 WARNING: No status response on attempt {attempt + 1}")
                continue
            
            # For v2 API, check if we have companies data
            if "/v2/" in start_endpoint and "companies" in status_response:
                companies = status_response["companies"]
                print(f"🔥 V2 API returned {len(companies)} companies")
                
                # Check if any company has actual data (not empty)
                has_data = any(
                    company.get("name") or company.get("description") or company.get("website")
                    for company in companies
                )
                
                if has_data:
                    print(f"🔥 Companies have data - marking as completed")
                    job_manager.update_job_status(job_id, "completed", status_response)
                    return
                else:
                    print(f"🔥 Companies returned but all fields empty")
                    job_manager.update_job_status(job_id, "completed", status_response)
                    return
            
            # For v1 API or if no companies yet, check status
            elif "organizations" in status_response:
                print(f"🔥 V1 API - got organizations data")
                job_manager.update_job_status(job_id, "completed", status_response)
                return
            
            # Check explicit status field
            current_status = status_response.get("status", "UNKNOWN")
            print(f"🔥 Current status: {current_status}")
            
            if current_status not in ["IN_PROGRESS", "PENDING", "UNKNOWN"]:
                print(f"🔥 Final status reached: {current_status}")
                job_manager.update_job_status(job_id, current_status.lower(), status_response)
                return
        
        # Timeout
        timeout_msg = "Enrichment task timed out after 20 polling attempts"
        print(f"🔥 TIMEOUT: {timeout_msg}")
        job_manager.update_job_status(job_id, "failed", {"error": timeout_msg})
        
    except Exception as e:
        error_msg = f"Exception in enrichment task: {str(e)}"
        print(f"🔥 EXCEPTION: {error_msg}")
        import traceback
        print(f"🔥 TRACEBACK:\n{traceback.format_exc()}")
        job_manager.update_job_status(job_id, "failed", {"error": error_msg})
