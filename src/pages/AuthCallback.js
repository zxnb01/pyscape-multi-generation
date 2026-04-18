import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';

/**
 * AuthCallback Page
 * Handles OAuth redirects (Google, GitHub)
 * Checks if profile is complete, then routes to profile-build or app
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for auth context to load
        if (loading) return;

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('❌ No session found, redirecting to auth');
          navigate('/auth');
          return;
        }

        // Fetch user profile to check profile_complete
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('profile_complete')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.warn('⚠️ Profile fetch error:', error);
          // If profile doesn't exist, it's a new user - go to profile build
          navigate('/profile-build');
          return;
        }

        // Route based on profile_complete status
        if (!profile?.profile_complete) {
          console.log('📝 New user detected, redirecting to profile build');
          navigate('/profile-build');
        } else {
          console.log('✅ User profile complete, redirecting to app');
          navigate('/app');
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        navigate('/auth');
      } finally {
        setChecking(false);
      }
    };

    handleCallback();
  }, [loading, navigate]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-400">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
