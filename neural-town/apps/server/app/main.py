"""
Neural Town 后端主入口 - FastAPI 应用
启动: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.api.v1 import router as v1_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化数据库，关闭时清理"""
    if settings.environment == 'development':
        await init_db()
    yield


app = FastAPI(
    title='Neural Town API',
    description='Neural Town「无限星河」—— AI 原生宇宙社区后端 API',
    version='0.1.0',
    lifespan=lifespan,
)

# CORS 配置
origins = [o.strip() for o in settings.cors_origins.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# 注册路由
app.include_router(v1_router)


@app.get('/')
async def root():
    return {
        'name': 'Neural Town API',
        'version': '0.1.0',
        'docs': '/docs',
    }


@app.get('/health')
async def health():
    return {'status': 'ok'}