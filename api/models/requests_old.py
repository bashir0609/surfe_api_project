from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

print("Loading requests_old.py") # DEBUG PRINT

class EmployeeCountRange(BaseModel):
    from_: int = Field(alias="from")
    to: int

class RevenueRange(BaseModel):
    from_: int = Field(alias="from") 
    to: int

class CompanySearchFilters(BaseModel):
    countries: Optional[List[str]] = None
    domains: Optional[List[str]] = None
    domainsExcluded: Optional[List[str]] = None
    employeeCount: Optional[EmployeeCountRange] = None
    industries: Optional[List[str]] = None
    revenue: Optional[RevenueRange] = None

class CompanySearchRequest(BaseModel):
    filters: CompanySearchFilters
    limit: int = Field(10, ge=1, le=200)
    pageToken: str = ""

class CompanyLookalikeRequest(BaseModel):
    domain: str = Field(..., example="surfe.com")
    limit: int = Field(10, ge=1, le=50)

class CompanyEnrichmentRequest(BaseModel):
    domains: List[str] = Field(..., example=["surfe.com", "google.com"])
    name: str = "My Enrichment List"

class PeopleSearchRequest(BaseModel):
    filters: Dict[str, Any] = Field(..., example={"seniorities": ["manager"], "industries": ["internet"]})
    people_per_company: int = Field(1, ge=1, le=5)
    limit: int = Field(10, ge=1, le=200)

class PeopleEnrichmentRequest(BaseModel):
    people: List[Dict[str, str]] = Field(..., example=[{"firstName": "John", "lastName": "Doe", "companyName": "Google"}])
    enrichment_type: str = Field("emailAndMobile", example="emailAndMobile")
    name: str = "My People Enrichment List"