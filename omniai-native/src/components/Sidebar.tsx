import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Plus, MessageSquare, Search, Trash2 } from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface Conversation {
  id: string;
  title: string;
  time: string;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: '1', title: 'Python 数据分析脚本', time: '2分钟前' },
  { id: '2', title: 'React 组件优化方案', time: '15分钟前' },
  { id: '3', title: '机器学习模型调参', time: '1小时前' },
  { id: '4', title: 'API 接口设计讨论', time: '3小时前' },
  { id: '5', title: '数据库架构优化', time: '昨天' },
];

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.8;

export default function Sidebar({ visible, onClose, onNavigate }: SidebarProps) {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewConversation = () => {
    const newId = String(Date.now());
    const newConvo: Conversation = {
      id: newId,
      title: '新对话',
      time: '刚刚',
    };
    setConversations((prev) => [newConvo, ...prev]);
    setActiveId(newId);
    showToast('已创建新对话');
  };

  const handleDelete = (id: string) => {
    if (pendingDeleteId === id) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setPendingDeleteId(null);
      if (activeId === id) {
        setActiveId(conversations.find((c) => c.id !== id)?.id ?? '');
      }
      showToast('对话已删除');
    } else {
      setPendingDeleteId(id);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <Animated.View
          style={{
            opacity: backdropAnim,
          }}
          className="flex-1 bg-black/50"
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
          }}
          className="absolute left-0 top-0 bottom-0"
        >
          <View
            className="bg-surface h-full"
            style={{ width: SIDEBAR_WIDTH }}
          >
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border-light">
              <Text className="text-lg font-semibold text-text-primary">对话</Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleNewConversation}
                  className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
                  activeOpacity={0.7}
                >
                  <Plus size={16} color="#3B82F6" />
                  <Text className="text-primary text-sm font-medium">新建对话</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} className="p-1.5" activeOpacity={0.7}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-3 py-3">
              <View className="flex-row items-center bg-surface-tertiary rounded-xl px-3 py-2.5">
                <Search size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-sm text-text-primary"
                  placeholder="搜索对话..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
              {filteredConversations.map((convo) => {
                const isActive = convo.id === activeId;
                const isPendingDelete = convo.id === pendingDeleteId;

                return (
                  <TouchableOpacity
                    key={convo.id}
                    onPress={() => handleSelectConversation(convo.id)}
                    onLongPress={() => handleDelete(convo.id)}
                    activeOpacity={0.7}
                    className={`flex-row items-center rounded-xl px-3 py-3 mb-1 ${
                      isActive ? 'bg-primary/10' : 'bg-transparent'
                    }`}
                  >
                    <MessageSquare
                      size={18}
                      color={isActive ? '#3B82F6' : '#9CA3AF'}
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className={`text-sm font-medium ${
                          isActive ? 'text-primary' : 'text-text-primary'
                        }`}
                        numberOfLines={1}
                      >
                        {convo.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary mt-0.5">{convo.time}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(convo.id)}
                      className="p-2 -mr-1"
                      activeOpacity={0.7}
                    >
                      {isPendingDelete ? (
                        <Text className="text-xs text-danger font-medium">确认?</Text>
                      ) : (
                        <Trash2 size={16} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
              {filteredConversations.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-sm text-text-tertiary">没有找到对话</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
