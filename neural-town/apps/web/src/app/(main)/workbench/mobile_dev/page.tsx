'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 设备类型 ───
type DevicePlatform = 'ios' | 'android' | 'web';

interface DeviceFrame {
  platform: DevicePlatform;
  label: string;
  model: string;
  width: number;
  height: number;
  aspectRatio: string;
}

// ─── 构建预设 ───
interface BuildPreset {
  id: string;
  name: string;
  framework: string;
  command: string;
  icon: string;
  defaultConfig: string;
}

// ─── 组件条目 ───
interface CrossPlatformComponent {
  name: string;
  category: string;
}

const DEVICE_FRAMES: DeviceFrame[] = [
  {
    platform: 'ios',
    label: 'iOS',
    model: 'iPhone 15 Pro',
    width: 375,
    height: 812,
    aspectRatio: '375 / 812',
  },
  {
    platform: 'android',
    label: 'Android',
    model: 'Pixel 8',
    width: 412,
    height: 915,
    aspectRatio: '412 / 915',
  },
  {
    platform: 'web',
    label: 'Web',
    model: 'Desktop Browser',
    width: 1024,
    height: 640,
    aspectRatio: '16 / 10',
  },
];

const CROSS_PLATFORM_COMPONENTS: CrossPlatformComponent[] = [
  { name: 'Button', category: 'basic' },
  { name: 'Card', category: 'basic' },
  { name: 'Input', category: 'form' },
  { name: 'Modal', category: 'feedback' },
  { name: 'BottomSheet', category: 'feedback' },
  { name: 'TabBar', category: 'navigation' },
  { name: 'SwipeAction', category: 'interaction' },
  { name: 'PullToRefresh', category: 'interaction' },
];

const BUILD_PRESETS: BuildPreset[] = [
  {
    id: 'expo',
    name: 'Expo',
    framework: 'React Native',
    command: 'npx create-expo-app@latest && npx expo start',
    icon: '📦',
    defaultConfig: `{
  "expo": {
    "name": "NeuralTown Mobile",
    "slug": "neural-town-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#0A0A1A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.neuraltown.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0A0A1A"
      },
      "package": "com.neuraltown.mobile"
    }
  }
}`,
  },
  {
    id: 'flutter',
    name: 'Flutter',
    framework: 'Dart',
    command: 'flutter create neural_town_mobile && cd neural_town_mobile && flutter run',
    icon: '🦋',
    defaultConfig: `name: neural_town_mobile
description: Neural Town Mobile - Cross-Platform Simulator

publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  http: ^1.2.0
  provider: ^6.1.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  assets:
    - assets/images/`,
  },
  {
    id: 'ionic',
    name: 'Ionic Capacitor',
    framework: 'Angular / React / Vue',
    command: 'npm install -g @ionic/cli && ionic start neural-town-mobile tabs',
    icon: '⚡',
    defaultConfig: `{
  "appId": "com.neuraltown.mobile",
  "appName": "Neural Town Mobile",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#0A0A1A",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#0A0A1A"
    }
  }
}`,
  },
];

// ─── 平台颜色映射 ───
const PLATFORM_COLORS: Record<DevicePlatform, { bg: string; border: string; text: string }> = {
  ios: { bg: 'from-slate-800 to-slate-900', border: 'border-slate-500/30', text: 'text-slate-300' },
  android: { bg: 'from-emerald-900 to-emerald-950', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  web: { bg: 'from-blue-900 to-indigo-950', border: 'border-blue-500/30', text: 'text-blue-300' },
};

// ─── 太空装饰粒子 ───
const STAR_POSITIONS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  size: Math.random() * 2 + 1,
}));

export default function MobileDevPage() {
  const meta = ROLES_META.mobile_dev;

  const [selectedPreset, setSelectedPreset] = useState<string>(BUILD_PRESETS[0].id);
  const [configText, setConfigText] = useState<string>(BUILD_PRESETS[0].defaultConfig);

  const handleGenerateComponent = (componentName: string) => {
    toast.success(`${componentName} 跨平台代码已生成`, {
      icon: '🧬',
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(108,92,231,0.3)' },
    });
  };

  const handleGenerateConfig = (preset: BuildPreset) => {
    setSelectedPreset(preset.id);
    setConfigText(preset.defaultConfig);
    toast.success(`${preset.name} 配置已生成`, {
      icon: '⚙️',
      style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(108,92,231,0.3)' },
    });
  };

  const currentPreset = BUILD_PRESETS.find((p) => p.id === selectedPreset) || BUILD_PRESETS[0];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* ─── 星空背景层 ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(224,64,251,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,242,169,0.04)_0%,transparent_50%)]" />
        {/* 星星粒子 */}
        {STAR_POSITIONS.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2 + star.delay, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </div>

      {/* ─── 主内容 ─── */}
      <div className="relative px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-8">
        {/* ── 页头 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CosmicCard padding="lg" glow className="overflow-hidden">
            <div className="flex items-center gap-4">
              <motion.div
                className="text-5xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {meta.icon}
              </motion.div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gradient">{meta.workbenchName}</h1>
                <p className="text-white/50 mt-1">{meta.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{meta.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{meta.labelEn}</span>
                </div>
              </div>
            </div>
          </CosmicCard>
        </motion.div>

        {/* ── Section 1: 多平台预览 ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🖥️</span>
            <h2 className="text-xl font-display font-semibold text-white">多平台预览</h2>
            <span className="text-xs text-white/30">Multi-Platform Preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEVICE_FRAMES.map((device) => {
              const colors = PLATFORM_COLORS[device.platform];
              const isWeb = device.platform === 'web';

              return (
                <CosmicCard key={device.platform} padding="md" hoverable>
                  <div className="flex flex-col items-center">
                    {/* 设备框架 */}
                    <div className="w-full flex justify-center mb-3">
                      <div
                        className="relative rounded-2xl border-2 border-white/10 bg-[#0d0d1a] shadow-lg overflow-hidden"
                        style={{
                          width: isWeb ? '100%' : '220px',
                          aspectRatio: device.aspectRatio,
                        }}
                      >
                        {/* 状态栏模拟（仅移动端） */}
                        {!isWeb && (
                          <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/5">
                            <span className="text-[9px] text-white/40 font-mono">9:41</span>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            </div>
                          </div>
                        )}
                        {/* 浏览器栏模拟（仅 Web） */}
                        {isWeb && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border-b border-white/5">
                            <div className="w-2 h-2 rounded-full bg-red-400/60" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                            <div className="w-2 h-2 rounded-full bg-green-400/60" />
                            <span className="ml-2 text-[9px] text-white/30 font-mono flex-1 truncate">
                              localhost:3000
                            </span>
                          </div>
                        )}
                        {/* 预览内容区 */}
                        <div className={`flex-1 flex items-center justify-center p-4 bg-gradient-to-br ${colors.bg}`}>
                          <div className="text-center space-y-2">
                            <motion.div
                              className="text-3xl"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {isWeb ? '🌐' : '📱'}
                            </motion.div>
                            <p className={`text-xs ${colors.text}`}>
                              {device.platform === 'ios' && 'SwiftUI Preview'}
                              {device.platform === 'android' && 'Jetpack Compose'}
                              {device.platform === 'web' && 'Web App Preview'}
                            </p>
                            <div className="flex justify-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-1 rounded-full bg-white/10"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 平台标签 */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${colors.border} ${colors.text}`}
                      >
                        {device.model}
                      </span>
                      <span className="text-xs text-white/50">{device.label}</span>
                    </div>
                  </div>
                </CosmicCard>
              );
            })}
          </div>
        </motion.section>

        {/* ── Section 2: 跨平台组件库 ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🧩</span>
            <h2 className="text-xl font-display font-semibold text-white">跨平台组件库</h2>
            <span className="text-xs text-white/30">Cross-Platform Components</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CROSS_PLATFORM_COMPONENTS.map((comp) => (
              <motion.div
                key={comp.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenerateComponent(comp.name)}
              >
                <CosmicCard padding="sm" hoverable className="cursor-pointer h-full">
                  <div className="space-y-3">
                    {/* 组件名 */}
                    <h3 className="text-sm font-display font-semibold text-white">{comp.name}</h3>

                    {/* 平台变体预览 */}
                    <div className="flex gap-2">
                      {/* iOS 变体 */}
                      <div className="flex-1 p-2 rounded-lg bg-slate-800/60 border border-slate-500/20">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-4 h-4 rounded-md bg-[#007AFF] flex items-center justify-center">
                            <span className="text-[7px] text-white">i</span>
                          </div>
                          <span className="text-[9px] text-slate-400">iOS</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-slate-600/60 w-full" />
                          <div className="h-1.5 rounded-full bg-slate-600/60 w-2/3" />
                          {comp.name !== 'Input' && (
                            <div className="h-1 rounded bg-slate-700/40 w-full" />
                          )}
                          {comp.name === 'Button' && (
                            <div className="h-4 rounded-lg bg-[#007AFF] w-full mt-1" />
                          )}
                          {comp.name === 'Input' && (
                            <div className="h-3 rounded border border-slate-500/30 bg-slate-700/40 w-full mt-1" />
                          )}
                        </div>
                      </div>

                      {/* Android 变体 */}
                      <div className="flex-1 p-2 rounded-lg bg-emerald-900/40 border border-emerald-500/20">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-4 h-4 rounded-sm bg-[#1B873B] flex items-center justify-center">
                            <span className="text-[7px] text-white">A</span>
                          </div>
                          <span className="text-[9px] text-emerald-400">Android</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-sm bg-emerald-700/60 w-full" />
                          <div className="h-1.5 rounded-sm bg-emerald-700/60 w-2/3" />
                          {comp.name !== 'Input' && (
                            <div className="h-1 rounded bg-emerald-800/40 w-full" />
                          )}
                          {comp.name === 'Button' && (
                            <div className="h-4 rounded-sm bg-[#1B873B] w-full mt-1 shadow-md" />
                          )}
                          {comp.name === 'Input' && (
                            <div className="h-3 rounded-sm border border-emerald-600/30 bg-emerald-800/40 w-full mt-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 代码生成提示 */}
                    <p className="text-[10px] text-nebulae-purple/60 text-center">
                      点击生成代码 →
                    </p>
                  </div>
                </CosmicCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 3: 构建配置 ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">⚙️</span>
            <h2 className="text-xl font-display font-semibold text-white">构建配置</h2>
            <span className="text-xs text-white/30">Build Configuration</span>
          </div>

          {/* 构建预设卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {BUILD_PRESETS.map((preset) => {
              const isActive = selectedPreset === preset.id;
              return (
                <CosmicCard
                  key={preset.id}
                  padding="md"
                  hoverable
                  glow={isActive}
                  className={isActive ? 'border-nebulae-purple/50' : ''}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <h3 className="font-display font-semibold text-white text-sm">{preset.name}</h3>
                      <p className="text-[11px] text-white/40">{preset.framework}</p>
                    </div>
                    {isActive && (
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-nebulae-purple/20 text-nebulae-purple">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="cosmic-input bg-[#0a0a14] rounded-lg p-2 mb-3">
                    <code className="text-xs text-green-400 font-mono break-all">{preset.command}</code>
                  </div>

                  <CosmicButton
                    size="sm"
                    variant={isActive ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleGenerateConfig(preset)}
                  >
                    {isActive ? '重新生成' : '生成配置'}
                  </CosmicButton>
                </CosmicCard>
              );
            })}
          </div>

          {/* 配置预览区 */}
          <CosmicCard padding="md" glow>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentPreset.icon}</span>
                <h3 className="text-sm font-display font-semibold text-white">
                  {currentPreset.name} 配置预览
                </h3>
              </div>
              <button
                className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/70 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(configText).then(() =>
                    toast.success('配置已复制到剪贴板', {
                      style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(108,92,231,0.3)' },
                    })
                  );
                }}
              >
                复制配置
              </button>
            </div>

            <textarea
              className="cosmic-input w-full h-64 font-mono text-xs text-green-400 bg-[#0a0a14] rounded-xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-nebulae-purple/50"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              spellCheck={false}
            />
          </CosmicCard>
        </motion.section>
      </div>
    </div>
  );
}