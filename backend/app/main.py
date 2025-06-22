from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router

app = FastAPI(
    title="Statio API",
    description="API for Statio - Service Status Monitoring",
    version="1.0.0",
    # Disable docs in production
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware to block docs access in production
@app.middleware("http")
async def block_docs_in_production(request: Request, call_next):
    if not settings.DEBUG:
        # Block access to docs endpoints in production
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            raise HTTPException(status_code=404, detail="Not found")
    
    response = await call_next(request)
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Statio API"} 