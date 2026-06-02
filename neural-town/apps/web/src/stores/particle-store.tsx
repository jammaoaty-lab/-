'use client';
/**
 * Particle Store - 全局粒子事件系统
 * 支持 particleBurst(x, y, color) 全局事件触发
 */

import { create } from 'zustand';

interface ParticleBurst {
  id: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface ParticleState {
  bursts: ParticleBurst[];
  triggerBurst: (x: number, y: number, color?: string) => void;
  clearBursts: () => void;
}

let burstId = 0;

export const useParticleStore = create<ParticleState>((set) => ({
  bursts: [],

  triggerBurst: (x, y, color = '#6C5CE7') => {
    const id = burstId++;
    set((state) => ({
      bursts: [...state.bursts, { id, x, y, color, timestamp: Date.now() }],
    }));
    setTimeout(() => {
      set((state) => ({
        bursts: state.bursts.filter((b) => b.id !== id),
      }));
    }, 1000);
  },

  clearBursts: () => set({ bursts: [] }),
}));

export function particleBurst(x: number, y: number, color?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('particle-burst', { detail: { x, y, color } })
    );
  }
}

export function ParticleProvider({ children }: { children: React.ReactNode }) {
  return children;
}