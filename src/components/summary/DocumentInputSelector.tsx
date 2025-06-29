import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ActionSearchBar, Action } from '@/components/ui/action-search-bar';
import { FileText, Link as LinkIcon, Upload, Zap, X, Check, Lock, Crown, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DocumentInputSelectorProps {
  legalText: string;
  setLegalText: (text: string) => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  validationErrors: {
    text?: string;
    url?: string;
    file?: string;
  };
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalysisDisabled?: boolean;
}

type InputMethod = 'text' | 'url' | 'file' | null;

export default function DocumentInputSelector({
  legalText,
  setLegalText,
  urlInput,
  setUrlInput,
  onFileChange,
  fileInputRef,
  validationErrors,
  onTextChange,
  onUrlChange,
  isAnalysisDisabled = false
}: DocumentInputSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const inputActions: Action[] = [
    {
      id: 'text',
      label: 'Paste Text',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: 'Copy and paste your legal document text',
      short: '⌘V',
      end: 'Quick',
      onClick: () => setSelectedMethod('text')
    },
    {
      id: 'url',
      label: 'Enter URL',
      icon: <LinkIcon className="h-5 w-5 text-green-500" />,
      description: 'Provide a link to terms of service',
      short: '🔗',
      end: 'Auto',
      onClick: () => setSelectedMethod('url')
    },
    {
      id: 'file',
      label: 'Upload Document',
      icon: <Upload className="h-5 w-5 text-purple-500" />,
      description: 'Upload PDF, DOC, TXT, or RTF files',
      short: '📄',
      end: 'File',
      onClick: () => setSelectedMethod('file')
    }
  ];

  const handleMethodSelect = (action: Action) => {
    if (isAnalysisDisabled) {
      toast({
        title: "Demo Mode",
        description: "Custom input is disabled in demo mode. Upgrade to Pro to analyze your own documents.",
        variant: "destructive"
      });
      return;
    }

    setSelectedMethod(action.id as InputMethod);
    
    // Clear other inputs when switching methods
    if (action.id === 'text') {
      setUrlInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (action.id === 'url') {
      setLegalText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (action.id === 'file') {
      setLegalText('');
      setUrlInput('');
    }
  };

  const clearSelection = () => {
    if (isAnalysisDisabled) return;
    
    setSelectedMethod(null);
    setLegalText('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasInput = () => {
    return (legalText.trim().length > 0) || 
           (urlInput.trim().length > 0) || 
           (fileInputRef.current?.files?.length || 0) > 0;
  };

  const getInputStatus = () => {
    if (legalText.trim().length > 0) return { method: 'text', status: 'ready' };
    if (urlInput.trim().length > 0) return { method: 'url', status: 'ready' };
    if (fileInputRef.current?.files?.length) return { method: 'file', status: 'ready' };
    return { method: null, status: 'empty' };
  };

  const inputStatus = getInputStatus();

  // Helper function to validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Get preview content based on current input
  const getPreviewContent = () => {
    if (selectedMethod === 'text' && legalText.trim().length > 0) {
      return {
        type: 'text',
        content: legalText,
        title: 'Text Content Preview'
      };
    }
    
    if (selectedMethod === 'url' && urlInput.trim().length > 0) {
      return {
        type: 'url',
        content: urlInput,
        title: 'URL Preview',
        isValid: isValidUrl(urlInput)
      };
    }
    
    if (selectedMethod === 'file' && fileInputRef.current?.files?.length && legalText.trim().length > 0) {
      return {
        type: 'file',
        content: legalText,
        title: 'File Content Preview',
        fileName: fileInputRef.current.files[0].name
      };
    }
    
    return null;
  };

  const previewContent = getPreviewContent();

  return (
    <Card className="border-2 border-muted shadow-lg" data-tutorial="upload-section">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Input Document</h3>
              <p className="text-sm text-muted-foreground">
                {isAnalysisDisabled 
                  ? "Demo document is loaded and ready for analysis"
                  : "Choose how you'd like to provide your legal document"
                }
              </p>
            </div>
          </div>
          
          {hasInput() && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3 mr-1" />
                {isAnalysisDisabled ? 'Demo Ready' : (
                  inputStatus.method === 'text' ? 'Text Ready' :
                  inputStatus.method === 'url' ? 'URL Ready' :
                  inputStatus.method === 'file' ? 'File Ready' : 'Ready'
                )}
              </Badge>
              {!isAnalysisDisabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isAnalysisDisabled ? (
          // Demo Mode Display
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-muted">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Demo Document Loaded</p>
                  <p className="text-sm text-muted-foreground">Sample Terms of Service ready for analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
                  <Lock className="h-3 w-3 mr-1" />
                  Demo Mode
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Unlock Custom Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to analyze your own documents with text input, URL fetching, and file uploads.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/upgrade')}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : !selectedMethod ? (
          <div>
            <ActionSearchBar
              actions={inputActions}
              onActionSelect={handleMethodSelect}
              placeholder="Search input methods..."
              label="How would you like to input your document?"
              className="max-w-none"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Method Header */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                {selectedMethod === 'text' && <FileText className="h-5 w-5 text-blue-500" />}
                {selectedMethod === 'url' && <LinkIcon className="h-5 w-5 text-green-500" />}
                {selectedMethod === 'file' && <Upload className="h-5 w-5 text-purple-500" />}
                <div>
                  <p className="font-medium">
                    {selectedMethod === 'text' && 'Text Input'}
                    {selectedMethod === 'url' && 'URL Input'}
                    {selectedMethod === 'file' && 'File Upload'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMethod === 'text' && 'Paste your legal document text below'}
                    {selectedMethod === 'url' && 'Enter the URL to your terms of service'}
                    {selectedMethod === 'file' && 'Upload your document file'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMethod(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Input Fields */}
            {selectedMethod === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="text" className="text-base font-medium">Document Text</Label>
                <Textarea 
                  id="text"
                  value={legalText}
                  onChange={onTextChange}
                  placeholder="Paste your legal document text here..."
                  className={`min-h-[200px] resize-none font-mono text-sm ${
                    validationErrors.text ? 'border-destructive' : ''
                  }`}
                  disabled={isAnalysisDisabled}
                />
                {validationErrors.text && (
                  <p className="text-sm text-destructive">{validationErrors.text}</p>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{legalText.length}/2,800 characters</span>
                  <Badge variant="outline" className="text-xs">
                    {legalText.length > 0 ? 'Text ready' : 'Enter text'}
                  </Badge>
                </div>
              </div>
            )}

            {selectedMethod === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="url" className="text-base font-medium">Document URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={urlInput}
                  onChange={onUrlChange}
                  placeholder="https://example.com/terms-of-service"
                  className={`h-12 ${validationErrors.url ? 'border-destructive' : ''}`}
                  disabled={isAnalysisDisabled}
                />
                {validationErrors.url && (
                  <p className="text-sm text-destructive">{validationErrors.url}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll automatically extract the text content from the webpage
                </p>
              </div>
            )}

            {selectedMethod === 'file' && (
              <div className="space-y-2">
                <Label htmlFor="file" className="text-base font-medium">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept=".txt,.doc,.docx,.pdf,.rtf"
                  className={`h-12 cursor-pointer ${validationErrors.file ? 'border-destructive' : ''}`}
                  disabled={isAnalysisDisabled}
                />
                {validationErrors.file && (
                  <p className="text-sm text-destructive">{validationErrors.file}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Supported formats: TXT, DOC, DOCX, PDF, RTF (max 20MB)
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMethod(null)}
                className="flex items-center gap-2"
                disabled={isAnalysisDisabled}
              >
                <X className="h-4 w-4" />
                Change Method
              </Button>
              
              {hasInput() && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Ready to analyze
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Document Preview Section */}
        {previewContent && !isAnalysisDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500/10 rounded-md flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-foreground">{previewContent.title}</h4>
                {previewContent.fileName && (
                  <Badge variant="outline" className="text-xs">
                    {previewContent.fileName}
                  </Badge>
                )}
              </div>

              {previewContent.type === 'url' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Target URL:</span>
                      {previewContent.isValid ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Valid URL
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                          Invalid URL
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono break-all text-blue-600">
                      {previewContent.content}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">i</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Content Preview Not Available</p>
                        <p>
                          The actual webpage content will be fetched and analyzed by our server during the analysis process. 
                          Client-side preview is not available due to CORS (Cross-Origin Resource Sharing) security restrictions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={previewContent.content}
                      readOnly
                      className="min-h-[150px] max-h-[300px] resize-none font-mono text-sm bg-muted/30 border-muted"
                      placeholder="Document content will appear here..."
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-background">
                        {previewContent.content.length} characters
                      </Badge>
                    </div>
                  </div>
                  {previewContent.content.length > 2800 && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        ⚠️ Content exceeds 2,800 character limit. It will be truncated during analysis.
                      </p>
                    </div>
                  )}
                  {previewContent.content.length < 10 && (
                    <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        ⚠️ Content is too short. Please provide at least 10 characters for analysis.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}