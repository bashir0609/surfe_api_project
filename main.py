import os
import socket
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from core.dependencies import get_api_key
from api.routes import company_lookalikes, company_search, company_enrichment, people_search, people_enrichment, diagnostics, dashboard, data_quality_test

print(f"DEBUG: main.py started. Current working directory: {os.getcwd()}")
print(f"DEBUG: Value of SURFE_API_KEY_1: {os.getenv('SURFE_API_KEY_1')}")
print(f"DEBUG: Value of KV_URL: {os.getenv('KV_URL')}")
print(f"DEBUG: All environment variables (first 5): {list(os.environ.items())[:5]}") # This might print sensitive info, remove after debugging!
print("Loading main.py") # DEBUG PRINT

def find_free_port(start_port=8000, max_port=8100):
    """Find a free port starting from start_port"""
    for port in range(start_port, max_port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.bind(('127.0.0.1', port))
                print(f"✅ Found free port: {port}")
                return port
        except OSError:
            print(f"❌ Port {port} is busy")
            continue
    
    # If no port found in range, let the system choose
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
        print(f"🔍 System assigned port: {port}")
        return port

# Get the absolute path of the directory containing main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="FastAPI Surfe Fallback")

# Use absolute paths to ensure directories are found, regardless of where the app is started from
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

app.include_router(company_lookalikes.router)
app.include_router(company_search.router)
app.include_router(company_enrichment.router)
app.include_router(people_search.router)
app.include_router(people_enrichment.router)
app.include_router(diagnostics.router)
app.include_router(dashboard.router)
app.include_router(data_quality_test.router)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/pages/{page_name}", response_class=HTMLResponse)
async def show_page(request: Request, page_name: str):
    if ".." in page_name or "/" in page_name:
        return templates.TemplateResponse("404.html", {"request": request}, status_code=404)
    try:
        return templates.TemplateResponse(f"{page_name}.html", {"request": request})
    except Exception:
        return templates.TemplateResponse("404.html", {"request": request}, status_code=404)
    
@app.get("/debug/routes")
async def list_routes():
    routes = []
    for route in app.routes:
        # Safe attribute access
        path = getattr(route, 'path', 'Unknown')
        methods = getattr(route, 'methods', set())
        routes.append({
            "path": path,
            "methods": list(methods) if hasattr(methods, '__iter__') else []
        })
    return {"routes": routes}

if __name__ == "__main__":
    import uvicorn
    
    # Find a free port automatically
    free_port = find_free_port(start_port=8000, max_port=8100)
    
    print(f"🚀 Starting server on http://127.0.0.1:{free_port}")
    print(f"📊 Dashboard: http://127.0.0.1:{free_port}")
    print(f"📈 Company Enrichment: http://127.0.0.1:{free_port}/pages/company_enrichment")
    
    uvicorn.run(app, host="127.0.0.1", port=free_port, reload=True)
