import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Sprout, 
  User, 
  Mail, 
  Lock, 
  Store, 
  ShoppingBag, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'merchant'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({
        fullName,
        email,
        password,
        role,
      });

      // If user session is returned, auto signed in
      if (data?.session) {
        notifySuccess('Account created successfully!');
        if (role === 'merchant') {
          navigate('/merchant', { replace: true });
        } else {
          navigate('/customer', { replace: true });
        }
      } else if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
        setErrorMessage('An account with this email address already exists. Please log in.');
      } else {
        // Confirmation email was sent by Supabase
        setEmailConfirmationRequired(true);
        notifySuccess('Verification link sent to your email!');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
      notifyError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (emailConfirmationRequired) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-card text-center space-y-5">
          <div className="w-16 h-16 bg-forest-100 text-forest-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Check Your Inbox</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We have sent a confirmation link to <strong className="text-slate-800">{email}</strong>.
            Please verify your email address to activate your {role} account and log in.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all"
            >
              Back to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-card">
        
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              HarvestHero
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Join the Food Rescue Mission
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign up to discover discounted surplus meals or list your store's bundles
          </p>

          {/* Educational safety disclaimer */}
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[11px] text-left leading-relaxed">
            <span className="font-bold block text-amber-950">🎓 Educational Hackathon Project</span>
            Created solely for educational and portfolio demonstration. Do not use sensitive passwords or real financial information.
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Role Selection Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                role === 'customer'
                  ? 'border-forest-600 bg-forest-50/70 text-forest-950 shadow-xs'
                  : 'border-cream-300 bg-white text-slate-600 hover:bg-cream-50'
              }`}
            >
              <ShoppingBag className={`w-5 h-5 mb-1 ${role === 'customer' ? 'text-forest-700' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold block">Customer</span>
                <span className="text-[10px] text-slate-500">Rescue food &amp; save</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                role === 'merchant'
                  ? 'border-forest-600 bg-forest-50/70 text-forest-950 shadow-xs'
                  : 'border-cream-300 bg-white text-slate-600 hover:bg-cream-50'
              }`}
            >
              <Store className={`w-5 h-5 mb-1 ${role === 'merchant' ? 'text-forest-700' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold block">Merchant</span>
                <span className="text-[10px] text-slate-500">List surplus bundles</span>
              </div>
            </button>
          </div>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Deshmukh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
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
                Creating your account...
              </>
            ) : (
              <>
                Create {role === 'merchant' ? 'Merchant' : 'Customer'} Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-forest-800 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
