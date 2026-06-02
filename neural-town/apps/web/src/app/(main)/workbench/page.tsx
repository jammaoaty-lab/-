'use client';
/**
 * @file 工作台总览页面 - 角色专属工作台入口
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { ROLES_META } from '@neural-town/shared';
import type { UserRole } from '@neural-town/shared';

export default function WorkbenchIndexPage() {
  const { user, isAuthenticated } = useAuthStore();

  const userRoles = (user?.roleTags || []) as UserRole[];
  const userWorkbenches = userRoles
    .filter((r) => r !== 'normal')
    .map((r) => ROLES_META[r])
    .filter(Boolean);

  // 分类展示所有工作台
  const categories = [
    {
      title: '设计师创意室',
      icon: '🎨',
      roles: ['graphic_designer', 'uiux_designer', 'interior_designer', 'industrial_designer', 'fashion_designer', 'motion_designer', 'aigc_director'],
    },
    {
      title: '开发者星舰',
      icon: '💻',
      roles: ['frontend_dev', 'backend_dev', 'ai_ml_dev', 'fullstack_dev', 'devops_sre', 'mobile_dev', 'data_engineer', 'security_dev', 'web3_dev'],
    },
    {
      title: '其他舱室',
      icon: '📊',
      roles: ['pm', 'beginner', 'enthusiast'],
    },
  ];

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-gradient mb-2">工作台舰桥</h1>
      <p className="text-sm text-white/50 mb-8">选择你的专业工作台，开始创造之旅</p>

      {isAuthenticated && userWorkbenches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-display font-semibold mb-4 text-white/80">⬡ 我的舰桥</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWorkbenches.map((meta) => {
              if (!meta) return null;
              return (
                <Link key={meta.key} href={`/workbench/${meta.key}`}>
                  <CosmicCard padding="md" hoverable className="h-full">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{meta.icon}</span>
                      <div>
                        <h3 className="font-display font-semibold text-white">{meta.workbenchName}</h3>
                        <p className="text-xs text-white/50 mt-1">{meta.description}</p>
                      </div>
                    </div>
                  </CosmicCard>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 所有工作台分类 */}
      {categories.map((cat) => (
        <div key={cat.title} className="mb-8">
          <h2 className="text-lg font-display font-semibold mb-4 text-white/80">
            {cat.icon} {cat.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.roles.map((roleKey) => {
              const meta = ROLES_META[roleKey as UserRole];
              if (!meta) return null;
              const isMine = userRoles.includes(roleKey as UserRole);
              return (
                <Link key={roleKey} href={`/workbench/${roleKey}`}>
                  <CosmicCard padding="md" hoverable glow={isMine} className="h-full">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{meta.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-white">{meta.workbenchName}</h3>
                          {isMine && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nebulae-purple/20 text-nebulae-purple">
                              已选定
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1">{meta.description}</p>
                        <p className="text-xs text-white/40 mt-2">{meta.label} · {meta.labelEn}</p>
                      </div>
                    </div>
                  </CosmicCard>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}