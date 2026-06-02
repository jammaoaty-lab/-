'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore, type AIPersona } from '@/stores/editor-store';

const PERSONA_CONFIG: Record<AIPersona, { name: string; icon: string; description: string; color: string }> = {
  engineer: {
    name: '星舰工程师',
    icon: '🔧',
    description: '严谨，适合后端/安全',
    color: '#6C5CE7',
  },
  creator: {
    name: '创世者',
    icon: '✨',
    description: '创意，适合前端/ML',
    color: '#00E5FF',
  },
  mentor: {
    name: '导师',
    icon: '🧑‍🏫',
    description: '耐心，适合新手',
    color: '#00F2A9',
  },
};

const AI_SUGGESTIONS = [
  '解释这个组件的作用',
  '优化这段代码的性能',
  '生成单元测试',
  '添加 JSDoc 注释',
  '将这段代码转换为 TypeScript',
  '找出潜在的 bug',
];

export default function AICodeCompanion() {
  const {
    chatMessages, isAIGenerating, aiPersona,
    activeFileId, openFiles,
    addChatMessage, setAIGenerating, setAIPersona,
  } = useEditorStore();

  const [input, setInput] = useState('');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const persona = PERSONA_CONFIG[aiPersona];

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isAIGenerating) return;

    const userMessage = input.trim();
    addChatMessage({ role: 'user', content: userMessage });
    setInput('');
    setAIGenerating(true);

    // Simulate AI response
    const currentFile = activeFile;
    const contextInfo = currentFile
      ? `（当前文件：${currentFile.name}，语言：${currentFile.language}）`
      : '';

    setTimeout(() => {
      let response = '';

      if (userMessage.includes('解释') || userMessage.includes('做什么')) {
        response = `当然！让我来解释一下 ${contextInfo}：\n\n这段代码定义了一个 React 组件，它使用了 \`framer-motion\` 来创建动画效果。主要的逻辑包括：\n\n1. **StarCard 组件** - 可展开的卡片，hover 时有缩放和发光动画\n2. **motion.div** - Framer Motion 的动画容器，提供了 \`whileHover\` 属性\n3. **展开/折叠** - 点击卡片切换 \`isExpanded\` 状态，描述文字高度自动变化\n\n如果你需要我深入解释某个具体部分，请告诉我！`;
      } else if (userMessage.includes('优化') || userMessage.includes('性能')) {
        response = `好的，针对 ${contextInfo} 的性能优化建议：\n\n\`\`\`typescript\n// 1. 使用 React.memo 避免无意义的重渲染\nconst StarCard = React.memo(({ title, description, constellation }: StarCardProps) => {\n  // ...\n});\n\n// 2. 使用 useCallback 稳定回调函数\nconst handleToggle = useCallback(() => {\n  setIsExpanded(prev => !prev);\n}, []);\n\n// 3. 考虑对 stars 数组使用 useMemo\nconst stars = useMemo(() => [\n  // ...star data\n], []);\n\`\`\`\n\n这些优化可以减少不必要的渲染，特别是在列表较长的时候效果明显。`;
      } else if (userMessage.includes('测试') || userMessage.includes('test')) {
        response = `为 StarCard 组件生成测试 ${contextInfo}：\n\n\`\`\`typescript\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport StarCard from './StarCard';\n\ndescribe('StarCard', () => {\n  const defaultProps = {\n    title: '猎户座星云',\n    description: '充满活力的恒星形成区',\n    constellation: '猎户座',\n  };\n\n  it('should render the title', () => {\n    render(<StarCard {...defaultProps} />);\n    expect(screen.getByText('猎户座星云')).toBeInTheDocument();\n  });\n\n  it('should expand on click', () => {\n    render(<StarCard {...defaultProps} />);\n    const card = screen.getByRole('button');\n    fireEvent.click(card);\n    // expect expanded state...\n  });\n});\n\`\`\``;
      } else if (userMessage.includes('注释') || userMessage.includes('doc')) {
        response = `为代码添加 JSDoc/TSDoc 注释 ${contextInfo}：\n\n\`\`\`typescript\n/**\n * 星卡组件 - 展示星云信息的可交互卡片\n * \n * @component\n * @param {Object} props - 组件属性\n * @param {string} props.title - 星云名称\n * @param {string} props.description - 星云描述，支持长文本自动折叠\n * @param {string} props.constellation - 所属星座名称\n * \n * @example\n * <StarCard \n *   title="猎户座星云"\n *   description="..." \n *   constellation="猎户座"\n * />\n */\nfunction StarCard({ title, description, constellation }: StarCardProps) {\n\`\`\``;
      } else {
        response = `收到你的问题！${contextInfo}\n\n根据当前的 \`${activeFile?.name || '文件'}\`，我可以帮你：\n\n- 🔍 **解释代码**：选中代码后右键选择"AI 解释"\n- ⚡ **优化性能**：让 React 组件运行更快\n- 🧪 **生成测试**：为函数自动编写测试用例\n- 📝 **添加注释**：为代码生成完整的文档注释\n- 🔄 **重构建议**：识别代码坏味道并提供改进方案\n\n请告诉我你具体需要什么帮助！`;
      }

      addChatMessage({ role: 'assistant', content: response });
      setAIGenerating(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[2], language: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts.map((part, i) => {
      if (part.type === 'code') {
        return (
          <div key={i} className="my-2 rounded-lg border border-[#2A2F45] overflow-hidden">
            {part.language && (
              <div className="px-3 py-1 bg-[#0A1020] border-b border-[#2A2F45] text-[10px] text-white/40 font-mono">
                {part.language}
              </div>
            )}
            <pre className="p-3 text-xs font-mono text-[#C5CDE0] bg-[#060B1C] overflow-x-auto">
              <code>{part.content}</code>
            </pre>
          </div>
        );
      }
      return (
        <p key={i} className="text-xs leading-relaxed whitespace-pre-wrap">
          {part.content.split('\n').map((line, j) => (
            <span key={j}>
              {line}
              {j < part.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#030614]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1A1F35] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{persona.icon}</span>
          <span className="text-xs font-display text-white/80">AI 星灵伴侣</span>
        </div>

        {/* Persona Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 transition-colors"
            style={{ color: persona.color }}
          >
            {persona.name}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showPersonaMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[#2A2F45] bg-[#0D1020] shadow-xl z-50 overflow-hidden"
              >
                {(Object.entries(PERSONA_CONFIG) as [AIPersona, typeof persona][]).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAIPersona(key);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5 ${
                      aiPersona === key ? 'bg-white/[0.07]' : ''
                    }`}
                  >
                    <span>{p.icon}</span>
                    <div className="text-left">
                      <div style={{ color: p.color }}>{p.name}</div>
                      <div className="text-[10px] text-white/30">{p.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
                style={{ backgroundColor: persona.color + '20' }}
              >
                {persona.icon}
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-[#6C5CE7]/20 border border-[#6C5CE7]/30 text-white/90'
                  : 'bg-white/[0.03] border border-[#2A2F45]/50 text-white/80'
              }`}
            >
              {renderContent(msg.content)}
              <div className="text-[9px] text-white/20 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00E5FF] flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5">
                你
              </div>
            )}
          </div>
        ))}

        {/* AI Generating Indicator */}
        {isAIGenerating && (
          <div className="flex gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 animate-pulse"
              style={{ backgroundColor: persona.color + '20' }}
            >
              {persona.icon}
            </div>
            <div className="bg-white/[0.03] border border-[#2A2F45]/50 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B388FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B388FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B388FF] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestions (when no messages yet) */}
      {chatMessages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-white/30 mb-1.5">试试这些：</p>
          <div className="flex flex-wrap gap-1">
            {AI_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  addChatMessage({ role: 'user', content: suggestion });
                  setAIGenerating(true);
                  setTimeout(() => {
                    addChatMessage({
                      role: 'assistant',
                      content: `好的！我来${suggestion}。\n\n当前文件：${activeFile?.name || '未知'}。\n\n这是一个示例响应，展示 AI 伴侣的工作方式。在实际使用时，这里会显示真实的代码分析和建议。`,
                    });
                    setAIGenerating(false);
                  }, 1200);
                }}
                className="px-2 py-1 rounded-full text-[10px] border border-[#2A2F45]/50 hover:border-[#6C5CE7]/40 hover:bg-[#6C5CE7]/10 transition-colors text-white/50 hover:text-white/80"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[#1A1F35] p-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeFile ? `询问关于 ${activeFile.name} 的问题...` : '询问代码问题...'}
            rows={2}
            className="flex-1 bg-white/[0.03] border border-[#2A2F45] rounded-lg px-3 py-2 text-xs text-white/90 placeholder-white/25 resize-none focus:outline-none focus:border-[#6C5CE7]/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAIGenerating}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: input.trim() ? persona.color + '20' : 'transparent',
              color: input.trim() ? persona.color : '#8899AA',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}