import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Cpu,
  Flame,
  Database,
  Headphones,
  HardDrive,
  Download,
  Shield,
  Terminal,
  Cloud,
  Monitor,
  Crown,
  LogOut,
  LogIn,
  UserX,
  ChevronRight,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isGuest: boolean;
  onLogin: () => void;
}

const menuSection1 = [
  { key: 'models', label: '模型中心', desc: '管理与切换AI模型', Icon: Cpu, color: '#3B82F6', bgColor: '#EFF6FF' },
  { key: 'lora', label: 'LoRA训练', desc: '自定义模型微调', Icon: Flame, color: '#F97316', bgColor: '#FFF7ED' },
  { key: 'knowledge', label: '知识库', desc: '文档与数据管理', Icon: Database, color: '#10B981', bgColor: '#ECFDF5' },
  { key: 'voice', label: '语音助手', desc: '语音交互与合成', Icon: Headphones, color: '#8B5CF6', bgColor: '#F5F3FF' },
];

const menuSection2 = [
  { key: 'cache', label: '缓存管理', desc: '清理与优化存储', Icon: HardDrive, color: '#6366F1', bgColor: '#EEF2FF' },
  { key: 'download', label: '下载管理', desc: '模型与资源下载', Icon: Download, color: '#14B8A6', bgColor: '#F0FDFA' },
  { key: 'privacy', label: '隐私与安全', desc: '数据保护设置', Icon: Shield, color: '#EF4444', bgColor: '#FEF2F2' },
  { key: 'dev', label: '开发者模式', desc: '高级调试选项', Icon: Terminal, color: '#64748B', bgColor: '#F8FAFC' },
];

function MenuItem({ item, onPress }: { item: typeof menuSection1[number]; onPress: () => void }) {
  const IconComp = item.Icon;
  return (
    <TouchableOpacity
      className="flex-row items-center py-3.5 px-4"
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View
        className="w-9 h-9 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: item.bgColor }}
      >
        <IconComp size={18} color={item.color} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-sm font-medium">{item.label}</Text>
        <Text className="text-text-tertiary text-xs mt-0.5">{item.desc}</Text>
      </View>
      <ChevronRight size={18} color="#D1D5DB" strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function ProfilePage({ onNavigate, onLogout, isGuest, onLogin }: ProfilePageProps) {
  const { showToast } = useToast();

  const handleMenuPress = (key: string) => {
    onNavigate(key);
  };

  return (
    <View style={{ flex: 1 }} className="bg-surface-secondary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="bg-surface pt-14 pb-6 px-5">
          {isGuest ? (
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mr-4">
                <UserX size={28} color="#9CA3AF" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-lg font-bold">游客用户</Text>
                <Text className="text-text-tertiary text-sm mt-1">登录后可解锁更多功能</Text>
              </View>
              <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-xl"
                activeOpacity={0.8}
                onPress={onLogin}
              >
                <Text className="text-white text-sm font-semibold">登录</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Text className="text-white text-2xl font-bold">U</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-text-primary text-lg font-bold">User</Text>
                  <View className="flex-row items-center ml-2 px-2 py-0.5 rounded-full bg-amber-50">
                    <Crown size={12} color="#F59E0B" strokeWidth={2.5} />
                    <Text className="text-amber-600 text-xs font-semibold ml-1">Pro</Text>
                  </View>
                </View>
                <Text className="text-text-tertiary text-sm mt-1">UID: 100001 · 已绑定 3 台设备</Text>
              </View>
            </View>
          )}
        </View>

        {!isGuest && (
          <View className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
            <View className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Crown size={16} color="#F59E0B" strokeWidth={2} />
                  <Text className="text-amber-400 text-sm font-bold ml-1.5">Pro 会员</Text>
                </View>
                <Text className="text-gray-400 text-xs">到期时间：永久</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">使用配额</Text>
                  <Text className="text-white text-lg font-bold mt-0.5">∞</Text>
                </View>
                <View className="w-px h-8 bg-gray-600 mx-4" />
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">云端同步</Text>
                  <View className="flex-row items-center mt-1">
                    <Cloud size={14} color="#10B981" strokeWidth={2} />
                    <Text className="text-green-400 text-sm font-semibold ml-1">已开启</Text>
                  </View>
                </View>
                <View className="w-px h-8 bg-gray-600 mx-4" />
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">会员等级</Text>
                  <Text className="text-white text-lg font-bold mt-0.5">Pro</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="mx-4 mt-4 bg-surface rounded-2xl overflow-hidden border border-border-light">
          <Text className="text-text-tertiary text-xs font-medium px-4 pt-3 pb-1 uppercase tracking-wider">
            功能
          </Text>
          {menuSection1.map((item, idx) => (
            <React.Fragment key={item.key}>
              <MenuItem item={item} onPress={() => handleMenuPress(item.key)} />
              {idx < menuSection1.length - 1 && <View className="h-px bg-border-light ml-16" />}
            </React.Fragment>
          ))}
        </View>

        <View className="mx-4 mt-3 bg-surface rounded-2xl overflow-hidden border border-border-light">
          <Text className="text-text-tertiary text-xs font-medium px-4 pt-3 pb-1 uppercase tracking-wider">
            工具
          </Text>
          {menuSection2.map((item, idx) => (
            <React.Fragment key={item.key}>
              <MenuItem item={item} onPress={() => handleMenuPress(item.key)} />
              {idx < menuSection2.length - 1 && <View className="h-px bg-border-light ml-16" />}
            </React.Fragment>
          ))}
        </View>

        <View className="mx-4 mt-3 bg-surface rounded-2xl overflow-hidden border border-border-light">
          <TouchableOpacity
            className="flex-row items-center py-3.5 px-4"
            activeOpacity={0.6}
            onPress={() => onNavigate('settings')}
          >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3 bg-gray-100">
              <Monitor size={18} color="#6B7280" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium">设置中心</Text>
            </View>
            <ChevronRight size={18} color="#D1D5DB" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View className="mx-4 mt-5">
          {isGuest ? (
            <TouchableOpacity
              className="bg-primary rounded-2xl py-3.5 items-center justify-center"
              activeOpacity={0.8}
              onPress={onLogin}
            >
              <View className="flex-row items-center">
                <LogIn size={18} color="#FFFFFF" strokeWidth={2} />
                <Text className="text-white text-sm font-semibold ml-2">登录账号</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-surface rounded-2xl py-3.5 items-center justify-center border border-red-200"
              activeOpacity={0.7}
              onPress={() => {
                onLogout();
                showToast('已退出登录', 'info');
              }}
            >
              <View className="flex-row items-center">
                <LogOut size={18} color="#EF4444" strokeWidth={2} />
                <Text className="text-red-500 text-sm font-semibold ml-2">退出登录</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-text-tertiary text-xs text-center mt-6">
          OmniAI Assistant v2.5.0
        </Text>
      </ScrollView>
    </View>
  );
}
