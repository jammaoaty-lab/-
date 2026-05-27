import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  Plus,
  Search,
  Code2,
  PenLine,
  Globe,
  MessageCircle,
  Zap,
  ChevronDown,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  capabilities: string[];
  prompts: string[];
}

const agents: Agent[] = [
  {
    id: 'code',
    name: '代码助手',
    description: '编程开发与代码审查专家',
    icon: Code2,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    capabilities: ['Python', 'JavaScript', 'Debug', 'Code Review', 'Refactor'],
    prompts: ['帮我写一个排序算法', '这段代码有什么问题？', '帮我重构这段代码'],
  },
  {
    id: 'writing',
    name: '写作助手',
    description: '文案创作与内容优化专家',
    icon: PenLine,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    capabilities: ['文案写作', '文章润色', 'SEO优化', '多语言', '创意构思'],
    prompts: ['帮我写一篇产品介绍', '润色这段文字', '生成营销文案'],
  },
  {
    id: 'search',
    name: '搜索助手',
    description: '信息检索与数据分析专家',
    icon: Globe,
    color: '#10B981',
    bgColor: '#ECFDF5',
    capabilities: ['实时搜索', '学术检索', '新闻聚合', '数据分析', '趋势追踪'],
    prompts: ['搜索最新的AI论文', '分析这个话题的趋势', '对比这两个产品'],
  },
  {
    id: 'chat',
    name: '对话助手',
    description: '智能对话与情感陪伴专家',
    icon: MessageCircle,
    color: '#F97316',
    bgColor: '#FFF7ED',
    capabilities: ['日常对话', '情感分析', '建议推荐', '知识问答', '角色扮演'],
    prompts: ['今天心情不好', '推荐一部电影', '扮演一个历史人物'],
  },
  {
    id: 'efficiency',
    name: '效率助手',
    description: '任务管理与流程优化专家',
    icon: Zap,
    color: '#EF4444',
    bgColor: '#FEF2F2',
    capabilities: ['任务规划', '时间管理', '文档处理', '自动化', '流程优化'],
    prompts: ['帮我制定学习计划', '优化我的工作流程', '整理这份文档'],
  },
];

function AgentCard({ agent, isExpanded, onToggle, onStartChat }: {
  agent: Agent;
  isExpanded: boolean;
  onToggle: () => void;
  onStartChat: () => void;
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

  const IconComponent = agent.icon;

  return (
    <View className="bg-surface rounded-2xl mb-3 overflow-hidden border border-border-light">
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: agent.bgColor }}
        >
          <IconComponent size={22} color={agent.color} strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-text-primary text-base font-semibold">
            {agent.name}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            {agent.description}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 280],
          }),
          overflow: 'hidden',
        }}
      >
        <View className="px-4 pb-4">
          <View className="h-px bg-border-light mb-3" />

          <Text className="text-text-tertiary text-xs font-medium mb-2 uppercase tracking-wider">
            核心能力
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {agent.capabilities.map((cap) => (
              <View
                key={cap}
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: agent.bgColor }}
              >
                <Text className="text-xs font-medium" style={{ color: agent.color }}>
                  {cap}
                </Text>
              </View>
            ))}
          </View>

          <Text className="text-text-tertiary text-xs font-medium mb-2 uppercase tracking-wider">
            示例提问
          </Text>
          <View className="gap-2 mb-4">
            {agent.prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                className="bg-surface-secondary rounded-xl px-3 py-2.5 border border-border-light"
                activeOpacity={0.6}
                onPress={onStartChat}
              >
                <Text className="text-text-secondary text-sm">{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="rounded-xl py-3 items-center justify-center"
            style={{ backgroundColor: agent.color }}
            activeOpacity={0.8}
            onPress={onStartChat}
          >
            <Text className="text-white text-sm font-semibold">开始对话</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

export default function AgentPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { showToast } = useToast();

  const filteredAgents = agents.filter(
    (a) =>
      a.name.includes(searchText) ||
      a.description.includes(searchText) ||
      a.capabilities.some((c) => c.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleStartChat = (agent: Agent) => {
    showToast(`已进入${agent.name}模式`);
  };

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface pt-14 pb-3 px-5 border-b border-border-light">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-text-primary">智能体</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center"
              activeOpacity={0.7}
              onPress={() => showToast('新建智能体即将上线')}
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
          <Animated.View className="flex-row items-center bg-surface-secondary rounded-xl px-3 py-2.5 mb-1">
            <Search size={16} color="#9CA3AF" strokeWidth={2} />
            <TouchableOpacity
              className="flex-1 ml-2"
              activeOpacity={1}
            >
              <Text className="text-text-tertiary text-sm">搜索智能体...</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isExpanded={expandedId === agent.id}
            onToggle={() => handleToggle(agent.id)}
            onStartChat={() => handleStartChat(agent)}
          />
        ))}

        {filteredAgents.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-text-tertiary text-sm">未找到匹配的智能体</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
