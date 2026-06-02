'use client';
/**
 * @file ParticleBackground - 全局深空粒子背景系统
 * 使用 Canvas 2D 渲染星云、粒子、流星效果
 * 支持鼠标视差交互和点击涟漪
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useParticleStore, particleBurst } from '@/stores/particle-store';

interface Star {
  x: number; y: number; z: number;
  size: number; opacity: number;
  twinkleSpeed: number; twinkleOffset: number;
}

interface Nebula {
  x: number; y: number;
  radius: number;
  color: string;
  opacity: number;
  angle: number;
  speed: number;
}

interface Meteor {
  x: number; y: number;
  vx: number; vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number; y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);
  const pathname = usePathname();

  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.floor((width * height) / 2500); // 密度
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  const initNebulae = useCallback((width: number, height: number) => {
    const nebulae: Nebula[] = [
      { x: width * 0.2, y: height * 0.3, radius: 200, color: '#6C5CE7', opacity: 0.04, angle: 0, speed: 0.0002 },
      { x: width * 0.8, y: height * 0.6, radius: 250, color: '#00E5FF', opacity: 0.03, angle: 0, speed: -0.00015 },
      { x: width * 0.5, y: height * 0.8, radius: 180, color: '#E040FB', opacity: 0.03, angle: 0, speed: 0.0001 },
    ];
    nebulaeRef.current = nebulae;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      initNebulae(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // 鼠标追踪
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / canvas.width,
        y: e.clientY / canvas.height,
      };
    };

    // 点击涟漪
    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 80,
        opacity: 0.5,
      });
    };

    // 全局粒子爆破事件
    const onParticleBurst = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      for (let i = 0; i < 6; i++) {
        ripplesRef.current.push({
          x: detail.x + (Math.random() - 0.5) * 40,
          y: detail.y + (Math.random() - 0.5) * 40,
          radius: 0,
          maxRadius: 40 + Math.random() * 40,
          opacity: 0.4,
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('particle-burst', onParticleBurst);

    // 生成流星定时器
    const meteorInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        meteorsRef.current.push({
          x: Math.random() * canvas.width,
          y: -20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 4 + 2,
          length: Math.random() * 80 + 40,
          opacity: Math.random() * 0.5 + 0.3,
          life: 0,
          maxLife: 120,
        });
      }
    }, 2000);

    let frame = 0;

    const animate = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // 绘制星云
      for (const nebula of nebulaeRef.current) {
        nebula.angle += nebula.speed;
        const nx = nebula.x + Math.cos(nebula.angle) * 30;
        const ny = nebula.y + Math.sin(nebula.angle) * 30;

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nebula.radius);
        grad.addColorStop(0, nebula.color);
        grad.addColorStop(0.5, nebula.color + '10');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.globalAlpha = nebula.opacity;
        ctx.beginPath();
        ctx.arc(nx, ny, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 绘制星星（带视差）
      for (const star of starsRef.current) {
        const parallaxX = (mx - 0.5) * star.z * 20;
        const parallaxY = (my - 0.5) * star.z * 20;
        const sx = star.x + parallaxX;
        const sy = star.y + parallaxY;

        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size * twinkle, 0, Math.PI * 2);
        ctx.fill();

        // 亮星加辉光
        if (star.size > 1.5 && twinkle > 0.8) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 4);
          glow.addColorStop(0, `rgba(108, 192, 231, ${alpha * 0.5})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 绘制流星
      for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
        const m = meteorsRef.current[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const fade = 1 - m.life / m.maxLife;
        if (fade <= 0) {
          meteorsRef.current.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          m.x, m.y,
          m.x - m.vx * m.length, m.y - m.vy * m.length
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity * fade})`);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * m.length * 0.1, m.y - m.vy * m.length * 0.1);
        ctx.stroke();
      }

      // 绘制涟漪
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 1.5;
        const fade = 1 - r.radius / r.maxRadius;
        if (fade <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(108, 92, 231, ${0.3 * fade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('particle-burst', onParticleBurst);
      clearInterval(meteorInterval);
    };
  }, [pathname, initStars, initNebulae]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}