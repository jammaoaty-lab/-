"""
Neural Town 数据库模型 - SQLAlchemy ORM
完整涵盖用户、频道、帖子、评论、项目、资产、资讯等
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Text, Boolean, DateTime, ForeignKey,
    Enum as SAEnum, ARRAY, JSON, Float
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


# ─── 用户 ───
user_role_enum = SAEnum(
    # 设计师
    'graphic_designer', 'uiux_designer', 'interior_designer',
    'industrial_designer', 'fashion_designer', 'motion_designer', 'aigc_director',
    # 开发者
    'frontend_dev', 'backend_dev', 'ai_ml_dev', 'fullstack_dev',
    'devops_sre', 'mobile_dev', 'data_engineer', 'security_dev', 'web3_dev',
    # 其他
    'pm', 'beginner', 'enthusiast', 'normal',
    name='user_role'
)


class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), default='')
    avatar_url = Column(Text, default='')
    bio = Column(Text, default='')
    role_tags = Column(ARRAY(user_role_enum), default=['normal'])
    certified_roles = Column(ARRAY(user_role_enum), default=[])
    certification_data = Column(JSONB, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    posts = relationship('Post', back_populates='author', lazy='dynamic')
    projects = relationship('Project', back_populates='user', lazy='dynamic')
    comments = relationship('Comment', back_populates='author', lazy='dynamic')
    likes = relationship('Like', back_populates='user', lazy='dynamic')
    follows = relationship('Follow', back_populates='follower', lazy='dynamic')


# ─── 频道 ───
class Channel(Base):
    __tablename__ = 'channels'

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default='')
    icon = Column(String(50), default='')
    group_name = Column(String(50), default='')
    sort_order = Column(Integer, default=0)

    posts = relationship('Post', back_populates='channel', lazy='dynamic')


# ─── 帖子 ───
post_type_enum = SAEnum('normal', 'creation', 'news', name='post_type')


class Post(Base):
    __tablename__ = 'posts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    channel_id = Column(Integer, ForeignKey('channels.id'), nullable=True)
    title = Column(String(300), default='')
    body = Column(Text, default='')
    body_plain = Column(Text, default='')
    post_type = Column(post_type_enum, default='normal')
    source_project_id = Column(UUID(as_uuid=True), nullable=True)
    prompt_data = Column(JSONB, default=dict)
    media_urls = Column(ARRAY(Text), default=[])
    status = Column(String(20), default='published')
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship('User', back_populates='posts')
    channel = relationship('Channel', back_populates='posts')
    comments = relationship('Comment', back_populates='post', lazy='dynamic', cascade='all, delete-orphan')
    likes = relationship('Like', back_populates='post', lazy='dynamic', cascade='all, delete-orphan')


# ─── 评论 ───
class Comment(Base):
    __tablename__ = 'comments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey('posts.id', ondelete='CASCADE'), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)
    body = Column(Text, nullable=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship('User', back_populates='comments')
    post = relationship('Post', back_populates='comments')
    parent = relationship('Comment', remote_side=[id], backref='children')


# ─── 点赞 ───
class Like(Base):
    __tablename__ = 'likes'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey('posts.id', ondelete='CASCADE'), nullable=True)
    comment_id = Column(UUID(as_uuid=True), ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='likes')
    post = relationship('Post', back_populates='likes')


# ─── 关注 ───
class Follow(Base):
    __tablename__ = 'follows'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    following_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    follower = relationship('User', foreign_keys=[follower_id], back_populates='follows')


# ─── 工作台项目 ───
project_type_enum = SAEnum(
    'graphic', 'uiux', 'interior', 'industrial', 'fashion', 'motion', 'aigc_director',
    'frontend', 'backend', 'aiml', 'fullstack', 'devops', 'mobile', 'data', 'security', 'web3',
    'pm', 'learning', 'playground',
    name='project_type'
)


class Project(Base):
    __tablename__ = 'projects'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = Column(project_type_enum, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, default='')
    data = Column(JSONB, default=dict)
    thumbnail_url = Column(Text, default='')
    status = Column(String(20), default='draft')
    published_post_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', back_populates='projects')
    assets = relationship('Asset', back_populates='project', lazy='dynamic', cascade='all, delete-orphan')


# ─── 资产 ───
class Asset(Base):
    __tablename__ = 'assets'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    type = Column(String(30), nullable=False)
    url = Column(Text, nullable=False)
    metadata = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='assets')


# ─── 通知 ───
class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = Column(String(30), nullable=False)  # like, comment, follow, mention, system
    title = Column(String(200), default='')
    body = Column(Text, default='')
    data = Column(JSONB, default=dict)  # 关联的 post_id, comment_id 等
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── 资讯源 ───
class NewsSource(Base):
    __tablename__ = 'news_sources'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    url = Column(Text, nullable=False)
    feed_type = Column(String(20), default='rss')  # rss, api, manual
    category = Column(String(50), default='general')
    is_active = Column(Boolean, default=True)
    fetch_interval = Column(Integer, default=3600)  # 抓取间隔（秒）
    last_fetched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship('NewsItem', back_populates='source', lazy='dynamic')


# ─── 资讯条目 ───
class NewsItem(Base):
    __tablename__ = 'news_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey('news_sources.id', ondelete='CASCADE'), nullable=False, index=True)
    source_name = Column(String(200), default='')
    title = Column(String(500), nullable=False)
    summary = Column(Text, default='')
    url = Column(Text, nullable=False)
    image_url = Column(Text, default='')
    tags = Column(ARRAY(String), default=[])
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship('NewsSource', back_populates='items')