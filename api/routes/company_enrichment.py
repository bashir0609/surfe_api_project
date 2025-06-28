from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from uuid import uuid4
from api.models import requests as req_models, responses as res_models
from core import job_manager, background_tasks
from utils.api_client import surfe_client
import logging
import traceback

print("Loading company_enrichment.py") # DEBUG PRINT

logger = logging.getLogger(__name__)

# CHANGED: v1 to v2 in the prefix
router = APIRouter(prefix="/api/v2/companies", tags=["Company"])

@router.post("/enrich", response_model=res_models.JobStatusResponse)
async def start_company_enrichment(
    request: req_models.CompanyEnrichmentRequest, 
    background_tasks_runner: BackgroundTasks
):
    """Company enrichment with debugging"""
    job_id = None
    
    try:
        logger.info("🔍 COMPANY STEP 1: Starting company enrichment")
        
        logger.info("🔍 COMPANY STEP 2: Creating job_id")
        job_id = str(uuid4())
        logger.info(f"🔍 COMPANY STEP 2 SUCCESS: job_id = {job_id}")
        
        logger.info("🔍 COMPANY STEP 3: Creating job in job_manager")
        job_manager.create_job(job_id)
        logger.info(f"🔍 COMPANY STEP 3 SUCCESS: Job {job_id} created")
        
        logger.info("🔍 COMPANY STEP 4: Creating payload")
        # FIXED: Use proper v2 API format (companies, not organizations)
        payload = {"companies": [{"domain": d, "externalID": f"company_{i}"} for i, d in enumerate(request.domains)]}
        logger.info(f"🔍 COMPANY STEP 4 SUCCESS: V2 Payload for {len(request.domains)} domains: {request.domains}")

        logger.info("🔍 COMPANY STEP 5: Adding background task")
        # FIXED: Use v2 external endpoints (the current non-deprecated API)
        background_tasks_runner.add_task(
            background_tasks.run_enrichment_task, 
            job_id,
            "/v2/companies/enrich",  # v2 endpoint
            "/v2/companies/enrich/{id}",  # v2 status endpoint
            payload
        )
        logger.info(f"🔍 COMPANY STEP 5 SUCCESS: Background task added for job {job_id}")
        
        response = {"job_id": job_id, "status": "pending"}
        logger.info(f"🔍 COMPANY SUCCESS: Returning {response}")
        
        return response
        
    except Exception as e:
        logger.error(f"🚨 COMPANY ERROR with job_id = {job_id}: {str(e)}")
        logger.error(f"🚨 COMPANY TRACEBACK:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "error_type": type(e).__name__,
                "job_id_when_error": job_id,
                "endpoint": "company_enrichment_v2",
                "traceback": traceback.format_exc()
            }
        )

@router.get("/enrich/status/{job_id}", response_model=res_models.JobStatusResponse)
async def get_company_enrichment_status(job_id: str):
    """Get company enrichment job status"""
    try:
        logger.info(f"🔍 COMPANY STATUS: Getting status for job_id = {job_id}")
        job = job_manager.get_job(job_id)
        if job["status"] == "not_found":
            raise HTTPException(status_code=404, detail={"error": "Job not found"})
        logger.info(f"🔍 COMPANY STATUS SUCCESS: Job {job_id} has status {job['status']}")
        return {"job_id": job_id, **job}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 COMPANY STATUS ERROR for {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"error": str(e)})
