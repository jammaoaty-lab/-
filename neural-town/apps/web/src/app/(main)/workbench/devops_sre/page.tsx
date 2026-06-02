'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 流水线节点类型定义 ───
const PIPELINE_NODE_TYPES = {
  commit: { color: '#00E5FF', icon: '📦' },
  build: { color: '#6C5CE7', icon: '🔨' },
  test: { color: '#00F2A9', icon: '🧪' },
  security_scan: { color: '#FF6B6B', icon: '🔒' },
  deploy_staging: { color: '#FFD166', icon: '🚀' },
  deploy_prod: { color: '#FF9100', icon: '🌐' },
  monitor: { color: '#E040FB', icon: '📡' },
} as const;

type PipelineNodeType = keyof typeof PIPELINE_NODE_TYPES;

interface PipelineNodeStatus {
  id: string;
  type: PipelineNodeType;
  status: 'success' | 'running' | 'pending' | 'failed';
  duration: string;
}

// ─── 服务健康状态类型 ───
type ServiceHealthStatus = 'healthy' | 'warning' | 'critical';

interface ServiceHealth {
  name: string;
  status: ServiceHealthStatus;
  uptime: string;
  load: number; // 0-100
  lastCheck: string;
}

// ─── 部署脚本类型 ───
type DeployEnv = 'production' | 'staging';
type ScriptType = 'docker_compose' | 'nginx' | 'baota';

// ─── CI/CD 初始节点 ───
const INITIAL_PIPELINE_NODES = [
  { id: 'commit', label: 'Git Commit', type: 'commit' as PipelineNodeType, x: 40, y: 40, width: 130, height: 50 },
  { id: 'build', label: 'Docker Build', type: 'build' as PipelineNodeType, x: 220, y: 40, width: 140, height: 50 },
  { id: 'test', label: '单元测试', type: 'test' as PipelineNodeType, x: 410, y: 40, width: 130, height: 50 },
  { id: 'security_scan', label: '安全扫描', type: 'security_scan' as PipelineNodeType, x: 590, y: 40, width: 130, height: 50 },
  { id: 'deploy_staging', label: '部署测试环境', type: 'deploy_staging' as PipelineNodeType, x: 40, y: 130, width: 150, height: 50 },
  { id: 'deploy_prod', label: '部署生产环境', type: 'deploy_prod' as PipelineNodeType, x: 220, y: 130, width: 150, height: 50 },
  { id: 'monitor', label: '监控告警', type: 'monitor' as PipelineNodeType, x: 420, y: 130, width: 130, height: 50 },
];

const INITIAL_PIPELINE_CONNS = [
  { id: 'c1', from: 'commit', to: 'build' },
  { id: 'c2', from: 'build', to: 'test' },
  { id: 'c3', from: 'test', to: 'security_scan' },
  { id: 'c4', from: 'security_scan', to: 'deploy_staging' },
  { id: 'c5', from: 'deploy_staging', to: 'deploy_prod' },
  { id: 'c6', from: 'deploy_prod', to: 'monitor' },
];

// ─── 服务健康初始数据 ───
const INITIAL_SERVICES: ServiceHealth[] = [
  { name: 'API Gateway', status: 'healthy', uptime: '99.99%', load: 35, lastCheck: '2 秒前' },
  { name: 'Auth Service', status: 'healthy', uptime: '99.95%', load: 42, lastCheck: '5 秒前' },
  { name: 'Database (PG)', status: 'healthy', uptime: '99.97%', load: 28, lastCheck: '1 秒前' },
  { name: 'Redis Cache', status: 'warning', uptime: '99.80%', load: 68, lastCheck: '3 秒前' },
  { name: 'Celery Worker', status: 'healthy', uptime: '99.90%', load: 55, lastCheck: '8 秒前' },
];

// ─── 状态颜色映射 ───
const STATUS_COLORS: Record<ServiceHealthStatus, string> = {
  healthy: '#00F2A9',
  warning: '#FFD166',
  critical: '#FF6B6B',
};

const STATUS_LABELS: Record<ServiceHealthStatus, string> = {
  healthy: '正常',
  warning: '警告',
  critical: '异常',
};

// ─── 部署脚本模板 ───
function generateDockerCompose(projectName: string, port: string): string {
  return `version: '3.8'
services:
  ${projectName}:
    image: ${projectName}:latest
    container_name: ${projectName}
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/${projectName}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: always
    networks:
      - ${projectName}_net

  db:
    image: postgres:16-alpine
    container_name: ${projectName}_db
    environment:
      - POSTGRES_DB=${projectName}
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - ${projectName}_net

  redis:
    image: redis:7-alpine
    container_name: ${projectName}_redis
    networks:
      - ${projectName}_net

volumes:
  pgdata:

networks:
  ${projectName}_net:
    driver: bridge`;
}

function generateNginxConfig(projectName: string, port: string): string {
  return `server {
    listen 80;
    server_name ${projectName}.example.com;

    # 日志
    access_log /var/log/nginx/${projectName}_access.log;
    error_log  /var/log/nginx/${projectName}_error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 静态资源
    location /static/ {
        alias /var/www/${projectName}/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 前端
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;
}

function generateBaotaScript(projectName: string, port: string): string {
  return `#!/bin/bash
# ====================================
# 宝塔面板部署脚本 - ${projectName}
# ====================================

APP_NAME="${projectName}"
APP_PORT=${port}
APP_DIR="/www/wwwroot/\${APP_NAME}"

echo "🚀 开始部署 \${APP_NAME}..."

# 1. 创建站点目录
if [ ! -d "\${APP_DIR}" ]; then
    mkdir -p "\${APP_DIR}"
    echo "✅ 目录已创建: \${APP_DIR}"
fi

# 2. 进入目录
cd \${APP_DIR}

# 3. 拉取代码
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/your-org/\${APP_NAME}.git .
fi
echo "✅ 代码已拉取"

# 4. 安装依赖
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
elif [ -f "package.json" ]; then
    npm install --production
fi
echo "✅ 依赖已安装"

# 5. 运行迁移
if [ -f "manage.py" ]; then
    python manage.py migrate
fi
echo "✅ 数据库迁移完成"

# 6. 启动服务 (使用 supervisor / pm2)
if command -v pm2 &> /dev/null; then
    pm2 delete \${APP_NAME} 2>/dev/null
    pm2 start app.js --name \${APP_NAME} -- --port \${APP_PORT}
elif command -v supervisorctl &> /dev/null; then
    supervisorctl restart \${APP_NAME}
else
    nohup gunicorn app:app -b 0.0.0.0:\${APP_PORT} --daemon
fi
echo "✅ 服务已启动"

# 7. 检查健康
sleep 3
curl -s http://localhost:\${APP_PORT}/health > /dev/null && echo "✅ 服务运行正常" || echo "❌ 服务启动失败"

echo "🎉 部署完成! 访问 http://localhost:\${APP_PORT}"`;
}

// ─── 节点选中状态详情 ───
const PIPELINE_NODE_STATUSES: Record<string, PipelineNodeStatus> = {
  commit: { id: 'commit', type: 'commit', status: 'success', duration: '12s' },
  build: { id: 'build', type: 'build', status: 'success', duration: '45s' },
  test: { id: 'test', type: 'test', status: 'success', duration: '1m 20s' },
  security_scan: { id: 'security_scan', type: 'security_scan', status: 'running', duration: '进行中...' },
  deploy_staging: { id: 'deploy_staging', type: 'deploy_staging', status: 'pending', duration: '排队中' },
  deploy_prod: { id: 'deploy_prod', type: 'deploy_prod', status: 'pending', duration: '等待审批' },
  monitor: { id: 'monitor', type: 'monitor', status: 'success', duration: '持续运行' },
};

const STATUS_STYLE: Record<PipelineNodeStatus['status'], { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-success-green/20', text: 'text-success-green', label: '通过' },
  running: { bg: 'bg-nebulae-purple/20', text: 'text-nebulae-purple', label: '运行中' },
  pending: { bg: 'bg-white/10', text: 'text-white/40', label: '等待' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', label: '失败' },
};

export default function DevopsSrePage() {
  const meta = ROLES_META.devops_sre;

  // 流水线选中状态
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 服务健康状态
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);

  // 部署脚本
  const [projectName, setProjectName] = useState('');
  const [deployEnv, setDeployEnv] = useState<DeployEnv>('staging');
  const [portNumber, setPortNumber] = useState('3000');
  const [generatedScript, setGeneratedScript] = useState('');
  const [scriptType, setScriptType] = useState<ScriptType | null>(null);

  // 处理流水线节点选中
  const handleSelectNode = (node: { id: string }) => {
    setSelectedNodeId(node.id);
  };

  // 刷新服务状态
  const handleRefreshServices = () => {
    toast.loading('正在刷新服务状态...', { id: 'svc-refresh' });
    setTimeout(() => {
      setServices(prev =>
        prev.map(s => ({
          ...s,
          load: Math.min(100, Math.max(5, s.load + (Math.random() - 0.5) * 20)),
          lastCheck: '刚刚',
        }))
      );
      toast.success('服务状态已刷新', { id: 'svc-refresh' });
    }, 800);
  };

  // 生成脚本
  const handleGenerateScript = (type: ScriptType) => {
    if (!projectName.trim()) {
      toast.error('请输入项目名称');
      return;
    }
    if (!portNumber.trim() || isNaN(Number(portNumber))) {
      toast.error('请输入有效的端口号');
      return;
    }

    let script = '';
    switch (type) {
      case 'docker_compose':
        script = generateDockerCompose(projectName, portNumber);
        break;
      case 'nginx':
        script = generateNginxConfig(projectName, portNumber);
        break;
      case 'baota':
        script = generateBaotaScript(projectName, portNumber);
        break;
    }

    setGeneratedScript(script);
    setScriptType(type);
    toast.success(`${type === 'docker_compose' ? 'Docker Compose' : type === 'nginx' ? 'Nginx Config' : '宝塔面板脚本'} 已生成`);
  };

  // 复制脚本
  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript).then(
      () => toast.success('已复制到剪贴板'),
      () => toast.error('复制失败')
    );
  };

  const selectedStatus = selectedNodeId ? PIPELINE_NODE_STATUSES[selectedNodeId] : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ─── 页面头部 ─── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <CosmicButton size="sm" variant="secondary" onClick={handleRefreshServices}>
            🔄 刷新状态
          </CosmicButton>
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #dev 频道')}>发布</CosmicButton>
        </div>
      </div>

      {/* ─── 三列内容区 ─── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 overflow-hidden">
        {/* ─── 左列：CI/CD 流水线 ─── */}
        <div className="flex flex-col border-r border-cosmic-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-cosmic-border bg-space-card/30">
            <h2 className="text-sm font-display text-white/80">🔄 CI/CD 流水线</h2>
            {selectedStatus && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLE[selectedStatus.status].bg} ${STATUS_STYLE[selectedStatus.status].text}`}>
                {STATUS_STYLE[selectedStatus.status].label}
              </span>
            )}
          </div>

          <div className="flex-1 flex">
            {/* 画布区域 */}
            <div className="flex-1">
              <FlowCanvas
                nodes={INITIAL_PIPELINE_NODES}
                connections={INITIAL_PIPELINE_CONNS}
                nodeTypes={PIPELINE_NODE_TYPES}
                onSelectNode={handleSelectNode}
                readOnly={true}
              />
            </div>

            {/* 选中节点详情侧栏 */}
            {selectedStatus && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-cosmic-border overflow-hidden"
              >
                <div className="glass-panel h-full p-3 space-y-3">
                  <h3 className="text-xs font-display text-white flex items-center gap-1.5">
                    <span>{PIPELINE_NODE_TYPES[selectedStatus.type].icon}</span>
                    节点详情
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/50">类型</span>
                      <span className="text-white/80">{selectedStatus.type}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/50">状态</span>
                      <span className={STATUS_STYLE[selectedStatus.status].text}>
                        {STATUS_STYLE[selectedStatus.status].label}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/50">耗时</span>
                      <span className="text-white/80">{selectedStatus.duration}</span>
                    </div>

                    {/* 状态进度指示 */}
                    <div className="mt-3">
                      <div className="flex gap-0.5">
                        {(['commit', 'build', 'test', 'security_scan', 'deploy_staging', 'deploy_prod', 'monitor'] as PipelineNodeType[]).map(type => {
                          const s = PIPELINE_NODE_STATUSES[type];
                          const isActive = type === selectedStatus.type;
                          const isPassed =
                            type === 'commit' || type === 'build' || type === 'test' || type === 'monitor'
                              ? true
                              : s.status === 'running'
                                ? true
                                : false;
                          const color = s.status === 'success' || isPassed ? '#00F2A9' : s.status === 'running' ? '#6C5CE7' : '#374151';
                          return (
                            <div
                              key={type}
                              className="flex-1 h-1 rounded-full transition-all"
                              style={{
                                backgroundColor: isActive ? '#6C5CE7' : color,
                                opacity: isActive ? 1 : 0.4,
                              }}
                              title={type}
                            />
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-white/30 mt-1 text-center">流水线进度</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── 中列：服务状态监控 ─── */}
        <div className="flex flex-col border-r border-cosmic-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-cosmic-border bg-space-card/30">
            <h2 className="text-sm font-display text-white/80">📊 服务状态监控</h2>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map(service => (
                <CosmicCard key={service.name} padding="sm" hoverable={true} className="!p-3">
                  {/* 服务名 + 状态点 */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-display text-white/90 truncate">{service.name}</h3>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                        style={{
                          backgroundColor: STATUS_COLORS[service.status],
                          boxShadow: `0 0 6px ${STATUS_COLORS[service.status]}80`,
                        }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: STATUS_COLORS[service.status] }}
                      >
                        {STATUS_LABELS[service.status]}
                      </span>
                    </div>
                  </div>

                  {/* 负载条 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/40">负载</span>
                      <span className="text-white/60">{service.load.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${service.load}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{
                          backgroundColor:
                            service.load > 80 ? '#FF6B6B' :
                            service.load > 60 ? '#FFD166' :
                            '#00F2A9',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/40">在线率</span>
                      <span className="text-white/60">{service.uptime}</span>
                    </div>
                    <p className="text-[10px] text-white/30 text-right">{service.lastCheck}</p>
                  </div>
                </CosmicCard>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 右列：部署脚本生成器 ─── */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-cosmic-border bg-space-card/30">
            <h2 className="text-sm font-display text-white/80">📜 部署脚本生成器</h2>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* 表单 */}
            <div className="space-y-3">
              {/* 项目名称 */}
              <div>
                <label className="text-[11px] text-white/50 mb-1 block">项目名称</label>
                <input
                  className="cosmic-input text-xs h-8 w-full"
                  placeholder="例如: my-web-app"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              {/* 环境选择 */}
              <div>
                <label className="text-[11px] text-white/50 mb-1 block">部署环境</label>
                <div className="flex gap-1">
                  {(['staging', 'production'] as DeployEnv[]).map(env => (
                    <button
                      key={env}
                      onClick={() => setDeployEnv(env)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        deployEnv === env
                          ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30'
                          : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {env === 'production' ? '🚀 生产' : '🧪 测试'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 端口号 */}
              <div>
                <label className="text-[11px] text-white/50 mb-1 block">端口号</label>
                <input
                  className="cosmic-input text-xs h-8 w-full"
                  placeholder="例如: 3000"
                  value={portNumber}
                  onChange={(e) => setPortNumber(e.target.value)}
                />
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="space-y-2">
              <CosmicButton
                size="sm"
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleGenerateScript('docker_compose')}
              >
                🐳 生成 Docker Compose
              </CosmicButton>
              <CosmicButton
                size="sm"
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleGenerateScript('nginx')}
              >
                ⚙️ 生成 Nginx Config
              </CosmicButton>
              <CosmicButton
                size="sm"
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleGenerateScript('baota')}
              >
                🖥️ 生成宝塔面板脚本
              </CosmicButton>
            </div>

            {/* 输出区域 */}
            {generatedScript && scriptType && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">
                    {scriptType === 'docker_compose' ? 'docker-compose.yml' :
                     scriptType === 'nginx' ? 'nginx.conf' :
                     'deploy.sh'}
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    📋 复制
                  </button>
                </div>
                <div className="bg-[#0a0a14] rounded-lg border border-white/10 overflow-auto max-h-64">
                  <pre className="p-3 text-[10px] font-mono text-green-400 leading-relaxed whitespace-pre overflow-x-auto">
                    <code>{generatedScript}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}