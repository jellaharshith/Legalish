import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="inline-block mb-3 px-4 py-1 bg-primary/10 text-primary rounded-full font-medium text-sm">
        Legal Terms Speedrun Any%
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
          V.OL.T
        </span>
      </h1>
      <h2 className="text-2xl md:text-3xl font-medium mb-6">Voice of Legal Terms</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
        Stop scrolling through boring Terms of Service. Let our AI translate legal jargon into 
        something you'll actually understand — with a side of humor.
      </p>
    </motion.div>
  );
}