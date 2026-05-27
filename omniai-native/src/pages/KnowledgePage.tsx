import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Database,
  Clock,
  ChevronDown,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Document {
  name: string;
  size: string;
  date: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  documents: Document[];
  updateTime: string;
}

const knowledgeBases: KnowledgeBase[] = [
  {
    id: 'product',
    name: '产品文档库',
    icon: BookOpen,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    updateTime: '2小时前',
    documents: [
      { name: '更新日志.pdf', size: '2.1MB', date: '2026-05-25' },
      { name: '用户手册.docx', size: '5.8MB', date: '2026-05-20' },
      { name: '产品路线图.xlsx', size: '1.2MB', date: '2026-05-18' },
      { name: '需求规格说明书.pdf', size: '3.4MB', date: '2026-05-15' },
    ],
  },
  {
    id: 'tech',
    name: '技术规范库',
    icon: Database,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    updateTime: '5小时前',
    documents: [
      { name: '认证模块设计.md', size: '0.8MB', date: '2026-05-24' },
      { name: '数据库设计规范.pdf', size: '2.3MB', date: '2026-05-22' },
      { name: '微服务架构方案.docx', size: '4.1MB', date: '2026-05-19' },
    ],
  },
  {
    id: 'api',
    name: 'API 参考手册',
    icon: FileText,
    color: '#10B981',
    bgColor: '#ECFDF5',
    updateTime: '1天前',
    documents: [
      { name: 'REST API 列表.md', size: '1.5MB', date: '2026-05-23' },
      { name: 'WebSocket 协议.pdf', size: '2.7MB', date: '2026-05-21' },
      { name: 'GraphQL Schema.md', size: '0.9MB', date: '2026-05-17' },
      { name: '错误码参考表.xlsx', size: '1.1MB', date: '2026-05-14' },
    ],
  },
];

const recentDocuments = [
  { name: '更新日志.pdf', baseName: '产品文档库', date: '2小时前' },
  { name: '认证模块设计.md', baseName: '技术规范库', date: '5小时前' },
  { name: 'REST API 列表.md', baseName: 'API 参考手册', date: '1天前' },
  { name: '用户手册.docx', baseName: '产品文档库', date: '2天前' },
];

function KnowledgeBaseCard({ kb, isExpanded, onToggle, onDocPress }: {
  kb: KnowledgeBase;
  isExpanded: boolean;
  onToggle: () => void;
  onDocPress: (doc: Document) => void;
}) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedHeight]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const totalSize = kb.documents.reduce((sum, doc) => {
    return sum + parseFloat(doc.size);
  }, 0).toFixed(1);

  const IconComponent = kb.icon;

  return (
    <View className="bg-surface rounded-2xl mb-3 overflow-hidden border border-border-light">
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: kb.bgColor }}
        >
          <IconComponent size={22} color={kb.color} strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-text-primary text-base font-semibold">
            {kb.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-text-secondary text-xs">
              {kb.documents.length} 个文档
            </Text>
            <View className="w-1 h-1 rounded-full bg-text-tertiary mx-2" />
            <Text className="text-text-secondary text-xs">
              {totalSize}MB
            </Text>
            <View className="w-1 h-1 rounded-full bg-text-tertiary mx-2" />
            <Clock size={12} color="#9CA3AF" strokeWidth={2} />
            <Text className="text-text-secondary text-xs ml-1">
              {kb.updateTime}
            </Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, kb.documents.length * 56 + 16],
          }),
          overflow: 'hidden',
        }}
      >
        <View className="px-4 pb-4">
          <View className="h-px bg-border-light mb-3" />
          {kb.documents.map((doc, index) => (
            <TouchableOpacity
              key={doc.name}
              className={`flex-row items-center py-3 ${index < kb.documents.length - 1 ? 'border-b border-border-light' : ''}`}
              activeOpacity={0.6}
              onPress={() => onDocPress(doc)}
            >
              <View className="w-8 h-8 rounded-lg bg-surface-secondary items-center justify-center mr-3">
                <FileText size={16} color="#6B7280" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm">{doc.name}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-text-tertiary text-xs">{doc.size}</Text>
                  <View className="w-1 h-1 rounded-full bg-text-tertiary mx-1.5" />
                  <Text className="text-text-tertiary text-xs">{doc.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

export default function KnowledgePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { showToast } = useToast();

  const filteredBases = knowledgeBases.filter(
    (kb) =>
      kb.name.toLowerCase().includes(searchText.toLowerCase()) ||
      kb.documents.some((d) => d.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDocPress = (doc: Document) => {
    showToast(`正在打开: ${doc.name}`);
  };

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface pt-14 pb-3 px-5 border-b border-border-light">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-text-primary">知识库</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center"
              activeOpacity={0.7}
              onPress={() => showToast('新建知识库即将上线')}
            >
              <Plus size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center"
              activeOpacity={0.7}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
              placeholder="搜索知识库或文档..."
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
        {filteredBases.map((kb) => (
          <KnowledgeBaseCard
            key={kb.id}
            kb={kb}
            isExpanded={expandedId === kb.id}
            onToggle={() => handleToggle(kb.id)}
            onDocPress={handleDocPress}
          />
        ))}

        {filteredBases.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-text-tertiary text-sm">未找到匹配的知识库</Text>
          </View>
        )}

        <View className="mt-4">
          <View className="flex-row items-center mb-3">
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-text-secondary text-sm font-semibold ml-2">最近文档</Text>
          </View>

          {recentDocuments.map((doc, index) => (
            <TouchableOpacity
              key={`${doc.name}-${index}`}
              className={`flex-row items-center bg-surface rounded-xl p-3 mb-2 border border-border-light ${searchText && !doc.name.toLowerCase().includes(searchText.toLowerCase()) ? 'opacity-30' : ''}`}
              activeOpacity={0.6}
              onPress={() => showToast(`正在打开: ${doc.name}`)}
            >
              <View className="w-9 h-9 rounded-lg bg-surface-secondary items-center justify-center mr-3">
                <FileText size={18} color="#6B7280" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm">{doc.name}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-text-tertiary text-xs">{doc.baseName}</Text>
                  <View className="w-1 h-1 rounded-full bg-text-tertiary mx-1.5" />
                  <Text className="text-text-tertiary text-xs">{doc.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
