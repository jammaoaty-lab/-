import { create } from 'zustand';

// ─── Types ───

export interface TimelineClip {
  id: string;
  trackId: string;
  label: string;
  startTime: number; // seconds
  duration: number; // seconds
  color: string;
  type: 'shot' | 'audio' | 'subtitle' | 'effect' | 'transition';
  data?: Record<string, unknown>;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'pip' | 'audio' | 'subtitle' | 'effect';
  clips: TimelineClip[];
  visible: boolean;
  locked: boolean;
}

export interface Character {
  id: string;
  name: string;
  avatarEmoji: string;
  personality: {
    optimism: number; // 0-1
    gentleness: number; // 0-1
    energy: number; // 0-1
  };
  emotion: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  snapshots: { id: string; name: string; timestamp: number }[];
}

export interface StoryboardShot {
  id: string;
  index: number;
  title: string;
  description: string;
  startTime: number;
  duration: number;
  emotionIntensity: number;
  primaryEmotion: string;
  cameraAngle: string;
  characterIds: string[];
  lightingPreset: string;
  selected: boolean;
}

export interface EmotionPoint {
  time: number;
  intensity: number;
  emotion: string;
  characterId?: string; // undefined = global
}

export type ViewMode = 'galaxy' | 'editor';
export type PlayState = 'playing' | 'paused' | 'stopped';
export type ExportFormat = 'mp4' | 'ntp' | 'gif';

interface DirectorState {
  // Project
  projectName: string;
  script: string;

  // View mode
  viewMode: ViewMode;

  // Timeline
  tracks: TimelineTrack[];
  totalDuration: number; // seconds
  currentTime: number;
  playState: PlayState;
  zoomLevel: number; // pixels per second

  // Storyboard shots (synced with timeline)
  shots: StoryboardShot[];
  selectedShotId: string | null;

  // Characters
  characters: Character[];
  activeCharacterId: string | null;

  // Emotion curve
  emotionPoints: EmotionPoint[];

  // UI panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelExpanded: boolean;
  showScriptEditor: boolean;
  isGenerating: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setProjectName: (name: string) => void;
  setScript: (script: string) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  toggleScriptEditor: () => void;

  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  setZoomLevel: (zoom: number) => void;

  // Timeline operations
  addTrack: (track: Omit<TimelineTrack, 'clips'>) => void;
  removeTrack: (trackId: string) => void;
  addClip: (clip: Omit<TimelineClip, 'id'>) => void;
  removeClip: (clipId: string) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  updateClipDuration: (clipId: string, newDuration: number) => void;

  // Shots
  selectShot: (shotId: string | null) => void;
  addShot: (shot: Omit<StoryboardShot, 'id' | 'selected'>) => void;
  removeShot: (shotId: string) => void;
  reorderShots: (fromIndex: number, toIndex: number) => void;

  // Characters
  setActiveCharacter: (charId: string | null) => void;
  updateCharacterPersonality: (charId: string, key: keyof Character['personality'], value: number) => void;
  updateCharacterEmotion: (charId: string, key: keyof Character['emotion'], value: number) => void;
  saveSnapshot: (charId: string, name: string) => void;

  // Emotion
  addEmotionPoint: (point: Omit<EmotionPoint, 'time'> & { time?: number }) => void;
  removeEmotionPoint: (index: number) => void;
  updateEmotionPoint: (index: number, updates: Partial<EmotionPoint>) => void;

  // Generation
  setIsGenerating: (v: boolean) => void;

  // Seed demo data
  seedDemo: () => void;
}

// ─── Demo Data Helpers ───

function makeDemoTracks(): TimelineTrack[] {
  return [
    {
      id: 'track-video', name: '视频主轨', type: 'video', visible: true, locked: false,
      clips: [
        { id: 'c1', trackId: 'track-video', label: '分镜1: 开场', startTime: 0, duration: 3, color: '#6C5CE7', type: 'shot' },
        { id: 'c2', trackId: 'track-video', label: '分镜2: 主角登场', startTime: 3, duration: 4, color: '#00E5FF', type: 'shot' },
        { id: 'c3', trackId: 'track-video', label: '分镜3: 冲突升级', startTime: 7, duration: 5, color: '#FF6B6B', type: 'shot' },
        { id: 'c4', trackId: 'track-video', label: '分镜4: 高潮', startTime: 12, duration: 4, color: '#FFD166', type: 'shot' },
        { id: 'c5', trackId: 'track-video', label: '分镜5: 结局', startTime: 16, duration: 4, color: '#00F2A9', type: 'shot' },
      ],
    },
    {
      id: 'track-audio', name: '音频轨', type: 'audio', visible: true, locked: false,
      clips: [
        { id: 'a1', trackId: 'track-audio', label: 'BGM - 星际序曲', startTime: 0, duration: 20, color: '#9B59B6', type: 'audio' },
        { id: 'a2', trackId: 'track-audio', label: '音效 - 风声', startTime: 7, duration: 3, color: '#3498DB', type: 'audio' },
      ],
    },
    {
      id: 'track-subtitle', name: '字幕轨', type: 'subtitle', visible: true, locked: false,
      clips: [
        { id: 's1', trackId: 'track-subtitle', label: '"在遥远的未来..."', startTime: 0.5, duration: 3, color: '#E040FB', type: 'subtitle' },
        { id: 's2', trackId: 'track-subtitle', label: '"我是艾拉，最后的星航员"', startTime: 3.5, duration: 3, color: '#E040FB', type: 'subtitle' },
        { id: 's3', trackId: 'track-subtitle', label: '"警告！前方有未知信号"', startTime: 8, duration: 2.5, color: '#E040FB', type: 'subtitle' },
      ],
    },
    {
      id: 'track-effect', name: '特效轨', type: 'effect', visible: true, locked: false,
      clips: [
        { id: 'e1', trackId: 'track-effect', label: '淡入', startTime: 0, duration: 1, color: '#FF9100', type: 'transition' },
        { id: 'e2', trackId: 'track-effect', label: '镜头光晕', startTime: 12, duration: 2, color: '#FF9100', type: 'effect' },
        { id: 'e3', trackId: 'track-effect', label: '渐隐黑场', startTime: 19, duration: 1, color: '#FF9100', type: 'transition' },
      ],
    },
  ];
}

function makeDemoShots(): StoryboardShot[] {
  return [
    { id: 'sh1', index: 0, title: '开场：深空', description: '广阔的宇宙星空，一艘飞船从远处缓缓驶来', startTime: 0, duration: 3, emotionIntensity: 0.3, primaryEmotion: 'wonder', cameraAngle: 'wide', characterIds: [], lightingPreset: 'deep_space', selected: false },
    { id: 'sh2', index: 1, title: '主角登场', description: '驾驶舱内，主角艾拉凝视窗外', startTime: 3, duration: 4, emotionIntensity: 0.5, primaryEmotion: 'hopeful', cameraAngle: 'medium', characterIds: ['char-1'], lightingPreset: 'cockpit_warm', selected: false },
    { id: 'sh3', index: 2, title: '冲突升级', description: '警报响起，全息投影显示危险区域', startTime: 7, duration: 5, emotionIntensity: 0.85, primaryEmotion: 'tense', cameraAngle: 'close-up', characterIds: ['char-1'], lightingPreset: 'alert_red', selected: false },
    { id: 'sh4', index: 3, title: '情感高潮', description: '艾拉做出决定，眼神坚定', startTime: 12, duration: 4, emotionIntensity: 0.95, primaryEmotion: 'determined', cameraAngle: 'tracking', characterIds: ['char-1'], lightingPreset: 'heroic_gold', selected: false },
    { id: 'sh5', index: 4, title: '结局落幕', description: '飞船驶向新世界，星光闪烁', startTime: 16, duration: 4, emotionIntensity: 0.45, primaryEmotion: 'bittersweet', cameraAngle: 'wide', characterIds: [], lightingPreset: 'starry_dawn', selected: false },
  ];
}

function makeDemoCharacters(): Character[] {
  return [{
    id: 'char-1',
    name: '艾拉 (Aira)',
    avatarEmoji: '👩‍🚀',
    personality: { optimism: 0.75, gentleness: 0.6, energy: 0.8 },
    emotion: { joy: 0.5, sadness: 0.2, anger: 0.15, fear: 0.25, surprise: 0.35 },
    snapshots: [],
  }];
}

function makeDemoEmotionPoints(): EmotionPoint[] {
  return [
    { time: 0, intensity: 0.25, emotion: 'calm' },
    { time: 3, intensity: 0.5, emotion: 'hopeful' },
    { time: 7, intensity: 0.8, emotion: 'tense' },
    { time: 12, intensity: 0.95, emotion: 'triumphant' },
    { time: 16, intensity: 0.4, emotion: 'peaceful' },
    { time: 20, intensity: 0.35, emotion: 'reflective' },
  ];
}

export const useDirectorStore = create<DirectorState>((set, get) => ({
  projectName: '星际旅人',
  script: `# 星际旅人 — 第一幕

## 场景1：深空（外景）

**时间：** 未来，某日  
**地点：** 深空，近轨道

> （广阔的宇宙星空。一艘银白色的飞船"曙光号"从远处缓缓驶来，引擎发出柔和的蓝光。）

**画外音（艾拉）：** "距离地球已经航行了三年零四十二天..."

---

## 场景2：驾驶舱（内景）

**时间：** 紧接上一场  
**地点：** 曙光号驾驶舱

> （驾驶舱内光线温暖。艾拉坐在控制台前，凝视着窗外的星云。她的手指轻轻划过全息屏幕上的航线图。）

**艾拉：** "还有最后一段航程了。"（停顿）"不知道那边会是什么样子。"

**系统语音：** "检测到异常引力波信号。坐标：猎户座方向。"

---

## 场景3：警报（内景/外景交替）

**时间：** 几分钟后  
**地点：** 驾驶舱 / 外部空间

> （红色警报灯开始闪烁。全息投影在中央展开，显示出一个扭曲的空间区域。）

**艾拉：** （紧张地操作控制台）"这是什么...？"

**系统语音：** "警告。检测到高能反应。建议立即规避。"

**艾拉：** （坚定地）"不。我要过去看看。"

---

## 场景4：抉择（内景）

**时间：** 紧接  
**地点：** 驾驶舱

> （特写艾拉的脸。她眼中闪过一丝恐惧，但很快被决心取代。她按下了一个按钮。）

**艾拉：** "曙光号，全速前进。"

---

## 场景5：新世界（外景）

**时间：** 一段时间后  
**地点：** 未知星域

> （飞船穿过一道绚丽的光幕，进入一个全新的星系。无数彩色的星球悬浮在空中，如同宝石。）

**艾拉（画外音）：** "我们到了。"

> （画面渐渐变暗，星光闪烁。）
`,
  viewMode: 'editor',
  tracks: makeDemoTracks(),
  totalDuration: 20,
  currentTime: 0,
  playState: 'stopped',
  zoomLevel: 60,
  shots: makeDemoShots(),
  selectedShotId: null,
  characters: makeDemoCharacters(),
  activeCharacterId: 'char-1',
  emotionPoints: makeDemoEmotionPoints(),
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelExpanded: true,
  showScriptEditor: false,
  isGenerating: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setProjectName: (name) => set({ projectName: name }),
  setScript: (script) => set({ script }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelExpanded: !s.bottomPanelExpanded })),
  toggleScriptEditor: () => set((s) => ({ showScriptEditor: !s.showScriptEditor })),

  play: () => set({ playState: 'playing' }),
  pause: () => set({ playState: 'paused' }),
  stop: () => set({ playState: 'stopped', currentTime: 0 }),
  seekTo: (time) => set({ currentTime: Math.max(0, Math.min(time, get().totalDuration)) }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  addTrack: (track) => set((s) => ({ tracks: [...s.tracks, { ...track, clips: [] }] })),
  removeTrack: (trackId) => set((s) => ({ tracks: s.tracks.filter((t) => t.id !== trackId) })),
  addClip: (clip) => {
    const newClip: TimelineClip = { ...clip, id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === clip.trackId ? { ...t, clips: [...t.clips, newClip].sort((a, b) => a.startTime - b.startTime) } : t
      ),
    }));
  },
  removeClip: (clipId) => set((s) => ({
    tracks: s.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== clipId) })),
  })),
  moveClip: (clipId, newStartTime, newTrackId) => set((s) => ({
    tracks: s.tracks.map((t) => {
      const targetId = newTrackId || t.id;
      if (targetId !== t.id) return t;
      return {
        ...t,
        clips: t.clips.map((c) => c.id === clipId ? { ...c, startTime: newStartTime, trackId: targetId } : c)
          .sort((a, b) => a.startTime - b.startTime),
      };
    }),
  })),
  updateClipDuration: (clipId, newDuration) => set((s) => ({
    tracks: s.tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) => c.id === clipId ? { ...c, duration: Math.max(0.5, newDuration) } : c),
    })),
  })),

  selectShot: (shotId) => set({
    selectedShotId: shotId,
    shots: get().shots.map((s) => ({ ...s, selected: s.id === shotId })),
  }),
  addShot: (shot) => {
    const newShot: StoryboardShot = { ...shot, id: `shot-${Date.now()}`, selected: false };
    set((s) => ({ shots: [...s.shots, newShot] }));
  },
  removeShot: (shotId) => set((s) => ({
    shots: s.shots.filter((sh) => sh.id !== shotId),
    selectedShotId: s.selectedShotId === shotId ? null : s.selectedShotId,
  })),
  reorderShots: (fromIndex, toIndex) => set((s) => {
    const newShots = [...s.shots];
    const [moved] = newShots.splice(fromIndex, 1);
    newShots.splice(toIndex, 0, moved);
    return { shots: newShots.map((sh, i) => ({ ...sh, index: i })) };
  }),

  setActiveCharacter: (charId) => set({ activeCharacterId: charId }),
  updateCharacterPersonality: (charId, key, value) => set((s) => ({
    characters: s.characters.map((c) =>
      c.id === charId ? { ...c, personality: { ...c.personality, [key]: value } } : c
    ),
  })),
  updateCharacterEmotion: (charId, key, value) => set((s) => ({
    characters: s.characters.map((c) =>
      c.id === charId ? { ...c, emotion: { ...c.emotion, [key]: value } } : c
    ),
  })),
  saveSnapshot: (charId, name) => set((s) => ({
    characters: s.characters.map((c) =>
      c.id === charId ? {
        ...c,
        snapshots: [...c.snapshots, { id: `snap-${Date.now()}`, name, timestamp: Date.now() }],
      } : c
    ),
  })),

  addEmotionPoint: (point) => set((s) => {
    const newPoint: EmotionPoint = { ...point, time: point.time ?? s.currentTime };
    const points = [...s.emotionPoints, newPoint].sort((a, b) => a.time - b.time);
    return { emotionPoints: points };
  }),
  removeEmotionPoint: (index) => set((s) => ({
    emotionPoints: s.emotionPoints.filter((_, i) => i !== index),
  })),
  updateEmotionPoint: (index, updates) => set((s) => ({
    emotionPoints: s.emotionPoints.map((p, i) => (i === index ? { ...p, ...updates } : p)),
  })),

  setIsGenerating: (v) => set({ isGenerating: v }),

  seedDemo: () => {
    set({
      tracks: makeDemoTracks(),
      shots: makeDemoShots(),
      characters: makeDemoCharacters(),
      emotionPoints: makeDemoEmotionPoints(),
      totalDuration: 20,
      currentTime: 0,
      playState: 'stopped',
    });
  },
}));
