import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface OnboardingState {
  shouldShowTutorial: boolean;
  isFirstTimeUser: boolean;
  hasCompletedTutorial: boolean;
}

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    shouldShowTutorial: false,
    isFirstTimeUser: false,
    hasCompletedTutorial: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const checkOnboardingStatus = async () => {
      try {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const forceTutorial = urlParams.get('tutorial') === 'true';

        if (forceTutorial) {
          setOnboardingState({
            shouldShowTutorial: true,
            isFirstTimeUser: false,
            hasCompletedTutorial: false
          });
          setIsLoading(false);
          return;
        }

        // Check localStorage for completion status
        const localCompleted = localStorage.getItem('legalish_tutorial_completed') === 'true';
        const localSkipped = localStorage.getItem('legalish_tutorial_skipped') === 'true';

        if (localCompleted || localSkipped) {
          setOnboardingState({
            shouldShowTutorial: false,
            isFirstTimeUser: false,
            hasCompletedTutorial: localCompleted
          });
          setIsLoading(false);
          return;
        }

        // If user is logged in, check their profile
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('created_at, terms_analyzed')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setIsLoading(false);
            return;
          }

          if (profile) {
            const createdAt = new Date(profile.created_at);
            const now = new Date();
            const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            
            // Show tutorial if:
            // 1. User created account within last 24 hours AND
            // 2. Has analyzed 0 documents AND
            // 3. Hasn't completed/skipped tutorial
            const isNewUser = hoursSinceCreation < 24;
            const hasNoAnalyses = (profile.terms_analyzed || 0) === 0;
            
            if (isNewUser && hasNoAnalyses) {
              setOnboardingState({
                shouldShowTutorial: true,
                isFirstTimeUser: true,
                hasCompletedTutorial: false
              });
            } else {
              setOnboardingState({
                shouldShowTutorial: false,
                isFirstTimeUser: false,
                hasCompletedTutorial: true
              });
            }
          }
        } else {
          // For non-logged-in users, check if they've seen the tutorial
          setOnboardingState({
            shouldShowTutorial: !localCompleted && !localSkipped,
            isFirstTimeUser: true,
            hasCompletedTutorial: localCompleted
          });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  const startTutorial = () => {
    setOnboardingState(prev => ({
      ...prev,
      shouldShowTutorial: true
    }));
  };

  const completeTutorial = () => {
    localStorage.setItem('legalish_tutorial_completed', 'true');
    localStorage.setItem('legalish_tutorial_completed_at', new Date().toISOString());
    setOnboardingState({
      shouldShowTutorial: false,
      isFirstTimeUser: false,
      hasCompletedTutorial: true
    });
  };

  const skipTutorial = () => {
    localStorage.setItem('legalish_tutorial_skipped', 'true');
    setOnboardingState(prev => ({
      ...prev,
      shouldShowTutorial: false
    }));
  };

  return {
    ...onboardingState,
    isLoading,
    startTutorial,
    completeTutorial,
    skipTutorial
  };
}