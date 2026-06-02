"""
Neural Town Pydantic 请求/响应模型
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ─── 认证 ───
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role_tags: List[str] = Field(default=['normal'])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: 'UserOut'


class CertifyRequest(BaseModel):
    role: str
    evidence: dict = {}


# ─── 用户 ───
class UserOut(BaseModel):
    id: UUID
    username: str
    email: str
    display_name: str
    avatar_url: str
    bio: str
    role_tags: List[str]
    certified_roles: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role_tags: Optional[List[str]] = None


# ─── 频道 ───
class ChannelOut(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    icon: str
    group_name: str
    sort_order: int

    class Config:
        from_attributes = True


# ─── 帖子 ───
class PostCreate(BaseModel):
    channel_id: Optional[int] = None
    title: str = ''
    body: str = ''
    body_plain: str = ''
    post_type: str = 'normal'
    source_project_id: Optional[UUID] = None
    prompt_data: Optional[dict] = None
    media_urls: List[str] = []


class PostOut(BaseModel):
    id: UUID
    author_id: UUID
    author: Optional[UserOut] = None
    channel_id: Optional[int] = None
    channel: Optional[ChannelOut] = None
    title: str
    body: str
    body_plain: str
    post_type: str
    source_project_id: Optional[UUID] = None
    prompt_data: Optional[dict] = None
    media_urls: List[str]
    status: str
    like_count: int
    comment_count: int
    view_count: int
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: List[PostOut]
    total: int
    cursor: Optional[str] = None
    has_more: bool = False


# ─── 评论 ───
class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)
    parent_id: Optional[UUID] = None


class CommentOut(BaseModel):
    id: UUID
    post_id: UUID
    author_id: UUID
    author: Optional[UserOut] = None
    parent_id: Optional[UUID] = None
    body: str
    like_count: int
    created_at: datetime
    children: List['CommentOut'] = []

    class Config:
        from_attributes = True


# ─── 项目 ───
class ProjectCreate(BaseModel):
    type: str
    title: str
    description: str = ''
    data: dict = {}


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    data: Optional[dict] = None
    thumbnail_url: Optional[str] = None


class ProjectOut(BaseModel):
    id: UUID
    user_id: UUID
    user: Optional[UserOut] = None
    type: str
    title: str
    description: str
    data: dict
    thumbnail_url: str
    status: str
    published_post_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── 资讯 ───
class NewsSourceOut(BaseModel):
    id: UUID
    name: str
    url: str
    feed_type: str
    category: str
    is_active: bool
    last_fetched_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NewsItemOut(BaseModel):
    id: UUID
    source_name: str
    title: str
    summary: str
    url: str
    image_url: str
    tags: List[str]
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── 搜索 ───
class SearchResult(BaseModel):
    posts: List[PostOut] = []
    projects: List[ProjectOut] = []
    users: List[UserOut] = []
    total: int = 0


# ─── 通用响应 ───
class MessageResponse(BaseModel):
    message: str
    success: bool = True