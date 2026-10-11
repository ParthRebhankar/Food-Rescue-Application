import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Sprout, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn({ email, password });
      notifySuccess('Signed in successfully!');

      // Check user role from metadata or profile to redirect correctly
      const role = user?.user_metadata?.role;
      const target = location.state?.from?.pathname;

      if (target) {
        navigate(target, { replace: true });
      } else if (role === 'merchant') {
        navigate('/merchant', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.message || 'Failed to sign in. Please check your credentials.';
      if (msg.includes('Email not confirmed')) {
        msg = 'Your email address has not been confirmed yet. Please check your email inbox to verify your account.';
      } else if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password. Please verify your details.';
      }
      setErrorMessage(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-card">
        
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              HarvestHero
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your surplus planner and food rescue dashboard
          </p>

          {/* Educational safety disclaimer for web crawlers & users */}
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[11px] text-left leading-relaxed">
            <span className="font-bold block text-amber-950">🎓 Educational Hackathon Project</span>
            This is a non-commercial student prototype. Please use demo/test passwords only. Do not enter real sensitive credentials.
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-forest-700 hover:text-forest-900"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-bold text-forest-800 hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
