import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User, Menu, X, HelpCircle, Download, Chrome, Siren as Firefox, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTutorial } from '@/components/onboarding/TutorialProvider';
import AuthModal from '@/components/auth/AuthModal';
import ExtensionModal from '@/components/extension/ExtensionModal';

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { startTutorial } = useTutorial();

  // Change navbar style on scroll
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    });
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/summary', label: 'Analyze' },
    { path: '/upgrade', label: 'Pricing' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/Logo-version-1.png" 
              alt="Legalish Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Legalish
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-all duration-200 hover:text-primary relative ${
                location.pathname === link.path 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
          <Link
            to="/privacy"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary relative ${
              location.pathname === '/privacy' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Privacy
            {location.pathname === '/privacy' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Tutorial Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={startTutorial}
            className="text-sm flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Tutorial
          </Button>

          {/* Extension Button */}
          <ExtensionModal>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Extension
            </Button>
          </ExtensionModal>

          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-sm"
              >
                Sign Out
              </Button>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${location.pathname === '/dashboard' ? 'border-primary text-primary bg-primary/10' : ''}`}
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <AuthModal>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-medium px-6"
              >
                Sign In
              </Button>
            </AuthModal>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg md:hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-lg font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <Link
                to="/privacy"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-lg font-medium transition-colors ${
                  location.pathname === '/privacy' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Privacy
              </Link>
              
              <div className="pt-4 border-t border-border space-y-3">
                {/* Tutorial Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    startTutorial();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Tutorial
                </Button>

                {/* Extension Button */}
                <ExtensionModal>
                  <Button
                    variant="outline"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Get Extension
                  </Button>
                </ExtensionModal>

                {user ? (
                  <div className="space-y-2">
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <AuthModal>
                    <Button
                      variant="default"
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </AuthModal>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}