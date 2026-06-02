'use client';

import { useState } from 'react';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import toast from 'react-hot-toast';

interface ExpressionPreset {
  id: string;
  name: string;
  icon: string;
  emotion: string;
  params: Record<string, number>;
}

const EXPRESSION_PRESETS: ExpressionPreset[] = [
  { id: 'neutral', name: '中性', icon: '😐', emotion: 'neutral', params: { brow: 0.5, eye: 0.5, mouth: 0.5, cheek: 0.5 } },
  { id: 'happy', name: '喜悦', icon: '😊', emotion: 'joyful', params: { brow: 0.7, eye: 0.8, mouth: 0.9, cheek: 0.8 } },
  { id: 'sad', name: '悲伤', icon: '😢', emotion: 'sad', params: { brow: 0.3, eye: 0.2, mouth: 0.2, cheek: 0.3 } },
  { id: 'angry', name: '愤怒', icon: '😠', emotion: 'angry', params: { brow: 0.1, eye: 0.3, mouth: 0.1, cheek: 0.4 } },
  { id: 'surprised', name: '惊讶', icon: '😮', emotion: 'surprised', params: { brow: 0.9, eye: 0.95, mouth: 0.85, cheek: 0.6 } },
  { id: 'fearful', name: '恐惧', icon: '😨', emotion: 'fearful', params: { brow: 0.2, eye: 0.1, mouth: 0.3, cheek: 0.2 } },
  { id: 'disgust', name: '厌恶', icon: '🤢', emotion: 'disgust', params: { brow: 0.3, eye: 0.4, mouth: 0.2, cheek: 0.3 } },
  { id: 'smirk', name: '得意', icon: '😏', emotion: 'smirk', params: { brow: 0.6, eye: 0.5, mouth: 0.7, cheek: 0.6 } },
  { id: 'cry', name: '哭泣', icon: '😭', emotion: 'sad', params: { brow: 0.2, eye: 0.1, mouth: 0.1, cheek: 0.15 } },
  { id: 'laugh', name: '大笑', icon: '😂', emotion: 'joyful', params: { brow: 0.8, eye: 0.9, mouth: 1.0, cheek: 0.9 } },
  { id: 'confused', name: '困惑', icon: '🤔', emotion: 'confused', params: { brow: 0.4, eye: 0.5, mouth: 0.4, cheek: 0.5 } },
  { id: 'love', name: '爱慕', icon: '🥰', emotion: 'joyful', params: { brow: 0.7, eye: 0.7, mouth: 0.6, cheek: 0.9 } },
];

const COMPOUND_EMOTIONS: ExpressionPreset[] = [
  { id: 'jealous', name: '嫉妒', icon: '😒', emotion: 'jealous', params: { brow: 0.3, eye: 0.3, mouth: 0.3, cheek: 0.5 } },
  { id: 'shame', name: '羞愧', icon: '😳', emotion: 'shame', params: { brow: 0.4, eye: 0.3, mouth: 0.4, cheek: 0.8 } },
  { id: 'hope', name: '期待', icon: '🤩', emotion: 'hopeful', params: { brow: 0.8, eye: 0.9, mouth: 0.7, cheek: 0.7 } },
];

const CHARACTER_PRESETS = [
  { id: 'hero', name: '主角·勇者', icon: '🦸', skin: '#FFD5B8', hair: '#3D1C00', eyes: '#3B82F6', outfit: '#6C5CE7' },
  { id: 'heroine', name: '女主·精灵', icon: '🧝', skin: '#FFE0D0', hair: '#FFD700', eyes: '#10B981', outfit: '#F472B6' },
  { id: 'villain', name: '反派·暗影', icon: '🦹', skin: '#D4C5B9', hair: '#1A1A1A', eyes: '#EF4444', outfit: '#374151' },
  { id: 'mentor', name: '导师·智者', icon: '🧙', skin: '#C4A882', hair: '#9CA3AF', eyes: '#6366F1', outfit: '#1E40AF' },
  { id: 'custom', name: '自定义', icon: '👤', skin: '#FFD5B8', hair: '#4A3728', eyes: '#3B82F6', outfit: '#8B5CF6' },
];

interface CharacterRigProps {
  onExpressionChange?: (params: Record<string, number>) => void;
  onCharacterSelect?: (character: typeof CHARACTER_PRESETS[0]) => void;
}

export default function CharacterRig({ onExpressionChange, onCharacterSelect }: CharacterRigProps) {
  const [selectedChar, setSelectedChar] = useState(CHARACTER_PRESETS[0]);
  const [expressions, setExpressions] = useState(EXPRESSION_PRESETS[0].params);
  const [activeTab, setActiveTab] = useState<'preset' | 'advanced' | 'character' | 'audio'>('preset');
  const [audioText, setAudioText] = useState('');

  const applyExpression = (preset: ExpressionPreset) => {
    setExpressions(preset.params);
    onExpressionChange?.(preset.params);
    toast.success(`已应用表情: ${preset.name}`);
  };

  const updateSlider = (key: string, value: number) => {
    const updated = { ...expressions, [key]: value };
    setExpressions(updated);
    onExpressionChange?.(updated);
  };

  const analyzeAudio = async () => {
    if (!audioText.trim()) { toast.error('请输入台词或上传音频'); return; }
    toast.loading('AI 分析中...', { id: 'facial' });
    try {
      const res = await fetch('/api/v1/generate/facial-expression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_text: audioText, character_id: selectedChar.id }),
      });
      const data = await res.json();
      toast.success(`主导情绪: ${data.dominant_emotion}`, { id: 'facial' });
    } catch { toast.error('分析失败', { id: 'facial' }); }
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* 标签页 */}
      <div className="flex border-b border-cosmic-border">
        {(['preset', 'advanced', 'character', 'audio'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs transition-colors ${
              activeTab === tab ? 'text-nebulae-purple border-b border-nebulae-purple bg-nebulae-purple/10' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab === 'preset' ? '表情预设' : tab === 'advanced' ? '高级' : tab === 'character' ? '角色' : '音频'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'preset' && (
          <div className="space-y-3">
            <p className="text-[10px] text-white/40 font-mono">基础情绪</p>
            <div className="grid grid-cols-3 gap-1">
              {EXPRESSION_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyExpression(preset)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors text-xs text-white/70 hover:text-white"
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40 font-mono mt-3">复合情绪</p>
            <div className="grid grid-cols-3 gap-1">
              {COMPOUND_EMOTIONS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyExpression(preset)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors text-xs text-white/70 hover:text-white"
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {[
              { key: 'brow', label: '眉毛', color: '#FF6B6B' },
              { key: 'eye', label: '眼睛', color: '#00E5FF' },
              { key: 'mouth', label: '嘴巴', color: '#FFD166' },
              { key: 'cheek', label: '脸颊', color: '#E040FB' },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/50">{label}</span>
                  <span className="text-[10px] font-mono" style={{ color }}>{Math.round(expressions[key] * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={expressions[key]}
                  onChange={(e) => updateSlider(key, parseFloat(e.target.value))}
                  className="w-full accent-nebulae-purple h-1"
                  style={{ accentColor: color }}
                />
              </div>
            ))}

            <CosmicButton size="sm" className="w-full mt-2" onClick={() => onExpressionChange?.(expressions)}>
              应用自定义表情曲线
            </CosmicButton>
          </div>
        )}

        {activeTab === 'character' && (
          <div className="space-y-3">
            <p className="text-[10px] text-white/40 font-mono">角色预设</p>
            {CHARACTER_PRESETS.map(char => (
              <button
                key={char.id}
                onClick={() => { setSelectedChar(char); onCharacterSelect?.(char); }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  selectedChar.id === char.id ? 'bg-nebulae-purple/20 border border-nebulae-purple/30' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{char.icon}</span>
                <div className="text-xs">
                  <p className="text-white/80">{char.name}</p>
                  <div className="flex gap-1 mt-1">
                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: char.skin }} />
                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: char.hair }} />
                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ background: char.eyes }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-3">
            <p className="text-[10px] text-white/40 font-mono">音频驱动表情</p>
            <textarea
              className="cosmic-input text-xs h-24 resize-none"
              placeholder="输入台词，AI 将分析情感并赋予面部表情..."
              value={audioText}
              onChange={(e) => setAudioText(e.target.value)}
            />
            <CosmicButton size="sm" className="w-full" onClick={analyzeAudio}>
              分析并生成表情
            </CosmicButton>
            <p className="text-[10px] text-white/20 text-center">
              支持上传 MP3/WAV 音频文件
            </p>
          </div>
        )}
      </div>
    </div>
  );
}