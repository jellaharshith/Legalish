import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Key, FileText, Link as LinkIcon, Upload, CreditCard, Save, Edit } from 'lucide-react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  terms_analyzed: number;
}

interface Analysis {
  id: string;
  input_text: string;
  input_url: string | null;
  input_file_name: string | null;
  summary_data: Array<{ title: string; description: string }>;
  red_flags_data: string[];
  created_at: string;
  analysis_time_ms: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { getSubscription } = useStripe();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode by default

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/');
      return;
    }

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, subscription_tier, terms_analyzed')
          .eq('id', user.id)
          .single();

        if (error) {
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: null,
                avatar_url: null,
                subscription_tier: 'free',
                terms_analyzed: 0
              })
              .select('full_name, avatar_url, subscription_tier, terms_analyzed')
              .single();

            if (createError) throw createError;
            
            setProfile(newProfile);
            setFullName(newProfile.full_name || '');
            setAvatarUrl(newProfile.avatar_url || '');
          } else {
            throw error;
          }
        } else {
          setProfile(data);
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url || '');
          // If user already has a name, don't start in edit mode
          if (data.full_name && data.full_name.trim()) {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setProfileLoading(false);
      }
    }

    async function loadSubscription() {
      try {
        const subscriptionData = await getSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    }

    async function loadAnalyses() {
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        setAnalyses(data || []);
      } catch (error) {
        console.error('Error loading analyses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analysis history',
          variant: 'destructive',
        });
      } finally {
        setAnalysesLoading(false);
      }
    }

    loadProfile();
    loadSubscription();
    loadAnalyses();
  }, [user, navigate, toast, loading, getSubscription]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate inputs
    if (fullName.trim().length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Full name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (avatarUrl && !isValidUrl(avatarUrl)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid URL for the avatar',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        full_name: fullName.trim(), 
        avatar_url: avatarUrl.trim() || null 
      } : null);
      
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(profile?.full_name || '');
    setAvatarUrl(profile?.avatar_url || '');
    setIsEditing(false);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getSubscriptionStatus = () => {
    if (subscriptionLoading) return 'Loading...';
    if (!subscription) return 'Free';
    
    const status = subscription.subscription_status;
    if (status === 'active') return 'Pro';
    if (status === 'past_due') return 'Past Due';
    if (status === 'canceled') return 'Canceled';
    return 'Free';
  };

  const getSubscriptionBadgeVariant = () => {
    const status = subscription?.subscription_status;
    if (status === 'active') return 'default';
    if (status === 'past_due') return 'destructive';
    if (status === 'canceled') return 'secondary';
    return 'outline';
  };

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[400px] bg-muted rounded-lg"></div>
              <div className="h-[400px] bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Profile Header - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                <User className="h-6 w-6 sm:h-8 sm:w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'Your Profile'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base truncate">{user?.email}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                <Badge variant={getSubscriptionBadgeVariant()}>
                  {getSubscriptionStatus()}
                </Badge>
                {subscription?.subscription_status === 'active' && subscription?.current_period_end && (
                  <span className="text-xs text-muted-foreground">
                    Renews {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid - Responsive */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Profile Settings Card */}
            <Card className="border-2 border-muted shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Settings className="h-5 w-5" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription className="text-sm">Update your personal information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-10"
                    disabled={!isEditing || updating}
                    maxLength={100}
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      {fullName.length}/100 characters
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="text-sm font-medium">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-avatar.jpg"
                    className="h-10"
                    disabled={!isEditing || updating}
                    type="url"
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Optional: Enter a URL to your profile picture
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updating || !fullName.trim()}
                      className="flex-1 h-10"
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {!isEditing && (
                  <div className="pt-2 text-sm text-muted-foreground">
                    Click "Edit" to update your profile information
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Details Card */}
            <Card className="border-2 border-muted shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Key className="h-5 w-5" />
                  Subscription Details
                </CardTitle>
                <CardDescription className="text-sm">Your current plan and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm">Current Plan</span>
                    <Badge variant={getSubscriptionBadgeVariant()}>
                      {getSubscriptionStatus()}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm">Terms Analyzed</span>
                    <span className="text-sm">{profile?.terms_analyzed || 0}</span>
                  </div>
                  {subscription?.subscription_status === 'active' && (
                    <>
                      {subscription.current_period_end && (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="font-medium text-sm">Next Billing</span>
                          <span className="text-sm">
                            {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {subscription.payment_method_brand && subscription.payment_method_last4 && (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="font-medium text-sm">Payment Method</span>
                          <span className="text-sm">
                            {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  {subscription?.subscription_status === 'active' ? (
                    <Button
                      variant="outline"
                      className="w-full h-10"
                      onClick={() => {
                        toast({
                          title: "Manage Subscription",
                          description: "Subscription management would be implemented here in a real app.",
                        });
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-10"
                      onClick={() => navigate('/upgrade')}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Card - Full Width */}
          <Card className="border-2 border-muted shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm">Your recent terms analysis history</CardDescription>
            </CardHeader>
            <CardContent>
              {analysesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 sm:h-24 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : analyses.length > 0 ? (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <Card key={analysis.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {analysis.input_url ? (
                                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              ) : analysis.input_file_name ? (
                                <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <p className="font-medium text-sm sm:text-base truncate">
                                {analysis.input_url
                                  ? 'URL Analysis'
                                  : analysis.input_file_name
                                  ? analysis.input_file_name
                                  : 'Text Analysis'}
                              </p>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex sm:flex-col sm:text-right gap-4 sm:gap-1">
                            <div>
                              <p className="text-sm font-mono">
                                {(analysis.analysis_time_ms / 1000).toFixed(2)}s
                              </p>
                              <p className="text-xs text-muted-foreground">
                                analysis time
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {analysis.red_flags_data.length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                red flags
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm sm:text-base">No analyses yet. Start by analyzing some terms!</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/summary')}
                    className="mt-4 h-10"
                  >
                    Analyze Terms
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}