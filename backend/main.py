from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import rituals, items, abilities

app = FastAPI(title="Ordem Paranormal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rituals.router, prefix="/api", tags=["rituals"])
app.include_router(items.router, prefix="/api", tags=["items"])
app.include_router(abilities.router, prefix="/api", tags=["abilities"])

# serve the frontend/ folder as static files
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")
