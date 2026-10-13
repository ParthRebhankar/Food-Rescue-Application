import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useNotification } from '../context/NotificationContext';
import {
  Sprout, Lock, Eye, EyeOff, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false); // true once Supabase fires RECOVERY event
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Supabase sends the user back with a URL hash containing an access_token.
  // The JS client automatically parses it and fires a RECOVERY auth event.
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      notifySuccess('Password updated successfully! Please log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setErrorMessage(err.message || 'Failed to update password. The link may have expired.');
      notifyError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-card">

        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">HarvestHero</span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose a strong password for your account
          </p>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success state */}
        {done ? (
          <div className="text-center space-y-4 py-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Password Updated!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Redirecting you to login in a moment…
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:underline pt-2">
              Go to Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        ) : !sessionReady ? (
          /* Waiting for Supabase to parse the URL token */
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Verifying reset link…</p>
            <p className="text-xs text-slate-500">
              If this takes too long, your link may have expired.{' '}
              <Link to="/forgot-password" className="font-bold text-forest-800 hover:underline">
                Request a new one
              </Link>
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-forest-700 mx-auto" />
          </div>

        ) : (
          /* Main form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-slate-800 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-slate-800 transition-all"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              ) : (
                <>Update Password <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="text-center pt-2 text-xs text-slate-500">
              Link expired?{' '}
              <Link to="/forgot-password" className="font-bold text-forest-800 hover:underline">
                Request a new reset link
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
