'use client';

import { useState, useCallback, useRef } from 'react';

interface PlacedComponent {
  id: string;
  componentId: string;
  name: string;
  icon: string;
  html: string;
  x: number;
  y: number;
  width: number;
  selected: boolean;
  props: Record<string, unknown>;
}

interface DesignCanvasProps {
  device: 'desktop' | 'tablet' | 'mobile';
  onComponentsChange?: (components: PlacedComponent[]) => void;
}

const DEVICE_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' };

export default function DesignCanvas({ device, onComponentsChange }: DesignCanvasProps) {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('component'));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newComp: PlacedComponent = {
      id: `comp-${Date.now()}`,
      componentId: data.id,
      name: data.name,
      icon: data.icon,
      html: data.html,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 300,
      selected: true,
      props: data.defaultProps || {},
    };

    const updated = [...components, newComp];
    setComponents(updated);
    setSelectedId(newComp.id);
    onComponentsChange?.(updated);
  }, [components, onComponentsChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const selectComponent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    setComponents(prev => prev.map(c => ({ ...c, selected: c.id === id })));
  };

  const deselectAll = () => {
    setSelectedId(null);
    setComponents(prev => prev.map(c => ({ ...c, selected: false })));
  };

  const deleteSelected = () => {
    if (selectedId) {
      const updated = components.filter(c => c.id !== selectedId);
      setComponents(updated);
      setSelectedId(null);
      onComponentsChange?.(updated);
    }
  };

  const moveComponent = (id: string, dx: number, dy: number) => {
    setComponents(prev => prev.map(c =>
      c.id === id ? { ...c, x: c.x + dx, y: c.y + dy } : c
    ));
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-[#0a0e1a] overflow-auto p-4">
      {/* 设备选择器 */}
      <div className="flex items-center gap-1 mb-3 bg-space-card rounded-xl p-0.5 border border-cosmic-border">
        {(['desktop', 'tablet', 'mobile'] as const).map(d => (
          <button
            key={d}
            onClick={() => {}}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${device === d ? 'bg-nebulae-purple/20 text-nebulae-purple' : 'text-white/50 hover:text-white/80'}`}
          >
            {d === 'desktop' ? '🖥 桌面' : d === 'tablet' ? '📱 平板' : '📱 手机'}
          </button>
        ))}
        <button onClick={deleteSelected} className="ml-2 px-2 py-1 text-xs text-danger-red hover:bg-danger-red/10 rounded-lg">
          🗑 删除
        </button>
      </div>

      {/* 画布 */}
      <div
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={deselectAll}
        className="relative bg-white rounded-lg shadow-2xl min-h-[600px] transition-all duration-300"
        style={{ width: DEVICE_WIDTHS[device] }}
      >
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
            从左侧拖拽组件到这里
          </div>
        )}

        {components.map(comp => (
          <div
            key={comp.id}
            onClick={(e) => selectComponent(comp.id, e)}
            draggable
            onDragStart={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              e.dataTransfer.setData('move-component', JSON.stringify({ id: comp.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }));
            }}
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                moveComponent(comp.id, e.clientX - rect.left - comp.x, e.clientY - rect.top - comp.y);
              }
            }}
            className={`absolute cursor-move group transition-shadow ${
              comp.selected ? 'ring-2 ring-nebulae-purple ring-offset-1 z-10' : 'hover:ring-1 hover:ring-gray-300'
            }`}
            style={{ left: comp.x, top: comp.y, width: comp.width }}
          >
            <div
              className="p-0"
              dangerouslySetInnerHTML={{ __html: comp.html }}
            />
            {/* 组件标签 */}
            <div className="absolute -top-6 left-0 bg-nebulae-purple text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {comp.icon} {comp.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}