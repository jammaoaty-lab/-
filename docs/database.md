# 数据库设计文档

## 数据库概述

- 数据库名: `ai_drama_platform`
- 字符集: utf8mb4
- 排序规则: utf8mb4_unicode_ci

## 数据表设计

### 1. 用户相关表

#### `users` - 用户表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 用户ID | PK |
| username | varchar(50) | 用户名 | UNIQUE |
| nickname | varchar(50) | 昵称 | |
| avatar | varchar(255) | 头像URL | |
| phone | varchar(20) | 手机号 | UNIQUE |
| email | varchar(100) | 邮箱 | UNIQUE |
| password | varchar(255) | 密码(加密) | |
| salt | varchar(32) | 密码盐 | |
| user_type | tinyint | 用户类型:1普通2创作者3会员4企业 | INDEX |
| level | int | 用户等级 | INDEX |
| experience | int | 经验值 | |
| token_balance | bigint | Token余额 | |
| status | tinyint | 状态:1正常2禁用3封禁 | INDEX |
| register_time | datetime | 注册时间 | |
| last_login_time | datetime | 最后登录时间 | |
| last_login_ip | varchar(50) | 最后登录IP | |
| created_at | timestamp | 创建时间 | |
| updated_at | timestamp | 更新时间 | |

#### `user_levels` - 用户等级表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 等级ID | PK |
| level | int | 等级 | UNIQUE |
| name | varchar(50) | 等级名称 | |
| icon | varchar(255) | 等级图标 | |
| experience_required | int | 所需经验值 | |
| privileges | json | 等级权益 | |
| created_at | timestamp | 创建时间 | |

#### `user_tags` - 用户标签表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 标签ID | PK |
| name | varchar(50) | 标签名称 | UNIQUE |
| color | varchar(20) | 标签颜色 | |
| sort | int | 排序 | |
| created_at | timestamp | 创建时间 | |

#### `user_tag_relation` - 用户标签关联表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | ID | PK |
| user_id | bigint | 用户ID | INDEX |
| tag_id | int | 标签ID | INDEX |
| created_at | timestamp | 创建时间 | |

### 2. 会员相关表

#### `membership_packages` - 会员套餐表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 套餐ID | PK |
| name | varchar(100) | 套餐名称 | |
| description | text | 套餐描述 | |
| price | decimal(10,2) | 价格 | |
| duration_days | int | 有效期(天) | |
| token_gift | bigint | 赠送Token | |
| privileges | json | 套餐权益 | |
| sort | int | 排序 | |
| status | tinyint | 状态:1上架2下架 | INDEX |
| created_at | timestamp | 创建时间 | |

#### `user_memberships` - 用户会员表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | ID | PK |
| user_id | bigint | 用户ID | INDEX |
| package_id | int | 套餐ID | |
| start_time | datetime | 开始时间 | |
| end_time | datetime | 结束时间 | INDEX |
| order_id | bigint | 订单ID | |
| created_at | timestamp | 创建时间 | |

### 3. Token账务相关表

#### `token_logs` - Token流水表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 流水ID | PK |
| user_id | bigint | 用户ID | INDEX |
| type | tinyint | 类型:1充值2消费3赠送4冻结5解冻 | INDEX |
| amount | bigint | 变动金额 | |
| balance_before | bigint | 变动前余额 | |
| balance_after | bigint | 变动后余额 | |
| related_id | bigint | 关联ID(订单/任务等) | |
| related_type | varchar(50) | 关联类型 | |
| remark | varchar(255) | 备注 | |
| created_at | timestamp | 创建时间 | INDEX |

#### `recharge_orders` - 充值订单表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 订单ID | PK |
| order_no | varchar(50) | 订单号 | UNIQUE |
| user_id | bigint | 用户ID | INDEX |
| amount | decimal(10,2) | 充值金额 | |
| token_amount | bigint | 获得Token | |
| pay_type | tinyint | 支付方式:1微信2支付宝 | |
| pay_status | tinyint | 支付状态:0待付1已付2退款 | INDEX |
| pay_time | datetime | 支付时间 | |
| transaction_id | varchar(100) | 第三方交易号 | |
| created_at | timestamp | 创建时间 | INDEX |

### 4. 作品相关表

#### `works` - 作品表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 作品ID | PK |
| user_id | bigint | 作者ID | INDEX |
| title | varchar(200) | 作品标题 | |
| description | text | 作品描述 | |
| cover | varchar(255) | 封面URL | |
| video_url | varchar(255) | 视频URL | |
| category | tinyint | 分类:1漫剧2短剧3动漫4片段 | INDEX |
| quality | tinyint | 画质:1标清2高清34K48K5影视级 | |
| duration | int | 时长(秒) | |
| is_long_video | tinyint | 是否长视频:0否1是 | INDEX |
| view_count | int | 浏览数 | |
| like_count | int | 点赞数 | |
| collect_count | int | 收藏数 | |
| comment_count | int | 评论数 | |
| share_count | int | 分享数 | |
| reward_count | int | 打赏数 | |
| reward_amount | decimal(10,2) | 打赏总额 | |
| audit_status | tinyint | 审核状态:0待审1通过2驳回 | INDEX |
| audit_remark | varchar(255) | 审核备注 | |
| auditor_id | bigint | 审核人ID | |
| audit_time | datetime | 审核时间 | |
| status | tinyint | 状态:1正常2下架3违规 | INDEX |
| is_top | tinyint | 是否置顶:0否1是 | |
| is_featured | tinyint | 是否精选:0否1是 | |
| top_sort | int | 置顶排序 | |
| created_at | timestamp | 创建时间 | INDEX |
| updated_at | timestamp | 更新时间 | |

#### `work_shots` - 长视频镜头表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 镜头ID | PK |
| work_id | bigint | 作品ID | INDEX |
| shot_no | int | 镜头序号 | |
| description | text | 镜头描述 | |
| image_url | varchar(255) | 画面URL | |
| duration | int | 时长(秒) | |
| audio_url | varchar(255) | 配音URL | |
| subtitle | text | 字幕内容 | |
| prompt | text | AI生成提示词 | |
| status | tinyint | 状态:0待生成1生成中2成功3失败 | INDEX |
| error_msg | varchar(255) | 错误信息 | |
| created_at | timestamp | 创建时间 | |

#### `work_categories` - 作品分类表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 分类ID | PK |
| name | varchar(50) | 分类名称 | |
| icon | varchar(255) | 分类图标 | |
| sort | int | 排序 | |
| status | tinyint | 状态 | |
| created_at | timestamp | 创建时间 | |

### 5. 创作任务相关表

#### `create_tasks` - 创作任务表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 任务ID | PK |
| task_no | varchar(50) | 任务号 | UNIQUE |
| user_id | bigint | 用户ID | INDEX |
| task_type | tinyint | 任务类型:1生图2生视频3捏脸 | INDEX |
| params | json | 任务参数 | |
| quality | tinyint | 画质等级 | |
| speed_mode | tinyint | 速度模式:1标准2极速 | |
| infer_engine | tinyint | 推理引擎:1本地2云端3商用API | |
| model_id | int | 使用的模型ID | |
| token_cost | bigint | 消耗Token | |
| status | tinyint | 状态:0排队1执行中2成功3失败 | INDEX |
| progress | int | 进度(0-100) | |
| result | json | 结果数据 | |
| error_msg | text | 错误信息 | |
| started_at | timestamp | 开始时间 | |
| completed_at | timestamp | 完成时间 | |
| created_at | timestamp | 创建时间 | INDEX |

#### `long_video_tasks` - 长视频任务表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 任务ID | PK |
| task_no | varchar(50) | 任务号 | UNIQUE |
| user_id | bigint | 用户ID | INDEX |
| work_id | bigint | 作品ID | |
| script | text | 剧本内容 | |
| shot_count | int | 镜头总数 | |
| completed_shots | int | 已完成镜头数 | |
| voice_config | json | 配音配置 | |
| transition_config | json | 转场配置 | |
| status | tinyint | 状态:0拆解1镜头生成2合成3完成4失败 | INDEX |
| token_cost | bigint | 总消耗Token | |
| created_at | timestamp | 创建时间 | INDEX |

### 6. AI模型相关表

#### `ai_models` - AI模型表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 模型ID | PK |
| name | varchar(100) | 模型名称 | |
| description | text | 模型描述 | |
| cover | varchar(255) | 封面图 | |
| model_type | tinyint | 类型:1画风2角色3通用 | INDEX |
| model_url | varchar(255) | 模型文件URL | |
| user_id | bigint | 创建用户ID(0为官方) | INDEX |
| is_public | tinyint | 是否公开:0否1是 | INDEX |
| audit_status | tinyint | 审核状态:0待审1通过2驳回 | |
| use_count | int | 使用次数 | |
| sort | int | 排序 | |
| status | tinyint | 状态 | |
| created_at | timestamp | 创建时间 | INDEX |

#### `train_tasks` - 训练任务表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 训练任务ID | PK |
| task_no | varchar(50) | 任务号 | UNIQUE |
| user_id | bigint | 用户ID | INDEX |
| dataset_path | varchar(255) | 数据集路径 | |
| dataset_count | int | 图片数量 | |
| train_type | tinyint | 训练类型:1LoRA2DreamBooth | |
| params | json | 训练参数 | |
| token_cost | bigint | 消耗Token | |
| status | tinyint | 状态:0排队1训练中2成功3失败 | INDEX |
| progress | int | 进度 | |
| loss | decimal(10,6) | 损失值 | |
| result_model_id | int | 结果模型ID | |
| error_msg | text | 错误信息 | |
| created_at | timestamp | 创建时间 | INDEX |

### 7. 社区相关表

#### `circles` - 圈子表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 圈子ID | PK |
| name | varchar(100) | 圈子名称 | |
| description | text | 圈子描述 | |
| cover | varchar(255) | 圈子封面 | |
| owner_id | bigint | 圈主ID | |
| member_count | int | 成员数 | |
| post_count | int | 帖子数 | |
| status | tinyint | 状态 | |
| created_at | timestamp | 创建时间 | |

#### `posts` - 帖子表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 帖子ID | PK |
| user_id | bigint | 发布用户ID | INDEX |
| circle_id | int | 圈子ID | INDEX |
| title | varchar(200) | 帖子标题 | |
| content | text | 帖子内容 | |
| images | json | 图片列表 | |
| view_count | int | 浏览数 | |
| like_count | int | 点赞数 | |
| comment_count | int | 评论数 | |
| audit_status | tinyint | 审核状态 | INDEX |
| status | tinyint | 状态 | |
| created_at | timestamp | 创建时间 | INDEX |

#### `comments` - 评论表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 评论ID | PK |
| user_id | bigint | 评论用户ID | INDEX |
| target_type | varchar(50) | 目标类型:work/post | |
| target_id | bigint | 目标ID | INDEX |
| parent_id | bigint | 父评论ID | |
| content | text | 评论内容 | |
| like_count | int | 点赞数 | |
| audit_status | tinyint | 审核状态 | INDEX |
| created_at | timestamp | 创建时间 | INDEX |

#### `rewards` - 打赏记录表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 打赏ID | PK |
| from_user_id | bigint | 打赏用户ID | INDEX |
| to_user_id | bigint | 收赏用户ID | INDEX |
| target_type | varchar(50) | 目标类型 | |
| target_id | bigint | 目标ID | |
| amount | decimal(10,2) | 打赏金额 | |
| message | varchar(255) | 留言 | |
| created_at | timestamp | 创建时间 | INDEX |

### 8. 后台管理相关表

#### `admins` - 管理员表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 管理员ID | PK |
| username | varchar(50) | 用户名 | UNIQUE |
| password | varchar(255) | 密码 | |
| salt | varchar(32) | 密码盐 | |
| realname | varchar(50) | 真实姓名 | |
| avatar | varchar(255) | 头像 | |
| role_id | int | 角色ID | INDEX |
| status | tinyint | 状态:1正常2禁用 | INDEX |
| last_login_time | datetime | 最后登录时间 | |
| last_login_ip | varchar(50) | 最后登录IP | |
| created_at | timestamp | 创建时间 | |

#### `admin_roles` - 管理员角色表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | 角色ID | PK |
| name | varchar(50) | 角色名称 | |
| description | varchar(255) | 角色描述 | |
| permissions | json | 权限列表 | |
| sort | int | 排序 | |
| status | tinyint | 状态 | |
| created_at | timestamp | 创建时间 | |

#### `admin_operation_logs` - 管理员操作日志表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 日志ID | PK |
| admin_id | int | 管理员ID | INDEX |
| module | varchar(50) | 操作模块 | |
| action | varchar(50) | 操作动作 | |
| params | json | 操作参数 | |
| ip | varchar(50) | 操作IP | |
| user_agent | varchar(255) | UserAgent | |
| created_at | timestamp | 创建时间 | INDEX |

### 9. 风控相关表

#### `content_audit_logs` - 内容审核日志表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 日志ID | PK |
| target_type | varchar(50) | 目标类型 | |
| target_id | bigint | 目标ID | INDEX |
| audit_type | tinyint | 审核类型:1文本2图片3视频4音频 | |
| audit_result | tinyint | 审核结果:1通过2疑似3违规 | INDEX |
| risk_level | tinyint | 风险等级:1低2中3高 | |
| risk_tags | json | 风险标签 | |
| audit_detail | json | 审核详情 | |
| auditor_id | bigint | 审核人ID(0为机器) | |
| created_at | timestamp | 创建时间 | INDEX |

#### `violation_records` - 违规记录表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | bigint | 记录ID | PK |
| user_id | bigint | 用户ID | INDEX |
| violation_type | tinyint | 违规类型 | |
| target_type | varchar(50) | 目标类型 | |
| target_id | bigint | 目标ID | |
| description | text | 违规描述 | |
| penalty_type | tinyint | 处罚类型:1警告2临时封禁3永久封禁 | |
| penalty_duration | int | 处罚时长(天) | |
| penalty_start | datetime | 处罚开始时间 | |
| penalty_end | datetime | 处罚结束时间 | |
| handler_id | bigint | 处理人ID | |
| created_at | timestamp | 创建时间 | INDEX |

#### `ip_blacklist` - IP黑名单表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | ID | PK |
| ip | varchar(50) | IP地址 | UNIQUE |
| reason | varchar(255) | 封禁原因 | |
| expired_at | datetime | 过期时间(NULL为永久) | INDEX |
| created_at | timestamp | 创建时间 | |

### 10. 系统配置表

#### `system_configs` - 系统配置表
| 字段 | 类型 | 说明 | 索引 |
|------|------|------|------|
| id | int | ID | PK |
| group | varchar(50) | 配置分组 | INDEX |
| key | varchar(100) | 配置键 | UNIQUE |
| value | text | 配置值 | |
| type | varchar(20) | 值类型:string/int/bool/json | |
| description | varchar(255) | 配置说明 | |
| updated_at | timestamp | 更新时间 | |

## 索引设计原则

1. 所有主键自动创建索引
2. 唯一键创建唯一索引
3. 频繁查询的字段创建普通索引
4. 复合索引考虑最左前缀原则
5. 定期分析慢查询优化索引

## 数据库初始化SQL

详见: [database/init.sql](../database/init.sql)
