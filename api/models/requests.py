# ==============================================================================
# File: surfe_api_project/api/models/requests.py - Organized Pydantic Models
# ==============================================================================

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any

print("Loading requests.py") # DEBUG PRINT

# --- Company Search/Lookalike/Enrichment Models ---
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
    names: Optional[List[str]] = None
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

# --- People Search Models ---
class PeopleFilters(BaseModel):
    countries: Optional[List[str]] = None
    departments: Optional[List[str]] = None
    jobTitles: Optional[List[str]] = None
    seniorities: Optional[List[str]] = None

class PeopleSearchRequestV2(BaseModel):
    companies: Optional[CompanySearchFilters] = Field(default_factory=CompanySearchFilters)
    people: Optional[PeopleFilters] = Field(default_factory=PeopleFilters)
    limit: int = Field(10, ge=1, le=100)
    peoplePerCompany: int = Field(1, ge=1, le=10)
    pageToken: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "companies": {
                    "countries": ["us", "fr"],
                    "industries": ["Software", "SaaS"],
                    "employeeCount": {"from": 10, "to": 1000}
                },
                "people": {
                    "seniorities": ["manager", "director"],
                    "departments": ["Management", "Engineering"]
                },
                "limit": 10,
                "peoplePerCompany": 2,
                "pageToken": ""
            }
        }

# Old v1 People Search Model (for backward compatibility if needed)
class PeopleSearchRequest(BaseModel): # Kept as PeopleSearchRequest for existing routes
    filters: Dict[str, Any] = Field(..., example={"seniorities": ["manager"], "industries": ["internet"]})
    people_per_company: int = Field(1, ge=1, le=5)
    limit: int = Field(10, ge=1, le=200)

# --- People Enrichment Models (V2 Specification) ---
class EnrichmentInclude(BaseModel):
    email: bool = False
    linkedInUrl: bool = False
    mobile: bool = False

    @model_validator(mode='after')
    def check_at_least_one_true(self):
        if not (self.email or self.linkedInUrl or self.mobile):
            raise ValueError("At least one field (email, linkedInUrl, or mobile) must be true in 'include'.")
        return self

class NotificationOptions(BaseModel):
    webhookUrl: Optional[str] = None

class PersonEnrichmentInput(BaseModel):
    companyDomain: Optional[str] = None
    companyName: Optional[str] = None
    externalID: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    linkedinUrl: Optional[str] = None

    @model_validator(mode='after')
    def check_name_or_linkedin(self):
        if not (self.linkedinUrl or (self.firstName and self.lastName and self.companyName)):
            raise ValueError("Each person must have 'linkedinUrl' OR ('firstName', 'lastName', and 'companyName').")
        return self

class PeopleEnrichmentRequestV2(BaseModel): # The new V2 model for enrichment
    people: List[PersonEnrichmentInput] = Field(..., min_length=1, max_length=10000)
    include: EnrichmentInclude
    notificationOptions: Optional[NotificationOptions] = None

    class Config:
        json_schema_extra = {
            "example": {
                "people": [
                    {
                        "firstName": "John",
                        "lastName": "Doe",
                        "companyName": "Example Corp",
                        "companyDomain": "example.com",
                        "externalID": "user123"
                    },
                    {
                        "linkedinUrl": "https://www.linkedin.com/in/somebody"
                    }
                ],
                "include": {
                    "email": True,
                    "mobile": True
                },
                "notificationOptions": {
                    "webhookUrl": "https://your.webhook.url/here"
                }
            }
        }

# Old v1 People Enrichment Model (Renamed for clarity if V1 endpoint is maintained)
class PeopleEnrichmentRequestV1(BaseModel): # Renamed for clarity
    people: List[Dict[str, str]] = Field(..., example=[{"firstName": "John", "lastName": "Doe", "companyName": "Google"}])
    enrichment_type: str = Field("emailAndMobile", example="emailAndMobile") # Not used in V2 conversion
    name: str = "My People Enrichment List" # Not used in V2 conversion