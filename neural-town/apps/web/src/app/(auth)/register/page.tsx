'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES_META } from '@neural-town/shared';
import type { UserRole } from '@neural-town/shared';

const ROLE_CATEGORIES = [
  { label: '设计师', roles: ['graphic_designer', 'uiux_designer', 'interior_designer', 'industrial_designer', 'fashion_designer', 'motion_designer', 'aigc_director'] },
  { label: '开发者', roles: ['frontend_dev', 'backend_dev', 'ai_ml_dev', 'fullstack_dev', 'devops_sre', 'mobile_dev', 'data_engineer', 'security_dev', 'web3_dev'] },
  { label: '其他', roles: ['pm', 'beginner', 'enthusiast', 'normal'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['normal']);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      toast.error('请至少选择一个角色');
      return;
    }
    try {
      await register(username, email, password, selectedRoles);
      toast.success('欢迎登上母舰！');
      router.push('/community');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <CosmicCard glow padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-gradient">注册成为舰员</h1>
          <p className="text-sm text-white/50 mt-2">选择你的角色，登上专属舰桥</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">用户名</label>
            <input
              type="text"
              className="cosmic-input"
              placeholder="舰员代号（3-30字符）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">邮箱</label>
            <input
              type="email"
              className="cosmic-input"
              placeholder="你的星际通讯地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">密码</label>
            <input
              type="password"
              className="cosmic-input"
              placeholder="跃迁密钥（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {/* 角色选择星图 */}
          <div>
            <label className="block text-sm text-white/60 mb-3">
              选择角色（可多选，选择一个角色创建一个专属工作台）
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ROLE_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs text-white/40 font-mono mb-2">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.roles.map((roleKey) => {
                      const meta = ROLES_META[roleKey as UserRole];
                      if (!meta) return null;
                      const isSelected = selectedRoles.includes(roleKey as UserRole);
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => toggleRole(roleKey as UserRole)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                            isSelected
                              ? 'border-nebulae-purple bg-nebulae-purple/20 text-white'
                              : 'border-white/10 text-white/50 hover:border-white/30'
                          }`}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CosmicButton type="submit" className="w-full" isLoading={isLoading}>
            登上母舰
          </CosmicButton>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          已有舰员身份？{' '}
          <Link href="/login" className="text-nebulae-purple hover:text-ai-blue transition-colors">
            登入母舰
          </Link>
        </p>
      </CosmicCard>
    </motion.div>
  );
}