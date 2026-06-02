"""
Neural Town API v1 端点 - 帖子与评论路由
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import User, Post, Comment, Like, Channel, Project, Notification
from app.schemas import (
    PostCreate, PostOut, PostListResponse, CommentCreate, CommentOut, MessageResponse,
)
from app.services.auth import get_current_user, get_optional_user

router = APIRouter(prefix='/posts', tags=['帖子'])


async def enrich_post(post: Post, db: AsyncSession, current_user: Optional[User]) -> PostOut:
    """丰富帖子数据：加载关联、检查点赞状态"""
    # 加载关联
    await db.refresh(post, ['author', 'channel'])

    is_liked = False
    if current_user:
        like_result = await db.execute(
            select(Like).where(
                and_(Like.user_id == current_user.id, Like.post_id == post.id)
            )
        )
        is_liked = like_result.scalar_one_or_none() is not None

    p = PostOut.model_validate(post)
    p.is_liked = is_liked

    if post.author:
        from app.schemas import UserOut
        p.author = UserOut.model_validate(post.author)
    if post.channel:
        from app.schemas import ChannelOut
        p.channel = ChannelOut.model_validate(post.channel)

    return p


@router.get('', response_model=PostListResponse)
async def list_posts(
    channel: Optional[str] = Query(None, description='频道 slug'),
    sort: str = Query('latest', description='排序方式: hot, latest, following'),
    cursor: Optional[str] = Query(None, description='游标（上一页最后帖子ID）'),
    limit: int = Query(20, ge=1, le=50),
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """获取帖子列表，支持频道过滤和排序"""
    base_query = select(Post).options(
        selectinload(Post.author),
        selectinload(Post.channel),
    ).where(Post.status == 'published')

    # 频道过滤
    if channel and channel != 'all':
        ch_result = await db.execute(select(Channel).where(Channel.slug == channel))
        ch = ch_result.scalar_one_or_none()
        if ch:
            base_query = base_query.where(Post.channel_id == ch.id)
        else:
            return PostListResponse(items=[], total=0, has_more=False)

    # 排序
    if sort == 'hot':
        base_query = base_query.order_by(desc(Post.like_count))
    elif sort == 'following' and user:
        # 关注者的帖子
        from sqlalchemy import exists
        from app.models import Follow
        sub = select(Follow.following_id).where(Follow.follower_id == user.id)
        base_query = base_query.where(Post.author_id.in_(sub))
        base_query = base_query.order_by(desc(Post.created_at))
    else:
        base_query = base_query.order_by(desc(Post.created_at))

    # 游标分页
    if cursor:
        base_query = base_query.where(Post.id < cursor)

    base_query = base_query.limit(limit + 1)

    result = await db.execute(base_query)
    posts = result.scalars().all()

    has_more = len(posts) > limit
    items = posts[:limit]

    enriched = []
    for p in items:
        enriched.append(await enrich_post(p, db, user))

    # 总数
    count_query = select(func.count()).select_from(Post).where(Post.status == 'published')
    if channel and channel != 'all':
        ch_result = await db.execute(select(Channel).where(Channel.slug == channel))
        ch = ch_result.scalar_one_or_none()
        if ch:
            count_query = count_query.where(Post.channel_id == ch.id)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    next_cursor = str(items[-1].id) if has_more and items else None

    return PostListResponse(
        items=enriched,
        total=total,
        cursor=next_cursor,
        has_more=has_more,
    )


@router.post('', response_model=PostOut, status_code=201)
async def create_post(
    body: PostCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发布帖子"""
    post = Post(
        author_id=user.id,
        channel_id=body.channel_id,
        title=body.title,
        body=body.body,
        body_plain=body.body_plain,
        post_type=body.post_type,
        source_project_id=body.source_project_id,
        prompt_data=body.prompt_data or {},
        media_urls=body.media_urls,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return await enrich_post(post, db, user)


@router.get('/{post_id}', response_model=PostOut)
async def get_post(
    post_id: UUID,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """获取帖子详情"""
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.author), selectinload(Post.channel))
        .where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail='帖子不存在')

    # 增加浏览量
    post.view_count = (post.view_count or 0) + 1
    await db.flush()

    return await enrich_post(post, db, user)


@router.post('/{post_id}/like', response_model=MessageResponse)
async def like_post(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """点赞帖子"""
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail='帖子不存在')

    # 检查是否已赞
    existing = await db.execute(
        select(Like).where(and_(Like.user_id == user.id, Like.post_id == post_id))
    )
    if existing.scalar_one_or_none():
        return MessageResponse(message='已经点过赞了')

    like = Like(user_id=user.id, post_id=post_id)
    db.add(like)
    post.like_count = (post.like_count or 0) + 1

    # 发送通知给帖子作者
    if post.author_id != user.id:
        notif = Notification(
            user_id=post.author_id,
            type='like',
            title='新点赞',
            body=f'{user.display_name} 赞了你的帖子',
            data={'post_id': str(post_id), 'user_id': str(user.id)},
        )
        db.add(notif)

    await db.flush()
    return MessageResponse(message='点赞成功')


@router.post('/{post_id}/unlike', response_model=MessageResponse)
async def unlike_post(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """取消点赞"""
    result = await db.execute(
        select(Like).where(and_(Like.user_id == user.id, Like.post_id == post_id))
    )
    like = result.scalar_one_or_none()
    if not like:
        return MessageResponse(message='尚未点赞')

    await db.delete(like)

    post = await db.get(Post, post_id)
    if post:
        post.like_count = max(0, (post.like_count or 1) - 1)

    await db.flush()
    return MessageResponse(message='已取消点赞')


@router.post('/{post_id}/comments', response_model=CommentOut, status_code=201)
async def create_comment(
    post_id: UUID,
    body: CommentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """发表评论"""
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail='帖子不存在')

    comment = Comment(
        post_id=post_id,
        author_id=user.id,
        parent_id=body.parent_id,
        body=body.body,
    )
    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1

    # 通知
    if post.author_id != user.id:
        notif = Notification(
            user_id=post.author_id,
            type='comment',
            title='新评论',
            body=f'{user.display_name} 评论了你的帖子',
            data={'post_id': str(post_id), 'comment_id': str(comment.id)},
        )
        db.add(notif)

    await db.flush()
    await db.refresh(comment)

    from app.schemas import UserOut
    c = CommentOut.model_validate(comment)
    c.author = UserOut.model_validate(user)
    return c


@router.get('/{post_id}/comments', response_model=list[CommentOut])
async def get_comments(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """获取帖子评论列表（含嵌套）"""
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(and_(Comment.post_id == post_id, Comment.parent_id.is_(None)))
        .order_by(Comment.created_at)
    )
    top_comments = result.scalars().all()

    out: list[CommentOut] = []
    for c in top_comments:
        from app.schemas import UserOut
        co = CommentOut.model_validate(c)
        if c.author:
            co.author = UserOut.model_validate(c.author)

        # 加载子评论
        children_result = await db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.parent_id == c.id)
            .order_by(Comment.created_at)
        )
        children = children_result.scalars().all()
        co.children = []
        for child in children:
            child_out = CommentOut.model_validate(child)
            if child.author:
                child_out.author = UserOut.model_validate(child.author)
            co.children.append(child_out)

        out.append(co)

    return out


@router.post('/{post_id}/fork', response_model=MessageResponse)
async def fork_project(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """复刻帖子中的项目到自己的工作台"""
    post = await db.get(Post, post_id)
    if not post or not post.source_project_id:
        raise HTTPException(status_code=400, detail='该帖子没有可复刻的项目')

    source = await db.get(Project, post.source_project_id)
    if not source:
        raise HTTPException(status_code=404, detail='原项目不存在')

    # 创建副本
    new_project = Project(
        user_id=user.id,
        type=source.type,
        title=f'{source.title} (复刻)',
        description=source.description,
        data=source.data,
        status='draft',
    )
    db.add(new_project)
    await db.flush()

    # 通知原作者
    if source.user_id != user.id:
        notif = Notification(
            user_id=source.user_id,
            type='fork',
            title='项目被复刻',
            body=f'{user.display_name} 复刻了你的项目 {source.title}',
            data={'project_id': str(new_project.id), 'user_id': str(user.id)},
        )
        db.add(notif)

    await db.flush()
    return MessageResponse(message=f'项目已复制到你的工作台，ID: {new_project.id}')