import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { ArrowLeft, Play, Pause, Square, Download, Settings } from 'lucide-react-native';
import { useToast } from '../components/Toast';
import Svg, { Circle, G } from 'react-native-svg';

type TrainingState = 'idle' | 'training' | 'paused' | 'completed';

interface LoraPageProps {
  onBack: () => void;
}

interface TrainingParams {
  learningRate: string;
  batchSize: string;
  epochs: string;
  rank: string;
  alpha: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 8;

const PARAM_CONFIG: { key: keyof TrainingParams; label: string }[] = [
  { key: 'learningRate', label: '学习率' },
  { key: 'batchSize', label: '批次大小' },
  { key: 'epochs', label: '训练轮数' },
  { key: 'rank', label: '秩 (r)' },
  { key: 'alpha', label: 'Alpha' },
];

const LOG_TEMPLATES = [
  '前向传播完成, loss={loss}',
  '反向传播梯度计算完成',
  '模型参数更新: step={step}',
  '梯度裁剪: max_norm=1.0, grad_norm=0.8234',
  '验证集评估: val_loss={val_loss}',
  'Checkpoint 已保存: step={step}',
  '学习率调整: {lr}',
  '数据批次加载: batch_size={batch_size}',
  '混合精度训练: loss_scale=65536.0',
  'LoRA 权重梯度统计: mean=0.0012, std=0.0234',
  '注意力层适配器更新完成',
  'MLP 层适配器更新完成',
  '损失函数收敛中: delta_loss={delta}',
  '训练样本吞吐量: {throughput} samples/s',
  'GPU 显存使用: {mem}MB / 24576MB',
];

function getTimestamp(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function generateLogMessage(
  progress: number,
  loss: number,
  lr: string,
  batchSize: string,
): string {
  const template =
    LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const step = Math.floor(progress * 10);
  return template
    .replace('{loss}', loss.toFixed(4))
    .replace('{step}', String(step))
    .replace('{val_loss}', (loss + Math.random() * 0.5).toFixed(4))
    .replace('{lr}', lr)
    .replace('{batch_size}', batchSize)
    .replace('{delta}', (Math.random() * 0.01).toFixed(6))
    .replace('{throughput}', String(Math.floor(Math.random() * 20 + 10)))
    .replace('{mem}', String(Math.floor(Math.random() * 4000 + 8000)));
}

const STATE_CONFIG: Record<
  TrainingState,
  { label: string; color: string }
> = {
  idle: { label: '就绪', color: '#9CA3AF' },
  training: { label: '训练中', color: '#3B82F6' },
  paused: { label: '已暂停', color: '#F59E0B' },
  completed: { label: '已完成', color: '#10B981' },
};

export default function LoraPage({ onBack }: LoraPageProps) {
  const { showToast } = useToast();
  const [trainingState, setTrainingState] = useState<TrainingState>('idle');
  const [progress, setProgress] = useState(54);
  const [loss, setLoss] = useState(2.4521);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: '14:23:01',
      message: 'LoRA 训练环境初始化完成',
    },
    {
      id: 'init-2',
      timestamp: '14:23:02',
      message: '数据集加载完成，共 1,247 条样本',
    },
    {
      id: 'init-3',
      timestamp: '14:23:03',
      message: 'LoRA 适配器配置: rank=8, alpha=16',
    },
  ]);
  const [params, setParams] = useState<TrainingParams>({
    learningRate: '1e-4',
    batchSize: '4',
    epochs: '3',
    rank: '8',
    alpha: '16',
  });
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logScrollViewRef = useRef<ScrollView>(null);
  const progressRef = useRef(progress);
  const lossRef = useRef(loss);
  const paramsRef = useRef(params);

  const totalEpochs = parseInt(params.epochs) || 3;
  const currentEpoch = Math.min(
    Math.floor((progress / 100) * totalEpochs) + 1,
    totalEpochs,
  );

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    lossRef.current = loss;
  }, [loss]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    if (trainingState === 'training') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [trainingState, pulseAnim]);

  useEffect(() => {
    if (trainingState === 'training') {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= 100) return 100;
          return next;
        });
        setLoss((prev) => {
          const decay = -0.002;
          const noise = (Math.random() - 0.5) * 0.04;
          return Math.max(0.01, prev + decay + noise);
        });
      }, 500);

      logIntervalRef.current = setInterval(() => {
        const newLog: LogEntry = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          timestamp: getTimestamp(),
          message: generateLogMessage(
            progressRef.current,
            lossRef.current,
            paramsRef.current.learningRate,
            paramsRef.current.batchSize,
          ),
        };
        setLogs((prev) => [...prev, newLog]);
      }, 2000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, [trainingState]);

  useEffect(() => {
    if (progress >= 100 && trainingState === 'training') {
      setTrainingState('completed');
      const completionLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: getTimestamp(),
        message: `训练完成！最终 loss: ${lossRef.current.toFixed(4)}`,
      };
      setLogs((prev) => [...prev, completionLog]);
    }
  }, [progress, trainingState]);

  useEffect(() => {
    if (logs.length > 0) {
      setTimeout(
        () => logScrollViewRef.current?.scrollToEnd?.({ animated: true }),
        100,
      );
    }
  }, [logs]);

  const handleStart = useCallback(() => {
    if (trainingState === 'completed') {
      setProgress(0);
      setLoss(2.4521);
    }
    setTrainingState('training');
  }, [trainingState]);

  const handlePause = useCallback(() => {
    setTrainingState('paused');
  }, []);

  const handleStop = useCallback(() => {
    setTrainingState('idle');
    setProgress(0);
    setLoss(2.4521);
  }, []);

  const handleExport = useCallback(() => {
    showToast('LoRA 权重已导出', 'success');
  }, [showToast]);

  const handleParamPress = useCallback((key: string) => {
    setEditingParam(key);
    setEditValue(paramsRef.current[key as keyof TrainingParams]);
  }, []);

  const handleParamSubmit = useCallback(
    (key: string) => {
      setParams((prev) => ({ ...prev, [key]: editValue }));
      setEditingParam(null);
      setEditValue('');
    },
    [editValue],
  );

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  const { color: stateColor, label: stateLabel } = STATE_CONFIG[trainingState];

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface pt-14 pb-3 px-5 border-b border-border-light">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-surface-secondary items-center justify-center mr-3"
            activeOpacity={0.7}
            onPress={onBack}
          >
            <ArrowLeft size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary">LoRA 训练</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="bg-surface mx-4 mt-4 rounded-2xl p-5 border border-border-light">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-semibold text-text-primary">
              训练进度
            </Text>
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: stateColor }}
              />
              <Text
                className="text-xs font-medium"
                style={{ color: stateColor }}
              >
                {stateLabel}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="items-center justify-center mr-5">
              <Svg width={130} height={130}>
                <Circle
                  cx={65}
                  cy={65}
                  r={RADIUS}
                  stroke="#F1F3F5"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <G rotation="-90" originX={65} originY={65}>
                  <Circle
                    cx={65}
                    cy={65}
                    r={RADIUS}
                    stroke={stateColor}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View
                className="absolute items-center justify-center"
                style={{ width: 130, height: 130 }}
              >
                <Animated.Text
                  className="text-2xl font-bold text-text-primary"
                  style={{ transform: [{ scale: pulseAnim }] }}
                >
                  {progress}%
                </Animated.Text>
                <Text className="text-xs text-text-tertiary mt-0.5">
                  Epoch {currentEpoch}/{totalEpochs}
                </Text>
              </View>
            </View>

            <View className="flex-1 gap-3">
              <View className="bg-surface-secondary rounded-xl px-3 py-2.5">
                <Text className="text-xs text-text-tertiary mb-0.5">Loss</Text>
                <Text className="text-sm font-semibold text-text-primary">
                  {loss.toFixed(4)}
                </Text>
              </View>
              <View className="bg-surface-secondary rounded-xl px-3 py-2.5">
                <Text className="text-xs text-text-tertiary mb-0.5">
                  学习率
                </Text>
                <Text className="text-sm font-semibold text-text-primary">
                  {params.learningRate}
                </Text>
              </View>
              <View className="bg-surface-secondary rounded-xl px-3 py-2.5">
                <Text className="text-xs text-text-tertiary mb-0.5">
                  当前轮次
                </Text>
                <Text className="text-sm font-semibold text-text-primary">
                  {currentEpoch} / {totalEpochs}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row justify-center gap-3 mx-4 mt-4">
          {trainingState === 'training' ? (
            <TouchableOpacity
              className="flex-row items-center bg-warning rounded-xl px-5 py-3"
              activeOpacity={0.8}
              onPress={handlePause}
            >
              <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white text-sm font-semibold ml-2">
                暂停
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center bg-primary rounded-xl px-5 py-3"
              activeOpacity={0.8}
              onPress={handleStart}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white text-sm font-semibold ml-2">
                {trainingState === 'paused'
                  ? '继续'
                  : trainingState === 'completed'
                    ? '重新训练'
                    : '开始训练'}
              </Text>
            </TouchableOpacity>
          )}

          {(trainingState === 'training' || trainingState === 'paused') && (
            <TouchableOpacity
              className="flex-row items-center bg-danger rounded-xl px-5 py-3"
              activeOpacity={0.8}
              onPress={handleStop}
            >
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white text-sm font-semibold ml-2">
                停止
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center bg-success rounded-xl px-5 py-3"
            activeOpacity={0.8}
            onPress={handleExport}
          >
            <Download size={18} color="#FFFFFF" />
            <Text className="text-white text-sm font-semibold ml-2">
              导出
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-surface mx-4 mt-4 rounded-2xl p-5 border border-border-light">
          <View className="flex-row items-center mb-4">
            <Settings size={18} color="#6B7280" strokeWidth={2} />
            <Text className="text-base font-semibold text-text-primary ml-2">
              训练参数
            </Text>
          </View>

          <View className="gap-3">
            {PARAM_CONFIG.map(({ key, label }, index) => (
              <View
                key={key}
                className={`flex-row items-center justify-between py-2 ${index < PARAM_CONFIG.length - 1 ? 'border-b border-border-light' : ''}`}
              >
                <Text className="text-sm text-text-secondary">{label}</Text>
                {editingParam === key ? (
                  <TextInput
                    className="bg-surface-secondary border border-primary rounded-lg px-3 py-1.5 text-sm text-text-primary w-24 text-right"
                    value={editValue}
                    onChangeText={setEditValue}
                    onBlur={() => handleParamSubmit(key)}
                    onSubmitEditing={() => handleParamSubmit(key)}
                    autoFocus
                    selectTextOnFocus
                  />
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleParamPress(key)}
                    className="bg-surface-secondary rounded-lg px-3 py-1.5"
                  >
                    <Text className="text-sm font-medium text-text-primary">
                      {params[key]}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="bg-surface mx-4 mt-4 rounded-2xl p-5 border border-border-light">
          <Text className="text-base font-semibold text-text-primary mb-3">
            训练日志
          </Text>
          <View
            className="rounded-xl p-3 max-h-60"
            style={{ backgroundColor: '#1A1D23' }}
          >
            <ScrollView
              ref={logScrollViewRef}
              showsVerticalScrollIndicator={false}
            >
              {logs.map((log) => (
                <View key={log.id} className="flex-row mb-1.5 last:mb-0">
                  <Text
                    className="text-xs mr-2 font-mono"
                    style={{ color: '#6B7280' }}
                  >
                    {log.timestamp}
                  </Text>
                  <Text
                    className="text-xs flex-1 font-mono"
                    style={{ color: '#A6E3A1' }}
                  >
                    {log.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
