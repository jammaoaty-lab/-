// @file Neural Town 共享类型定义 - 角色、频道、帖子、工作台等枚举与接口

// ─── 用户角色枚举 ───
export const DESIGNER_ROLES = [
  'graphic_designer', 'uiux_designer', 'interior_designer',
  'industrial_designer', 'fashion_designer', 'motion_designer', 'aigc_director',
] as const;

export const DEVELOPER_ROLES = [
  'frontend_dev', 'backend_dev', 'ai_ml_dev', 'fullstack_dev',
  'devops_sre', 'mobile_dev', 'data_engineer', 'security_dev', 'web3_dev',
] as const;

export const OTHER_ROLES = ['pm', 'beginner', 'enthusiast', 'normal'] as const;

export const USER_ROLES = [...DESIGNER_ROLES, ...DEVELOPER_ROLES, ...OTHER_ROLES] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── 角色元数据 ───
export interface RoleMeta {
  key: UserRole;
  label: string;
  labelEn: string;
  category: 'designer' | 'developer' | 'other';
  icon: string;
  color: string;
  description: string;
  workbenchName: string;
}

export const ROLES_META: Record<UserRole, RoleMeta> = {
  // 设计师
  graphic_designer:      { key:'graphic_designer', label:'平面设计师', labelEn:'Graphic Designer', category:'designer', icon:'🎨', color:'#FF6B6B', description:'视觉引力工作室', workbenchName:'视觉引力工作室' },
  uiux_designer:         { key:'uiux_designer', label:'UI/UX 设计师', labelEn:'UI/UX Designer', category:'designer', icon:'📱', color:'#6C5CE7', description:'界面星河编辑器', workbenchName:'界面星河编辑器' },
  interior_designer:     { key:'interior_designer', label:'室内设计师', labelEn:'Interior Designer', category:'designer', icon:'🏠', color:'#00F2A9', description:'空间生成舱', workbenchName:'空间生成舱' },
  industrial_designer:   { key:'industrial_designer', label:'工业/产品设计师', labelEn:'Industrial Designer', category:'designer', icon:'⚙️', color:'#FFD166', description:'形体工坊', workbenchName:'形体工坊' },
  fashion_designer:      { key:'fashion_designer', label:'服装设计师', labelEn:'Fashion Designer', category:'designer', icon:'👗', color:'#E040FB', description:'时尚织造台', workbenchName:'时尚织造台' },
  motion_designer:       { key:'motion_designer', label:'动效/3D设计师', labelEn:'Motion Designer', category:'designer', icon:'🎥', color:'#00E5FF', description:'动态星环站', workbenchName:'动态星环站' },
  aigc_director:         { key:'aigc_director', label:'AIGC 导演', labelEn:'AIGC Director', category:'designer', icon:'🎬', color:'#FF9100', description:'光年导演工作台', workbenchName:'光年导演工作台' },
  // 开发者
  frontend_dev:  { key:'frontend_dev', label:'前端工程师', labelEn:'Frontend Dev', category:'developer', icon:'🖥️', color:'#00E5FF', description:'界面织造舱', workbenchName:'界面织造舱' },
  backend_dev:   { key:'backend_dev', label:'后端工程师', labelEn:'Backend Dev', category:'developer', icon:'⚙️', color:'#6C5CE7', description:'API引力环', workbenchName:'API引力环' },
  ai_ml_dev:     { key:'ai_ml_dev', label:'AI/ML 工程师', labelEn:'AI/ML Engineer', category:'developer', icon:'🤖', color:'#00F2A9', description:'模型训练深空站', workbenchName:'模型训练深空站' },
  fullstack_dev: { key:'fullstack_dev', label:'全栈工程师', labelEn:'Fullstack Dev', category:'developer', icon:'🌐', color:'#FF6B6B', description:'融合反应堆', workbenchName:'融合反应堆' },
  devops_sre:    { key:'devops_sre', label:'DevOps/SRE', labelEn:'DevOps/SRE', category:'developer', icon:'🛠️', color:'#FFD166', description:'星链运维中心', workbenchName:'星链运维中心' },
  mobile_dev:    { key:'mobile_dev', label:'移动端工程师', labelEn:'Mobile Dev', category:'developer', icon:'📱', color:'#E040FB', description:'跨星系模拟器', workbenchName:'跨星系模拟器' },
  data_engineer: { key:'data_engineer', label:'数据工程师', labelEn:'Data Engineer', category:'developer', icon:'📊', color:'#00E5FF', description:'数据星云图', workbenchName:'数据星云图' },
  security_dev:  { key:'security_dev', label:'安全工程师', labelEn:'Security Engineer', category:'developer', icon:'🔐', color:'#FF6B6B', description:'暗物质扫描仪', workbenchName:'暗物质扫描仪' },
  web3_dev:      { key:'web3_dev', label:'区块链/Web3', labelEn:'Web3 Developer', category:'developer', icon:'⛓️', color:'#FFD166', description:'共识之环', workbenchName:'共识之环' },
  // 其他
  pm:         { key:'pm', label:'产品经理', labelEn:'Product Manager', category:'other', icon:'📊', color:'#6C5CE7', description:'产品思维引力舱', workbenchName:'产品思维引力舱' },
  beginner:   { key:'beginner', label:'初学者', labelEn:'Beginner', category:'other', icon:'🌱', color:'#00F2A9', description:'新手训练站', workbenchName:'新手训练站' },
  enthusiast: { key:'enthusiast', label:'AI 爱好者', labelEn:'AI Enthusiast', category:'other', icon:'🚀', color:'#FF9100', description:'游乐场星云', workbenchName:'游乐场星云' },
  normal:     { key:'normal', label:'普通用户', labelEn:'Explorer', category:'other', icon:'👤', color:'#888888', description:'资讯与发现', workbenchName:'信息舱' },
};

// ─── 频道定义 ───
export interface Channel {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  groupName: string;
  sortOrder: number;
}

export const DEFAULT_CHANNELS: Omit<Channel, 'id'>[] = [
  { slug:'all', name:'发现', description:'全部动态', icon:'🌐', groupName:'discover', sortOrder:0 },
  { slug:'graphic', name:'平面设计', description:'视觉引力', icon:'🎨', groupName:'designer', sortOrder:1 },
  { slug:'uiux', name:'UI/UX', description:'界面星河', icon:'📱', groupName:'designer', sortOrder:2 },
  { slug:'interior', name:'室内设计', description:'空间生成', icon:'🏠', groupName:'designer', sortOrder:3 },
  { slug:'industrial', name:'工业设计', description:'形体工坊', icon:'⚙️', groupName:'designer', sortOrder:4 },
  { slug:'fashion', name:'服装设计', description:'时尚织造', icon:'👗', groupName:'designer', sortOrder:5 },
  { slug:'motion', name:'动效/3D', description:'动态星环', icon:'🎥', groupName:'designer', sortOrder:6 },
  { slug:'aigc', name:'AIGC导演', description:'光年工作台', icon:'🎬', groupName:'designer', sortOrder:7 },
  { slug:'dev', name:'开发者星舰', description:'技术讨论', icon:'💻', groupName:'developer', sortOrder:8 },
  { slug:'pm', name:'PM引力舱', description:'产品思维', icon:'📊', groupName:'pm', sortOrder:9 },
  { slug:'beginner', name:'新手村', description:'学习成长', icon:'🌱', groupName:'beginner', sortOrder:10 },
  { slug:'fun', name:'奇点区', description:'游乐场', icon:'🚀', groupName:'fun', sortOrder:11 },
  { slug:'news', name:'资讯空间站', description:'AI 资讯', icon:'📡', groupName:'news', sortOrder:12 },
];

// ─── 帖子类型 ───
export type PostType = 'normal' | 'creation' | 'news';
export type PostSort = 'hot' | 'latest' | 'following';
export type PostStatus = 'draft' | 'published' | 'archived';

// ─── 工作台项目类型 ───
export type ProjectType =
  | 'graphic' | 'uiux' | 'interior' | 'industrial' | 'fashion' | 'motion' | 'aigc_director'
  | 'frontend' | 'backend' | 'aiml' | 'fullstack' | 'devops' | 'mobile' | 'data' | 'security' | 'web3'
  | 'pm' | 'learning' | 'playground';

// ─── API 通用类型 ───
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  cursor?: string;
  hasMore: boolean;
}

export interface ApiError {
  detail: string;
  code?: string;
}

// ─── 用户 ───
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  roleTags: UserRole[];
  certifiedRoles: UserRole[];
  createdAt: string;
}

// ─── 帖子 ───
export interface Post {
  id: string;
  authorId: string;
  author?: UserProfile;
  channelId: number;
  channel?: Channel;
  title: string;
  body: string;
  bodyPlain: string;
  postType: PostType;
  sourceProjectId?: string;
  promptData?: Record<string, unknown>;
  mediaUrls: string[];
  status: PostStatus;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── 评论 ───
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: UserProfile;
  parentId?: string;
  body: string;
  likeCount: number;
  createdAt: string;
  children?: Comment[];
}

// ─── 项目 ───
export interface Project {
  id: string;
  userId: string;
  type: ProjectType;
  title: string;
  description: string;
  data: Record<string, unknown>;
  thumbnailUrl: string;
  status: 'draft' | 'published' | 'archived';
  publishedPostId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── 资讯 ───
export interface NewsItem {
  id: string;
  sourceName: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
}