from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import motor.motor_asyncio
from config import settings
from routers import auth, podcasts, recommendations, agents, nlp
from services.database import get_database
from services.security import verify_token
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database connection
client = None
database = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from services.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()
    logger.info("Database connected successfully")
    
    yield
    
    # Shutdown
    await close_mongo_connection()
    logger.info("Database connection closed")

app = FastAPI(
    title=settings.project_name,
    description="An AI-powered podcast recommendation system with multi-agent architecture",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_str, tags=["authentication"])
app.include_router(podcasts.router, prefix=settings.api_v1_str, tags=["podcasts"])
app.include_router(recommendations.router, prefix=settings.api_v1_str, tags=["recommendations"])
app.include_router(agents.router, prefix=settings.api_v1_str, tags=["agents"])
app.include_router(nlp.router, prefix=settings.api_v1_str, tags=["nlp"])

@app.get("/")
async def root():
    return {
        "message": "Podcast Recommendation System API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
