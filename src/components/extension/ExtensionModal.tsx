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
  Clock
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
      status: 'available',
      downloadUrl: '#',
      description: 'Full-featured extension with all capabilities',
      users: '10,000+',
      rating: 4.8
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

  const handleInstallExtension = (browser: string) => {
    if (browser === 'chrome') {
      // For now, show installation instructions
      // In production, this would link to Chrome Web Store
      window.open('https://chrome.google.com/webstore', '_blank');
    }
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="install">Install</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

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
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Documents Analyzed</div>
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

            {/* CTA */}
            <div className="text-center">
              <Button 
                onClick={() => handleInstallExtension('chrome')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Install Chrome Extension
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="install" className="space-y-6">
            {/* Browser Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Browser</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {browsers.map((browser) => (
                  <Card 
                    key={browser.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedBrowser === browser.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBrowser(browser.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <browser.icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <h4 className="font-semibold mb-2">{browser.name}</h4>
                      
                      {browser.status === 'available' ? (
                        <div className="space-y-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{browser.rating}</span>
                            </div>
                            <div>{browser.users} users</div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Installation Instructions
                </CardTitle>
                <CardDescription>
                  Follow these steps to install the Legalish extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBrowser === 'chrome' ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Visit Chrome Web Store</p>
                        <p className="text-sm text-muted-foreground">Click the button below to open the extension page</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Click "Add to Chrome"</p>
                        <p className="text-sm text-muted-foreground">Review permissions and confirm installation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Sign in to your Legalish account</p>
                        <p className="text-sm text-muted-foreground">Access Pro features and sync your analysis history</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                      <div>
                        <p className="font-medium">Start analyzing!</p>
                        <p className="text-sm text-muted-foreground">Visit any legal document and click the extension icon</p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={() => handleInstallExtension('chrome')}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        Install Chrome Extension
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Coming Soon</h4>
                    <p className="text-muted-foreground mb-4">
                      We're working on bringing Legalish to {browsers.find(b => b.id === selectedBrowser)?.name}. 
                      Sign up for updates to be notified when it's ready!
                    </p>
                    <Button variant="outline">
                      Notify Me When Ready
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Privacy & Security</h4>
                    <p className="text-sm text-blue-800">
                      The Legalish extension only accesses content when you explicitly request analysis. 
                      We don't collect or store personal data beyond what's necessary for the service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                          privacy policies, and contract clauses.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Text Selection</Badge>
                          <Badge variant="secondary">Right-Click Menu</Badge>
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
                          one-sided terms, and unfair conditions.
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
                          and sync across all your devices.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Cloud Sync</Badge>
                          <Badge variant="secondary">Pro Features</Badge>
                          <Badge variant="secondary">History Tracking</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Multiple Analysis Tones</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Choose from 8 different analysis personalities, from serious professional 
                          to sarcastic and humorous interpretations.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">8 Voice Tones</Badge>
                          <Badge variant="secondary">Audio Playback</Badge>
                          <Badge variant="secondary">Premium Voices</Badge>
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
                      <p className="font-medium">Browse any website</p>
                      <p className="text-sm text-muted-foreground">The extension works on all websites</p>
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
                      <p className="font-medium">Listen to audio summary (Pro)</p>
                      <p className="text-sm text-muted-foreground">Premium AI voices read the analysis</p>
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