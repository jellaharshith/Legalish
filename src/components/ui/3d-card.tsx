import { motion } from 'framer-motion';
import { useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function Card3D({ children, className = "", intensity = 1 }: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`perspective-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        rotateY: 5 * intensity,
        rotateX: 5 * intensity,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 80px rgba(139, 92, 246, 0.3)`
            : `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
        }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}