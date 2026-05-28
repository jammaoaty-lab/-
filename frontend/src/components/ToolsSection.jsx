import React from 'react';
import { Wand2, UserRound, Layers, Clapperboard, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const tools = [
  {
    icon: Wand2,
    title: 'AI编剧',
    description: '自然语言生成完整剧本',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: UserRound,
    title: '角色捏脸',
    description: '自定义你的专属角色',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Layers,
    title: '无限画布',
    description: '自由绘制分镜画面',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clapperboard,
    title: '导演工作台',
    description: '运镜特效一键搞定',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Palette,
    title: '长视频引擎',
    description: '分钟级长视频生成',
    color: 'from-indigo-500 to-violet-500',
  },
];

export default function ToolsSection() {
  return (
    <section className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            一站式AIGC创作工具套件
          </h2>
          <p className="text-slate-400">
            从创意到成片，一站式完成你的漫剧创作
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center hover:border-slate-700 hover:bg-slate-800/50 transition-all">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-400">{tool.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
