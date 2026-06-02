'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Shot {
  id: string;
  shotNumber: number;
  title: string;
  time: number;
  emotionIntensity: number;
  emotion: string;
  cameraAngle: string;
  thumbnail?: string;
  selected: boolean;
}

interface StoryboardCanvasProps {
  shots: Shot[];
  onSelectShot: (shotId: string) => void;
  selectedShotId: string | null;
}

// 单个分镜球体
function ShotSphere({ shot, isSelected, onClick }: { shot: Shot; isSelected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      if (isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const emotionColors: Record<string, string> = {
    neutral: '#888888', tense: '#FF6B6B', sad: '#6C5CE7',
    joyful: '#FFD166', surprised: '#00E5FF', fearful: '#E040FB',
    angry: '#FF4444', hopeful: '#00F2A9',
  };

  const color = emotionColors[shot.emotion] || '#6C5CE7';

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.4, 32, 32]}
        position={[shot.time * 2 - 2, shot.emotionIntensity * 1.5, (['wide', 'close-up', 'tracking'].indexOf(shot.cameraAngle) - 1) * 0.8]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={isSelected ? 1 : hovered ? 0.5 : 0.2}
        />
      </Sphere>
      {/* 编号标签 */}
      <Text
        position={[shot.time * 2 - 2, shot.emotionIntensity * 1.5 + 0.6, (['wide', 'close-up', 'tracking'].indexOf(shot.cameraAngle) - 1) * 0.8]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`#${shot.shotNumber}`}
      </Text>
      {/* 选中光环 */}
      {isSelected && (
        <mesh position={[shot.time * 2 - 2, shot.emotionIntensity * 1.5, (['wide', 'close-up', 'tracking'].indexOf(shot.cameraAngle) - 1) * 0.8]}>
          <torusGeometry args={[0.5, 0.03, 16, 32]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
      )}
    </group>
  );
}

// 光轨连接线
function ConnectionLines({ shots }: { shots: Shot[] }) {
  const sorted = [...shots].sort((a, b) => a.shotNumber - b.shotNumber);
  const points = sorted.map((s) => [
    s.time * 2 - 2,
    s.emotionIntensity * 1.5,
    (['wide', 'close-up', 'tracking'].indexOf(s.cameraAngle) - 1) * 0.8,
  ] as [number, number, number]);

  if (points.length < 2) return null;

  const lines: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    lines.push([
      new THREE.Vector3(...points[i]),
      new THREE.Vector3(...points[i + 1]),
    ]);
  }

  return (
    <group>
      {lines.map(([a, b], i) => {
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        return (
          <Line
            key={i}
            points={[a, mid, b]}
            color="#6C5CE7"
            lineWidth={0.5}
            transparent
            opacity={0.4}
          />
        );
      })}
    </group>
  );
}

// 坐标轴
function Axes() {
  return (
    <group>
      {/* X轴 (时间) */}
      <Line points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]} color="#FF6B6B" lineWidth={0.5} />
      <Text position={[3.2, 0, 0]} fontSize={0.2} color="#FF6B6B">时间</Text>
      {/* Y轴 (情感强度) */}
      <Line points={[new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 2, 0)]} color="#00F2A9" lineWidth={0.5} />
      <Text position={[0, 2.2, 0]} fontSize={0.2} color="#00F2A9">情感</Text>
      {/* Z轴 (视角) */}
      <Line points={[new THREE.Vector3(0, 0, -1.5), new THREE.Vector3(0, 0, 1.5)]} color="#00E5FF" lineWidth={0.5} />
      <Text position={[0, 0, 1.7]} fontSize={0.2} color="#00E5FF">视角</Text>
    </group>
  );
}

// 星空背景
function StarField() {
  const stars = useMemo(() => {
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[stars, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

export default function StoryboardCanvas({ shots, onSelectShot, selectedShotId }: StoryboardCanvasProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        style={{ background: '#030614' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        <StarField />
        <Axes />
        <ConnectionLines shots={shots} />
        {shots.map((shot) => (
          <ShotSphere
            key={shot.id}
            shot={shot}
            isSelected={shot.id === selectedShotId}
            onClick={() => onSelectShot(shot.id)}
          />
        ))}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>

      {/* 图例 */}
      <div className="absolute bottom-3 left-3 glass-panel p-2 text-[10px] space-y-1">
        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-400" /><span className="text-white/60">X轴 = 时间</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-400" /><span className="text-white/60">Y轴 = 情感强度</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-cyan-400" /><span className="text-white/60">Z轴 = 视角/机位</span></div>
        <p className="text-white/30 mt-1">🖱 拖拽旋转 | 滚轮缩放 | 右键平移</p>
      </div>
    </div>
  );
}