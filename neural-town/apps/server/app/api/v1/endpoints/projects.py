"""
Neural Town API v1 端点 - 工作台项目路由
"""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import Project, User, Post
from app.schemas import ProjectCreate, ProjectUpdate, ProjectOut, UserOut, MessageResponse
from app.services.auth import get_current_user

router = APIRouter(prefix='/projects', tags=['项目'])


@router.get('', response_model=list[ProjectOut])
async def list_projects(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query('published'),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取我的项目列表"""
    query = select(Project).options(
        __import__('sqlalchemy.orm', fromlist=['selectinload']).selectinload(Project.user),
    ).where(Project.user_id == user.id)

    if type:
        query = query.where(Project.type == type)
    if status:
        query = query.where(Project.status == status)

    query = query.order_by(desc(Project.updated_at)).limit(50)

    result = await db.execute(query)
    projects = result.scalars().all()

    out: list[ProjectOut] = []
    for p in projects:
        po = ProjectOut.model_validate(p)
        if p.user:
            po.user = UserOut.model_validate(p.user)
        out.append(po)

    return out


@router.post('', response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建新项目"""
    project = Project(
        user_id=user.id,
        type=body.type,
        title=body.title,
        description=body.description,
        data=body.data,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)

    po = ProjectOut.model_validate(project)
    po.user = UserOut.model_validate(user)
    return po


@router.get('/{project_id}', response_model=ProjectOut)
async def get_project(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取项目详情（仅所有者可查看草稿）"""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Project).options(selectinload(Project.user)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail='项目不存在')

    if project.status == 'draft' and project.user_id != user.id:
        raise HTTPException(status_code=403, detail='无权查看该草稿')

    po = ProjectOut.model_validate(project)
    if project.user:
        po.user = UserOut.model_validate(project.user)
    return po


@router.put('/{project_id}', response_model=ProjectOut)
async def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新项目数据（增量同步 data JSON）"""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Project).options(selectinload(Project.user)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail='项目不存在')

    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail='无权修改此项目')

    if body.title is not None:
        project.title = body.title
    if body.description is not None:
        project.description = body.description
    if body.data is not None:
        # 深度合并而非直接替换
        merged = {**project.data, **body.data}
        project.data = merged
    if body.thumbnail_url is not None:
        project.thumbnail_url = body.thumbnail_url

    await db.flush()
    await db.refresh(project)

    po = ProjectOut.model_validate(project)
    if project.user:
        po.user = UserOut.model_validate(project.user)
    return po


@router.post('/{project_id}/publish', response_model=ProjectOut)
async def publish_project(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发布项目到社区（将项目关联创建帖子）"""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Project).options(selectinload(Project.user)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail='项目不存在')
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail='无权发布此项目')

    # 创建关联帖子
    post = Post(
        author_id=user.id,
        title=project.title,
        body=project.description,
        body_plain=project.description,
        post_type='creation',
        source_project_id=project.id,
    )
    db.add(post)
    await db.flush()

    project.status = 'published'
    project.published_post_id = post.id
    await db.flush()
    await db.refresh(project)

    po = ProjectOut.model_validate(project)
    if project.user:
        po.user = UserOut.model_validate(project.user)
    return po


@router.delete('/{project_id}', response_model=MessageResponse)
async def delete_project(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除项目"""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail='项目不存在')
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail='无权删除此项目')

    await db.delete(project)
    await db.flush()
    return MessageResponse(message='项目已删除')