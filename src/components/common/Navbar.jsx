import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sprout, 
  ShoppingBag, 
  CalendarCheck, 
  BarChart3, 
  Store, 
  PlusCircle, 
  LogOut, 
  User, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Educational Project Safety Banner */}
      <div className="bg-forest-950 text-emerald-200 text-[11px] py-1 px-4 text-center font-medium border-b border-forest-900 flex items-center justify-center gap-2">
        <span className="font-bold">🎓 Educational Hackathon Prototype</span>
        <span className="text-forest-600 hidden sm:inline">•</span>
        <span className="text-forest-300 hidden sm:inline">Non-commercial research &amp; portfolio showcase. No financial processing.</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow-md group-hover:bg-forest-900 transition-colors">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                HarvestHero
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-forest-700 -mt-1">
                Food Waste Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/customer"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/customer')
                  ? 'bg-forest-100/70 text-forest-900'
                  : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-forest-700" />
              Surplus Marketplace
            </Link>

            <Link
              to="/impact"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/impact')
                  ? 'bg-forest-100/70 text-forest-900'
                  : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-forest-700" />
              Impact Tracker
            </Link>

            {/* Reservations link */}
            {user && (
              <Link
                to="/reservations"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/reservations')
                    ? 'bg-forest-100/70 text-forest-900'
                    : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-forest-700" />
                My Reservations
              </Link>
            )}

            {/* Merchant specific links */}
            {user && role === 'merchant' && (
              <>
                <Link
                  to="/merchant"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname === '/merchant'
                      ? 'bg-forest-100/70 text-forest-900'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
                  }`}
                >
                  <Store className="w-4 h-4 text-forest-700" />
                  Merchant Hub
                </Link>

                <Link
                  to="/merchant/listings"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/merchant/listings')
                      ? 'bg-forest-100/70 text-forest-900'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
                  }`}
                >
                  Manage Bundles
                </Link>

                <Link
                  to="/merchant/bundle/new"
                  className="ml-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-forest-800 text-white hover:bg-forest-900 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Listing
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-forest-100 border border-forest-300 text-forest-800 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {profile?.full_name ? profile.full_name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </p>
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      role === 'merchant'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {role === 'merchant' ? 'Merchant' : 'Customer'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-forest-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 rounded-lg shadow-sm transition-all"
                >
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-cream-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/customer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-cream-100"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-forest-700" />
              <span>Surplus Marketplace</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-cream-100"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-forest-700" />
              <span>Impact Tracker</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          {user && (
            <Link
              to="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-cream-100"
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-forest-700" />
                <span>My Reservations</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          )}

          {user && role === 'merchant' && (
            <>
              <Link
                to="/merchant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-cream-100"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-forest-700" />
                  <span>Merchant Hub</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/merchant/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-cream-100"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>Manage Bundles</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/merchant/bundle/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center p-2.5 rounded-lg text-sm font-semibold bg-forest-800 text-white"
              >
                + Create Food Bundle
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-cream-200">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                    {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{profile?.full_name || user.email}</div>
                    <span className="text-xs uppercase font-semibold text-forest-700">{role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-forest-800 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
