'use client';
/**
 * @file AIGC Director Workbench - 光年导演工作台
 * 旗舰级工作台：多维情感画布 + 3D角色表情 + 多视角虚拟制片 + 情感曲线编辑
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// 懒加载重型 3D 组件
const StoryboardCanvas = dynamic(() => import('@/components/director/StoryboardCanvas'), { ssr: false });
const EmotionCurveEditor = dynamic(() => import('@/components/director/EmotionCurveEditor'), { ssr: false });
const CharacterRig = dynamic(() => import('@/components/director/CharacterRig'), { ssr: false });
const VirtualCamera = dynamic(() => import('@/components/director/VirtualCamera'), { ssr: false });
const LightingPanel = dynamic(() => import('@/components/director/LightingPanel'), { ssr: false });

type WorkbenchMode = 'storyboard' | 'emotion' | 'character' | 'camera' | 'lighting' | 'preview';

interface Shot {
  id: string;
  shotNumber: number;
  title: string;
  time: number;
  emotionIntensity: number;
  emotion: string;
  cameraAngle: string;
  thumbnail?: string;
  selected: boolean;
}

const INITIAL_SHOTS: Shot[] = [
  { id: 's1', shotNumber: 1, title: '开阔场景建立', time: 0, emotionIntensity: 0.3, emotion: 'neutral', cameraAngle: 'wide', selected: false },
  { id: 's2', shotNumber: 2, title: '主角登场', time: 0.25, emotionIntensity: 0.5, emotion: 'hopeful', cameraAngle: 'medium', selected: false },
  { id: 's3', shotNumber: 3, title: '冲突升级', time: 0.5, emotionIntensity: 0.8, emotion: 'tense', cameraAngle: 'close-up', selected: false },
  { id: 's4', shotNumber: 4, title: '情感高潮', time: 0.7, emotionIntensity: 0.9, emotion: 'joyful', cameraAngle: 'tracking', selected: false },
  { id: 's5', shotNumber: 5, title: '结局落幕', time: 0.9, emotionIntensity: 0.4, emotion: 'sad', cameraAngle: 'wide', selected: false },
];

export default function AIGCDirectorWorkbench() {
  const meta = ROLES_META.aigc_director;
  const [mode, setMode] = useState<WorkbenchMode>('storyboard');
  const [shots, setShots] = useState<Shot[]>(INITIAL_SHOTS);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [showScriptInput, setShowScriptInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectShot = (shotId: string) => {
    setSelectedShotId(shotId);
    setShots(prev => prev.map(s => ({ ...s, selected: s.id === shotId })));
  };

  const analyzeScript = async () => {
    if (!script.trim()) { toast.error('请输入剧本'); return; }
    setIsAnalyzing(true);
    toast.loading('AI 分析剧本中...', { id: 'script' });
    try {
      const res = await fetch('/api/v1/generate/script-to-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, style: 'cinematic', shot_count: 8 }),
      });
      const data = await res.json();
      if (data.shots) {
        const newShots: Shot[] = data.shots.map((s: any, i: number) => ({
          id: `s${i + 1}`,
          shotNumber: s.shot_number,
          title: s.description,
          time: i / Math.max(data.shots.length - 1, 1),
          emotionIntensity: data.emotion_curve[i]?.intensity || 0.5,
          emotion: s.emotion,
          cameraAngle: s.camera_angle,
          selected: false,
        }));
        setShots(newShots);
        setSelectedShotId(null);
      }
      toast.success(`生成了 ${data.shots.length} 个分镜`, { id: 'script' });
    } catch {
      toast.error('分析失败', { id: 'script' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const publishProject = async () => {
    toast.success('作品已发布到社区 #aigc 频道');
  };

  const modeTabs: { key: WorkbenchMode; label: string; icon: string }[] = [
    { key: 'storyboard', label: '多维画布', icon: '🌌' },
    { key: 'emotion', label: '情感曲线', icon: '📈' },
    { key: 'character', label: '角色表情', icon: '😊' },
    { key: 'camera', label: '虚拟制片', icon: '🎥' },
    { key: 'lighting', label: '灯光渲染', icon: '💡' },
    { key: 'preview', label: '导演监视器', icon: '🎬' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* 工作台头部 */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowScriptInput(!showScriptInput)}
            className="px-3 py-1.5 rounded-lg text-xs border border-cosmic-border text-white/60 hover:text-white hover:border-nebulae-purple transition-colors"
          >
            {showScriptInput ? '关闭剧本' : '📝 输入剧本'}
          </button>
          <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('项目已保存')}>
            保存
          </CosmicButton>
          <CosmicButton size="sm" onClick={publishProject}>
            发布作品
          </CosmicButton>
        </div>
      </div>

      {/* 剧本输入栏 */}
      <AnimatePresence>
        {showScriptInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-cosmic-border bg-space-card/50"
          >
            <div className="p-3 flex gap-3">
              <textarea
                className="cosmic-input text-xs flex-1 h-20 resize-none"
                placeholder="输入你的剧本文本，AI 将自动生成分镜、情感曲线和灯光方案..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <CosmicButton size="sm" onClick={analyzeScript} isLoading={isAnalyzing}>
                AI 分析
              </CosmicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 模式切换标签 */}
      <div className="flex border-b border-cosmic-border bg-space-card/30">
        {modeTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs transition-colors border-b-2 ${
              mode === tab.key
                ? 'border-nebulae-purple text-nebulae-purple bg-nebulae-purple/5'
                : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 工作区 */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'storyboard' && (
            <motion.div
              key="storyboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <div className="flex-1 relative">
                <StoryboardCanvas
                  shots={shots}
                  onSelectShot={handleSelectShot}
                  selectedShotId={selectedShotId}
                />
              </div>
              {/* 分镜详情侧栏 */}
              {selectedShotId && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 240 }}
                  exit={{ width: 0 }}
                  className="border-l border-cosmic-border overflow-hidden"
                >
                  <div className="glass-panel h-full p-3">
                    {(() => {
                      const shot = shots.find(s => s.id === selectedShotId);
                      if (!shot) return null;
                      return (
                        <div className="space-y-3">
                          <h3 className="text-sm font-display text-white">分镜 #{shot.shotNumber}</h3>
                          <p className="text-xs text-white/60">{shot.title}</p>
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between"><span className="text-white/40">机位</span><span className="text-white/70">{shot.cameraAngle}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">情绪</span><span className="text-white/70">{shot.emotion}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">强度</span><span className="text-white/70">{Math.round(shot.emotionIntensity * 100)}%</span></div>
                          </div>
                          <CosmicButton size="sm" variant="secondary" className="w-full" onClick={() => setMode('character')}>
                            编辑角色表情
                          </CosmicButton>
                          <CosmicButton size="sm" variant="secondary" className="w-full" onClick={() => setMode('camera')}>
                            设置摄像机
                          </CosmicButton>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {mode === 'emotion' && (
            <motion.div
              key="emotion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <EmotionCurveEditor duration={shots.length * 5} />
            </motion.div>
          )}

          {mode === 'character' && (
            <motion.div
              key="character"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <div className="flex-1 bg-[#0a0e1a] flex items-center justify-center">
                <div className="text-center">
                  {/* 3D 角色预览占位 */}
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-nebulae-purple/20 to-ai-blue/20 border border-cosmic-border flex items-center justify-center mb-4 mx-auto">
                    <div className="text-center">
                      <div className="text-6xl mb-2">😊</div>
                      <p className="text-sm text-white/50">3D 角色预览</p>
                      <p className="text-[10px] text-white/30">应用表情预设查看效果</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-64 border-l border-cosmic-border">
                <CharacterRig
                  onExpressionChange={(params) => console.log('Expression:', params)}
                  onCharacterSelect={(char) => console.log('Character:', char)}
                />
              </div>
            </motion.div>
          )}

          {mode === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <div className="flex-1 bg-[#0a0e1a] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-96 h-64 rounded-xl border-2 border-dashed border-cosmic-border flex items-center justify-center mb-4">
                    <div className="text-center">
                      <span className="text-4xl block mb-2">🎥</span>
                      <p className="text-sm text-white/50">取景框实时预览</p>
                      <p className="text-[10px] text-white/30">选择机位预设查看构图</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-64 border-l border-cosmic-border">
                <VirtualCamera
                  onCameraChange={(cam) => console.log('Camera:', cam)}
                  onRecordingChange={(recs) => console.log('Recordings:', recs)}
                />
              </div>
            </motion.div>
          )}

          {mode === 'lighting' && (
            <motion.div
              key="lighting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex"
            >
              <div className="flex-1 bg-[#0a0e1a] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-96 h-64 rounded-xl border border-cosmic-border bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center mb-4 shadow-lg">
                    <div className="text-center">
                      <span className="text-4xl block mb-2">💡</span>
                      <p className="text-sm text-white/50">灯光实时预览</p>
                      <p className="text-[10px] text-white/30">调整灯光参数查看效果</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-64 border-l border-cosmic-border">
                <LightingPanel
                  onLightingChange={(lights) => console.log('Lights:', lights)}
                  sceneDescription={script || 'cinematic scene'}
                />
              </div>
            </motion.div>
          )}

          {mode === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-[800px] h-[450px] rounded-xl border-2 border-cosmic-border bg-black flex items-center justify-center mb-4 relative">
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger-red" />
                    <div className="w-3 h-3 rounded-full bg-warning-gold" />
                    <div className="w-3 h-3 rounded-full bg-success-green" />
                  </div>
                  <div className="text-center">
                    <span className="text-5xl block mb-3">🎬</span>
                    <p className="text-lg text-white/50 font-display">导演监视器</p>
                    <p className="text-sm text-white/30 mt-1">低分辨率代理实时渲染预览</p>
                    <div className="flex items-center gap-4 justify-center mt-4">
                      <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                      </button>
                      <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/40">
                  共 {shots.length} 个分镜 | 使用虚拟摄像机控制机位 | 角色表情实时驱动
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}