'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 区块链节点类型 ───
const BLOCKCHAIN_NODE_TYPES: Record<string, { color: string; icon: string }> = {
  'validator': { color: '#FFD166', icon: '⛏️' },
  'full_node': { color: '#00E5FF', icon: '🖥️' },
  'light_node': { color: '#00F2A9', icon: '📱' },
  'oracle': { color: '#E040FB', icon: '🔮' },
  'bridge': { color: '#FF9100', icon: '🌉' },
  'dapp': { color: '#6C5CE7', icon: '🧩' },
};

// ─── 初始区块链网络节点 ───
const INITIAL_BLOCKCHAIN_NODES = [
  { id: 'v1', label: 'Validator Alpha', type: 'validator', x: 400, y: 30, width: 150, height: 50 },
  { id: 'v2', label: 'Validator Beta', type: 'validator', x: 200, y: 200, width: 150, height: 50 },
  { id: 'v3', label: 'Validator Gamma', type: 'validator', x: 600, y: 200, width: 150, height: 50 },
  { id: 'fn1', label: 'Full Node #1', type: 'full_node', x: 60, y: 400, width: 140, height: 50 },
  { id: 'fn2', label: 'Full Node #2', type: 'full_node', x: 350, y: 420, width: 140, height: 50 },
  { id: 'fn3', label: 'Full Node #3', type: 'full_node', x: 650, y: 400, width: 140, height: 50 },
  { id: 'ln1', label: 'Light Client A', type: 'light_node', x: 50, y: 600, width: 140, height: 50 },
  { id: 'ln2', label: 'Light Client B', type: 'light_node', x: 650, y: 600, width: 140, height: 50 },
  { id: 'oracle1', label: 'Chainlink Oracle', type: 'oracle', x: 850, y: 200, width: 160, height: 50 },
  { id: 'bridge1', label: 'Polygon Bridge', type: 'bridge', x: 850, y: 400, width: 150, height: 50 },
  { id: 'dapp1', label: 'Uniswap DApp', type: 'dapp', x: 400, y: 620, width: 150, height: 50 },
];

// ─── 初始区块链网络连线 ───
const INITIAL_BLOCKCHAIN_CONNS = [
  { id: 'bc1', from: 'v1', to: 'v2' },
  { id: 'bc2', from: 'v1', to: 'v3' },
  { id: 'bc3', from: 'v2', to: 'v3' },
  { id: 'bc4', from: 'v2', to: 'fn1' },
  { id: 'bc5', from: 'v1', to: 'fn2' },
  { id: 'bc6', from: 'v3', to: 'fn3' },
  { id: 'bc7', from: 'fn1', to: 'fn2' },
  { id: 'bc8', from: 'fn2', to: 'fn3' },
  { id: 'bc9', from: 'fn1', to: 'ln1' },
  { id: 'bc10', from: 'fn3', to: 'ln2' },
  { id: 'bc11', from: 'v3', to: 'oracle1' },
  { id: 'bc12', from: 'fn3', to: 'bridge1' },
  { id: 'bc13', from: 'fn2', to: 'dapp1' },
];

// ─── ERC-20 合约模板 ───
const ERC20_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NeuralToken - Neural Town 生态代币
/// @notice 标准 ERC-20 代币合约，支持铸造和销毁
contract NeuralToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("NeuralToken", "NEURAL") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10**18); // 初始铸造 1 亿枚
    }

    /// @notice 铸造新代币（仅所有者）
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /// @notice 销毁代币
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}`;

// ─── DApp 模板数据 ───
interface DAppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  difficulty: '入门' | '中级' | '高级';
}

const DAPP_TEMPLATES: DAppTemplate[] = [
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    description: '去中心化 NFT 交易市场，支持铸造、上架、竞价、版税',
    icon: '🎨',
    tags: ['Solidity', 'ERC-721', 'IPFS', 'ethers.js', 'React'],
    difficulty: '中级',
  },
  {
    id: 'defi-lending',
    name: 'DeFi 借贷协议',
    description: '超额抵押借贷协议，支持存借双市场，Aave 风格架构',
    icon: '🏦',
    tags: ['Solidity', 'ERC-4626', 'Price Oracle', 'Hardhat', 'TypeScript'],
    difficulty: '高级',
  },
  {
    id: 'dao-governance',
    name: 'DAO 治理',
    description: '链上治理系统：提案创建、代币投票、时间锁执行',
    icon: '🏛️',
    tags: ['Solidity', 'Governor', 'ERC-20Votes', 'OpenZeppelin', 'hardhat-deploy'],
    difficulty: '中级',
  },
  {
    id: 'cross-chain-bridge',
    name: '跨链桥',
    description: '多签验证跨链资产桥，支持 ERC-20 在 Ethereum ↔ Polygon 间转移',
    icon: '🌉',
    tags: ['Solidity', 'MultiSig', 'LayerZero', 'Foundry', 'Chainlink CCIP'],
    difficulty: '高级',
  },
];

// ─── 热门 Web3 库 ───
interface Web3Library {
  name: string;
  version: string;
  category: string;
  downloads: string;
}

const POPULAR_LIBRARIES: Web3Library[] = [
  { name: 'ethers.js', version: 'v6.13.4', category: '交互库', downloads: '4.8M/周' },
  { name: 'viem', version: 'v2.21.0', category: '交互库', downloads: '2.1M/周' },
  { name: 'Hardhat', version: 'v2.22.0', category: '开发框架', downloads: '1.2M/周' },
  { name: 'Foundry', version: 'v0.3.0', category: '开发框架', downloads: '890K/周' },
  { name: 'OpenZeppelin', version: 'v5.1.0', category: '合约库', downloads: '3.5M/周' },
  { name: 'wagmi', version: 'v2.14.0', category: 'React Hooks', downloads: '1.6M/周' },
  { name: 'RainbowKit', version: 'v2.2.0', category: '钱包连接', downloads: '950K/周' },
  { name: 'The Graph', version: 'v0.35.0', category: '数据索引', downloads: '420K/周' },
];

export default function Web3DevPage() {
  const meta = ROLES_META.web3_dev;
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<'contract' | 'topology' | 'templates'>('contract');

  const handleCompile = useCallback(() => {
    toast.loading('编译合约中...', { id: 'compile' });
    setTimeout(() => toast.success('✅ 编译成功 | 合约大小: 8.45 KB | Gas 估算: 1,234,567', { id: 'compile' }), 1500);
  }, []);

  const handleDeploy = useCallback(() => {
    toast.loading('部署到 Sepolia 测试网...', { id: 'deploy' });
    setTimeout(() => toast.success('🚀 已部署到 Sepolia: 0x742d...3a9F', { id: 'deploy' }), 2000);
  }, []);

  const handleAudit = useCallback(() => {
    toast.loading('安全审计中...', { id: 'audit' });
    setTimeout(() => toast.success('🔍 审计完成 | 严重: 0 | 警告: 1 | 建议: 3', { id: 'audit' }), 1800);
  }, []);

  const handleCreateFromTemplate = useCallback((templateName: string) => {
    toast.loading(`从「${templateName}」模板创建项目...`, { id: 'create-dapp' });
    setTimeout(() => toast.success(`✅「${templateName}」项目已创建，已推送到 #dev 频道`, { id: 'create-dapp' }), 1600);
  }, []);

  const getNodeDetailInfo = (node: { type: string; label: string }) => {
    const nodeType = BLOCKCHAIN_NODE_TYPES[node.type as keyof typeof BLOCKCHAIN_NODE_TYPES];
    const details: Record<string, { peers: number; blockHeight: number; uptime: string }> = {
      'validator': { peers: 128, blockHeight: 18472653, uptime: '99.97%' },
      'full_node': { peers: 64, blockHeight: 18472653, uptime: '99.82%' },
      'light_node': { peers: 12, blockHeight: 18472653, uptime: '98.45%' },
      'oracle': { peers: 32, blockHeight: 18472653, uptime: '99.91%' },
      'bridge': { peers: 48, blockHeight: 18472653, uptime: '99.74%' },
      'dapp': { peers: 0, blockHeight: 18472653, uptime: '99.99%' },
    };
    const info = details[node.type] || { peers: 0, blockHeight: 0, uptime: 'N/A' };
    return { ...info, icon: nodeType?.icon || '⬡', color: nodeType?.color || '#6C5CE7' };
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80 shrink-0">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {(['contract', 'topology', 'templates'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activeSection === s
                  ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {s === 'contract' && '📝 智能合约工坊'}
              {s === 'topology' && '🌐 网络拓扑'}
              {s === 'templates' && '📦 DApp 模板库'}
            </button>
          ))}
          <CosmicButton size="sm" onClick={() => toast.success('发布到 #dev 频道')}>
            发布
          </CosmicButton>
        </div>
      </div>

      {/* ─── 内容区 ─── */}
      <div className="flex-1 overflow-hidden">
        {/* ═══════════════════════════════════════════════ */}
        {/* Section 1 - 智能合约工坊 */}
        {/* ═══════════════════════════════════════════════ */}
        {activeSection === 'contract' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full overflow-hidden"
          >
            {/* 左侧：代码编辑器 */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-cosmic-border bg-space-card/40 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-mono text-white/40">NeuralToken.sol</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFD166]/20 text-[#FFD166] font-mono">
                  Solidity ^0.8.20
                </span>
              </div>

              <div className="flex-1 overflow-auto bg-[#0a0a14] p-4">
                <pre className="text-xs leading-relaxed font-mono">
                  <code className="text-green-400">{ERC20_TEMPLATE}</code>
                </pre>
              </div>

              {/* 操作按钮行 */}
              <div className="flex items-center gap-3 px-4 py-3 border-t border-cosmic-border bg-space-card/60 shrink-0">
                <CosmicButton size="sm" onClick={handleCompile}>
                  ⚙️ 编译
                </CosmicButton>
                <CosmicButton size="sm" variant="secondary" onClick={handleDeploy}>
                  🚀 部署到测试网
                </CosmicButton>
                <CosmicButton size="sm" variant="ghost" onClick={handleAudit}>
                  🔍 安全审计
                </CosmicButton>
                <div className="flex-1" />
                <span className="text-[10px] text-white/30">Sepolia Testnet</span>
              </div>
            </div>

            {/* 右侧：指标面板 */}
            <div className="w-64 border-l border-cosmic-border bg-space-card/30 p-4 flex flex-col gap-4 shrink-0 overflow-auto">
              <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">合约指标</h3>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-[10px] text-white/40">Gas 估算</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-display text-[#FFD166]">1,234,567</span>
                  <span className="text-[10px] text-white/30 mb-1">wei</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#FFD166]" style={{ width: '45%' }} />
                </div>
                <p className="text-[9px] text-white/30">区块 Gas 上限: 30,000,000</p>
              </div>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-[10px] text-white/40">合约大小</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-display text-[#00E5FF]">8.45</span>
                  <span className="text-[10px] text-white/30 mb-1">KB</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#00E5FF]" style={{ width: '34%' }} />
                </div>
                <p className="text-[9px] text-white/30">合约大小上限: 24.576 KB</p>
              </div>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-[10px] text-white/40">代码行数</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-display text-[#00F2A9]">32</span>
                  <span className="text-[10px] text-white/30 mb-1">行</span>
                </div>
              </div>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-[10px] text-white/40">函数数量</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-display text-[#E040FB]">6</span>
                </div>
                <div className="text-[9px] text-white/30 space-y-0.5">
                  <p>• constructor</p>
                  <p>• mint (write)</p>
                  <p>• burn (write)</p>
                  <p>• transfer (write)</p>
                  <p>• approve (write)</p>
                  <p>• transferFrom (write)</p>
                </div>
              </div>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-[10px] text-white/40">安全评分</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-display text-success-green">85</span>
                  <span className="text-[10px] text-white/30 mb-1">/100</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-success-green" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* Section 2 - 区块链网络拓扑 */}
        {/* ═══════════════════════════════════════════════ */}
        {activeSection === 'topology' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full overflow-hidden"
          >
            {/* 主画布 */}
            <div className="flex-1 relative">
              <FlowCanvas
                nodes={INITIAL_BLOCKCHAIN_NODES}
                connections={INITIAL_BLOCKCHAIN_CONNS}
                nodeTypes={BLOCKCHAIN_NODE_TYPES}
                onSelectNode={setSelectedNode}
              />
            </div>

            {/* 右侧节点详情面板 */}
            {selectedNode && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 260 }}
                className="border-l border-cosmic-border overflow-hidden shrink-0"
              >
                <div className="glass-panel h-full p-3 space-y-3 overflow-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {BLOCKCHAIN_NODE_TYPES[selectedNode.type as keyof typeof BLOCKCHAIN_NODE_TYPES]?.icon}
                    </span>
                    <h3 className="text-sm font-display text-white truncate">{selectedNode.label}</h3>
                  </div>

                  {(() => {
                    const info = getNodeDetailInfo(selectedNode);
                    return (
                      <>
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">节点信息</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-[9px] text-white/30">类型</p>
                              <p className="text-xs text-white/70">{selectedNode.type}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-[9px] text-white/30">对等节点</p>
                              <p className="text-xs text-white/70">{info.peers}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-[9px] text-white/30">区块高度</p>
                              <p className="text-xs text-white/70">{info.blockHeight.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-[9px] text-white/30">在线率</p>
                              <p className="text-xs text-success-green">{info.uptime}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">操作</p>
                          <input
                            className="cosmic-input text-xs h-7 w-full"
                            placeholder="节点名称"
                            defaultValue={selectedNode.label}
                          />
                          <CosmicButton
                            size="sm"
                            className="w-full"
                            onClick={() => toast.success(`节点「${selectedNode.label}」属性已更新`)}
                          >
                            更新属性
                          </CosmicButton>
                          <CosmicButton
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() => toast.success(`已连接到 ${selectedNode.label}`)}
                          >
                            连接到节点
                          </CosmicButton>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* Section 3 - DApp 模板库 */}
        {/* ═══════════════════════════════════════════════ */}
        {activeSection === 'templates' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-auto p-6"
          >
            {/* DApp 模板卡片网格 */}
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">
              🧩 DApp 项目模板
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {DAPP_TEMPLATES.map((tmpl) => (
                <CosmicCard key={tmpl.id} padding="md" hoverable>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{tmpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-display text-white">{tmpl.name}</h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            tmpl.difficulty === '入门'
                              ? 'bg-success-green/20 text-success-green'
                              : tmpl.difficulty === '中级'
                              ? 'bg-[#FFD166]/20 text-[#FFD166]'
                              : 'bg-danger-red/20 text-danger-red'
                          }`}
                        >
                          {tmpl.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">{tmpl.description}</p>
                    </div>
                  </div>

                  {/* 技术标签 */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tmpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <CosmicButton
                    size="sm"
                    className="w-full"
                    onClick={() => handleCreateFromTemplate(tmpl.name)}
                  >
                    🚀 一键创建
                  </CosmicButton>
                </CosmicCard>
              ))}
            </div>

            {/* 热门 Web3 库 */}
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">
              📚 热门 Web3 库 & 工具
            </h3>
            <CosmicCard padding="md">
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-[10px] text-white/30 font-mono uppercase tracking-wider pb-2 border-b border-white/5">
                  <span>库名</span>
                  <span>版本</span>
                  <span>分类</span>
                  <span>下载量</span>
                </div>
                {POPULAR_LIBRARIES.map((lib) => (
                  <div
                    key={lib.name}
                    className="grid grid-cols-4 gap-2 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors items-center"
                  >
                    <span className="text-sm font-mono text-white/80">{lib.name}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#FFD166]/10 text-[#FFD166]">
                      {lib.version}
                    </span>
                    <span className="text-xs text-white/40">{lib.category}</span>
                    <span className="text-xs text-white/30 font-mono">{lib.downloads}</span>
                  </div>
                ))}
              </div>
            </CosmicCard>

            {/* 底部快捷操作 */}
            <div className="mt-6 flex justify-center gap-3">
              <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('Hardhat 项目已初始化')}>
                ⚙️ 初始化 Hardhat
              </CosmicButton>
              <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('Foundry 项目已初始化')}>
                🔨 初始化 Foundry
              </CosmicButton>
              <CosmicButton size="sm" variant="secondary" onClick={() => toast.success('已连接 MetaMask')}>
                🦊 连接钱包
              </CosmicButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}