"""
Neural Town Celery 异步任务
- 视频生成任务
- 资讯 RSS 抓取
- AI 内容审核
"""
from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    'neural_town',
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    task_routes={
        'app.tasks.fetch_rss': {'queue': 'news'},
        'app.tasks.generate_video': {'queue': 'ai'},
        'app.tasks.moderate_content': {'queue': 'moderation'},
    },
)


@celery_app.task(name='app.tasks.fetch_rss')
def fetch_rss_feed(source_id: str):
    """抓取 RSS 资讯源 - 异步任务"""
    # TODO: 实现 RSS 抓取逻辑
    pass


@celery_app.task(name='app.tasks.generate_video')
def generate_video_shot(project_id: str, params: dict):
    """AI 视频生成任务 - AIGC 导演工作台"""
    # TODO: 实现视频生成逻辑
    pass


@celery_app.task(name='app.tasks.moderate_content')
def moderate_content(content_id: str, content_type: str):
    """AI 内容审核"""
    # TODO: 实现内容审核逻辑
    pass