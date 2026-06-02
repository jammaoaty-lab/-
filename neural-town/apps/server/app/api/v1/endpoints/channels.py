"""
Neural Town API v1 端点 - 频道路由
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Channel
from app.schemas import ChannelOut

router = APIRouter(prefix='/channels', tags=['频道'])


@router.get('', response_model=List[ChannelOut])
async def list_channels(db: AsyncSession = Depends(get_db)):
    """获取所有频道列表，按 sort_order 排序"""
    result = await db.execute(
        select(Channel).order_by(Channel.sort_order)
    )
    channels = result.scalars().all()
    return [ChannelOut.model_validate(c) for c in channels]


@router.get('/{slug}', response_model=ChannelOut)
async def get_channel(slug: str, db: AsyncSession = Depends(get_db)):
    """根据 slug 获取频道详情"""
    result = await db.execute(select(Channel).where(Channel.slug == slug))
    channel = result.scalar_one_or_none()
    if not channel:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='频道不存在')
    return ChannelOut.model_validate(channel)