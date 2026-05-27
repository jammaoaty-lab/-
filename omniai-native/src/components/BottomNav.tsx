import { View, Text, TouchableOpacity } from 'react-native';
import { MessageSquare, Bot, Database, Cpu, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = [
  { key: 'chat', label: '消息', Icon: MessageSquare },
  { key: 'agent', label: '智能体', Icon: Bot },
  { key: 'knowledge', label: '知识库', Icon: Database },
  { key: 'models', label: '模型', Icon: Cpu },
  { key: 'profile', label: '我的', Icon: User },
] as const;

interface BottomNavProps {
  current: string;
  onNavigate: (page: string) => void;
}

export default function BottomNav({ current, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-border-light flex-row items-start justify-around"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = current === key;
        return (
          <TouchableOpacity
            key={key}
            className="flex-1 items-center pt-2"
            onPress={() => onNavigate(key)}
            activeOpacity={0.7}
          >
            {active && (
              <View className="w-1.5 h-1.5 rounded-full bg-primary mb-1" />
            )}
            {!active && <View className="h-2.5" />}
            <Icon
              size={22}
              color={active ? '#3B82F6' : '#9CA3AF'}
            />
            <Text
              className={`mt-1 text-[10px] ${active ? 'text-primary' : 'text-text-tertiary'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
