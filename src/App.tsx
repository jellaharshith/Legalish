import { useState } from 'react';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import HomePage from '@/pages/HomePage';
import SummaryPage from '@/pages/SummaryPage';
import UpgradePage from '@/pages/UpgradePage';
import DashboardPage from '@/pages/DashboardPage';
import SuccessPage from '@/pages/SuccessPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { LegalTermsProvider } from '@/context/LegalTermsContext';
import { AuthProvider } from '@/context/AuthContext';
import { TutorialProvider } from '@/components/onboarding/TutorialProvider';

// Create Sentry-wrapped Router for automatic route tracking
const SentryRouter = Sentry.withSentryRouting(Router);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="volt-ui-theme">
      <AuthProvider>
        <TutorialProvider>
          <LegalTermsProvider>
            <SentryRouter>
              <div className="min-h-screen bg-background font-sans flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/upgrade" element={<UpgradePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </SentryRouter>
          </LegalTermsProvider>
        </TutorialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Sentry.withProfiler(App);