'use client';
/**
 * @file HyperspaceEntrance - 超空间入口动画组件
 * Three.js 星门 → 超空间跃迁 → 母舰全景动画序列
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

type PortalPhase = 'loading' | 'star-gate' | 'hyperspace' | 'mothership' | 'complete';
type MothershipView = 'panorama' | 'role-select';

export default function HyperspaceEntrance() {
  const router = useRouter();
  const [phase, setPhase] = useState<PortalPhase>('loading');
  const [shipView, setShipView] = useState<MothershipView>('panorama');
  const [hasVisited, setHasVisited] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  // 检查是否首次访问
  useEffect(() => {
    const visited = localStorage.getItem('nt-visited');
    if (visited) {
      setHasVisited(true);
    } else {
      localStorage.setItem('nt-visited', '1');
    }
  }, []);

  // Three.js 星门场景
  useEffect(() => {
    if (hasVisited || phase === 'complete') return;

    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 星门 —— 发光圆环
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.04, 32, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x6C5CE7 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    // 外层环
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.02, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0x00E5FF, opacity: 0.5, transparent: true })
    );
    scene.add(outerRing);

    // 粒子漩涡（汇聚到星门）
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      // 螺旋分布
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 4;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // 紫色到蓝色渐变
      const mix = Math.random();
      colors[i * 3] = 0.42 * (1 - mix);
      colors[i * 3 + 1] = 0.36 * mix + 0.9 * mix;
      colors[i * 3 + 2] = 0.9 * (1 - mix) + mix;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 媒体查询重设尺寸
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let animationId: number;
    let elapsed = 0;

    const animate = () => {
      elapsed += 0.01;
      animationId = requestAnimationFrame(animate);

      // 星门旋转
      ring.rotation.x = elapsed * 0.3;
      ring.rotation.y = elapsed * 0.5;
      ring.rotation.z = elapsed * 0.2;

      outerRing.rotation.x = -elapsed * 0.2;
      outerRing.rotation.y = -elapsed * 0.4;

      // 粒子旋转 + 向门收缩
      particles.rotation.y = elapsed * 0.15;
      particles.rotation.x = Math.sin(elapsed * 0.1) * 0.15;

      // 星空背景（远处闪烁点）
      renderer.render(scene, camera);
    };

    animate();

    // 阶段计时控制
    if (phase === 'loading') {
      const timer = setTimeout(() => setPhase('star-gate'), 1000);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        window.removeEventListener('resize', onResize);
      };
    }

    // 星门展示 3 秒 → 跃迁
    if (phase === 'star-gate') {
      const timer = setTimeout(() => setPhase('hyperspace'), 3000);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        window.removeEventListener('resize', onResize);
      };
    }

    // 跃迁 → 母舰
    if (phase === 'hyperspace') {
      const timer = setTimeout(() => setPhase('mothership'), 2000);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        window.removeEventListener('resize', onResize);
      };
    }

    // 母舰停留 2 秒 → 跳转到社区
    if (phase === 'mothership') {
      const timer = setTimeout(() => setPhase('complete'), 2000);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationId);
        renderer.dispose();
        window.removeEventListener('resize', onResize);
      };
    }

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
    };
  }, [phase, hasVisited]);

  // 已完成→跳转
  useEffect(() => {
    if (phase === 'complete' || hasVisited) {
      const timer = setTimeout(() => router.push('/community'), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, hasVisited, router]);

  // 跳过按钮
  const skipEntrance = () => {
    localStorage.setItem('nt-visited', '1');
    setHasVisited(true);
  };

  return (
    <AnimatePresence>
      {!hasVisited && phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[200] bg-space-deep overflow-hidden"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Three.js 画布 */}
          <div ref={mountRef} className="absolute inset-0" />

          {/* 光柱效果（跃迁阶段） */}
          <AnimatePresence>
            {phase === 'hyperspace' && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 超空间光带 */}
                <div className="absolute inset-0 bg-gradient-radial from-nebulae-purple/30 via-transparent to-transparent animate-pulse-slow" />
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-[2px] bg-gradient-to-r from-nebulae-purple to-ai-blue"
                    style={{
                      left: '-10%',
                      top: `${(i / 20) * 100}%`,
                      width: '120%',
                    }}
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '100%', opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 文字叠加层 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {phase === 'star-gate' && (
                <motion.div
                  key="gate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <h1 className="text-5xl font-display font-bold text-gradient mb-4">
                    Neural Town
                  </h1>
                  <p className="text-xl text-white/60">星际之门已开启</p>
                </motion.div>
              )}

              {phase === 'hyperspace' && (
                <motion.div
                  key="warp"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-center"
                >
                  <h2 className="text-4xl font-display font-bold text-gradient mb-3">
                    超空间跃迁中
                  </h2>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-ai-blue"
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.5, 1] }}
                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'mothership' && (
                <motion.div
                  key="ship"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-display font-bold text-gradient mb-3">
                    欢迎登上母舰
                  </h1>
                  <p className="text-lg text-white/60">请选择你的角色舰桥</p>
                  <div className="flex gap-3 justify-center mt-6 flex-wrap">
                    {['🎨', '💻', '📊', '🌱', '🚀'].map((icon, i) => (
                      <motion.div
                        key={icon}
                        className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                      >
                        {icon}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 跳过按钮 */}
          <button
            className="absolute bottom-8 right-8 z-10 px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
            onClick={skipEntrance}
          >
            跳过动画 →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}