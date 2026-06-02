'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasLayer {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  fontSize?: number;
  shapeType?: 'rect' | 'circle' | 'line';
  opacity: number;
  visible: boolean;
  locked: boolean;
}

interface InfiniteCanvasProps {
  width?: number;
  height?: number;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  onLayersChange?: (layers: CanvasLayer[]) => void;
}

export default function InfiniteCanvas({
  width = 1200,
  height = 800,
  gridSize = 20,
  showGrid: initialShowGrid = true,
  snapToGrid: initialSnapToGrid = true,
  onLayersChange,
}: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [snapToGrid, setSnapToGrid] = useState(initialSnapToGrid);
  const [layers, setLayers] = useState<CanvasLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'text' | 'rect' | 'circle' | 'image'>('select');
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const spaceDownRef = useRef(false);

  const snap = useCallback((val: number) => snapToGrid ? Math.round(val / gridSize) * gridSize : val, [snapToGrid, gridSize]);

  const screenToCanvas = useCallback((sx: number, sy: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (sx - rect.left) / zoom - offset.x,
      y: (sy - rect.top) / zoom - offset.y,
    };
  }, [zoom, offset]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画布背景
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 + offset.x * zoom, canvas.height / 2 + offset.y * zoom);
    ctx.scale(zoom, zoom);

    // 画布区域
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // 网格
    if (showGrid) {
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.08)';
      ctx.lineWidth = 0.5;
      for (let x = -width / 2; x <= width / 2; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, -height / 2); ctx.lineTo(x, height / 2); ctx.stroke();
      }
      for (let y = -height / 2; y <= height / 2; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(-width / 2, y); ctx.lineTo(width / 2, y); ctx.stroke();
      }
    }

    // 绘制图层
    for (const layer of layers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;

      if (layer.type === 'text') {
        ctx.fillStyle = layer.color;
        ctx.font = `${layer.fontSize || 24}px Inter, sans-serif`;
        ctx.fillText(layer.content, layer.x - width / 2, layer.y - height / 2 + (layer.fontSize || 24));
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.color;
        ctx.strokeStyle = layer.color;
        if (layer.shapeType === 'rect') {
          ctx.fillRect(layer.x - width / 2, layer.y - height / 2, layer.width, layer.height);
        } else if (layer.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(layer.x - width / 2, layer.y - height / 2, layer.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 选中高亮
      if (layer.id === selectedLayer) {
        ctx.strokeStyle = '#6C5CE7';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 3 / zoom]);
        ctx.strokeRect(layer.x - width / 2 - 4, layer.y - height / 2 - 4, layer.width + 8, layer.height + 8);
        ctx.setLineDash([]);
      }

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [width, height, zoom, offset, showGrid, gridSize, layers, selectedLayer]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (spaceDownRef.current || e.button === 1) {
      setIsPanning(true);
      isPanningRef.current = true;
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    const pos = screenToCanvas(e.clientX, e.clientY);
    const snapped = { x: snap(pos.x), y: snap(pos.y) };

    if (tool === 'select') {
      const clicked = layers.findLast(l =>
        snapped.x >= l.x - width / 2 && snapped.x <= l.x - width / 2 + l.width &&
        snapped.y >= l.y - height / 2 && snapped.y <= l.y - height / 2 + l.height
      );
      setSelectedLayer(clicked?.id || null);
    } else {
      setDrawing(true);
      setDrawStart(snapped);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanningRef.current) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (drawing) {
      draw();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    isPanningRef.current = false;

    if (drawing) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const snapped = { x: snap(pos.x), y: snap(pos.y) };
      const startX = drawStart.x;
      const startY = drawStart.y;
      const w = Math.abs(snapped.x - startX);
      const h = Math.abs(snapped.y - startY);

      if (w > 5 || h > 5) {
        const newLayer: CanvasLayer = {
          id: `layer-${Date.now()}`,
          type: tool === 'text' ? 'text' : 'shape',
          x: Math.min(startX, snapped.x),
          y: Math.min(startY, snapped.y),
          width: Math.max(w, 50),
          height: Math.max(h, 20),
          content: tool === 'text' ? '双击编辑文字' : '',
          color: tool === 'text' ? '#ffffff' : '#6C5CE7',
          fontSize: 24,
          shapeType: tool === 'circle' ? 'circle' : 'rect',
          opacity: 1,
          visible: true,
          locked: false,
        };
        const updated = [...layers, newLayer];
        setLayers(updated);
        onLayersChange?.(updated);
        setSelectedLayer(newLayer.id);
      }
      setDrawing(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.1, Math.min(5, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); spaceDownRef.current = true; }
    if (e.code === 'Delete' && selectedLayer) {
      setLayers(prev => prev.filter(l => l.id !== selectedLayer));
      setSelectedLayer(null);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') { setIsPanning(false); isPanningRef.current = false; spaceDownRef.current = false; }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const pos = screenToCanvas(e.clientX, e.clientY);
    const clicked = layers.findLast(l =>
      pos.x >= l.x - width / 2 && pos.x <= l.x - width / 2 + l.width &&
      pos.y >= l.y - height / 2 && pos.y <= l.y - height / 2 + l.height &&
      l.type === 'text'
    );
    if (clicked) {
      const text = prompt('编辑文字:', clicked.content);
      if (text !== null) {
        setLayers(prev => prev.map(l => l.id === clicked.id ? { ...l, content: text } : l));
      }
    }
  };

  const exportCanvas = (format: 'png' | 'svg') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);
    for (const layer of layers) {
      if (!layer.visible) continue;
      if (layer.type === 'text') {
        ctx.fillStyle = layer.color;
        ctx.font = `${layer.fontSize || 24}px Inter, sans-serif`;
        ctx.fillText(layer.content, layer.x, layer.y);
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.color;
        if (layer.shapeType === 'rect') ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        else if (layer.shapeType === 'circle') { ctx.beginPath(); ctx.arc(layer.x, layer.y, layer.width / 2, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'neural-town-design.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 border-b border-cosmic-border bg-space-card/50">
        {(['select', 'text', 'rect', 'circle', 'image'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              tool === t ? 'bg-nebulae-purple/30 text-nebulae-purple border border-nebulae-purple/50' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {t === 'select' ? '↖选择' : t === 'text' ? 'T 文字' : t === 'rect' ? '□ 矩形' : t === 'circle' ? '○ 圆形' : '🖼 图片'}
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button onClick={() => setShowGrid(!showGrid)} className={`px-2 py-1 text-xs rounded ${showGrid ? 'text-nebulae-purple' : 'text-white/40'}`}>
          网格
        </button>
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-2 py-1 text-xs rounded ${snapToGrid ? 'text-nebulae-purple' : 'text-white/40'}`}>
          吸附
        </button>
        <div className="flex-1" />
        <span className="text-xs text-white/30">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="text-xs px-2 py-1 text-white/50 hover:text-white">+</button>
        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-xs px-2 py-1 text-white/50 hover:text-white">-</button>
        <button onClick={() => exportCanvas('png')} className="cosmic-btn px-3 py-1 text-xs">导出PNG</button>
      </div>

      {/* 画布 */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative bg-[#030614]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
          style={{ cursor: isPanning ? 'grabbing' : spaceDownRef.current ? 'grab' : 'crosshair' }}
        />
      </div>

      {/* 图层面板 */}
      <div className="absolute right-2 top-14 w-48 glass-panel p-2 text-xs">
        <h3 className="text-white/60 font-mono mb-2 text-[10px] uppercase">图层</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {layers.map((layer, i) => (
            <div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                layer.id === selectedLayer ? 'bg-nebulae-purple/20 border border-nebulae-purple/30' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-[10px]">{layer.type === 'text' ? 'T' : layer.shapeType === 'circle' ? '○' : '□'}</span>
              <span className="truncate flex-1 text-white/70">{layer.content || `图层 ${i + 1}`}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? {...l, visible: !l.visible} : l)); }}
                className="text-[10px] text-white/30 hover:text-white/80"
              >
                {layer.visible ? '👁' : '—'}
              </button>
            </div>
          ))}
        </div>
        {layers.length === 0 && <p className="text-white/20 text-[10px]">选择工具并拖拽创建</p>}
      </div>
    </div>
  );
}