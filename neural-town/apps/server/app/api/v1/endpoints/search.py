"""
Neural Town API v1 端点 - 全局搜索路由
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc

from app.database import get_db
from app.models import Post, User, Project
from app.schemas import PostOut, UserOut, ProjectOut, SearchResult

router = APIRouter(prefix='/search', tags=['搜索'])


@router.get('', response_model=SearchResult)
async def search(
    q: str = Query(..., min_length=1),
    type: str = Query('all', description='posts,projects,users,all'),
    db: AsyncSession = Depends(get_db),
):
    """全局搜索帖子、项目、用户"""
    search_term = f'%{q}%'
    posts: list[PostOut] = []
    projects: list[ProjectOut] = []
    users: list[UserOut] = []
    total = 0

    # 搜索帖子
    if type in ('posts', 'all'):
        result = await db.execute(
            select(Post).where(
                or_(
                    Post.title.ilike(search_term),
                    Post.body_plain.ilike(search_term),
                ),
                Post.status == 'published',
            ).order_by(desc(Post.created_at)).limit(10)
        )
        for p in result.scalars().all():
            po = PostOut.model_validate(p)
            if p.author:
                po.author = UserOut.model_validate(p.author)
            posts.append(po)
            total += 1

    # 搜索项目
    if type in ('projects', 'all'):
        result = await db.execute(
            select(Project).where(
                or_(
                    Project.title.ilike(search_term),
                    Project.description.ilike(search_term),
                ),
                Project.status == 'published',
            ).order_by(desc(Project.updated_at)).limit(10)
        )
        for p in result.scalars().all():
            po = ProjectOut.model_validate(p)
            if p.user:
                po.user = UserOut.model_validate(p.user)
            projects.append(po)
            total += 1

    # 搜索用户
    if type in ('users', 'all'):
        result = await db.execute(
            select(User).where(
                or_(
                    User.username.ilike(search_term),
                    User.display_name.ilike(search_term),
                    User.bio.ilike(search_term),
                ),
            ).order_by(User.username).limit(10)
        )
        for u in result.scalars().all():
            users.append(UserOut.model_validate(u))
            total += 1

    return SearchResult(posts=posts, projects=projects, users=users, total=total)