'use client';

import { useState, useRef, useCallback } from 'react';

export interface FlowNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  icon?: string;
  inputs?: string[];
  outputs?: string[];
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface FlowCanvasProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  onNodesChange?: (nodes: FlowNode[]) => void;
  onConnectionsChange?: (conns: FlowConnection[]) => void;
  onSelectNode?: (node: FlowNode) => void;
  nodeTypes?: Record<string, { color: string; icon: string }>;
  readOnly?: boolean;
}

const GRID = 20;
const snap = (v: number) => Math.round(v / GRID) * GRID;

export function FlowCanvas({
  nodes: initialNodes, connections: initialConns,
  onNodesChange, onConnectionsChange, onSelectNode,
  nodeTypes = {}, readOnly = false,
}: FlowCanvasProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [connections, setConns] = useState<FlowConnection[]>(initialConns);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; fromX: number; fromY: number; toX: number; toY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 1200;
  const H = 800;

  const handleMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    if (readOnly) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    setDragging({ id: node.id, offsetX: e.clientX * scaleX - node.x, offsetY: e.clientY * scaleY - node.y });
    setSelectedId(node.id);
    onSelectNode?.(node);
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const updated = nodes.map(n => n.id === dragging.id ? {
        ...n, x: snap(e.clientX * scaleX - dragging.offsetX), y: snap(e.clientY * scaleY - dragging.offsetY),
      } : n);
      setNodes(updated);
      onNodesChange?.(updated);
    }
    if (connecting) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      setConnecting(prev => prev ? { ...prev, toX: e.clientX * scaleX, toY: e.clientY * scaleY } : null);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    if (connecting) {
      const targetNode = nodes.find(n =>
        Math.abs(connecting.toX - (n.x + n.width / 2)) < 60 &&
        Math.abs(connecting.toY - (n.y + n.height / 2)) < 60 &&
        n.id !== connecting.fromId
      );
      if (targetNode) {
        const newConn: FlowConnection = { id: `conn-${Date.now()}`, from: connecting.fromId, to: targetNode.id };
        const updated = [...connections, newConn];
        setConns(updated);
        onConnectionsChange?.(updated);
      }
      setConnecting(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setConns(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  const startConnection = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    setConnecting({ fromId: node.id, fromX: node.x + node.width, fromY: node.y + node.height / 2, toX: node.x + node.width, toY: node.y + node.height / 2 });
  };

  const addNode = (type: string, e: React.MouseEvent) => {
    if (readOnly) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      label: `New ${type}`,
      type,
      x: snap(e.clientX * scaleX - 60),
      y: snap(e.clientY * scaleY - 25),
      width: 120,
      height: 50,
    };
    const updated = [...nodes, newNode];
    setNodes(updated);
    onNodesChange?.(updated);
  };

  const getNodeColor = (node: FlowNode) => {
    const nt = nodeTypes[node.type];
    return nt?.color || '#6C5CE7';
  };

  const getNodeIcon = (node: FlowNode) => {
    const nt = nodeTypes[node.type];
    return nt?.icon || '⬡';
  };

  return (
    <div className="relative h-full bg-[#0a0a14] overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={(e) => addNode('endpoint', e)}
      >
        {/* 网格 */}
        {Array.from({ length: Math.floor(W / GRID) }).map((_, i) => (
          <line key={`gv${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={H} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
        ))}
        {Array.from({ length: Math.floor(H / GRID) }).map((_, i) => (
          <line key={`gh${i}`} x1={0} y1={i * GRID} x2={W} y2={i * GRID} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
        ))}

        {/* 连线 */}
        {connections.map(conn => {
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (!from || !to) return null;
          const x1 = from.x + from.width;
          const y1 = from.y + from.height / 2;
          const x2 = to.x;
          const y2 = to.y + to.height / 2;
          const cx = (x1 + x2) / 2;
          return (
            <g key={conn.id}>
              <path
                d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(108,92,231,0.4)"
                strokeWidth={1.5}
              />
              {/* 流动光点动画 */}
              <circle r={3} fill="#00E5FF" opacity={0.6}>
                <animateMotion dur="2s" repeatCount="indefinite" path={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`} />
              </circle>
            </g>
          );
        })}

        {/* 进行中的连线 */}
        {connecting && (
          <line
            x1={connecting.fromX} y1={connecting.fromY}
            x2={connecting.toX} y2={connecting.toY}
            stroke="rgba(108,92,231,0.6)" strokeWidth={1.5} strokeDasharray="5,3"
          />
        )}

        {/* 节点 */}
        {nodes.map(node => {
          const color = getNodeColor(node);
          const isSelected = selectedId === node.id;
          return (
            <g key={node.id}>
              <rect
                x={node.x} y={node.y}
                width={node.width} height={node.height}
                rx={10}
                fill={isSelected ? `${color}20` : '#1a1a2e'}
                stroke={isSelected ? color : 'rgba(108,92,231,0.2)'}
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer"
                onMouseDown={(e) => handleMouseDown(e, node)}
                onContextMenu={(e) => handleContextMenu(e, node.id)}
              />
              <text
                x={node.x + 12} y={node.y + 30}
                fill="white" fontSize={12} fontFamily="JetBrains Mono, monospace"
                className="pointer-events-none"
              >
                {getNodeIcon(node)} {node.label}
              </text>
              {/* 输出端口 */}
              <circle
                cx={node.x + node.width} cy={node.y + node.height / 2} r={5}
                fill={color} stroke="white" strokeWidth={0.5}
                className="cursor-crosshair"
                onMouseDown={(e) => startConnection(e, node)}
              />
              {isSelected && (
                <rect x={node.x - 2} y={node.y - 2} width={node.width + 4} height={node.height + 4} rx={12} fill="none" stroke="#00E5FF" strokeWidth={1} strokeDasharray="4,2" />
              )}
            </g>
          );
        })}

        {/* 提示 */}
        {nodes.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={14}>
            双击空白区域添加节点 | 从节点圆点拖拽连线
          </text>
        )}
      </svg>

      {/* 浮动添加栏 */}
      {!readOnly && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 glass-panel p-1">
          {Object.entries(nodeTypes).map(([type, { color, icon }]) => (
            <button
              key={type}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-1"
              style={{ borderLeft: `2px solid ${color}` }}
            >
              {icon} {type}
            </button>
          ))}
          <button className="px-2 py-1 text-xs text-white/40 hover:text-white/80" onClick={() => {
            const updated = nodes.slice(0, -1); setNodes(updated); onNodesChange?.(updated);
          }}>撤销</button>
        </div>
      )}
    </div>
  );
}