from fastapi import APIRouter
from .endpoints import query, assistant, automation, accessibility

api_router = APIRouter()
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(automation.router, prefix="/automation", tags=["automation"])
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["accessibility"])

# Add more routers as needed
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
