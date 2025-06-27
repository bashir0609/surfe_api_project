from typing import Dict, Any

print("Loading job_manager.py") # DEBUG PRINT

jobs: Dict[str, Dict[str, Any]] = {}

def create_job(job_id: str):
    jobs[job_id] = {"status": "pending", "result": None}

def get_job(job_id: str) -> Dict[str, Any]:
    return jobs.get(job_id, {"status": "not_found", "result": None})

def update_job_status(job_id: str, status: str, result: Any = None):
    if job_id in jobs:
        jobs[job_id]["status"] = status
        if result is not None:
            jobs[job_id]["result"] = result