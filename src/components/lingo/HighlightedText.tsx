import { LegalTerm } from '@/hooks/useLingoLookup';
import LegalTermTooltip from './LegalTermTooltip';

interface HighlightedTextProps {
  segments: Array<{
    text: string;
    isHighlighted: boolean;
    term?: LegalTerm;
  }>;
  className?: string;
}

export default function HighlightedText({ segments, className = '' }: HighlightedTextProps) {
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.isHighlighted && segment.term) {
          return (
            <LegalTermTooltip key={index} term={segment.term}>
              {segment.text}
            </LegalTermTooltip>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
}