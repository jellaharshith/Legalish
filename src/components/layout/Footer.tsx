import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Company info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/Logo-version-1.png" 
                alt="Legalish Logo" 
                className="w-6 h-6 object-contain"
              />
              <span className="font-semibold text-foreground">Legalish</span>
            </div>
            <span className="text-muted-foreground text-sm">
              © 2025 Legalish. All rights reserved.
            </span>
          </div>

          {/* Right side - Built on Bolt badge */}
          <motion.a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Built on</span>
            <span className="font-bold">Bolt</span>
            <ExternalLink className="h-3 w-3" />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}