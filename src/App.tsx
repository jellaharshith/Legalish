import { useState } from 'react';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import SummaryPage from '@/pages/SummaryPage';
import UpgradePage from '@/pages/UpgradePage';
import DashboardPage from '@/pages/DashboardPage';
import SuccessPage from '@/pages/SuccessPage';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { LegalTermsProvider } from '@/context/LegalTermsContext';
import { AuthProvider } from '@/context/AuthContext';
import { TutorialProvider } from '@/components/onboarding/TutorialProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="volt-ui-theme">
      <AuthProvider>
        <TutorialProvider>
          <LegalTermsProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/upgrade" element={<UpgradePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                  </Routes>
                </main>
                <Toaster />
              </div>
            </Router>
          </LegalTermsProvider>
        </TutorialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;