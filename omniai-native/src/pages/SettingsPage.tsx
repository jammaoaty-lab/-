import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Moon,
  Bell,
  Globe,
  Shield,
  Database,
  Info,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface SettingsPageProps {
  onBack: () => void;
}

interface ToggleSettingProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleSetting({ icon: Icon, iconColor, iconBg, label, value, onValueChange }: ToggleSettingProps) {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  const bgColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    const newValue = !value;
    onValueChange(newValue);

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: newValue ? 20 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(bgColor, {
        toValue: newValue ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, onValueChange, translateX, bgColor]);

  const trackBg = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D1D5DB', '#3B82F6'],
  });

  return (
    <View className="flex-row items-center justify-between py-3.5 px-4 bg-surface">
      <View className="flex-row items-center flex-1">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
        <Text className="text-text-primary text-[15px] font-medium">{label}</Text>
      </View>

      <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
        <Animated.View
          className="w-[50px] h-[30px] rounded-full justify-center px-[3px]"
          style={{ backgroundColor: trackBg }}
        >
          <Animated.View
            className="w-[24px] h-[24px] rounded-full bg-white shadow-sm"
            style={{ transform: [{ translateX }] }}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

interface NavigationSettingProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress: () => void;
}

function NavigationSetting({ icon: Icon, iconColor, iconBg, label, value, onPress }: NavigationSettingProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3.5 px-4 bg-surface"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
        <Text className="text-text-primary text-[15px] font-medium">{label}</Text>
      </View>

      <View className="flex-row items-center">
        {value && (
          <Text className="text-text-tertiary text-sm mr-2">{value}</Text>
        )}
        <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const MODEL_CYCLE = ['OmniAI 3B', 'OmniAI 7B', 'OmniAI 1.5B'] as const;

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { showToast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [localInference, setLocalInference] = useState(true);
  const [modelIndex, setModelIndex] = useState(0);

  const handleCycleModel = useCallback(() => {
    setModelIndex((prev) => {
      const next = (prev + 1) % MODEL_CYCLE.length;
      showToast(`默认模型已切换为 ${MODEL_CYCLE[next]}`, 'success');
      return next;
    });
  }, [showToast]);

  return (
    <View style={{ flex: 1 }} className="bg-surface-secondary">
      <View className="bg-surface pt-14 pb-3 px-5 border-b border-border-light">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            className="w-9 h-9 items-center justify-center rounded-lg -ml-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color="#1A1D23" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary ml-2">设置</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mt-5">
          <Text className="text-text-tertiary text-xs font-medium uppercase tracking-wider px-5 mb-2">
            偏好设置
          </Text>
          <View className="mx-4 rounded-2xl overflow-hidden border border-border-light">
            <ToggleSetting
              icon={Moon}
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="深色模式"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <View className="h-px bg-border-light mx-4" />
            <ToggleSetting
              icon={Bell}
              iconColor="#F59E0B"
              iconBg="#FFF7ED"
              label="消息通知"
              value={notifications}
              onValueChange={setNotifications}
            />
            <View className="h-px bg-border-light mx-4" />
            <ToggleSetting
              icon={Globe}
              iconColor="#10B981"
              iconBg="#ECFDF5"
              label="自动更新"
              value={autoUpdate}
              onValueChange={setAutoUpdate}
            />
            <View className="h-px bg-border-light mx-4" />
            <ToggleSetting
              icon={Database}
              iconColor="#3B82F6"
              iconBg="#EFF6FF"
              label="本地推理"
              value={localInference}
              onValueChange={setLocalInference}
            />
          </View>
        </View>

        <View className="mt-7">
          <Text className="text-text-tertiary text-xs font-medium uppercase tracking-wider px-5 mb-2">
            通用
          </Text>
          <View className="mx-4 rounded-2xl overflow-hidden border border-border-light">
            <NavigationSetting
              icon={Info}
              iconColor="#3B82F6"
              iconBg="#EFF6FF"
              label="账号信息"
              onPress={() => showToast('账号信息页面即将上线', 'info')}
            />
            <View className="h-px bg-border-light mx-4" />
            <NavigationSetting
              icon={Shield}
              iconColor="#EF4444"
              iconBg="#FEF2F2"
              label="隐私设置"
              onPress={() => showToast('隐私设置页面即将上线', 'info')}
            />
            <View className="h-px bg-border-light mx-4" />
            <NavigationSetting
              icon={Globe}
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
              label="默认模型"
              value={MODEL_CYCLE[modelIndex]}
              onPress={handleCycleModel}
            />
            <View className="h-px bg-border-light mx-4" />
            <NavigationSetting
              icon={Database}
              iconColor="#F97316"
              iconBg="#FFF7ED"
              label="缓存大小"
              value="128 MB"
              onPress={() => showToast('缓存已清除', 'success')}
            />
            <View className="h-px bg-border-light mx-4" />
            <NavigationSetting
              icon={Info}
              iconColor="#6B7280"
              iconBg="#F1F3F5"
              label="关于 OmniAI"
              value="v2.5.0"
              onPress={() => showToast('OmniAI Assistant v2.5.0', 'info')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
