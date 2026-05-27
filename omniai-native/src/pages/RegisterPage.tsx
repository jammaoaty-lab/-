import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Sparkles, Check } from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface RegisterPageProps {
  onBack: () => void;
  onGoLogin: () => void;
  onRegister: () => void;
}

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: '弱' };
  if (score === 2) return { score: 2, label: '一般' };
  if (score === 3) return { score: 3, label: '较强' };
  return { score: 4, label: '强' };
};

const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

const socialButtons = [
  { name: 'QQ', bg: 'bg-[#12B7F5]', label: 'QQ' },
  { name: '微信', bg: 'bg-[#07C160]', label: '微信' },
  { name: '抖音', bg: 'bg-[#161823]', label: '抖音' },
  { name: 'Google', bg: 'bg-[#EA4335]', label: 'Google' },
];

export default function RegisterPage({ onBack, onGoLogin, onRegister }: RegisterPageProps) {
  const { showToast } = useToast();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('请输入有效的邮箱地址');
    } else {
      setEmailError('');
    }
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async () => {
    if (!nickname.trim()) {
      showToast('请输入昵称', 'info');
      return;
    }
    if (!email.trim() || emailError) {
      showToast('请输入有效的邮箱地址', 'info');
      return;
    }
    if (!password) {
      showToast('请输入密码', 'info');
      return;
    }
    if (!agreed) {
      showToast('请先同意服务条款和隐私政策', 'info');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      onRegister();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center mb-6">
            <ArrowLeft size={24} color="#1A1D23" />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-4">
              <Sparkles size={32} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-1">创建账号</Text>
            <Text className="text-sm text-text-secondary">开始你的 AI 之旅</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="flex-row items-center bg-surface-secondary rounded-xl px-4 h-14">
              <User size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-text-primary"
                placeholder="昵称"
                placeholderTextColor="#9CA3AF"
                value={nickname}
                onChangeText={setNickname}
              />
            </View>

            <View>
              <View className="flex-row items-center bg-surface-secondary rounded-xl px-4 h-14">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary"
                  placeholder="邮箱"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={validateEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? (
                <Text className="text-danger text-xs mt-1 ml-1">{emailError}</Text>
              ) : null}
            </View>

            <View>
              <View className="flex-row items-center bg-surface-secondary rounded-xl px-4 h-14">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-text-primary"
                  placeholder="密码"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View className="mt-3">
                  <View className="flex-row gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className="flex-1 h-1.5 rounded-full"
                        style={{
                          backgroundColor: i <= strength.score ? strengthColors[strength.score] : '#E5E7EB',
                        }}
                      />
                    ))}
                  </View>
                  <Text
                    className="text-xs"
                    style={{ color: strengthColors[strength.score] }}
                  >
                    密码强度：{strength.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center mb-6"
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View
              className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${
                agreed ? 'bg-primary border-primary' : 'border-border bg-white'
              }`}
            >
              {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text className="text-sm text-text-secondary flex-1">
              我已阅读并同意{' '}
              <Text className="text-primary">服务条款</Text>
              {' '}和{' '}
              <Text className="text-primary">隐私政策</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-14 rounded-xl items-center justify-center mb-6 ${
              loading ? 'bg-primary/60' : 'bg-primary'
            }`}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? '注册中...' : '注册'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-xs text-text-tertiary">其他方式注册</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="flex-row justify-center gap-4 mb-8">
            {socialButtons.map((btn) => (
              <TouchableOpacity
                key={btn.name}
                className={`${btn.bg} w-14 h-14 rounded-xl items-center justify-center`}
                onPress={() => showToast(`${btn.label}注册功能即将上线`, 'info')}
                activeOpacity={0.7}
              >
                <Text className="text-white text-xs font-semibold">{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row justify-center">
            <Text className="text-sm text-text-secondary">已有账号？</Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text className="text-sm text-primary font-semibold ml-1">登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
