import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface LegalTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export interface UseLingoLookupReturn {
  terms: LegalTerm[];
  loading: boolean;
  error: string | null;
  searchTerms: (query: string) => LegalTerm[];
  getTermDefinition: (term: string) => LegalTerm | null;
  highlightTermsInText: (text: string) => Array<{
    text: string;
    isHighlighted: boolean;
    term?: LegalTerm;
  }>;
}

export function useLingoLookup(): UseLingoLookupReturn {
  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('legal_glossary')
          .select('*')
          .order('term');

        if (error) throw error;

        setTerms(data || []);
      } catch (err) {
        console.error('Error fetching legal terms:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch legal terms');
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const searchTerms = (query: string): LegalTerm[] => {
    if (!query.trim()) return [];
    
    const searchQuery = query.toLowerCase();
    return terms.filter(term => 
      term.term.toLowerCase().includes(searchQuery) ||
      term.definition.toLowerCase().includes(searchQuery)
    );
  };

  const getTermDefinition = (term: string): LegalTerm | null => {
    return terms.find(t => 
      t.term.toLowerCase() === term.toLowerCase()
    ) || null;
  };

  const highlightTermsInText = (text: string): Array<{
    text: string;
    isHighlighted: boolean;
    term?: LegalTerm;
  }> => {
    if (!text || terms.length === 0) {
      return [{ text, isHighlighted: false }];
    }

    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);
    
    const result: Array<{
      text: string;
      isHighlighted: boolean;
      term?: LegalTerm;
    }> = [];

    let remainingText = text;
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let foundMatch = false;

      // Check for term matches at current position
      for (const term of sortedTerms) {
        const termRegex = new RegExp(`\\b${term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const match = remainingText.slice(currentIndex - currentIndex).match(termRegex);
        
        if (match && match.index !== undefined) {
          const matchStart = currentIndex + match.index;
          const matchEnd = matchStart + match[0].length;

          // Add text before the match
          if (matchStart > currentIndex) {
            result.push({
              text: text.slice(currentIndex, matchStart),
              isHighlighted: false
            });
          }

          // Add the highlighted term
          result.push({
            text: text.slice(matchStart, matchEnd),
            isHighlighted: true,
            term: term
          });

          currentIndex = matchEnd;
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        // No match found, move to next character
        currentIndex++;
      }
    }

    // Add any remaining text
    if (currentIndex < text.length) {
      result.push({
        text: text.slice(currentIndex),
        isHighlighted: false
      });
    }

    // Merge consecutive non-highlighted segments
    const mergedResult: Array<{
      text: string;
      isHighlighted: boolean;
      term?: LegalTerm;
    }> = [];

    for (const segment of result) {
      if (segment.text.length === 0) continue;

      const lastSegment = mergedResult[mergedResult.length - 1];
      if (lastSegment && !lastSegment.isHighlighted && !segment.isHighlighted) {
        lastSegment.text += segment.text;
      } else {
        mergedResult.push(segment);
      }
    }

    return mergedResult.length > 0 ? mergedResult : [{ text, isHighlighted: false }];
  };

  return {
    terms,
    loading,
    error,
    searchTerms,
    getTermDefinition,
    highlightTermsInText
  };
}