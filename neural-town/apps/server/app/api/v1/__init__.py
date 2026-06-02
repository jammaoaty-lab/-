"""
Neural Town API v1 - 路由聚合
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, channels, posts, projects, news, search, generate

router = APIRouter(prefix='/api/v1')
router.include_router(auth.router)
router.include_router(channels.router)
router.include_router(posts.router)
router.include_router(projects.router)
router.include_router(news.router)
router.include_router(search.router)
router.include_router(generate.router)