import { motion } from 'framer-motion';
import { useLegalTerms } from '@/context/LegalTermsContext';

export default function SummaryHighlights() {
  const { summary } = useLegalTerms();

  if (!summary || summary.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground italic">
          Paste some terms and hit "Analyze" to see a summary here.
        </p>
      </div>
    );
  }

  // Get the first summary item which contains the paragraph summary
  const summaryItem = summary[0];

  if (!summaryItem || !summaryItem.description) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground italic">
          No summary available. Please try analyzing the terms again.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold mb-4">Summary</h2>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border border-border rounded-md bg-card/50"
      >
        <p className="text-foreground leading-relaxed text-base">
          {summaryItem.description}
        </p>
      </motion.div>
    </motion.div>
  );
}