import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { forwardRef } from 'react';

interface HolographicButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const HolographicButton = forwardRef<HTMLButtonElement, HolographicButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          ref={ref}
          className={`
            relative overflow-hidden
            bg-gradient-to-r from-primary via-purple-500 to-pink-500
            hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90
            text-white font-semibold
            border-0 shadow-lg
            transition-all duration-300
            ${className}
          `}
          {...props}
        >
          {/* Holographic shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              transform: 'skewX(-20deg)',
            }}
          />
          
          {/* Content */}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {children}
          </span>
        </Button>
      </motion.div>
    );
  }
);

HolographicButton.displayName = "HolographicButton";