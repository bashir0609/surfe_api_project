#!/usr/bin/env python3
"""
Debug script to test individual module imports
Run this script to identify which module is causing the job_id error
"""

import sys
import traceback

def test_import(module_name, import_statement):
    """Test importing a specific module and catch any errors"""
    print(f"\n{'='*50}")
    print(f"Testing: {module_name}")
    print(f"Import: {import_statement}")
    print('='*50)
    
    try:
        exec(import_statement)
        print(f"✅ SUCCESS: {module_name} imported without errors")
        return True
    except Exception as e:
        print(f"❌ ERROR in {module_name}: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        print("❌ Full traceback:")
        print(traceback.format_exc())
        return False

def main():
    """Test all your modules one by one"""
    print("Starting module import debugging...")
    
    modules_to_test = [
        ("uuid", "from uuid import uuid4"),
        ("FastAPI basics", "from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks"),
        ("typing", "from typing import List, Optional, Dict, Any"),
        ("pydantic", "from pydantic import BaseModel, Field, model_validator"),
        ("responses.py", "from api.models import responses"),
        ("requests.py", "from api.models import requests"),
        ("dependencies", "from core.dependencies import get_api_key"),
        ("job_manager", "from core import job_manager"),
        ("background_tasks", "from core import background_tasks"),
    ]
    
    failed_modules = []
    
    for module_name, import_stmt in modules_to_test:
        success = test_import(module_name, import_stmt)
        if not success:
            failed_modules.append(module_name)
    
    print(f"\n{'='*60}")
    print("SUMMARY")
    print('='*60)
    
    if failed_modules:
        print(f"❌ FAILED MODULES: {failed_modules}")
        print("The 'job_id' error is likely coming from one of these modules.")
    else:
        print("✅ All modules imported successfully!")
        print("The error might be in the endpoint logic itself.")
    
    # Additional test: Try creating a simple Pydantic model
    print(f"\n{'='*50}")
    print("Testing simple Pydantic model creation...")
    try:
        from pydantic import BaseModel
        from typing import Optional, Any
        
        class TestJobResponse(BaseModel):
            job_id: str
            status: str
            result: Optional[Any] = None
        
        # Test creating an instance
        test_instance = TestJobResponse(job_id="test_123", status="pending")
        print(f"✅ Test Pydantic model works: {test_instance}")
        
    except Exception as e:
        print(f"❌ Pydantic model test failed: {str(e)}")
        print(traceback.format_exc())

if __name__ == "__main__":
    main()