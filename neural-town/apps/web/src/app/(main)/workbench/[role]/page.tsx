'use client';
/**
 * @file 工作台详情页（占位 - 各工作台详细实现后续扩展）
 */

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES_META } from '@neural-town/shared';
import type { UserRole } from '@neural-town/shared';

export default function WorkbenchDetailPage() {
  const params = useParams();
  const roleKey = params.role as string;
  const { user } = useAuthStore();

  const meta = ROLES_META[roleKey as UserRole];

  if (!meta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/50">未知的工作台类型</p>
      </div>
    );
  }

  const isUserRole = user?.roleTags?.includes(roleKey as UserRole);

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 工作台头部 */}
        <CosmicCard padding="lg" glow className="mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{meta.icon}</div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient">{meta.workbenchName}</h1>
              <p className="text-white/50 mt-1">{meta.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{meta.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{meta.labelEn}</span>
              </div>
            </div>

            {isUserRole ? (
              <CosmicButton variant="secondary" size="sm" className="ml-auto">
                进入工作台
              </CosmicButton>
            ) : (
              <CosmicButton size="sm" className="ml-auto">
                添加此角色
              </CosmicButton>
            )}
          </div>
        </CosmicCard>

        {/* 工作台核心功能预览 */}
        <CosmicCard padding="lg">
          <h2 className="text-xl font-display font-semibold mb-4">工作台能力</h2>
          <p className="text-white/50 mb-4">
            {meta.category === 'designer' && '可视化创作、AI 辅助生成、一键发布到社区。'}
            {meta.category === 'developer' && '可视化节点编排、AI 代码生成、实时预览。'}
            {meta.category === 'other' && '专属工具、AI 辅助、学习成长。'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'AI 生成', desc: '通过提示词快速生成内容' },
              { title: '可视化编辑', desc: '拖拽式操作，所见即所得' },
              { title: '社区发布', desc: '一键发布作品到社区星云' },
            ].map((f) => (
              <CosmicCard key={f.title} padding="sm" hoverable>
                <h3 className="font-medium text-white text-sm">{f.title}</h3>
                <p className="text-xs text-white/40 mt-1">{f.desc}</p>
              </CosmicCard>
            ))}
          </div>
        </CosmicCard>
      </motion.div>
    </div>
  );
}