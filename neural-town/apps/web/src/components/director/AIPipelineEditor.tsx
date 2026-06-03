'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionLineType,
  Panel,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectorStore } from '@/stores/director-store';
import toast from 'react-hot-toast';

// ─── Custom Node Types ───

type PipelineNodeType = 'input' | 'ai-process' | 'output';

interface PipelineNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  nodeType: PipelineNodeType;
  status?: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  outputPreview?: string;
  config?: Record<string, string>;
  icon: string;
  color: string;
}

const NODE_TYPE_STYLES: Record<PipelineNodeType, { bg: string; border: string; iconBg: string }> = {
  input: { bg: 'rgba(0, 229, 255, 0.08)', border: '#00E5FF', iconBg: '#00E5FF20' },
  'ai-process': { bg: 'rgba(108, 92, 231, 0.08)', border: '#6C5CE7', iconBg: '#6C5CE720' },
  output: { bg: 'rgba(0, 242, 169, 0.08)', border: '#00F2A9', iconBg: '#00F2A920' },
};

function PipelineNode({ data, selected }: NodeProps<PipelineNodeData>) {
  const style = NODE_TYPE_STYLES[data.nodeType];
  
  return (
    <div
      className={`relative rounded-xl backdrop-blur-sm transition-all duration-200 ${
        selected ? 'ring-2 ring-white/40 shadow-xl' : ''
      }`}
      style={{
        background: style.bg,
        border: `1.5px solid ${selected ? '#ffffff60' : style.border + '60'}`,
        minWidth: 180,
        boxShadow: selected ? `0 0 20px ${style.border}30` : undefined,
      }}
    >
      {/* Input handle */}
      {data.nodeType !== 'input' && (
        <Handle type="target" position={Position.Left} 
          style={{ background: style.border, width: 10, height: 10, border: '2px solid #0a0e1a' }} />
      )}

      {/* Output handle */}
      {data.nodeType !== 'output' && (
        <Handle type="source" position={Position.Right}
          style={{ background: style.border, width: 10, height: 10, border: '2px solid #0a0e1a' }} />
      )}

      {/* Node header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: style.iconBg }}>
          {data.status === 'running' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚙️</motion.div>
          ) : data.status === 'success' ? '✅' :
           data.status === 'error' ? '❌' : data.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-white truncate">{data.label}</p>
          <p className="text-[9px] text-white/35 truncate">{data.description}</p>
        </div>
      </div>

      {/* Progress bar when running */}
      {data.status === 'running' && typeof data.progress === 'number' && (
        <div className="mx-3 mt-2 mb-1">
          <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${style.border}, #fff)` }}
              initial={{ width: 0 }}
              animate={{ width: `${data.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[8px] text-white/30 mt-0.5 text-right">{data.progress}%</p>
        </div>
      )}

      {/* Output preview when success */}
      {data.status === 'success' && data.outputPreview && (
        <div className="m-2 mt-1 p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <p className="text-[9px] text-[#00F2A9] truncate">{data.outputPreview}</p>
        </div>
      )}

      {/* Config fields placeholder */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="px-3 pb-2 space-y-1">
          {Object.entries(data.config).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[8px] text-white/30">{key}</span>
              <span className="text-[9px] text-white/50 font-mono">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { pipelineNode: PipelineNode };

// ─── Default pipeline nodes ───
function createDefaultNodes(): Node<PipelineNodeData>[] {
  return [
    {
      id: 'script-input',
      type: 'pipelineNode',
      position: { x: 50, y: 120 },
      data: {
        label: '剧本输入',
        description: 'Markdown 格式剧本解析',
        nodeType: 'input',
        icon: '📝',
        color: '#00E5FF',
        config: { format: 'Markdown', encoding: 'UTF-8' },
      },
    },
    {
      id: 'scene-gen',
      type: 'pipelineNode',
      position: { x: 320, y: 40 },
      data: {
        label: '场景生成 (ComfyUI)',
        description: 'AI 生成分镜场景图像',
        nodeType: 'ai-process',
        icon: '🎨',
        color: '#6C5CE7',
        config: { model: 'SDXL', steps: '30', size: '1920x1080' },
      },
    },
    {
      id: 'character-anim',
      type: 'pipelineNode',
      position: { x: 320, y: 220 },
      data: {
        label: '角色动画 (SadTalker)',
        description: '音频驱动面部表情+口型',
        nodeType: 'ai-process',
        icon: '🗣️',
        color: '#6C5CE7',
        config: { model: 'SadTalker', fps: '30' },
      },
    },
    {
      id: 'voice-synth',
      type: 'pipelineNode',
      position: { x: 600, y: 130 },
      data: {
        label: '语音合成 (VITS)',
        description: '多角色情感化语音合成',
        nodeType: 'ai-process',
        icon: '🔊',
        color: '#6C5CE7',
        config: { model: 'VITS-v2', speaker: '艾拉' },
      },
    },
    {
      id: 'music-gen',
      type: 'pipelineNode',
      position: { x: 600, y: 280 },
      data: {
        label: '配乐生成 (MusicGen)',
        description: '根据情感曲线生成 BGM',
        nodeType: 'ai-process',
        icon: '🎵',
        color: '#6C5CE7',
        config: { model: 'MusicGen', duration: '20s' },
      },
    },
    {
      id: 'render-output',
      type: 'pipelineNode',
      position: { x: 900, y: 170 },
      data: {
        label: '渲染输出 (FFmpeg)',
        description: '合成最终视频文件',
        nodeType: 'output',
        icon: '🎬',
        color: '#00F2A9',
        config: { format: 'MP4', quality: '4K', codec: 'H.265' },
      },
    },
  ];
}

function createDefaultEdges(): Edge[] {
  return [
    { id: 'e1', source: 'script-input', target: 'scene-gen', animated: true, style: { stroke: '#00E5FF60', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF60' } },
    { id: 'e2', source: 'script-input', target: 'character-anim', animated: true, style: { stroke: '#00E5FF60', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF60' } },
    { id: 'e3', source: 'scene-gen', target: 'render-output', animated: true, style: { stroke: '#6C5CE760', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6C5CE760' } },
    { id: 'e4', source: 'character-anim', target: 'render-output', animated: true, style: { stroke: '#6C5CE760', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6C5CE760' } },
    { id: 'e5', source: 'voice-synth', target: 'render-output', animated: true, style: { stroke: '#6C5CE760', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6C5CE760' } },
    { id: 'e6', source: 'music-gen', target: 'render-output', animated: true, style: { stroke: '#6C5CE760', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6C5CE760' } },
    { id: 'e7', source: 'script-input', target: 'voice-synth', animated: true, style: { stroke: '#00E5FF60', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF60' } },
    { id: 'e8', source: 'script-input', target: 'music-gen', animated: true, style: { stroke: '#00E5FF60', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00E5FF60' } },
  ];
}

export default function AIPipelineEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(createDefaultNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createDefaultEdges());
  const [isRunning, setIsRunning] = useState(false);
  const { seedDemo, setIsGenerating } = useDirectorStore();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#ffffff30', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ffffff30' },
    }, eds)),
    [setEdges]
  );

  // Simulate pipeline execution
  const runPipeline = async () => {
    setIsRunning(true);
    setIsGenerating(true);
    
    const executionOrder = ['script-input', 'scene-gen', 'voice-synth', 'music-gen', 'character-anim', 'render-output'];
    
    for (const nodeId of executionOrder) {
      // Set running status
      setNodes(nds =>
        nds.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: 'running' as const, progress: 0 } }
            : n
        )
      );

      // Simulate progress
      for (let p = 0; p <= 100; p += 10 + Math.random() * 20) {
        await new Promise(r => setTimeout(r, 150 + Math.random() * 200));
        setNodes(nds =>
          nds.map(n =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, progress: Math.min(100, p), status: 'running' as const } }
              : n
          )
        );
      }

      // Mark success
      const previews: Record<string, string> = {
        'script-input': '已解析 5 个场景、3 个角色、12 条台词',
        'scene-gen': '生成 5 张场景图 (1920×1080)',
        'character-anim': '生成 3 段角色动画视频',
        'voice-synth': '合成 3 条语音轨道 (总长 20s)',
        'music-gen': '生成 BGM "星际序曲" (20s)',
        'render-output': '输出 final.mp4 (4K, H.265, 45MB)',
      };

      setNodes(nds =>
        nds.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: 'success' as const, progress: 100, outputPreview: previews[nodeId] || '完成' } }
            : n
        )
      );
    }

    // Seed demo data into timeline
    seedDemo();
    setIsRunning(false);
    setIsGenerating(false);
    toast.success('✨ 管线执行完成！时间轴已自动填充', { icon: '🎉', duration: 4000 });
  };

  const resetPipeline = () => {
    setNodes(createDefaultNodes());
    setEdges(createDefaultEdges());
    setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#030614]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cosmic-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="text-sm font-display font-semibold text-white/90">AI 生成管线</span>
          <span className="text-[10px] text-white/30">(react-flow 节点编辑器)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetPipeline}
            disabled={isRunning}
            className="px-2.5 py-1 rounded-lg text-[10px] border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
          >
            🔄 重置管线
          </button>
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#FF6B6B] text-white hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? '⏳ 管线运行中...' : '▶️ 运行管线'}
          </button>
        </div>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#ffffff20', strokeWidth: 1.5 },
          }}
          connectionLineStyle={{ stroke: '#6C5CE7', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#030614' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff06" />
          <Controls
            showInteractive={false}
            style={{ background: '#0D1020CC', borderRadius: 8, border: '1px solid #1A1F35' }}
          />
          <MiniMap
            nodeColor={(node) => {
              const d = node.data as PipelineNodeData;
              return d.nodeType === 'input' ? '#00E5FF40' :
                     d.nodeType === 'output' ? '#00F2A940' : '#6C5CE740';
            }}
            maskColor="#03061480"
            style={{ background: '#0D1020CC', border: '1px solid #1A1F35', borderRadius: 8 }}
          />

          {/* Info panel */}
          <Panel position="top-left" className="!m-3 !bg-transparent !border-none !shadow-none">
            <div className="px-3 py-2 rounded-lg bg-[#0D1020CC] backdrop-blur-sm border border-[#1A1F35]">
              <p className="text-[10px] text-white/40 leading-relaxed max-w-[240px]">
                拖拽节点调整位置，连接端口构建数据流。点击「运行管线」模拟完整 AI 生成流程。
              </p>
            </div>
          </Panel>

          {/* Status panel */}
          <Panel position="top-right" className="!m-3 !bg-transparent !border-none !shadow-none">
            <div className="px-3 py-2 rounded-lg bg-[#0D1020CC] backdrop-blur-sm border border-[#1A1F35]">
              <p className="text-[10px] text-white/50 font-mono">
                节点: {nodes.length} · 连接: {edges.length}
              </p>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
