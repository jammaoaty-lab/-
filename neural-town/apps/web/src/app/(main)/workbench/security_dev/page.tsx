'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CosmicCard } from '@/components/cosmic/CosmicCard';
import { CosmicButton } from '@/components/cosmic/CosmicButton';
import { FlowCanvas } from '@/components/workbench/FlowCanvas';
import { ROLES_META } from '@neural-town/shared';
import toast from 'react-hot-toast';

// ─── 类型定义 ───

type SecuritySection = 'scanner' | 'architecture' | 'compliance';

type ScanType = '全面扫描' | 'OWASP Top 10' | 'API安全' | 'SQL注入';

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface Finding {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  remediation: string;
  target: string;
}

interface ComplianceItem {
  id: string;
  name: string;
  framework: string;
  description: string;
  completed: boolean;
}

interface SecurityNodeTypeInfo {
  color: string;
  icon: string;
}

// ─── 常量 ───

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: '严重', color: '#FF1744', bg: 'rgba(255,23,68,0.15)', border: 'rgba(255,23,68,0.4)' },
  high: { label: '高危', color: '#FF9100', bg: 'rgba(255,145,0,0.15)', border: 'rgba(255,145,0,0.4)' },
  medium: { label: '中危', color: '#FFD166', bg: 'rgba(255,209,102,0.15)', border: 'rgba(255,209,102,0.4)' },
  low: { label: '低危', color: '#00F2A9', bg: 'rgba(0,242,169,0.15)', border: 'rgba(0,242,169,0.4)' },
};

const SCAN_TYPES: ScanType[] = ['全面扫描', 'OWASP Top 10', 'API安全', 'SQL注入'];

const SCAN_PHASES = ['初始化扫描引擎', '发现目标资产', '执行漏洞检测', '分析扫描结果', '生成安全报告'];

const SECURITY_NODE_TYPES: Record<string, SecurityNodeTypeInfo> = {
  'waf': { color: '#FF6B6B', icon: '🛡️' },
  'auth': { color: '#6C5CE7', icon: '🔑' },
  'encrypt': { color: '#00E5FF', icon: '🔐' },
  'firewall': { color: '#FF9100', icon: '🔥' },
  'ids': { color: '#FFD166', icon: '👁️' },
  'audit': { color: '#00F2A9', icon: '📋' },
  'vault': { color: '#E040FB', icon: '🔒' },
};

const INITIAL_SECURITY_NODES = [
  { id: 'firewall', label: '防火墙', type: 'firewall', x: 60, y: 30, width: 130, height: 50 },
  { id: 'waf', label: 'WAF', type: 'waf', x: 60, y: 120, width: 130, height: 50 },
  { id: 'ids', label: '入侵检测', type: 'ids', x: 280, y: 75, width: 130, height: 50 },
  { id: 'auth', label: '认证服务', type: 'auth', x: 500, y: 30, width: 130, height: 50 },
  { id: 'encrypt', label: '加密网关', type: 'encrypt', x: 500, y: 120, width: 130, height: 50 },
  { id: 'vault', label: '密钥保险库', type: 'vault', x: 720, y: 30, width: 140, height: 50 },
  { id: 'audit', label: '审计日志', type: 'audit', x: 720, y: 120, width: 130, height: 50 },
];

const INITIAL_SECURITY_CONNS = [
  { id: 'sc1', from: 'firewall', to: 'ids' },
  { id: 'sc2', from: 'waf', to: 'ids' },
  { id: 'sc3', from: 'ids', to: 'auth' },
  { id: 'sc4', from: 'ids', to: 'encrypt' },
  { id: 'sc5', from: 'auth', to: 'vault' },
  { id: 'sc6', from: 'encrypt', to: 'audit' },
  { id: 'sc7', from: 'vault', to: 'audit' },
];

const INITIAL_COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: 'gdpr', name: 'GDPR', framework: '通用数据保护条例', description: '欧盟数据隐私法规合规', completed: false },
  { id: 'soc2', name: 'SOC 2 Type II', framework: '服务组织控制', description: '安全性、可用性、处理完整性、机密性和隐私性', completed: false },
  { id: 'iso27001', name: 'ISO 27001', framework: '信息安全管理体系', description: '国际信息安全标准认证', completed: false },
  { id: 'dlp2', name: '等保 2.0', framework: '网络安全等级保护', description: '中国网络安全等级保护制度', completed: false },
  { id: 'pci', name: 'PCI DSS', framework: '支付卡行业数据安全标准', description: '支付卡数据安全合规', completed: false },
  { id: 'hipaa', name: 'HIPAA', framework: '健康保险流通与责任法案', description: '医疗数据隐私安全', completed: false },
];

// 模拟扫描结果
const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f1',
    severity: 'critical',
    title: 'SQL 注入漏洞',
    description: '在 /api/user/search 端点发现未参数化的 SQL 查询，攻击者可构造恶意输入获取数据库全部内容。',
    remediation: '使用 PreparedStatement 或 ORM 参数化查询；对用户输入进行严格校验和转义；部署 WAF 规则拦截 SQL 注入特征。',
    target: '/api/user/search?q=*',
  },
  {
    id: 'f2',
    severity: 'high',
    title: 'JWT Token 签名算法降级',
    description: 'JWT 验证未锁定签名算法，允许 "none" 算法绕过验证。攻击者可伪造任意身份 Token。',
    remediation: '在 JWT 验证时显式指定允许的算法列表，拒绝 alg=none；使用 RS256 替代 HS256 并保护私钥。',
    target: 'Authorization Header',
  },
  {
    id: 'f3',
    severity: 'high',
    title: '敏感信息明文存储',
    description: '数据库中发现用户手机号和身份证号以明文方式存储，未做脱敏或加密处理。',
    remediation: '使用 AES-256-GCM 对敏感字段进行加密存储；建立密钥管理服务(KMS)统一管理加密密钥。',
    target: 'Database: users table',
  },
  {
    id: 'f4',
    severity: 'medium',
    title: '跨站脚本攻击 (XSS)',
    description: '用户输入在页面中直接渲染未做 HTML 转义，评论区存在存储型 XSS 风险。',
    remediation: '对所有用户输入使用 DOMPurify 进行 HTML 清理；设置 Content-Security-Policy 响应头。',
    target: '/post/:id#comments',
  },
  {
    id: 'f5',
    severity: 'medium',
    title: 'CORS 配置过于宽松',
    description: 'API 响应头 Access-Control-Allow-Origin 设置为 *，允许任意源发起跨域请求。',
    remediation: '将 CORS 白名单限定为已知域名；对敏感端点要求 Credentials 并指定具体 Origin。',
    target: 'All API endpoints',
  },
  {
    id: 'f6',
    severity: 'low',
    title: '错误信息暴露系统信息',
    description: 'API 异常响应中包含堆栈跟踪和框架版本号，可能为攻击者提供攻击面信息。',
    remediation: '生产环境禁用详细错误输出；使用统一错误响应格式，仅返回必要的错误码和消息。',
    target: 'Global Error Handler',
  },
];

// ─── 页面组件 ───

export default function SecurityDevPage() {
  const meta = ROLES_META.security_dev;
  const [activeSection, setActiveSection] = useState<SecuritySection>('scanner');

  // ─── Section 1: 漏洞扫描器 ───
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState<ScanType>('全面扫描');
  const [scanDepth, setScanDepth] = useState(3);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const startScan = useCallback(() => {
    if (!targetUrl.trim()) {
      toast.error('请输入目标 URL');
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
    setFindings([]);
    setScanPhase(SCAN_PHASES[0]);

    toast.loading('正在启动暗物质扫描仪...', { id: 'scan' });

    const totalDuration = 4000 + scanDepth * 800;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;
      const phaseIndex = Math.min(
        Math.floor(progress / (100 / SCAN_PHASES.length)),
        SCAN_PHASES.length - 1
      );
      setScanPhase(SCAN_PHASES[phaseIndex]);

      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        setScanPhase('扫描完成');
        // 根据扫描类型展示不同结果
        const resultCount = scanType === '全面扫描' ? MOCK_FINDINGS.length : Math.min(scanType === 'SQL注入' ? 1 : 3, MOCK_FINDINGS.length);
        const sorted = [...MOCK_FINDINGS]
          .sort((a, b) => {
            const order: SeverityLevel[] = ['critical', 'high', 'medium', 'low'];
            return order.indexOf(a.severity) - order.indexOf(b.severity);
          })
          .slice(0, resultCount);
        setFindings(sorted);
        toast.success(`扫描完成，发现 ${sorted.filter(f => f.severity === 'critical').length} 个严重漏洞`, { id: 'scan' });
      } else {
        setScanProgress(progress);
      }
    }, totalDuration / 50);

    // 返回清理函数（组件卸载或重新扫描时中断）
    return () => clearInterval(interval);
  }, [targetUrl, scanDepth, scanType]);

  const handleStartScan = () => {
    startScan();
  };

  // ─── Section 2: 安全架构图 ───
  const [selectedSecurityNode, setSelectedSecurityNode] = useState<{
    id: string;
    label: string;
    type: string;
  } | null>(null);

  // ─── Section 3: 合规检查清单 ───
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(INITIAL_COMPLIANCE_ITEMS);

  const toggleCompliance = (id: string) => {
    setComplianceItems(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
    const item = complianceItems.find(i => i.id === id);
    if (item) {
      toast.success(item.completed ? `${item.name} 已取消` : `${item.name} 已标记完成`);
    }
  };

  const handleComplianceAction = (item: ComplianceItem) => {
    if (item.completed) {
      toast.success(`${item.name} 合规检查已通过`);
    } else {
      toast.loading(`正在检查 ${item.name} 合规项...`, { id: item.id });
      setTimeout(() => {
        setComplianceItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, completed: true } : i)
        );
        toast.success(`${item.name} 合规检查已通过`, { id: item.id });
      }, 1200);
    }
  };

  const completedCount = complianceItems.filter(i => i.completed).length;
  const totalCount = complianceItems.length;

  // ─── 辅助函数 ───

  const getSeverityColor = (severity: SeverityLevel) => SEVERITY_CONFIG[severity].color;
  const getSeverityBg = (severity: SeverityLevel) => SEVERITY_CONFIG[severity].bg;
  const getSeverityLabel = (severity: SeverityLevel) => SEVERITY_CONFIG[severity].label;

  const sectionTabs: { key: SecuritySection; label: string; icon: string }[] = [
    { key: 'scanner', label: '漏洞扫描器', icon: '🔍' },
    { key: 'architecture', label: '安全架构图', icon: '🏗️' },
    { key: 'compliance', label: '合规检查清单', icon: '✅' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-cosmic-border bg-space-card/80">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h1 className="text-lg font-display font-bold text-gradient">{meta.workbenchName}</h1>
          <p className="text-xs text-white/40">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {sectionTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                activeSection === tab.key
                  ? 'bg-nebulae-purple/20 text-nebulae-purple border border-nebulae-purple/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <CosmicButton size="sm" onClick={() => toast.success('安全报告已发布到 #dev 频道')}>
            发布报告
          </CosmicButton>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-hidden">
        {/* ========== Section 1: 漏洞扫描器 ========== */}
        {activeSection === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-auto p-6"
          >
            <div className="max-w-5xl mx-auto space-y-6">
              {/* 扫描配置区域 */}
              <CosmicCard padding="lg">
                <h3 className="text-lg font-display text-white mb-5 flex items-center gap-2">
                  <span>🎯</span> 扫描配置
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">目标 URL</label>
                    <input
                      className="cosmic-input text-sm h-10 w-full"
                      placeholder="https://example.com"
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      disabled={isScanning}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">扫描类型</label>
                    <select
                      className="cosmic-input text-sm h-10 w-full"
                      value={scanType}
                      onChange={e => setScanType(e.target.value as ScanType)}
                      disabled={isScanning}
                    >
                      {SCAN_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">
                      扫描深度: <span className="text-nebulae-purple">{scanDepth}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scanDepth}
                      onChange={e => setScanDepth(Number(e.target.value))}
                      disabled={isScanning}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6C5CE7 ${(scanDepth - 1) * 25}%, rgba(255,255,255,0.1) ${(scanDepth - 1) * 25}%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
                      <span>浅层</span>
                      <span>深度</span>
                    </div>
                  </div>
                </div>
                <CosmicButton
                  size="lg"
                  className="w-full"
                  onClick={handleStartScan}
                  disabled={isScanning}
                  isLoading={isScanning}
                >
                  {isScanning ? '扫描中...' : '🚀 启动扫描'}
                </CosmicButton>
              </CosmicCard>

              {/* 扫描进度 */}
              {isScanning && (
                <CosmicCard padding="lg">
                  <h3 className="text-sm font-display text-white mb-4 flex items-center gap-2">
                    <span>⏳</span> 扫描进度
                  </h3>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/60">当前阶段</span>
                      <span className="text-nebulae-purple font-mono">{scanPhase}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-cosmic-border">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #6C5CE7, #00E5FF, #00F2A9)',
                          width: `${scanProgress}%`,
                        }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>0%</span>
                      <span>{scanProgress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {SCAN_PHASES.map((phase, i) => (
                      <div key={phase} className="flex-1">
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-500 ${
                            scanPhase === phase
                              ? 'bg-nebulae-purple'
                              : SCAN_PHASES.indexOf(scanPhase) > i
                                ? 'bg-ai-blue/60'
                                : 'bg-white/10'
                          }`}
                        />
                        <p className="text-[9px] text-center mt-1 text-white/30 truncate">{phase}</p>
                      </div>
                    ))}
                  </div>
                </CosmicCard>
              )}

              {/* 扫描结果 */}
              {findings.length > 0 && !isScanning && (
                <CosmicCard padding="lg">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-display text-white flex items-center gap-2">
                      <span>📊</span> 扫描结果
                    </h3>
                    <div className="flex gap-2">
                      {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(sev => {
                        const count = findings.filter(f => f.severity === sev).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={sev}
                            className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{
                              backgroundColor: SEVERITY_CONFIG[sev].bg,
                              color: SEVERITY_CONFIG[sev].color,
                              border: `1px solid ${SEVERITY_CONFIG[sev].border}`,
                            }}
                          >
                            {SEVERITY_CONFIG[sev].label} {count}
                          </span>
                        );
                      })}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                        共 {findings.length} 项
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {findings.map(finding => {
                      const isExpanded = expandedFinding === finding.id;
                      return (
                        <div
                          key={finding.id}
                          className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden transition-colors hover:bg-white/[0.06]"
                        >
                          <button
                            className="w-full p-4 flex items-start gap-3 text-left"
                            onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                          >
                            {/* Severity Badge */}
                            <span
                              className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-md font-mono uppercase"
                              style={{
                                backgroundColor: getSeverityBg(finding.severity),
                                color: getSeverityColor(finding.severity),
                                border: `1px solid ${getSeverityColor(finding.severity)}40`,
                              }}
                            >
                              {getSeverityLabel(finding.severity)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{finding.title}</h4>
                              <p className="text-xs text-white/40 mt-0.5 font-mono">{finding.target}</p>
                            </div>
                            <span className="text-white/20 text-sm shrink-0 mt-1">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3"
                            >
                              <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">漏洞描述</p>
                                <p className="text-sm text-white/70 leading-relaxed">{finding.description}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-success-green/5 border border-success-green/15">
                                <p className="text-[10px] text-success-green/70 uppercase tracking-wider mb-1">修复建议</p>
                                <p className="text-sm text-success-green/90 leading-relaxed">{finding.remediation}</p>
                              </div>
                              <CosmicButton
                                size="sm"
                                variant="secondary"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  toast.success('修复方案已添加到安全工单');
                                }}
                              >
                                创建修复工单
                              </CosmicButton>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CosmicCard>
              )}

              {/* 空状态 */}
              {findings.length === 0 && !isScanning && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <span className="text-6xl opacity-20">🔍</span>
                    <p className="text-white/30 mt-4">配置扫描参数并启动扫描</p>
                    <p className="text-xs text-white/15 mt-1">暗物质扫描仪将自动检测目标系统的安全漏洞</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== Section 2: 安全架构图 ========== */}
        {activeSection === 'architecture' && (
          <motion.div
            key="architecture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex"
          >
            {/* 主画布 */}
            <div className="flex-1 relative">
              <FlowCanvas
                nodes={INITIAL_SECURITY_NODES}
                connections={INITIAL_SECURITY_CONNS}
                nodeTypes={SECURITY_NODE_TYPES}
                onSelectNode={(node) => setSelectedSecurityNode(node)}
              />
              {/* 分层标注 */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {[
                  { label: '边界防护层', y: 30, color: '#FF9100' },
                  { label: '网络检测层', y: 75, color: '#FFD166' },
                  { label: '应用安全层', y: 120, color: '#6C5CE7' },
                  { label: '数据安全层', y: 30, color: '#E040FB' },
                ].map(layer => (
                  <div key={layer.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                    <span className="text-[10px] text-white/30">{layer.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧配置面板 */}
            {selectedSecurityNode && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 280 }}
                className="border-l border-cosmic-border overflow-hidden shrink-0"
              >
                <div className="glass-panel h-full p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {SECURITY_NODE_TYPES[selectedSecurityNode.type as keyof typeof SECURITY_NODE_TYPES]?.icon ?? '⬡'}
                    </span>
                    <h3 className="text-sm font-display text-white">{selectedSecurityNode.label}</h3>
                  </div>

                  <p className="text-xs text-white/50">
                    类型: <span className="text-white/70">{selectedSecurityNode.type}</span>
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">节点名称</label>
                      <input
                        className="cosmic-input text-xs h-8 w-full mt-1"
                        defaultValue={selectedSecurityNode.label}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">安全策略</label>
                      <select className="cosmic-input text-xs h-8 w-full mt-1" defaultValue="default">
                        <option value="default">默认策略</option>
                        <option value="strict">严格模式</option>
                        <option value="permissive">宽松模式</option>
                        <option value="monitor">仅监控</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">告警阈值</label>
                      <select className="cosmic-input text-xs h-8 w-full mt-1" defaultValue="medium">
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="critical">严重</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">备注</label>
                      <textarea
                        className="cosmic-input text-xs h-20 w-full mt-1 resize-none"
                        placeholder="添加配置备注..."
                      />
                    </div>

                    <CosmicButton size="sm" className="w-full" onClick={() => toast.success('配置已保存')}>
                      保存配置
                    </CosmicButton>

                    <CosmicButton
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => toast.success(`${selectedSecurityNode.label} 巡检已启动`)}
                    >
                      🔍 启动巡检
                    </CosmicButton>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">状态信息</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">运行状态</span>
                        <span className="text-success-green flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
                          正常
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">吞吐量</span>
                        <span className="text-white/70 font-mono">2.4k/s</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">最后检查</span>
                        <span className="text-white/70">12s 前</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ========== Section 3: 合规检查清单 ========== */}
        {activeSection === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-auto p-6"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              {/* 进度概览 */}
              <CosmicCard padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display text-white flex items-center gap-2">
                    <span>📋</span> 合规进度
                  </h3>
                  <span className="text-sm font-mono text-white/40">
                    {completedCount} / {totalCount}
                  </span>
                </div>

                {/* 进度条 */}
                <div className="h-4 rounded-full bg-white/5 overflow-hidden border border-cosmic-border mb-4">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00F2A9, #6C5CE7)',
                      width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/5 text-center">
                    <p className="text-2xl font-bold text-success-green font-mono">{completedCount}</p>
                    <p className="text-[10px] text-white/30 mt-1">已通过</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 text-center">
                    <p className="text-2xl font-bold text-ai-blue font-mono">{totalCount - completedCount}</p>
                    <p className="text-[10px] text-white/30 mt-1">待检查</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 text-center">
                    <p className="text-2xl font-bold text-nebulae-purple font-mono">
                      {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">完成率</p>
                  </div>
                </div>
              </CosmicCard>

              {/* 合规清单 */}
              <CosmicCard padding="lg">
                <h3 className="text-sm font-display text-white mb-4 flex items-center gap-2">
                  <span>✅</span> 合规检查清单
                </h3>

                <div className="space-y-2">
                  {complianceItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        item.completed
                          ? 'bg-success-green/5 border-success-green/15'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-success-green border-success-green'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        onClick={() => toggleCompliance(item.id)}
                      >
                        {item.completed && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white text-xs"
                          >
                            ✓
                          </motion.span>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium ${item.completed ? 'text-success-green' : 'text-white'}`}>
                            {item.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/30">
                            {item.framework}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                      </div>

                      {/* Status */}
                      <span
                        className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded-full ${
                          item.completed
                            ? 'bg-success-green/15 text-success-green border border-success-green/20'
                            : 'bg-white/5 text-white/30 border border-white/5'
                        }`}
                      >
                        {item.completed ? '已通过' : '未检查'}
                      </span>

                      {/* Action Button */}
                      <CosmicButton
                        size="sm"
                        variant={item.completed ? 'secondary' : 'primary'}
                        onClick={() => handleComplianceAction(item)}
                      >
                        {item.completed ? '复查' : '开始检查'}
                      </CosmicButton>
                    </div>
                  ))}
                </div>
              </CosmicCard>

              {/* AI 助手 */}
              <CosmicCard padding="lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">合规 AI 助手</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      需要生成合规报告或检查清单？AI 助手可以自动分析你的系统并生成合规文档。
                    </p>
                  </div>
                  <CosmicButton
                    size="sm"
                    variant="secondary"
                    onClick={() => toast.success('AI 合规分析报告已生成')}
                  >
                    生成报告
                  </CosmicButton>
                </div>
              </CosmicCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}