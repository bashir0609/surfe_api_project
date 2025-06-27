from fastapi import APIRouter, Depends, HTTPException
from api.models import requests as req_models, responses as res_models
from core.dependencies import get_api_key
from utils import api_client

print("Loading company_lookalikes.py") # DEBUG PRINT

router = APIRouter(prefix="/api/v1/companies", tags=["Company"])
@router.post("/lookalikes", response_model=res_models.GenericResponse)
async def get_company_lookalikes(request: req_models.CompanyLookalikeRequest, api_key: str = Depends(get_api_key)):
    result = await api_client.make_surfe_request("POST", "/v1/organizations/look-alikes", api_key, json_data=request.model_dump())
    if "error" in result:
        error_detail = result.get("details", result.get("error", "An unknown API error occurred."))
        raise HTTPException(status_code=500, detail={"error": str(error_detail)})
    return {"success": True, "data": result}