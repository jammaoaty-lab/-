'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

const API_NODE_TYPES = {
  'controller': { color: '#6C5CE7', icon: '🎮' },
  'service': { color: '#00E5FF', icon: '⚡' },
  'repository': { color: '#00F2A9', icon: '🗄' },
  'model': { color: '#FFD166', icon: '📦' },
  'middleware': { color: '#FF6B6B', icon: '🔒' },
  'endpoint': { color: '#E040FB', icon: '🔗' },
  'gateway': { color: '#FF9100', icon: '🌐' },
};

const INITIAL_NODES = [
  { id: 'gateway', label: 'API Gateway', type: 'gateway', x: 40, y: 40, width: 130, height: 50 },
  { id: 'ctrl1', label: 'UserController', type: 'controller', x: 240, y: 40, width: 150, height: 50 },
  { id: 'ctrl2', label: 'PostController', type: 'controller', x: 240, y: 140, width: 150, height: 50 },
  { id: 'svc1', label: 'UserService', type: 'service', x: 460, y: 40, width: 140, height: 50 },
  { id: 'svc2', label: 'PostService', type: 'service', x: 460, y: 140, width: 140, height: 50 },
  { id: 'repo1', label: 'UserRepo', type: 'repository', x: 660, y: 40, width: 130, height: 50 },
  { id: 'repo2', label: 'PostRepo', type: 'repository', x: 660, y: 140, width: 130, height: 50 },
  { id: 'model1', label: 'User', type: 'model', x: 850, y: 40, width: 100, height: 50 },
  { id: 'model2', label: 'Post', type: 'model', x: 850, y: 140, width: 100, height: 50 },
  { id: 'mw1', label: 'AuthMiddleware', type: 'middleware', x: 40, y: 140, width: 150, height: 50 },
];

const INITIAL_CONNS = [
  { id: 'c1', from: 'gateway', to: 'ctrl1' },
  { id: 'c2', from: 'gateway', to: 'ctrl2' },
  { id: 'c3', from: 'mw1', to: 'ctrl1' },
  { id: 'c4', from: 'ctrl1', to: 'svc1' },
  { id: 'c5', from: 'ctrl2', to: 'svc2' },
  { id: 'c6', from: 'svc1', to: 'repo1' },
  { id: 'c7', from: 'svc2', to: 'repo2' },
  { id: 'c8', from: 'repo1', to: 'model1' },
  { id: 'c9', from: 'repo2', to: 'model2' },
];

export default function BackendDevWorkbench() {
  const meta = ROLES_META.backend_dev;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'api' | 'er' | 'swagger'>('api');
  const [showER, setShowER] = useState(false);

  const handleGenerateCode = () => {
    toast.loading('AI 生成代码...', { id: 'gen' });
    setTimeout(() => toast.success('已生成 controller/model/service 代码', { id: 'gen' }), 1200);
  };

  const handleGenerateSwagger = () => {
    toast.loading('生成 Swagger 文档...', { id: 'swagger' });
    setViewMode('swagger');
    setTimeout(() => toast.success('OpenAPI 3.0 文档已生成', { id: 'swagger' }), 1000);
  };

  const handleGenerateMigration = () => {
    toast.success('数据库迁移文件已生成: alembic/versions/001_initial.py');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <CosmicButton size="sm" variant="secondary" onClick={handleGenerateCode}>🤖 生成代码</CosmicButton>
          <CosmicButton size="sm" variant="secondary" onClick={handleGenerateSwagger}>📋 Swagger</CosmicButton>
          <CosmicButton size="sm" variant="secondary" onClick={handleGenerateMigration}>🗄 迁移文件</CosmicButton>
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #dev 频道')}>发布</CosmicButton>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'swagger' ? (
          <div className="flex-1 overflow-auto p-4">
            <CosmicCard padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display text-white">Neural Town API v1</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-success-green/20 text-success-green">OpenAPI 3.0</span>
              </div>
              <div className="space-y-3">
                {[
                  { method: 'GET', path: '/api/v1/posts', desc: '获取帖子列表', color: '#00F2A9' },
                  { method: 'POST', path: '/api/v1/posts', desc: '创建帖子', color: '#FFD166' },
                  { method: 'GET', path: '/api/v1/posts/{id}', desc: '获取帖子详情', color: '#00F2A9' },
                  { method: 'POST', path: '/api/v1/posts/{id}/like', desc: '点赞帖子', color: '#6C5CE7' },
                  { method: 'GET', path: '/api/v1/users/me', desc: '获取当前用户', color: '#00F2A9' },
                  { method: 'POST', path: '/api/v1/auth/login', desc: '用户登录', color: '#00E5FF' },
                ].map(ep => (
                  <div key={ep.path} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: ep.color, backgroundColor: ep.color + '20' }}>
                      {ep.method}
                    </span>
                    <span className="text-sm font-mono text-white/70">{ep.path}</span>
                    <span className="text-xs text-white/40 ml-auto">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </CosmicCard>
          </div>
        ) : (
          <>
            {/* 主画布 */}
            <div className="flex-1 relative">
              <FlowCanvas
                nodes={INITIAL_NODES}
                connections={INITIAL_CONNS}
                nodeTypes={API_NODE_TYPES}
                onSelectNode={setSelectedNode}
              />
            </div>

            {/* 右侧面板 */}
            {selectedNode && (
              <motion.div initial={{ width: 0 }} animate={{ width: 260 }} className="border-l border-cosmic-border overflow-hidden">
                <div className="glass-panel h-full p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <span>{API_NODE_TYPES[selectedNode.type as keyof typeof API_NODE_TYPES]?.icon}</span>
                    <h3 className="text-sm font-display text-white">{selectedNode.label}</h3>
                  </div>
                  <p className="text-xs text-white/50">类型: {selectedNode.type}</p>
                  <div className="space-y-2">
                    <input className="cosmic-input text-xs h-7" placeholder="节点名称" defaultValue={selectedNode.label} />
                    <textarea className="cosmic-input text-xs h-20 resize-none" placeholder="节点描述/注释..." />
                    <CosmicButton size="sm" className="w-full" onClick={() => toast.success('属性已更新')}>更新属性</CosmicButton>
                    <CosmicButton size="sm" variant="secondary" className="w-full" onClick={() => handleGenerateCode()}>
                      为此节点生成代码
                    </CosmicButton>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}