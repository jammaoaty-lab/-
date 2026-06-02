"""
Neural Town API v1 端点 - 资讯空间站路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import NewsSource, NewsItem
from app.schemas import NewsSourceOut, NewsItemOut

router = APIRouter(prefix='/news', tags=['资讯'])


@router.get('/sources', response_model=list[NewsSourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)):
    """获取所有资讯源"""
    result = await db.execute(
        select(NewsSource).where(NewsSource.is_active == True).order_by(NewsSource.name)
    )
    sources = result.scalars().all()
    return [NewsSourceOut.model_validate(s) for s in sources]


@router.get('', response_model=list[NewsItemOut])
async def list_news(
    db: AsyncSession = Depends(get_db),
):
    """获取最新资讯条目"""
    result = await db.execute(
        select(NewsItem)
        .order_by(desc(NewsItem.published_at))
        .limit(30)
    )
    items = result.scalars().all()
    return [NewsItemOut.model_validate(i) for i in items]