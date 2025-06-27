# ==============================================================================
# File: surfe_api_project/config/config.py
# ==============================================================================

import os

print("Loading config.py") # DEBUG PRINT

# Direct variable (for direct import)
SURFE_API_BASE_URL = "https://api.surfe.com"

# Config class (for object-based import)
class Config:
    SURFE_API_BASE_URL = "https://api.surfe.com"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# Create a global config instance
config = Config()