import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionSearchBar, Action } from '@/components/ui/action-search-bar';
import { FileText, Home, Briefcase, X, Check } from 'lucide-react';

interface DocumentTypeSelectorProps {
  documentType: string;
  setDocumentType: (type: string) => void;
}

export default function DocumentTypeSelector({ documentType, setDocumentType }: DocumentTypeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const documentTypeActions: Action[] = [
    {
      id: 'general',
      label: 'General Contract',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: 'Standard legal document analysis',
      short: '📄',
      end: 'Default'
    },
    {
      id: 'lease',
      label: 'Lease Agreement',
      icon: <Home className="h-5 w-5 text-green-500" />,
      description: 'Specialized for rental agreements',
      short: '🏠',
      end: 'Housing'
    },
    {
      id: 'employment',
      label: 'Employment Contract',
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      description: 'Optimized for job contracts',
      short: '💼',
      end: 'Work'
    }
  ];

  const handleTypeSelect = (action: Action) => {
    setDocumentType(action.id);
    setIsExpanded(false);
  };

  const getSelectedAction = () => {
    return documentTypeActions.find(action => action.id === documentType) || documentTypeActions[0];
  };

  const getDocumentTypeDescription = (type: string) => {
    switch (type) {
      case 'general':
        return 'Standard legal document analysis with general contract expertise';
      case 'lease':
        return 'Specialized analysis for rental agreements, lease contracts, and housing terms';
      case 'employment':
        return 'Optimized analysis for job contracts, employment terms, and workplace agreements';
      default:
        return 'Standard legal document analysis';
    }
  };

  const selectedAction = getSelectedAction();

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Document Type</h3>
            <p className="text-sm text-muted-foreground">Choose the type of legal document for specialized analysis</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isExpanded ? (
          <div>
            {/* Current Selection Display */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                {selectedAction.icon}
                <div>
                  <p className="font-medium">{selectedAction.label}</p>
                  <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-8"
                >
                  Change
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getDocumentTypeDescription(documentType)}
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Select Document Type</p>
                <p className="text-sm text-muted-foreground">Choose the most appropriate type for better analysis</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Search Bar */}
            <ActionSearchBar
              actions={documentTypeActions}
              onActionSelect={handleTypeSelect}
              placeholder="Search document types..."
              label="What type of document are you analyzing?"
              className="max-w-none"
              defaultExpanded={true}
            />

            {/* Type Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {documentTypeActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    documentType === action.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleTypeSelect(action)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {action.icon}
                    <span className="font-medium text-sm">{action.label}</span>
                    {documentType === action.id && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              ))}
            </div>

            {/* Benefits of Specialized Analysis */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Why Document Type Matters
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• <strong>Specialized Analysis:</strong> Each type uses domain-specific knowledge</p>
                <p>• <strong>Relevant Red Flags:</strong> Identifies issues specific to that document type</p>
                <p>• <strong>Better Context:</strong> AI understands the purpose and common clauses</p>
                <p>• <strong>Accurate Summaries:</strong> Focuses on what matters most for that contract type</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}