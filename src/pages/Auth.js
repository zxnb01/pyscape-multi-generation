import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState(null); // 'email', 'google', 'github'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Initialize Supabase client
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (!result.success) {
        setError(result.error || 'Authentication failed.');
      } else {
        const user = result.user;
        // ✅ Navigate based on profile + onboarding
        if (!user.profile_complete) navigate('/profile-build');
        else if (!user.onboarding_completed) navigate('/onboarding-quiz');
        else navigate('/app');
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app` // Redirect after login
        }
      });
      if (error) setError(error.message);
    } catch (err) {
      console.error(err);
      setError('Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/app` // Redirect after login
        }
      });
      if (error) setError(error.message);
    } catch (err) {
      console.error(err);
      setError('GitHub authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-lighter rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-primary mb-2 text-center">PyScape</h1>
        <p className="text-gray-400 text-center mb-6">Your adaptation starts here</p>

        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-sm text-red-200">{error}</div>}

        {!authMethod ? (
          // Auth Method Selection
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-gray-400 text-sm text-center mb-3">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all duration-300"
            >
              <FaGoogle className="w-6 h-6" />
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* GitHub Button */}
            <button
              onClick={handleGithubAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all duration-300"
            >
              <FaGithub className="w-6 h-6" />
              <span className="font-medium">Continue with GitHub</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Email Button */}
            <button
              onClick={() => setAuthMethod('email')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-light text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium"
            >
              <Mail className="w-6 h-6" />
              <span>Continue with Email</span>
            </button>

            <div className="mt-4 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthMethod(null);
                }}
                className="text-primary hover:text-primary-light"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        ) : (
          // Email Form
          <div>
            <button
              onClick={() => {
                setAuthMethod(null);
                setEmail('');
                setPassword('');
                setError('');
              }}
              className="mb-4 text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
            >
              ← Back
            </button>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                className="input w-full mb-4"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input w-full mb-4"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:text-primary-light">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
