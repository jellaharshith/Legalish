import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface RedFlagBadgeProps {
  text: string;
}

export default function RedFlagBadge({ text }: RedFlagBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-md"
    >
      <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
      <div>
        <p className="font-medium text-destructive">{text}</p>
      </div>
    </motion.div>
  );
}