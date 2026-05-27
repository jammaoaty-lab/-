import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import {
  Plus,
  Search,
  Cpu,
  HardDrive,
  Download,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

type ModelStatus = 'idle' | 'download' | 'error';

interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  status: ModelStatus;
  enabled: boolean;
  progress: number;
}

const initialModels: Model[] = [
  {
    id: '3b',
    name: 'OmniAI 3B',
    description: '轻量级通用模型',
    size: '1.8GB',
    status: 'idle',
    enabled: true,
    progress: 100,
  },
  {
    id: '7b',
    name: 'OmniAI 7B',
    description: '高性能推理模型',
    size: '4.2GB',
    status: 'idle',
    enabled: true,
    progress: 100,
  },
  {
    id: '1.5b',
    name: 'OmniAI 1.5B',
    description: '极速轻量模型',
    size: '1.1GB',
    status: 'download',
    enabled: true,
    progress: 67,
  },
  {
    id: '13b',
    name: 'OmniAI 13B',
    description: '旗舰级大模型',
    size: '8.5GB',
    status: 'idle',
    enabled: false,
    progress: 100,
  },
];

function StatusBadge({ status }: { status: ModelStatus }) {
  if (status === 'idle') {
    return (
      <View className="flex-row items-center bg-green-50 px-2.5 py-1 rounded-full">
        <View className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
        <Text className="text-success text-xs font-medium">就绪</Text>
      </View>
    );
  }
  if (status === 'download') {
    return (
      <View className="flex-row items-center bg-blue-50 px-2.5 py-1 rounded-full">
        <View className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
        <Text className="text-primary text-xs font-medium">下载中</Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full">
      <View className="w-1.5 h-1.5 rounded-full bg-danger mr-1.5" />
      <Text className="text-danger text-xs font-medium">异常</Text>
    </View>
  );
}

function ModelCard({
  model,
  onToggleEnabled,
  onDownloadPress,
}: {
  model: Model;
  onToggleEnabled: (id: string) => void;
  onDownloadPress: (id: string) => void;
}) {
  const progressAnim = useRef(new Animated.Value(model.progress)).current;
  const [currentProgress, setCurrentProgress] = useState(model.progress);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentProgress, progressAnim]);

  const handleDownload = useCallback(() => {
    if (downloading) return;
    setDownloading(true);

    let progress = currentProgress;
    const interval = setInterval(() => {
      progress += 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setCurrentProgress(100);
        onDownloadPress(model.id);
        setDownloading(false);
      } else {
        setCurrentProgress(progress);
      }
    }, 30);
  }, [downloading, currentProgress, model.id, onDownloadPress]);

  const iconBgColor =
    model.status === 'download'
      ? '#EFF6FF'
      : model.status === 'error'
        ? '#FEF2F2'
        : '#F0FDF4';
  const iconColor =
    model.status === 'download'
      ? '#3B82F6'
      : model.status === 'error'
        ? '#EF4444'
        : '#10B981';

  return (
    <View className="bg-surface rounded-2xl mb-3 p-4 border border-border-light">
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBgColor }}
        >
          {model.status === 'download' ? (
            <Download size={22} color={iconColor} strokeWidth={2} />
          ) : model.status === 'error' ? (
            <AlertCircle size={22} color={iconColor} strokeWidth={2} />
          ) : (
            <Cpu size={22} color={iconColor} strokeWidth={2} />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary text-base font-semibold">
              {model.name}
            </Text>
            <StatusBadge status={model.status} />
          </View>
          <Text className="text-text-secondary text-sm mt-0.5">
            {model.description}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border-light">
        <View className="flex-row items-center gap-1">
          <HardDrive size={14} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-text-tertiary text-xs">{model.size}</Text>
        </View>

        <View className="flex-row items-center gap-3">
          {model.status === 'download' && (
            <TouchableOpacity
              className={`px-3 py-1.5 rounded-lg ${downloading ? 'bg-blue-50' : 'bg-primary'}`}
              activeOpacity={0.7}
              onPress={handleDownload}
              disabled={downloading}
            >
              <Text className={`text-xs font-medium ${downloading ? 'text-primary' : 'text-white'}`}>
                {downloading ? `${currentProgress}%` : '继续下载'}
              </Text>
            </TouchableOpacity>
          )}

          {model.status === 'idle' && currentProgress === 100 && (
            <View className="flex-row items-center gap-1">
              <Check size={14} color="#10B981" strokeWidth={2} />
              <Text className="text-success text-xs font-medium">已下载</Text>
            </View>
          )}

          <Switch
            value={model.enabled}
            onValueChange={() => onToggleEnabled(model.id)}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
          />
        </View>
      </View>

      {model.status === 'download' && (
        <View className="mt-3">
          <View className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
            <Animated.View
              className="h-full bg-primary rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
          <Text className="text-text-tertiary text-xs mt-1.5 text-right">
            {currentProgress}%
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { showToast } = useToast();

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      m.description.includes(searchText)
  );

  const handleToggleEnabled = useCallback(
    (id: string) => {
      setModels((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            const next = !m.enabled;
            showToast(`${m.name} ${next ? '已启用' : '已禁用'}`);
            return { ...m, enabled: next };
          }
          return m;
        })
      );
    },
    [showToast]
  );

  const handleDownloadComplete = useCallback(
    (id: string) => {
      setModels((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            showToast(`${m.name} 下载完成`, 'success');
            return { ...m, status: 'idle' as ModelStatus, progress: 100 };
          }
          return m;
        })
      );
    },
    [showToast]
  );

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface pt-14 pb-3 px-5 border-b border-border-light">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-text-primary">模型管理</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center"
              activeOpacity={0.7}
              onPress={() => showToast('添加模型即将上线')}
            >
              <Plus size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center"
              activeOpacity={0.7}
              onPress={() => {
                setShowSearch((prev) => !prev);
                if (showSearch) setSearchText('');
              }}
            >
              <Search size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View className="flex-row items-center bg-surface-secondary rounded-xl px-3 py-2.5 mb-1">
            <Search size={16} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-2 text-sm text-text-primary"
              placeholder="搜索模型..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {filteredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onToggleEnabled={handleToggleEnabled}
            onDownloadPress={handleDownloadComplete}
          />
        ))}

        {filteredModels.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-text-tertiary text-sm">未找到匹配的模型</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
