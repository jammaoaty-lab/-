import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Menu,
  Plus,
  Send,
  Square,
  Mic,
  Paperclip,
  Brain,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  MoreHorizontal,
  Trash2,
  PenLine,
  Code2,
  Languages,
  ImageIcon,
  Headphones,
  Search,
  Database,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  deepThinking?: boolean;
  thinkingSteps?: string[];
  thinkingExpanded?: boolean;
  copied?: boolean;
  liked?: 'up' | 'down' | null;
}

interface ChatPageProps {
  onToggleSidebar: () => void;
}

const THINKING_STEPS_TEMPLATES = [
  [
    '分析用户输入，理解核心意图...',
    '检索相关知识库，匹配最佳信息源...',
    '构建推理链路，验证逻辑一致性...',
    '评估多个候选方案，选择最优路径...',
    '整合信息，组织回答结构...',
    '生成最终回复，确保准确性和完整性',
  ],
  [
    '解析查询语义，提取关键实体...',
    '在知识图谱中定位相关节点...',
    '沿推理路径遍历关联概念...',
    '对候选答案进行置信度评分...',
    '排除低置信度结果，精炼内容...',
    '组织自然语言输出，完成响应',
  ],
  [
    '识别问题类型，确定推理策略...',
    '加载领域模型，激活相关参数...',
    '逐步推导中间结论，保持逻辑链...',
    '交叉验证关键事实，消除矛盾...',
    '优化表达方式，提升可读性...',
    '输出最终结果，附带推理依据',
  ],
  [
    '理解用户需求，拆解子问题...',
    '调用多源数据，融合异构信息...',
    '建立因果模型，追踪推理步骤...',
    '对比分析不同视角，综合判断...',
    '验证结论稳健性，处理边界情况...',
    '形成完整回答，确保逻辑自洽',
  ],
];

const AI_RESPONSE_TEMPLATES = [
  '根据我的分析，这是一个很好的问题。让我从几个方面来回答：\n\n首先，从技术角度来看，这个方案具有可行性。核心原理基于成熟的算法框架，在实际应用中已经得到了广泛验证。\n\n其次，从实践层面来说，建议采用渐进式的实施策略。可以先在小范围内进行试点，收集反馈后再逐步扩大应用范围。\n\n最后，需要注意一些潜在的风险点，包括数据安全、性能瓶颈和用户体验等方面。建议制定相应的预案来应对可能出现的问题。\n\n希望这些信息对您有所帮助！如有其他疑问，欢迎继续探讨。',
  '这是一个值得深入探讨的话题。以下是我的详细分析：\n\n**核心观点**\n当前的技术发展趋势表明，这一领域正在经历快速变革。新的方法论和工具不断涌现，为解决传统问题提供了更多可能性。\n\n**关键发现**\n1. 效率提升：新方案相比传统方法，效率提升了约40%\n2. 成本优化：通过智能化流程，运营成本显著降低\n3. 用户体验：交互方式更加自然，学习曲线更平缓\n\n**建议**\n- 短期：关注技术成熟度和团队适配性\n- 中期：建立标准化流程和评估体系\n- 长期：构建可持续的创新生态\n\n如需更深入的技术细节，我可以进一步展开讨论。',
  '感谢您的提问！让我为您梳理一下这个问题的脉络：\n\n从本质上看，这个问题涉及三个层面：\n\n🔹 **认知层面** — 需要理解底层逻辑和核心概念。很多看似复杂的问题，一旦抓住关键原理，就能迎刃而解。\n\n🔹 **技术层面** — 实现路径的选择至关重要。不同的技术选型会导致截然不同的结果，需要根据具体场景做出权衡。\n\n🔹 **实践层面** — 理论与实践之间往往存在差距。建议通过快速原型验证、迭代优化的方式来缩小这个差距。\n\n总结来说，关键在于找到理论与实践的最佳平衡点。我建议您可以先从一个最小可行方案开始，在实践中不断调整和完善。',
  '这个问题非常有深度，让我从专业角度为您解读：\n\n📌 **背景分析**\n在当前的技术环境下，这类问题越来越受到关注。根据最新的研究数据，相关领域的投入增长了约60%，显示出强劲的发展势头。\n\n📌 **解决方案**\n我推荐采用分层架构的方法：\n- 底层：确保数据质量和基础设施的稳定性\n- 中层：构建智能化的处理和分析能力\n- 上层：提供灵活的交互和展示接口\n\n📌 **实施路径**\nPhase 1: 需求确认与方案设计（1-2周）\nPhase 2: 核心功能开发与测试（3-4周）\nPhase 3: 优化迭代与上线部署（2-3周）\n\n如果您需要更具体的实施细节或技术方案，请告诉我！',
];

const QUICK_ACTIONS = [
  { icon: PenLine, label: 'AI写作', prompt: '请帮我写一篇关于' },
  { icon: Code2, label: '代码生成', prompt: '请帮我生成一段代码，实现' },
  { icon: Languages, label: '翻译', prompt: '请帮我翻译以下内容：' },
  { icon: ImageIcon, label: 'OCR识图', prompt: '请识别图片中的文字内容' },
  { icon: Headphones, label: '语音助手', prompt: '语音助手模式已开启，' },
  { icon: Search, label: 'AI搜索', prompt: '请搜索关于' },
  { icon: Database, label: '知识库', prompt: '根据知识库查询：' },
  { icon: Bot, label: 'Agent', prompt: 'Agent模式：请帮我完成' },
];

let messageIdCounter = 0;
function generateId(): string {
  messageIdCounter++;
  return `msg-${Date.now()}-${messageIdCounter}`;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDelay(): number {
  return Math.floor(Math.random() * 1200) + 800;
}

export default function ChatPage({ onToggleSidebar }: ChatPageProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState<string[]>([]);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
  }, []);

  const clearThinkingTimers = useCallback(() => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    stepTimeoutsRef.current.forEach((t) => clearTimeout(t));
    stepTimeoutsRef.current = [];
  }, []);

  const handleNewChat = useCallback(() => {
    clearThinkingTimers();
    setMessages([]);
    setIsGenerating(false);
    setCurrentThinkingSteps([]);
    setThinkingTime(0);
    setInput('');
  }, [clearThinkingTimers]);

  const simulateDeepThinking = useCallback(
    (userMessage: string) => {
      const steps = getRandomItem(THINKING_STEPS_TEMPLATES);
      setCurrentThinkingSteps([]);
      setThinkingTime(0);

      thinkingTimerRef.current = setInterval(() => {
        setThinkingTime((prev) => prev + 1);
      }, 1000);

      steps.forEach((step, index) => {
        const timeout = setTimeout(
          () => {
            setCurrentThinkingSteps((prev) => [...prev, step]);
            scrollToBottom();

            if (index === steps.length - 1) {
              if (thinkingTimerRef.current) {
                clearInterval(thinkingTimerRef.current);
                thinkingTimerRef.current = null;
              }

              setTimeout(() => {
                const response = getRandomItem(AI_RESPONSE_TEMPLATES);
                const aiMessage: Message = {
                  id: generateId(),
                  role: 'assistant',
                  content: response,
                  model: 'OmniAI 3B',
                  deepThinking: true,
                  thinkingSteps: steps,
                  thinkingExpanded: false,
                  copied: false,
                  liked: null,
                };
                setMessages((prev) => [...prev, aiMessage]);
                setIsGenerating(false);
                setCurrentThinkingSteps([]);
                setThinkingTime(0);
                scrollToBottom();
              }, 600);
            }
          },
          steps.slice(0, index + 1).reduce((acc) => acc + getRandomDelay(), 0),
        );
        stepTimeoutsRef.current.push(timeout);
      });
    },
    [scrollToBottom],
  );

  const simulateNormalResponse = useCallback(() => {
    const delay = Math.floor(Math.random() * 1000) + 800;
    setTimeout(() => {
      const response = getRandomItem(AI_RESPONSE_TEMPLATES);
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        model: 'OmniAI 3B',
        copied: false,
        liked: null,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
      scrollToBottom();
    }, delay);
  }, [scrollToBottom]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    scrollToBottom();

    if (deepThinking) {
      simulateDeepThinking(trimmed);
    } else {
      simulateNormalResponse();
    }
  }, [input, isGenerating, deepThinking, scrollToBottom, simulateDeepThinking, simulateNormalResponse]);

  const handleStopGenerating = useCallback(() => {
    clearThinkingTimers();
    setIsGenerating(false);
    setCurrentThinkingSteps([]);
    setThinkingTime(0);
    showToast('已停止生成', 'info');
  }, [clearThinkingTimers, showToast]);

  const handleCopy = useCallback(
    (messageId: string, content: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, copied: true } : m)),
      );
      showToast('已复制到剪贴板', 'success');
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, copied: false } : m)),
        );
      }, 2000);
    },
    [showToast],
  );

  const handleLike = useCallback((messageId: string, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const newLiked = m.liked === type ? null : type;
        return { ...m, liked: newLiked };
      }),
    );
  }, []);

  const handleRegenerate = useCallback(
    (messageId: string) => {
      if (isGenerating) return;

      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex < 0) return;

      const userMsgIndex = msgIndex - 1;
      if (userMsgIndex < 0 || messages[userMsgIndex].role !== 'user') return;

      setMessages((prev) => prev.slice(0, msgIndex));
      setIsGenerating(true);
      scrollToBottom();

      if (deepThinking) {
        simulateDeepThinking(messages[userMsgIndex].content);
      } else {
        simulateNormalResponse();
      }
    },
    [messages, isGenerating, deepThinking, scrollToBottom, simulateDeepThinking, simulateNormalResponse],
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      showToast('消息已删除', 'info');
    },
    [showToast],
  );

  const toggleThinkingExpanded = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, thinkingExpanded: !m.thinkingExpanded } : m,
      ),
    );
  }, []);

  const handleQuickAction = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  const renderThinkingPanel = (message: Message) => {
    if (!message.deepThinking || !message.thinkingSteps) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleThinkingExpanded(message.id)}
        className="mb-2"
      >
        <View className="flex-row items-center py-1.5 px-1">
          {message.thinkingExpanded ? (
            <ChevronDown size={14} color="#6B7280" />
          ) : (
            <ChevronRight size={14} color="#6B7280" />
          )}
          <Brain size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
          <Text className="text-xs text-text-secondary ml-1 font-medium">
            深度思考过程
          </Text>
          <Text className="text-xs text-text-tertiary ml-2">
            {message.thinkingSteps.length} 步
          </Text>
        </View>
        {message.thinkingExpanded && (
          <View className="bg-primary/5 rounded-lg p-3 mt-1 border border-primary/10">
            {message.thinkingSteps.map((step, idx) => (
              <View key={idx} className="flex-row items-start mb-1.5 last:mb-0">
                <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center mr-2 mt-0.5">
                  <Text className="text-[10px] text-primary font-bold">{idx + 1}</Text>
                </View>
                <Text className="text-xs text-text-secondary flex-1 leading-4">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessageActions = (message: Message) => {
    if (message.role !== 'assistant') return null;

    return (
      <View className="flex-row items-center mt-1.5 gap-1">
        <TouchableOpacity
          onPress={() => handleCopy(message.id, message.content)}
          className="w-7 h-7 items-center justify-center rounded-md"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          {message.copied ? (
            <Check size={14} color="#10B981" />
          ) : (
            <Copy size={14} color="#9CA3AF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLike(message.id, 'up')}
          className="w-7 h-7 items-center justify-center rounded-md"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <ThumbsUp
            size={14}
            color={message.liked === 'up' ? '#3B82F6' : '#9CA3AF'}
            fill={message.liked === 'up' ? '#3B82F6' : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLike(message.id, 'down')}
          className="w-7 h-7 items-center justify-center rounded-md"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <ThumbsDown
            size={14}
            color={message.liked === 'down' ? '#EF4444' : '#9CA3AF'}
            fill={message.liked === 'down' ? '#EF4444' : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRegenerate(message.id)}
          className="w-7 h-7 items-center justify-center rounded-md"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <RotateCcw size={14} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(message.id)}
          className="w-7 h-7 items-center justify-center rounded-md"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Trash2 size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = (message: Message) => {
    if (message.role === 'user') {
      return (
        <View key={message.id} className="flex-row justify-end mb-4 px-4">
          <View className="max-w-[80%] bg-user-bubble rounded-2xl rounded-br-sm px-4 py-3">
            <Text className="text-sm text-text-primary leading-5">
              {message.content}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View key={message.id} className="flex-row mb-4 px-4">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2 mt-0.5">
          <Sparkles size={14} color="#3B82F6" />
        </View>
        <View className="max-w-[85%] flex-1">
          {renderThinkingPanel(message)}
          <View className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-border-light">
            <Text className="text-sm text-text-primary leading-5">
              {message.content}
            </Text>
          </View>
          {message.model && (
            <Text className="text-[10px] text-text-tertiary mt-1 ml-1">
              {message.model}
            </Text>
          )}
          {renderMessageActions(message)}
        </View>
      </View>
    );
  };

  const renderThinkingIndicator = () => {
    if (!isGenerating || !deepThinking || currentThinkingSteps.length === 0) return null;

    return (
      <View className="flex-row mb-4 px-4">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2 mt-0.5">
          <Sparkles size={14} color="#3B82F6" />
        </View>
        <View className="max-w-[85%] flex-1">
          <View className="flex-row items-center mb-2">
            <Brain size={14} color="#3B82F6" />
            <Text className="text-xs text-primary font-medium ml-1.5">
              深度思考中...
            </Text>
            <Text className="text-xs text-text-tertiary ml-2">
              {thinkingTime}s
            </Text>
          </View>
          <View className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            {currentThinkingSteps.map((step, idx) => (
              <View key={idx} className="flex-row items-start mb-1.5 last:mb-0">
                <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center mr-2 mt-0.5">
                  <Text className="text-[10px] text-primary font-bold">{idx + 1}</Text>
                </View>
                <Text className="text-xs text-text-secondary flex-1 leading-4">
                  {step}
                </Text>
                {idx === currentThinkingSteps.length - 1 && (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1 mt-1.5" />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderGeneratingIndicator = () => {
    if (!isGenerating || deepThinking) return null;

    return (
      <View className="flex-row mb-4 px-4">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2 mt-0.5">
          <Sparkles size={14} color="#3B82F6" />
        </View>
        <View className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-border-light">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <Text className="text-sm text-text-tertiary ml-2">正在生成回复...</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWelcomeScreen = () => {
    if (messages.length > 0 || isGenerating) return null;

    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
          <Sparkles size={32} color="#3B82F6" />
        </View>
        <Text className="text-xl font-bold text-text-primary mb-1">
          你好，有什么可以帮你的？
        </Text>
        <Text className="text-sm text-text-tertiary mb-8 text-center">
          选择下方快捷操作，或直接输入你的问题
        </Text>
        <View className="flex-row flex-wrap justify-center gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => handleQuickAction(action.prompt)}
              className="flex-row items-center bg-surface-secondary border border-border-light rounded-xl px-3 py-2.5"
              activeOpacity={0.7}
            >
              <action.icon size={16} color="#3B82F6" />
              <Text className="text-xs text-text-secondary ml-1.5 font-medium">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuickChips = () => {
    if (messages.length === 0 || isGenerating) return null;

    return (
      <View className="px-4 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => handleQuickAction(action.prompt)}
                className="flex-row items-center bg-surface-secondary border border-border-light rounded-full px-3 py-1.5"
                activeOpacity={0.7}
              >
                <action.icon size={12} color="#3B82F6" />
                <Text className="text-[11px] text-text-secondary ml-1">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      className="bg-surface-secondary"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-3 py-2.5 bg-surface border-b border-border">
          <TouchableOpacity
            onPress={onToggleSidebar}
            className="w-9 h-9 items-center justify-center rounded-lg"
            activeOpacity={0.7}
          >
            <Menu size={20} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-success mr-1.5" />
            <Text className="text-sm font-semibold text-text-primary">
              OmniAI 3B
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleNewChat}
              className="w-9 h-9 items-center justify-center rounded-lg"
              activeOpacity={0.7}
            >
              <Plus size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="w-9 h-9 items-center justify-center rounded-lg"
              activeOpacity={0.7}
            >
              <MoreHorizontal size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {messages.length > 0 || isGenerating ? (
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={scrollToBottom}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => renderMessage(msg))}
            {renderThinkingIndicator()}
            {renderGeneratingIndicator()}
          </ScrollView>
        ) : (
          renderWelcomeScreen()
        )}

        {renderQuickChips()}

        {deepThinking && (
          <View className="flex-row items-center px-4 pb-1.5">
            <Brain size={12} color="#3B82F6" />
            <Text className="text-[11px] text-primary ml-1">
              深度思考模式已开启，AI 将进行更深入的分析推理
            </Text>
          </View>
        )}

        <View className="flex-row items-end px-3 pb-3 pt-1.5 bg-surface border-t border-border">
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center rounded-lg mb-0.5"
            activeOpacity={0.7}
          >
            <Paperclip size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="flex-1 mx-1.5">
            <TextInput
              className="bg-surface-secondary border border-border rounded-2xl px-4 py-2.5 text-sm text-text-primary max-h-28"
              placeholder="输入消息..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={4000}
              editable={!isGenerating}
            />
          </View>

          <TouchableOpacity
            onPress={() => setDeepThinking(!deepThinking)}
            className={`w-9 h-9 items-center justify-center rounded-lg mb-0.5 ${deepThinking ? 'bg-primary/10' : ''}`}
            activeOpacity={0.7}
          >
            <Brain
              size={18}
              color={deepThinking ? '#3B82F6' : '#9CA3AF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-9 h-9 items-center justify-center rounded-lg mb-0.5"
            activeOpacity={0.7}
          >
            <Mic size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {isGenerating ? (
            <TouchableOpacity
              onPress={handleStopGenerating}
              className="w-9 h-9 items-center justify-center rounded-lg bg-danger/10 mb-0.5"
              activeOpacity={0.7}
            >
              <Square size={16} color="#EF4444" fill="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim()}
              className={`w-9 h-9 items-center justify-center rounded-lg mb-0.5 ${input.trim() ? 'bg-primary' : 'bg-surface-tertiary'}`}
              activeOpacity={0.7}
            >
              <Send
                size={16}
                color={input.trim() ? '#FFFFFF' : '#9CA3AF'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
