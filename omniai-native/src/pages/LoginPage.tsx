import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react-native';
import { useToast } from '../components/Toast';

interface LoginPageProps {
  onBack: () => void;
  onGoRegister: () => void;
  onLogin: () => void;
  onSkip: () => void;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const socialButtons = [
  { label: 'Q', name: 'QQ', color: '#12B7F5' },
  { label: '微', name: '微信', color: '#07C160' },
  { label: '抖', name: '抖音', color: '#161823' },
  { label: 'G', name: 'Google', color: '#4285F4' },
];

export default function LoginPage({ onBack, onGoRegister, onLogin, onSkip }: LoginPageProps) {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = isValidEmail(email) && password.length > 0;

  const handleEmailBlur = () => {
    if (email.length > 0) {
      setEmailError(!isValidEmail(email));
    }
  };

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialPress = (name: string) => {
    showToast(`${name}登录功能即将上线`, 'info');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      className="bg-white"
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 items-center justify-center rounded-full bg-surface-secondary"
            >
              <ArrowLeft size={20} color="#1A1D23" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkip}>
              <Text className="text-text-secondary text-base">跳过</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mb-8">
            <View className="w-14 h-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
              <Sparkles size={28} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-text-primary">OmniAI</Text>
          </View>

          <View className="mb-8">
            <Text className="text-2xl font-bold text-text-primary mb-1">欢迎回来</Text>
            <Text className="text-base text-text-secondary">登录你的 OmniAI 账号</Text>
          </View>

          <View className="mb-4">
            <View
              className={`flex-row items-center rounded-xl border px-4 h-12 ${
                emailError ? 'border-danger' : 'border-border'
              } bg-surface-secondary`}
            >
              <Mail size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-text-primary"
                placeholder="邮箱地址"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(false);
                }}
                onBlur={handleEmailBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError && (
              <Text className="text-danger text-xs mt-1 ml-1">请输入有效的邮箱地址</Text>
            )}
          </View>

          <View className="mb-3">
            <View className="flex-row items-center rounded-xl border border-border bg-surface-secondary px-4 h-12">
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-text-primary"
                placeholder="密码"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                {showPassword ? (
                  <EyeOff size={18} color="#9CA3AF" />
                ) : (
                  <Eye size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="self-end mb-6">
            <Text className="text-primary text-sm">忘记密码？</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={!isFormValid || loading}
            className={`h-12 rounded-xl items-center justify-center ${
              isFormValid ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-semibold">登录</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-text-tertiary text-sm">其他方式登录</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="flex-row justify-center gap-4 mb-8">
            {socialButtons.map((btn) => (
              <TouchableOpacity
                key={btn.name}
                onPress={() => handleSocialPress(btn.name)}
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: `${btn.color}1A` }}
              >
                <Text className="text-base font-semibold" style={{ color: btn.color }}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row justify-center mt-auto">
            <Text className="text-text-secondary text-sm">还没有账号？</Text>
            <TouchableOpacity onPress={onGoRegister}>
              <Text className="text-primary text-sm font-semibold">注册</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
