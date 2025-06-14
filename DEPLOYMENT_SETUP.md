# Google Authentication Setup for Deployed Site

## Issue
Google authentication is failing on the deployed site because Supabase redirect URLs are not configured for the production domain.

## Solution Steps

### 1. Update Supabase Authentication Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs:

**Site URL:**
```
https://legalish.site
```

**Redirect URLs:**
```
https://legalish.site
https://legalish.site/
https://legalish.site/**
http://localhost:5173
http://localhost:5173/**
```

### 2. Update Google OAuth Settings

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Add the following to **Authorized redirect URIs**:
```
https://legalish.site/auth/callback
https://your-supabase-project.supabase.co/auth/v1/callback
```

### 3. Environment Variables Check

Make sure your deployed site has the correct environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These should be the same values you use locally.

### 4. Test the Authentication

After making these changes:
1. Clear your browser cache
2. Try signing in with Google on https://legalish.site
3. The authentication should now work properly

## Common Issues

- **Still getting localhost errors**: Make sure you've saved the changes in Supabase dashboard
- **Google OAuth errors**: Verify the redirect URIs in Google Cloud Console match exactly
- **Environment variables**: Ensure the deployed site has access to the correct Supabase credentials

## Verification

You can verify the setup is working by:
1. Opening the browser developer tools
2. Going to the Network tab
3. Attempting to sign in with Google
4. Checking that the redirect URLs point to your production domain