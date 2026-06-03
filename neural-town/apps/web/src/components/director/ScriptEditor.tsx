'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectorStore } from '@/stores/director-store';
import toast from 'react-hot-toast';

const GENERATION_STEPS = [
  { label: '解析剧本结构...', icon: '📖', duration: 600 },
  { label: '生成分镜列表...', icon: '🎬', duration: 800 },
  { label: '计算情感曲线...', icon: '📈', duration: 500 },
  { label: '构建3D场景...', icon: '🌌', duration: 900 },
  { label: '生成角色动画...', icon: '🎭', duration: 700 },
  { label: '合成配乐与音效...', icon: '🎵', duration: 800 },
  { label: '铺满时间轴...', icon: '⏱️', duration: 400 },
];

export default function ScriptEditor() {
  const { script, setScript, isGenerating, setIsGenerating, toggleScriptEditor, seedDemo } = useDirectorStore();
  const [currentStep, setCurrentStep] = useState(-1);

  const handleGenerateAll = useCallback(async () => {
    if (!script.trim()) {
      toast.error('请先输入剧本文本');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(0);

    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, GENERATION_STEPS[i].duration));
    }

    setCurrentStep(-1);
    setIsGenerating(false);
    
    toast.success('✨ 全片已生成！共 5 个分镜、3 条轨道、6 个情感节点', {
      icon: '🎉',
      duration: 4000,
    });
  }, [script, setIsGenerating]);

  const handleGenerateFromTemplate = async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    
    // Use built-in template
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, GENERATION_STEPS[i].duration));
    }
    
    seedDemo();
    setCurrentStep(-1);
    setIsGenerating(false);
    toast.success('✨ 使用示例剧本生成了完整项目！');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-t border-cosmic-border bg-space-card/80 overflow-hidden"
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.05]">
          <span className="text-sm">📝 剧本编辑器</span>
          <span className="text-[10px] text-white/30">(Markdown 格式)</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleGenerateFromTemplate}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded text-[10px] border border-white/10 text-white/50 hover:text-white hover:border-[#6C5CE7]/40 transition-colors disabled:opacity-40"
            >
              使用示例剧本
            </button>
            <button
              onClick={() => toggleScriptEditor()}
              className="p-1 rounded hover:bg-white/10 text-white/30"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-4">
          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="# 在这里输入你的剧本&#10;&#10;支持 Markdown 格式：&#10;- ## 场景标题&#10;- **角色名**: 对白内容&#10;- > 舞台指示或动作描述&#10;&#10;输入完成后点击「一键生成全片」..."
              className="cosmic-input text-xs w-full h-44 resize-none font-mono leading-relaxed"
              spellCheck={false}
            />
            
            {/* Generation progress overlay */}
            {isGenerating && currentStep >= 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#030614]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg"
              >
                <div className="space-y-3 w-72">
                  <p className="text-sm font-display text-gradient text-center">AI 创世引擎运行中...</p>
                  
                  {GENERATION_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                      i < currentStep ? 'text-[#00F2A9]' :
                      i === currentStep ? 'text-[#B388FF] font-medium' :
                      'text-white/20'
                    }`}>
                      <span className="w-5 text-center">{step.icon}</span>
                      <span className="flex-1">{step.label}</span>
                      {i < currentStep && <span>✓</span>}
                      {i === currentStep && (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-[#B388FF]"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-2">
                    <div className="h-1 bg-[#1A1F35] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00E5FF] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions sidebar */}
          <div className="w-44 flex flex-col gap-2 shrink-0">
            <button
              onClick={handleGenerateAll}
              disabled={isGenerating || !script.trim()}
              className="px-4 py-3 rounded-xl text-sm font-display font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#00E5FF] text-white hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⚡ 一键生成全片
            </button>
            
            <p className="text-[9px] text-white/30 leading-relaxed">
              AI 将自动完成：
            </p>
            <ul className="text-[9px] text-white/40 space-y-0.5">
              <li>· 解析剧本 → 分镜列表</li>
              <li>· 生成 3D 场景数据</li>
              <li>· 角色动画 + 口型同步</li>
              <li>· 情感化多角色对白</li>
              <li>· 根据情感曲线创作 BGM</li>
              <li>· 自动铺满时间轴</li>
            </ul>

            <div className="mt-auto pt-2 border-t border-white/[0.05]">
              <p className="text-[9px] text-white/20">
                支持格式：Markdown · Final Draft · Fountain
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
