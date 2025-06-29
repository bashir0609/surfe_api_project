# api/routes/people_enrichment.py - Cleaned up imports
from fastapi import APIRouter, HTTPException, BackgroundTasks
from uuid import uuid4
from api.models import requests as req_models, responses as res_models
from core import job_manager, background_tasks
import logging
import traceback

print("Loading people_enrichment.py") # DEBUG PRINT

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["People Enrichment"])

# api/routes/people_enrichment.py - Replace V2 endpoint with rotation
@router.post("/v2/people/enrich", response_model=res_models.JobStatusResponse)
async def start_people_enrichment_v2(
    request: req_models.PeopleEnrichmentRequestV2,
    background_tasks_runner: BackgroundTasks
):
    """V2 People Enrichment with rotation - no individual API key needed"""
    
    job_id = None
    
    try:
        logger.info("🔍 STEP 1: Starting V2 endpoint with rotation")
        
        logger.info("🔍 STEP 2: Creating job_id")
        job_id = str(uuid4())
        logger.info(f"🔍 STEP 2 SUCCESS: job_id = {job_id}")
        
        logger.info("🔍 STEP 3: Converting request to dict")
        payload = request.model_dump(exclude_none=True, by_alias=True)
        logger.info(f"🔍 STEP 3 SUCCESS: Payload has {len(payload)} keys")
        
        logger.info("🔍 STEP 4: Calling job_manager.create_job")
        job_manager.create_job(job_id)
        logger.info(f"🔍 STEP 4 SUCCESS: Job {job_id} created in job_manager")
        
        logger.info("🔍 STEP 5: Adding background task with rotation")
        background_tasks_runner.add_task(
            background_tasks.run_enrichment_task,
            job_id,  # Pass job_id as first argument
            None,    # No individual API key - will use rotation
            "/v2/people/enrich",
            "/v2/people/enrich/{id}",
            payload
        )
        logger.info(f"🔍 STEP 5 SUCCESS: Background task added for job {job_id}")
        
        logger.info("🔍 STEP 6: Creating response")
        response = {"job_id": job_id, "status": "pending"}
        logger.info(f"🔍 STEP 6 SUCCESS: Response = {response}")
        
        return response
        
    except Exception as e:
        logger.error(f"🚨 ERROR occurred with job_id = {job_id}")
        logger.error(f"🚨 ERROR message: {str(e)}")
        logger.error(f"🚨 ERROR type: {type(e).__name__}")
        logger.error(f"🚨 FULL TRACEBACK:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e),
                "error_type": type(e).__name__,
                "job_id_when_error": job_id,
                "traceback": traceback.format_exc()
            }
        )
    
# api/routes/people_enrichment.py - Replace V1 endpoint with rotation
@router.post("/v1/people/enrich", response_model=res_models.JobStatusResponse)
async def start_people_enrichment_v1(
    request: req_models.PeopleEnrichmentRequestV1,
    background_tasks_runner: BackgroundTasks
):
    """V1 People Enrichment with rotation - no individual API key needed"""
    
    job_id = None
    
    try:
        logger.info("🔍 V1 STEP 1: Starting V1 endpoint with rotation")
        
        logger.info("🔍 V1 STEP 2: Creating job_id")
        job_id = str(uuid4())
        logger.info(f"🔍 V1 STEP 2 SUCCESS: job_id = {job_id}")
        
        logger.info("🔍 V1 STEP 3: Converting V1 to V2 format")
        
        # Create V2 include object
        v2_include = req_models.EnrichmentInclude(email=True, mobile=True)
        logger.info("🔍 V1 STEP 3a: Created EnrichmentInclude")
        
        # Convert people list
        v2_people_input = []
        for i, p in enumerate(request.people):
            logger.info(f"🔍 V1 STEP 3b: Converting person {i}: {p}")
            person_input = req_models.PersonEnrichmentInput(
                firstName=p.get("firstName"),
                lastName=p.get("lastName"),
                companyName=p.get("companyName"),
                linkedinUrl=p.get("linkedinUrl"),
                externalID=p.get("externalID")
            )
            v2_people_input.append(person_input)
        
        logger.info(f"🔍 V1 STEP 3c: Converted {len(v2_people_input)} people")
        
        # Create V2 request
        v2_request = req_models.PeopleEnrichmentRequestV2(
            people=v2_people_input,
            include=v2_include,
            notificationOptions=None
        )
        logger.info("🔍 V1 STEP 3d: Created V2 request object")
        
        # Convert to payload
        payload = v2_request.model_dump(exclude_none=True, by_alias=True)
        logger.info(f"🔍 V1 STEP 3 SUCCESS: Converted to payload with {len(payload)} keys")
        
        logger.info("🔍 V1 STEP 4: Creating job in job_manager")
        job_manager.create_job(job_id)
        logger.info(f"🔍 V1 STEP 4 SUCCESS: Job {job_id} created")
        
        logger.info("🔍 V1 STEP 5: Adding background task with rotation")
        background_tasks_runner.add_task(
            background_tasks.run_enrichment_task,
            job_id,
            None,    # No individual API key - will use rotation
            "/v2/people/enrich",
            "/v2/people/enrich/{id}",
            payload
        )
        logger.info(f"🔍 V1 STEP 5 SUCCESS: Background task added for job {job_id}")
        
        response = {"job_id": job_id, "status": "pending"}
        logger.info(f"🔍 V1 SUCCESS: Returning {response}")
        
        return response
        
    except Exception as e:
        logger.error(f"🚨 V1 ERROR with job_id = {job_id}: {str(e)}")
        logger.error(f"🚨 V1 TRACEBACK:\n{traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "error_type": type(e).__name__,
                "job_id_when_error": job_id,
                "endpoint": "V1",
                "traceback": traceback.format_exc()
            }
        )

# Status endpoints
@router.get("/v2/people/enrich/status/{job_id}", response_model=res_models.JobStatusResponse)
async def get_people_enrichment_status_v2(job_id: str):
    """Get V2 job status"""
    try:
        logger.info(f"🔍 STATUS V2: Getting status for job_id = {job_id}")
        job = job_manager.get_job(job_id)
        if job["status"] == "not_found":
            raise HTTPException(status_code=404, detail={"error": "Job not found"})
        return {"job_id": job_id, **job}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 STATUS V2 ERROR for {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"error": str(e)})

@router.get("/v1/people/enrich/status/{job_id}", response_model=res_models.JobStatusResponse)
async def get_people_enrichment_status_v1(job_id: str):
    """Get V1 job status"""
    try:
        logger.info(f"🔍 STATUS V1: Getting status for job_id = {job_id}")
        job = job_manager.get_job(job_id)
        if job["status"] == "not_found":
            raise HTTPException(status_code=404, detail={"error": "Job not found"})
        return {"job_id": job_id, **job}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"🚨 STATUS V1 ERROR for {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"error": str(e)})
    
