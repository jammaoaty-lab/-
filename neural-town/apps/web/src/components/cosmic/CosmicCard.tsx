'use client';
/**
 * @file CosmicCard - 宇宙玻璃卡片组件
 */

import { forwardRef } from 'react';
import clsx from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CosmicCardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const CosmicCard = forwardRef<HTMLDivElement, CosmicCardProps>(
  ({ hoverable = true, glow = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={clsx(
          'cosmic-card',
          paddingMap[padding],
          glow && 'border-nebulae-purple/50 shadow-[0_0_20px_rgba(108,92,231,0.15)]',
          className
        )}
        whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

CosmicCard.displayName = 'CosmicCard';