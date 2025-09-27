from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.podcasts import router as podcasts_router
from .routers.auth import router as auth_router
from .routers.user import router as user_router

app = FastAPI(title="Podcast Retrieval System")

app.add_middleware(	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(podcasts_router, prefix="/podcasts", tags=["podcasts"])
app.include_router(auth_router, prefix="/auth", tags=["auth"]) 
app.include_router(user_router, prefix="/user", tags=["user"])
