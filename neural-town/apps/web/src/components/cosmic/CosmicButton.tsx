'use client';
/**
 * @file CosmicButton - 宇宙渐变按钮（shine扫光 + 点击粒子爆发）
 */

import { forwardRef, useCallback } from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useParticleStore } from '@/stores/particle-store';

interface CosmicButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'cosmic-btn',
  secondary: 'cosmic-btn cosmic-btn-secondary',
  ghost: 'cosmic-btn cosmic-btn-ghost',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const CosmicButton = forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, onClick, children, disabled, ...props }, ref) => {
    const triggerBurst = useParticleStore((s) => s.triggerBurst);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#6C5CE7');
        onClick?.(e);
      },
      [onClick, triggerBurst]
    );

    return (
      <motion.button
        ref={ref}
        className={clsx(
          'relative overflow-hidden rounded-xl font-display font-medium transition-all duration-300',
          variantClasses[variant],
          sizeClasses[size],
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size={16} />
            加载中...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

CosmicButton.displayName = 'CosmicButton';

/** 内联小型加载旋转器 */
function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.2} strokeWidth={3} />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}