from pydantic import BaseModel
from typing import List, Optional, Any, Dict

print("Loading responses.py") # DEBUG PRINT

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[Any] = None

class GenericResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class Company(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    industries: Optional[List[str]] = []
    employeeCount: Optional[int] = None

class Person(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    jobTitle: Optional[str] = None
    companyName: Optional[str] = None
    linkedinUrl: Optional[str] = None
    email: Optional[str] = None
    mobilePhone: Optional[str] = None