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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Key, 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  CreditCard, 
  Save, 
  Edit, 
  Camera, 
  Mail, 
  Calendar, 
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  Lock,
  X
} from 'lucide-react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  terms_analyzed: number;
  created_at: string;
  email: string;
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
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  
  // Form states - Initialize with empty strings to ensure controlled inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

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
          .select('full_name, avatar_url, subscription_tier, terms_analyzed, created_at, email')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
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
              .select('full_name, avatar_url, subscription_tier, terms_analyzed, created_at, email')
              .single();

            if (createError) throw createError;
            
            setProfile(newProfile);
            // Set form values with proper fallbacks
            setFullName(newProfile.full_name || '');
            setEmail(newProfile.email || user.email || '');
            setAvatarUrl(newProfile.avatar_url || '');
            setIsEditing(true); // Auto-enable editing for new profiles
          } else {
            throw error;
          }
        } else {
          setProfile(data);
          // Set form values with proper fallbacks
          setFullName(data.full_name || '');
          setEmail(data.email || user.email || '');
          setAvatarUrl(data.avatar_url || '');
          
          // Auto-enable editing if profile is incomplete
          if (!data.full_name || !data.full_name.trim()) {
            setIsEditing(true);
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
          .limit(20);

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

    if (fullName.trim().length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Full name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
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
      // Update email in auth if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim()
        });
        if (emailError) throw emailError;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
          email: email.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { 
        ...prev, 
        full_name: fullName.trim(), 
        avatar_url: avatarUrl.trim() || null,
        email: email.trim()
      } : null);
      
      setIsEditing(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setPasswordUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form values to original profile data
    setFullName(profile?.full_name || '');
    setEmail(profile?.email || user?.email || '');
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* Profile Header */}
          <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-r from-primary/5 to-purple-600/5">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || avatarUrl || ''} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold truncate">
                        {profile?.full_name || fullName || user?.email?.split('@')[0] || 'Welcome!'}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{profile?.email || email || user?.email}</span>
                      </div>
                      {profile?.created_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {formatDate(profile.created_at)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Badge variant={getSubscriptionBadgeVariant()} className="text-center">
                        <Shield className="h-3 w-3 mr-1" />
                        {getSubscriptionStatus()}
                      </Badge>
                      {subscription?.subscription_status === 'active' && subscription?.current_period_end && (
                        <span className="text-xs text-muted-foreground text-center">
                          Renews {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{profile?.terms_analyzed || 0}</div>
                      <div className="text-sm text-muted-foreground">Documents Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analyses.length}</div>
                      <div className="text-sm text-muted-foreground">Recent Analyses</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Profile Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Analysis History
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Information */}
                <Card className="border-2 border-muted shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>Update your personal details and profile picture</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="h-9 px-4"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-muted">
                          <AvatarImage src={avatarUrl || profile?.avatar_url || ''} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <div className="flex-1">
                            <Input
                              value={avatarUrl}
                              onChange={(e) => setAvatarUrl(e.target.value)}
                              placeholder="Enter image URL (e.g., https://example.com/photo.jpg)"
                              className="h-10"
                              disabled={updating}
                              type="url"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter a URL to your profile picture
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="space-y-4">
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
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="h-10"
                          disabled={!isEditing || updating}
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground">
                            Changing your email will require verification
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={updating || !fullName.trim() || !email.trim()}
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
                          className="h-10 px-6"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card className="border-2 border-muted shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>Update your account password for security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="h-10"
                        disabled={passwordUpdating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-10"
                        disabled={passwordUpdating}
                      />
                    </div>

                    <Button
                      onClick={handleUpdatePassword}
                      disabled={passwordUpdating || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="w-full h-10"
                    >
                      {passwordUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analysis History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="border-2 border-muted shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5" />
                    Analysis History
                  </CardTitle>
                  <CardDescription>Your recent legal document analyses with summaries and red flags</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysesLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded-lg" />
                      ))}
                    </div>
                  ) : analyses.length > 0 ? (
                    <div className="space-y-4">
                      {analyses.map((analysis) => (
                        <Card key={analysis.id} className="border border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {analysis.input_url ? (
                                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  ) : analysis.input_file_name ? (
                                    <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <p className="font-medium truncate">
                                    {analysis.input_url
                                      ? 'URL Analysis'
                                      : analysis.input_file_name
                                      ? analysis.input_file_name
                                      : 'Text Analysis'}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(analysis.created_at)}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{(analysis.analysis_time_ms / 1000).toFixed(2)}s</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                    <span>{analysis.red_flags_data.length} red flags</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAnalysis(analysis)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start analyzing legal documents to see your history here
                      </p>
                      <Button
                        onClick={() => navigate('/summary')}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Your First Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <Card className="border-2 border-muted shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="h-5 w-5" />
                    Subscription & Billing
                  </CardTitle>
                  <CardDescription>Your current plan and usage details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Current Plan</span>
                      <Badge variant={getSubscriptionBadgeVariant()} className="px-3 py-1">
                        {getSubscriptionStatus()}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Documents Analyzed</span>
                      <span className="text-lg font-bold text-primary">{profile?.terms_analyzed || 0}</span>
                    </div>
                    
                    {subscription?.subscription_status === 'active' && (
                      <>
                        {subscription.current_period_end && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Next Billing Date</span>
                            <span className="text-sm">
                              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {subscription.payment_method_brand && subscription.payment_method_last4 && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Payment Method</span>
                            <span className="text-sm">
                              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {subscription?.subscription_status === 'active' ? (
                      <Button
                        variant="outline"
                        className="w-full h-10"
                        onClick={() => {
                          toast({
                            title: "Manage Subscription",
                            description: "Subscription management portal would open here.",
                          });
                        }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        onClick={() => navigate('/upgrade')}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Details</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Analyzed on {formatDateTime(selectedAnalysis.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="redflags">Red Flags ({selectedAnalysis.red_flags_data.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  {selectedAnalysis.summary_data.map((item, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="redflags" className="space-y-4">
                  {selectedAnalysis.red_flags_data.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
                      <p className="text-destructive">{flag}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}