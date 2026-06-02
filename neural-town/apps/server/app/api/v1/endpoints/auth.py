"""
Neural Town API v1 端点 - 认证路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserOut,
    UserUpdate, MessageResponse,
)
from app.services.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user,
)

router = APIRouter(prefix='/auth', tags=['认证'])


@router.post('/register', response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """注册新用户，返回 JWT 令牌"""
    # 检查用户名唯一性
    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail='用户名已被注册')

    # 检查邮箱唯一性
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail='邮箱已被注册')

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.username,
        role_tags=body.role_tags,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post('/login', response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """用户登录，返回 JWT 令牌"""
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail='用户名或密码错误')

    if not user.is_active:
        raise HTTPException(status_code=403, detail='账户已被禁用')

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get('/me', response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return UserOut.model_validate(user)


@router.put('/me', response_model=UserOut)
async def update_me(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新当前用户资料"""
    if body.display_name is not None:
        user.display_name = body.display_name
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url
    if body.bio is not None:
        user.bio = body.bio
    if body.role_tags is not None:
        user.role_tags = body.role_tags

    await db.flush()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.post('/certify', response_model=UserOut)
async def certify_role(
    role: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """角色认证（简化版：直接添加认证角色）"""
    if role not in [r for r in user.role_tags]:
        raise HTTPException(status_code=400, detail='请先添加该角色到你的兴趣标签')

    certified = list(user.certified_roles or [])
    if role not in certified:
        certified.append(role)
        user.certified_roles = certified
        await db.flush()
        await db.refresh(user)

    return UserOut.model_validate(user)