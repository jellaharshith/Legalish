import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Chrome, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Shield, 
  Globe,
  Smartphone,
  Monitor,
  ArrowRight,
  Star,
  Users,
  Clock,
  Code,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';

interface ExtensionModalProps {
  children: React.ReactNode;
}

export default function ExtensionModal({ children }: ExtensionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox' | 'edge'>('chrome');

  const browsers = [
    {
      id: 'chrome' as const,
      name: 'Chrome',
      icon: Chrome,
      status: 'development',
      downloadUrl: '#',
      description: 'Available for developer installation',
      users: 'Dev Mode',
      rating: null
    },
    {
      id: 'firefox' as const,
      name: 'Firefox',
      icon: Globe,
      status: 'coming-soon',
      downloadUrl: '#',
      description: 'Coming soon with full feature parity',
      users: 'Soon',
      rating: null
    },
    {
      id: 'edge' as const,
      name: 'Edge',
      icon: Monitor,
      status: 'coming-soon',
      downloadUrl: '#',
      description: 'Microsoft Edge support in development',
      users: 'Soon',
      rating: null
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Analysis',
      description: 'Analyze legal text on any webpage with one click',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Red Flag Detection',
      description: 'Automatically identify concerning clauses',
      color: 'text-red-500'
    },
    {
      icon: Globe,
      title: 'Works Everywhere',
      description: 'Analyze terms on any website you visit',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: 'Sync with Account',
      description: 'Access your analysis history across devices',
      color: 'text-green-500'
    }
  ];

  const handleInstallExtension = () => {
    // For development version, show installation instructions
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Download className="h-6 w-6 text-primary" />
            Legalish Browser Extension
          </DialogTitle>
          <DialogDescription>
            Bring AI-powered legal analysis to every webpage you visit. Analyze terms of service, 
            privacy policies, and contracts without leaving your browser.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="install" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="install">Install</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="install" className="space-y-6">
            {/* Current Status */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Development Version Available</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      The Legalish extension is currently in development. You can install it manually for testing.
                      We're working on publishing it to the Chrome Web Store soon!
                    </p>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Chrome Web Store: Coming Soon
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Developer Installation (Chrome)
                </CardTitle>
                <CardDescription>
                  Install the extension manually for testing and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Download Extension Files</p>
                      <p className="text-sm text-muted-foreground">Get the extension source code from the project repository</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Open Chrome Extensions</p>
                      <p className="text-sm text-muted-foreground">Go to <code className="bg-muted px-1 rounded">chrome://extensions/</code> in your browser</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Enable Developer Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle "Developer mode" in the top right corner</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium">Load Unpacked Extension</p>
                      <p className="text-sm text-muted-foreground">Click "Load unpacked" and select the extension folder</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                    <div>
                      <p className="font-medium">Sign In & Start Analyzing</p>
                      <p className="text-sm text-muted-foreground">Sign in to your Legalish account and start analyzing legal documents</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Chrome className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Quick Setup</h4>
                      <p className="text-sm text-blue-800">Open Chrome Extensions page directly</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open('chrome://extensions/', '_blank')}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Extensions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Notice */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Chrome Web Store Coming Soon</h4>
                    <p className="text-sm text-green-800 mb-3">
                      We're preparing the extension for publication on the Chrome Web Store. 
                      Once published, installation will be as simple as clicking "Add to Chrome"!
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        In Review Process
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Legal Analysis, Everywhere</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The Legalish extension brings our powerful AI analysis directly to your browser. 
                Analyze any legal document on any website with just a few clicks.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">Dev</div>
                <div className="text-sm text-muted-foreground">Version</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Functional</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">PDF</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </Card>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 h-full">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${feature.color}`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Feature Showcase */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Extension Features</h3>
                <div className="grid gap-4">
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">One-Click Analysis</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Select any text on a webpage and analyze it instantly. Perfect for terms of service, 
                          privacy policies, and contract clauses. Now with full PDF support!
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Text Selection</Badge>
                          <Badge variant="secondary">Right-Click Menu</Badge>
                          <Badge variant="secondary">PDF Analysis</Badge>
                          <Badge variant="secondary">Full Page Analysis</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Smart Red Flag Detection</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Our AI automatically identifies concerning clauses like hidden fees, 
                          one-sided terms, and unfair conditions using advanced RAG technology.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">AI-Powered</Badge>
                          <Badge variant="secondary">Real-time Analysis</Badge>
                          <Badge variant="secondary">Legal Expertise</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Account Integration</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Sign in with your Legalish account to access Pro features, save analysis history, 
                          and sync across all your devices automatically.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Auto-Sync</Badge>
                          <Badge variant="secondary">Pro Features</Badge>
                          <Badge variant="secondary">History Tracking</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">PDF Document Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatically detects and analyzes PDF legal documents using URL-based analysis.
                          Perfect for lease agreements, contracts, and terms of service PDFs.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">PDF Detection</Badge>
                          <Badge variant="secondary">URL Analysis</Badge>
                          <Badge variant="secondary">Auto-Extract</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Browse any website or PDF</p>
                      <p className="text-sm text-muted-foreground">The extension works on all websites and PDF documents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Select legal text or click the extension icon</p>
                      <p className="text-sm text-muted-foreground">Choose what you want to analyze</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Get instant AI analysis</p>
                      <p className="text-sm text-muted-foreground">Summary and red flags in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium">Access full results in main app</p>
                      <p className="text-sm text-muted-foreground">Open complete analysis with audio features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}