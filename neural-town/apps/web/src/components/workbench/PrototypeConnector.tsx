'use client';

import { useState } from 'react';

interface PrototypeLink {
  id: string;
  from: string;
  to: string;
  trigger: 'click' | 'hover' | 'delay';
  animation: string;
}

interface Screen {
  id: string;
  name: string;
}

interface PrototypeConnectorProps {
  screens: Screen[];
  onLinksChange?: (links: PrototypeLink[]) => void;
}

export default function PrototypeConnector({ screens, onLinksChange }: PrototypeConnectorProps) {
  const [links, setLinks] = useState<PrototypeLink[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trigger, setTrigger] = useState<'click' | 'hover' | 'delay'>('click');
  const [animation, setAnimation] = useState('fade');

  const addLink = () => {
    if (!from || !to || from === to) return;
    const newLink: PrototypeLink = {
      id: `link-${Date.now()}`,
      from, to, trigger, animation,
    };
    const updated = [...links, newLink];
    setLinks(updated);
    onLinksChange?.(updated);
    setFrom(''); setTo('');
  };

  const removeLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    onLinksChange?.(updated);
  };

  return (
    <div className="glass-panel w-64 p-3">
      <h3 className="text-xs font-mono text-white/60 uppercase mb-3">原型连线</h3>

      {/* 添加连线 */}
      <div className="space-y-2 mb-4">
        <select className="cosmic-input text-xs h-8" value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">从页面...</option>
          {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="cosmic-input text-xs h-8" value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">到页面...</option>
          {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-1">
          <select className="cosmic-input text-xs h-8 flex-1" value={trigger} onChange={(e) => setTrigger(e.target.value as 'click' | 'hover' | 'delay')}>
            <option value="click">点击</option>
            <option value="hover">悬停</option>
            <option value="delay">延迟</option>
          </select>
          <select className="cosmic-input text-xs h-8 flex-1" value={animation} onChange={(e) => setAnimation(e.target.value)}>
            <option value="fade">淡入</option>
            <option value="slide">滑动</option>
            <option value="push">推入</option>
            <option value="flip">翻转</option>
          </select>
        </div>
        <button onClick={addLink} className="cosmic-btn w-full text-xs py-1.5">添加连线</button>
      </div>

      {/* 连线列表 */}
      <div className="space-y-1">
        {links.map(link => {
          const fromScreen = screens.find(s => s.id === link.from);
          const toScreen = screens.find(s => s.id === link.to);
          return (
            <div key={link.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 text-xs">
              <span className="text-white/60">{fromScreen?.name || link.from}</span>
              <span className="text-ai-blue">→</span>
              <span className="text-white/60">{toScreen?.name || link.to}</span>
              <span className="text-[10px] text-white/30 ml-auto">{link.trigger}</span>
              <button onClick={() => removeLink(link.id)} className="text-danger-red text-[10px] hover:text-red-400">×</button>
            </div>
          );
        })}
      </div>

      {links.length === 0 && (
        <p className="text-[10px] text-white/20 text-center">添加页面连线来创建交互原型</p>
      )}
    </div>
  );
}