import json
import random
from fastapi import Header, HTTPException

print("Loading dependencies.py") # DEBUG PRINT

def get_api_key() -> str:
    try:
        with open("api_keys.json", "r") as f:
            keys = json.load(f)
            
            # Get all surfe API keys
            surfe_keys = [v for k, v in keys.items() if k.startswith("surfe_api_key")]
            
            if not surfe_keys:
                raise HTTPException(status_code=500, detail="No Surfe API keys found in api_keys.json")
            
            # Check if any key is a placeholder
            placeholder_values = ["YOUR_SURFE_API_KEY_HERE", "your_actual_surfe_api_key_here", ""]
            valid_keys = [key for key in surfe_keys if key not in placeholder_values]
            
            if not valid_keys:
                raise HTTPException(status_code=500, detail="API keys not configured properly in api_keys.json")
            
            # Return a random valid key for load balancing
            return random.choice(valid_keys)
            
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="api_keys.json file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in api_keys.json")