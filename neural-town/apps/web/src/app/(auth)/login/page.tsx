'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('欢迎回到母舰！');
      router.push('/community');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <CosmicCard glow padding="lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-nebulae-purple to-ai-blue flex items-center justify-center">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gradient">登入 Neural Town</h1>
          <p className="text-sm text-white/50 mt-2">欢迎回到你的星舰舰桥</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">用户名</label>
            <input
              type="text"
              className="cosmic-input"
              placeholder="输入你的舰员代号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">密码</label>
            <input
              type="password"
              className="cosmic-input"
              placeholder="输入跃迁密钥"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <CosmicButton type="submit" className="w-full" isLoading={isLoading}>
            启动跃迁引擎
          </CosmicButton>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          还没有舰员身份？{' '}
          <Link href="/register" className="text-nebulae-purple hover:text-ai-blue transition-colors">
            注册成为舰员
          </Link>
        </p>
      </CosmicCard>
    </motion.div>
  );
}