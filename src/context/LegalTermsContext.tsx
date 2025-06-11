import { createContext, useContext, useState, ReactNode } from 'react';

interface SummaryItem {
  title: string;
  description: string;
}

type ToneType = 'serious' | 'sarcastic' | 'meme' | 'ominous' | 'academic' | 'child' | 'authoritative' | 'wizard';
type DocumentType = 'general' | 'lease' | 'employment';

interface LegalTermsContextType {
  legalText: string;
  setLegalText: (text: string) => void;
  summary: SummaryItem[];
  setSummary: (summary: SummaryItem[]) => void;
  redFlags: string[];
  setRedFlags: (flags: string[]) => void;
  tone: ToneType;
  setTone: (tone: ToneType) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (voiceId: string) => void;
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
}

const LegalTermsContext = createContext<LegalTermsContextType | undefined>(undefined);

export function useLegalTerms() {
  const context = useContext(LegalTermsContext);
  if (!context) {
    throw new Error('useLegalTerms must be used within a LegalTermsProvider');
  }
  return context;
}

interface LegalTermsProviderProps {
  children: ReactNode;
}

export function LegalTermsProvider({ children }: LegalTermsProviderProps) {
  const [legalText, setLegalText] = useState('');
  const [tone, setTone] = useState<ToneType>('serious');
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('general');

  return (
    <LegalTermsContext.Provider value={{ 
      legalText, 
      setLegalText, 
      summary, 
      setSummary,
      redFlags, 
      setRedFlags,
      tone, 
      setTone,
      selectedVoiceId,
      setSelectedVoiceId,
      documentType,
      setDocumentType
    }}>
      {children}
    </LegalTermsContext.Provider>
  );
}