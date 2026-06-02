-- Neural Town 数据库初始化脚本
-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户角色枚举
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'graphic_designer','uiux_designer','interior_designer',
        'industrial_designer','fashion_designer','motion_designer','aigc_director',
        'frontend_dev','backend_dev','ai_ml_dev','fullstack_dev',
        'devops_sre','mobile_dev','data_engineer','security_dev','web3_dev',
        'pm','beginner','enthusiast','normal'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 创建项目类型枚举
DO $$ BEGIN
    CREATE TYPE project_type AS ENUM (
        'graphic','uiux','interior','industrial','fashion','motion','aigc_director',
        'frontend','backend','aiml','fullstack','devops','mobile','data','security','web3',
        'pm','learning','playground'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 创建帖子类型枚举
DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('normal','creation','news');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 初始化频道数据
INSERT INTO channels (slug, name, description, icon, group_name, sort_order) VALUES
    ('all', '发现', '全部动态', '🌐', 'discover', 0),
    ('graphic', '平面设计', '视觉引力', '🎨', 'designer', 1),
    ('uiux', 'UI/UX', '界面星河', '📱', 'designer', 2),
    ('interior', '室内设计', '空间生成', '🏠', 'designer', 3),
    ('industrial', '工业设计', '形体工坊', '⚙️', 'designer', 4),
    ('fashion', '服装设计', '时尚织造', '👗', 'designer', 5),
    ('motion', '动效/3D', '动态星环', '🎥', 'designer', 6),
    ('aigc', 'AIGC导演', '光年工作台', '🎬', 'designer', 7),
    ('dev', '开发者星舰', '技术讨论', '💻', 'developer', 8),
    ('pm', 'PM引力舱', '产品思维', '📊', 'pm', 9),
    ('beginner', '新手村', '学习成长', '🌱', 'beginner', 10),
    ('fun', '奇点区', '游乐场', '🚀', 'fun', 11),
    ('news', '资讯空间站', 'AI 资讯', '📡', 'news', 12)
ON CONFLICT (slug) DO NOTHING;

-- 初始化资讯源
INSERT INTO news_sources (id, name, url, feed_type, category, is_active) VALUES
    (uuid_generate_v4(), 'Hacker News', 'https://hnrss.org/frontpage', 'rss', 'tech', true),
    (uuid_generate_v4(), 'AI Weekly', 'https://aiweekly.co/issues.rss', 'rss', 'ai', true),
    (uuid_generate_v4(), 'MIT Technology Review', 'https://www.technologyreview.com/feed/', 'rss', 'tech', true)
ON CONFLICT DO NOTHING;