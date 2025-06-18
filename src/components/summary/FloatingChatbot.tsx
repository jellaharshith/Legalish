import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, MoreVertical, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface FloatingChatbotProps {
  legalText: string;
  summary: Array<{ title: string; description: string }>;
  redFlags: string[];
  documentType: string;
}

interface ChatRequest {
  question: string;
  context: {
    legal_text: string;
    summary: Array<{ title: string; description: string }>;
    red_flags: string[];
    document_type: string;
  };
}

interface ChatResponse {
  success: boolean;
  data?: {
    answer: string;
    chunks_used: number;
    processing_time_ms: number;
  };
  error?: string;
}

export default function FloatingChatbot({ legalText, summary, redFlags, documentType }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzedDocument, setHasAnalyzedDocument] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user has analyzed a document
  useEffect(() => {
    const hasDocument = legalText.trim().length > 0 && summary.length > 0;
    setHasAnalyzedDocument(hasDocument);

    if (hasDocument && messages.length === 0) {
      // Add welcome message when document is analyzed
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Hi! I'm V.O.L.T Assistant 🤖\n\nI've analyzed your ${documentType} document and found ${redFlags.length} red flags. I can help you understand any part of your document!\n\nWhat would you like to know?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Show notification if chat is closed
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }
  }, [legalText, summary, redFlags, documentType, messages.length, isOpen]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Clear new message indicator when chat is opened
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!hasAnalyzedDocument) {
      toast({
        title: "No Document Analyzed",
        description: "Please analyze a document first before asking questions.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const chatRequest: ChatRequest = {
        question: userMessage.content,
        context: {
          legal_text: legalText,
          summary: summary,
          red_flags: redFlags,
          document_type: documentType
        }
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ChatResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Chat request failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.data!.answer,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your question right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the key red flags?",
    "Explain termination terms",
    "What are my obligations?",
    "Any hidden costs?",
    "Is this contract fair?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
    setHasNewMessage(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {(!isOpen || isMinimized) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={toggleChat}
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
              size="icon"
            >
              <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
              
              {/* Notification Badge */}
              {hasNewMessage && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
              
              {/* Pulse Animation */}
              {hasAnalyzedDocument && (
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-blue-500/20 bg-background/95 backdrop-blur-sm">
              {/* Chat Header */}
              <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">V.O.L.T Assistant</h3>
                      <p className="text-xs text-blue-100">
                        {hasAnalyzedDocument ? 'Ready to help!' : 'Analyze a document first'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={minimizeChat}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeChat}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Content */}
              <CardContent className="flex-1 flex flex-col p-0">
                {!hasAnalyzedDocument ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-semibold mb-2">No Document Analyzed</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyze a legal document first, then I'll be ready to answer your questions about it!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              {message.role === 'assistant' && (
                                <Avatar className="w-7 h-7 mt-1 shrink-0">
                                  <AvatarFallback className="bg-blue-500/10 text-blue-600">
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                                message.role === 'user' 
                                  ? 'bg-blue-500 text-white rounded-br-md' 
                                  : 'bg-muted/80 text-foreground rounded-bl-md'
                              }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'user' 
                                    ? 'text-blue-100' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>

                              {message.role === 'user' && (
                                <Avatar className="w-7 h-7 mt-1 shrink-0">
                                  <AvatarFallback className="bg-muted">
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2 justify-start"
                          >
                            <Avatar className="w-7 h-7 mt-1 shrink-0">
                              <AvatarFallback className="bg-blue-500/10 text-blue-600">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/80 rounded-2xl rounded-bl-md px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Suggested Questions */}
                        {messages.length <= 1 && !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <p className="text-xs text-muted-foreground text-center">
                              Quick questions:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {suggestedQuestions.map((question, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestedQuestion(question)}
                                  className="text-xs h-auto py-1 px-2 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                  disabled={isLoading}
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-background/50">
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about your document..."
                          disabled={isLoading}
                          className="flex-1 rounded-full border-blue-200 focus:border-blue-400"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          size="icon"
                          className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Powered by V.O.L.T AI
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}