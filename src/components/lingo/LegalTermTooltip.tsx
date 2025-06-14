import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { LegalTerm } from '@/hooks/useLingoLookup';

interface LegalTermTooltipProps {
  term: LegalTerm;
  children: React.ReactNode;
}

export default function LegalTermTooltip({ term, children }: LegalTermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employment':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'lease':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'general':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <span 
          className="underline decoration-primary/50 decoration-dotted cursor-help hover:decoration-solid transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="top" align="center">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">{term.term}</h4>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getCategoryColor(term.category)}`}
            >
              {term.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {term.definition}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}