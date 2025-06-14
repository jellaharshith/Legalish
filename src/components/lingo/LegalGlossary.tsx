import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Briefcase, Home, FileText } from 'lucide-react';
import { useLingoLookup, LegalTerm } from '@/hooks/useLingoLookup';

export default function LegalGlossary() {
  const { terms, loading, error, searchTerms } = useLingoLookup();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTerms = searchQuery 
    ? searchTerms(searchQuery)
    : selectedCategory === 'all' 
      ? terms 
      : terms.filter(term => term.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Terms', icon: BookOpen, count: terms.length },
    { id: 'general', label: 'General', icon: FileText, count: terms.filter(t => t.category === 'general').length },
    { id: 'employment', label: 'Employment', icon: Briefcase, count: terms.filter(t => t.category === 'employment').length },
    { id: 'lease', label: 'Lease', icon: Home, count: terms.filter(t => t.category === 'lease').length },
  ];

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md"></div>
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading legal terms: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Legal Glossary</h3>
          <Badge variant="outline" className="ml-auto">
            {filteredTerms.length} terms
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search legal terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2 text-xs"
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No terms found matching your search.</p>
              </div>
            ) : (
              filteredTerms.map((term, index) => (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{term.term}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(term.category)}`}
                        >
                          {term.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {term.definition}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}