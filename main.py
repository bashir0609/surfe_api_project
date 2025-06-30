import os
import socket
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from core.dependencies import get_api_key
from api.routes import company_lookalikes, company_search, company_enrichment, people_search, people_enrichment, diagnostics, dashboard, data_quality_test

print(f"DEBUG: main.py started. Current working directory: {os.getcwd()}")
print(f"DEBUG: Value of SURFE_API_KEY_1: {os.getenv('SURFE_API_KEY_1')}")
print(f"DEBUG: Value of KV_URL: {os.getenv('KV_URL')}")
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

# IMPROVED: Mount static files with absolute paths and error handling
static_dir = os.path.join(BASE_DIR, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    print(f"✅ Mounted static files from: {static_dir}")
else:
    print(f"❌ Static directory not found: {static_dir}")

# IMPROVED: Templates with absolute path
templates_dir = os.path.join(BASE_DIR, "templates")
if os.path.exists(templates_dir):
    templates = Jinja2Templates(directory=templates_dir)
    print(f"✅ Templates directory found: {templates_dir}")
else:
    print(f"❌ Templates directory not found: {templates_dir}")

# ADDED: Explicit route for CSS file (Vercel fallback)
@app.get("/static/css/styles.css")
async def serve_css():
    css_file = os.path.join(BASE_DIR, "static", "css", "styles.css")
    if os.path.exists(css_file):
        return FileResponse(css_file, media_type="text/css")
    else:
        print(f"❌ CSS file not found: {css_file}")
        return HTMLResponse("/* CSS file not found */", status_code=404)

# ADDED: Debug endpoint to check static files
@app.get("/debug/static")
async def debug_static():
    static_dir = os.path.join(BASE_DIR, "static")
    css_file = os.path.join(static_dir, "css", "styles.css")
    
    return {
        "base_dir": BASE_DIR,
        "static_dir": static_dir,
        "static_exists": os.path.exists(static_dir),
        "css_file": css_file,
        "css_exists": os.path.exists(css_file),
        "static_contents": os.listdir(static_dir) if os.path.exists(static_dir) else [],
        "css_dir_contents": os.listdir(os.path.join(static_dir, "css")) if os.path.exists(os.path.join(static_dir, "css")) else []
    }

app.include_router(company_lookalikes.router)
app.include_router(company_search.router)
app.include_router(company_enrichment.router)
app.include_router(people_search.router)
app.include_router(people_enrichment.router)
app.include_router(diagnostics.router)
app.include_router(dashboard.router)
app.include_router(data_quality_test.router)

# main.py - Updated root route with API key check
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Check if API keys are configured
    import os
    api_keys = [os.getenv(f"SURFE_API_KEY_{i}") for i in range(1, 6)]
    valid_keys = [key for key in api_keys if key]
    
    if not valid_keys:
        # No API keys configured - show landing page
        return templates.TemplateResponse("index.html", {"request": request})
    else:
        # API keys configured - show dashboard
        return templates.TemplateResponse("dashboard.html", {"request": request})
    
# main.py - Add API key check middleware for other routes
@app.middleware("http")
async def check_api_keys_middleware(request: Request, call_next):
    """Redirect to landing page if no API keys configured"""
    # Skip for static files and root route
    if (request.url.path.startswith("/static/") or 
        request.url.path == "/" or
        request.url.path == "/static/favicon.ico"):
        response = await call_next(request)
        return response
    
    # Check if any API keys are configured
    import os
    api_keys = [os.getenv(f"SURFE_API_KEY_{i}") for i in range(1, 6)]
    valid_keys = [key for key in api_keys if key]
    
    if not valid_keys:
        # No API keys configured - redirect to landing page
        return RedirectResponse(url="/", status_code=303)
    
    response = await call_next(request)
    return response

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
