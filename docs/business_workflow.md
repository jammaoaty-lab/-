# 10. 核心业务全流程

## 10.1 作品创作流程

1. 用户登录平台
2. 选择创作类型：漫剧/AI短剧/AI动漫/影视片段
3. 配置参数：画质、速度、推理引擎、专属模型
4. 输入提示词/上传素材
5. 预览与调整
6. 提交任务
7. 任务队列处理
8. 进度实时推送
9. 生成完成通知
10. 作品保存/分享/发布

## 10.2 长视频生成流程

1. 用户选择长视频模式
2. 输入剧本或长文本
3. AI自动拆分镜头（3-5秒/镜头）
4. 生成角色和场景设定
5. 逐个镜头生成任务
6. 镜头并行生成
7. TTS配音生成
8. FFmpeg/云媒体合成
9. 字幕自动添加
10. 转场和特效处理
11. 最终成品生成

## 10.3 模型训练流程

1. 用户准备数据集
2. 上传图片压缩包（最多10万张）
3. 选择训练类型：LoRA/完整模型
4. 配置训练参数
5. 提交训练任务
6. 云端GPU训练
7. 损失曲线实时反馈
8. 测试样图生成
9. 训练完成通知
10. 模型自动同步到推理端

# 11. 商业化盈利体系

## 11.1 盈利模式

| 模式 | 说明 |
|------|------|
| Token充值消费 | 按生成作品消耗的Token扣费 |
| 会员订阅 | 月度/季度/年度会员，享受权益 |
| 算力套餐 | 特定画质/时长的套餐包 |
| 模板售卖 | 创作者模板分成 |
| 模型交易 | LoRA模型交易分成 |
| 打赏 | 用户给优质作品打赏 |
| 企业定制 | 企业客户定制化服务 |

## 11.2 定价策略

- 画质档位：720P/1080P/4K/8K/24K
- 推理引擎系数：本地0.5x/云端1x/API 2.5x
- 速度模式：标准1x/极速1.8x

# 12. 长视频技术选型、核心代码 & 运维避坑

## 12.1 技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 视频生成API | 火山引擎/可灵/Minimax | 主流AI视频API |
| 语音合成 | 火山引擎语音/阿里云 | 多音色、高质量TTS |
| 媒体处理 | FFmpeg/阿里云ICE | 视频合成、转码 |
| 队列系统 | RabbitMQ/Redis Queue | ThinkPHP异步队列 |
| 文件存储 | OSS/COS | 文件持久化 |

## 12.2 数据库补充表（后台相关）

```sql
-- RBAC角色表
CREATE TABLE `sys_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_desc` varchar(255) DEFAULT '' COMMENT '角色描述',
  `permissions` text COMMENT '权限列表JSON',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态 1启用 0禁用',
  `sort` int DEFAULT 0 COMMENT '排序',
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台角色表';

-- 后台管理员表
CREATE TABLE `sys_admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '登录账号',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `salt` varchar(32) NOT NULL COMMENT '密码盐',
  `role_id` int NOT NULL COMMENT '角色ID',
  `nickname` varchar(50) DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) DEFAULT '' COMMENT '头像',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态1启用0禁用',
  `last_login_ip` varchar(50) DEFAULT '',
  `last_login_time` int DEFAULT 0,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台管理员表';

-- 管理员操作日志
CREATE TABLE `sys_admin_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL COMMENT '管理员ID',
  `username` varchar(50) NOT NULL COMMENT '管理员账号',
  `module` varchar(50) DEFAULT '' COMMENT '模块',
  `operate_type` varchar(50) NOT NULL COMMENT '操作类型',
  `operate_content` text NOT NULL COMMENT '操作内容',
  `params` text COMMENT '参数JSON',
  `ip` varchar(50) NOT NULL COMMENT '操作IP',
  `user_agent` varchar(255) DEFAULT '',
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- IP黑名单表
CREATE TABLE `ip_blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) NOT NULL COMMENT 'IP地址',
  `reason` varchar(255) DEFAULT '' COMMENT '拉黑原因',
  `expire_time` int DEFAULT 0 COMMENT '过期时间 0永久',
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ip` (`ip`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP黑名单表';

-- 平台公告表
CREATE TABLE `sys_notice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `type` tinyint DEFAULT 1 COMMENT '类型',
  `is_top` tinyint DEFAULT 0 COMMENT '是否置顶',
  `publish_time` int DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态',
  `admin_id` int DEFAULT NULL,
  `create_time` int NOT NULL,
  `update_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';
```

## 12.3 运维避坑指南

1. FFmpeg安全调用：必须参数转义，避免注入
2. 队列堆积监控：设置告警阈值
3. 磁盘空间监控：OSS+本地临时文件双管理
4. API限流：合理设置重试和熔断
5. 内容审核：多层审核，避免违规风险
6. 数据库性能：分表、索引优化

