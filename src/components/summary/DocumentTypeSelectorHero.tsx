import { useState, useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, Briefcase, Check, ArrowRight } from 'lucide-react';

interface DocumentTypeSelectorHeroProps {
  documentType: string;
  setDocumentType: (type: string) => void;
  onComplete: () => void;
}

const documentTypes = [
  {
    id: 'general',
    name: 'General Contract',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Standard legal document analysis with general contract expertise',
    features: [
      'Universal contract clause detection',
      'Standard red flag identification',
      'General legal term analysis',
      'Basic compliance checking'
    ]
  },
  {
    id: 'lease',
    name: 'Lease Agreement',
    icon: Home,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Specialized analysis for rental agreements, lease contracts, and housing terms',
    features: [
      'Rental-specific clause analysis',
      'Security deposit term review',
      'Maintenance responsibility detection',
      'Tenant rights identification'
    ]
  },
  {
    id: 'employment',
    name: 'Employment Contract',
    icon: Briefcase,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Optimized analysis for job contracts, employment terms, and workplace agreements',
    features: [
      'Employment law compliance',
      'Non-compete clause analysis',
      'Compensation structure review',
      'Termination condition assessment'
    ]
  }
];

export default function DocumentTypeSelectorHero({ documentType, setDocumentType, onComplete }: DocumentTypeSelectorHeroProps) {
  const [selectedType, setSelectedType] = useState(documentType);

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setDocumentType(typeId);
  };

  const handleContinue = () => {
    onComplete();
  };

  const selectedTypeData = documentTypes.find(type => type.id === selectedType) || documentTypes[0];
  const SelectedIcon = selectedTypeData.icon;

  return (
    <div className="min-h-screen">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1280&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1920&auto=format&fit=crop"
        title="Choose Document Type"
        date="Legal Analysis"
        scrollToExpand="Scroll to Select Type"
        textBlend
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Select Your Document Type
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose the type of legal document you're analyzing for specialized, 
              domain-specific analysis that understands the nuances of your contract.
            </p>
          </div>

          {/* Document Type Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {documentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? `border-2 ${type.borderColor} ${type.bgColor} shadow-lg` 
                      : 'border border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${type.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{type.name}</h3>
                        {isSelected && (
                          <Badge variant="outline" className={`${type.bgColor} ${type.color} ${type.borderColor} mt-1`}>
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {type.description}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Specialized Features:
                      </p>
                      <ul className="space-y-1">
                        {type.features.map((feature, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${type.color.replace('text-', 'bg-')}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Type Summary */}
          <Card className={`border-2 ${selectedTypeData.borderColor} ${selectedTypeData.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${selectedTypeData.bgColor} flex items-center justify-center`}>
                    <SelectedIcon className={`h-8 w-8 ${selectedTypeData.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {selectedTypeData.name} Selected
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedTypeData.description}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-6 py-3"
                >
                  Continue with {selectedTypeData.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Why Document Type Matters */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Why Specialized Analysis Matters
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Domain Expertise:</strong> Each document type has unique legal patterns and common clauses
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Targeted Red Flags:</strong> Identifies issues specific to that contract type
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Contextual Understanding:</strong> AI knows what to look for in each document category
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  What You Get
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Accurate Summaries:</strong> Focuses on clauses that matter most for your document type
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Relevant Insights:</strong> Analysis tailored to your specific legal context
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Better Protection:</strong> Catches issues you might miss without domain knowledge
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}