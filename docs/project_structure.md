# 7.4 其余目录结构说明

本说明补充其余目录的用途和结构。

## 目录列表

```
ai_local_infer/          # 本地推理服务
├── README.md
├── comfyui/            # ComfyUI 图像/视频生成
├── ollama/            # LLM 推理
├── ffmpeg/            # 视频处理工具
├── config/                # 配置文件
├── models/            # 模型存放
└── scripts/           # 推理服务启停脚本

ai_cloud_infer/         # 自建云端推理
├── Dockerfile
├── docker-compose.yml
├── k8s/                # K8s部署配置
├── nginx/               # 负载均衡配置
└── scripts/           # 部署和监控脚本

ai_cloud_train/         # 云端训练服务
├── train/               # 训练脚本
├── dataset/             # 数据集处理
├── requirements.txt
└── docker-compose.yml

ffmpeg_service/          # 视频处理服务
├── service/
├── temp/               # 临时文件
├── config/
└── workers/           # 工作节点

oss_mount/             # OSS 本地挂载

scripts/               # 运维脚本
├── generate_daily_report.sh  # 日报生成脚本
├── logrotate.sh           # 日志切割
├── monitor_queue.sh      # 队列监控
├── cleanup_temp.sh      # 临时文件清理
├── cleanup_expired.sh  # 过期数据清理
└── crontab.conf       # 定时任务配置
```

## 各目录详细说明

### ai_local_infer/
本地推理服务目录，用于部署常驻GPU推理

```
ai_local_infer/
├── README.md
├── comfyui/                # ComfyUI 服务
│   ├── custom_nodes/       # 自定义节点
│   ├── models/           # 模型文件
│   │   ├── checkpoints/
│   │   ├── loras/
│   │   └── vae/
│   ├── input/
│   └── output/
├── ollama/               # 本地 LLM 服务
│   └── models/
├── ffmpeg/               # FFmpeg 本地
│   └── bin/
├── scripts/
│   ├── start.sh           # 启动服务
│   ├── stop.sh
│   └── health_check.sh
└── config/
    └── service.yaml
```

### ai_cloud_infer/
云端弹性推理集群

```
ai_cloud_infer/
├── Dockerfile
├── docker-compose.yml
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── nginx/
│   └── nginx.conf
└── scripts/
    ├── deploy.sh
    └── scale.sh
```

### ai_cloud_train/
```
ai_cloud_train/
├── train/
│   ├── train_lora.py      # LoRA 训练脚本
│   ├── prepare_dataset.py
│   └── train_evaluation.py
├── dataset/
├── requirements.txt
└── docker-compose.yml
```

### ffmpeg_service/
专门用于视频处理、合成的独立服务

```
ffmpeg_service/
├── workers/
├── temp/
└── config/
└── scripts/
```

### oss_mount/
OSS 本地挂载点

### scripts/
所有运维脚本存放位置，已包含：
- 日报生成
- 日志切割
- 队列监控
- 临时文件清理
- 过期数据清理
- 定时任务配置

