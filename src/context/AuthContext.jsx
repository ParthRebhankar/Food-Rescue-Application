import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseConfigError } from '../services/supabase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId, fallbackUser = null) => {
    if (!userId || !isSupabaseConfigured) {
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      const data = await authService.getProfile(userId);
      if (data) {
        setProfile(data);
        setRole(data.role);
      } else if (fallbackUser) {
        // Fallback: create or retrieve from raw metadata if profile not yet committed by trigger
        const metaRole = fallbackUser.user_metadata?.role || 'customer';
        const metaName = fallbackUser.user_metadata?.full_name || fallbackUser.email?.split('@')[0];
        
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: metaName,
            email: fallbackUser.email,
            role: metaRole,
          });
          const recheck = await authService.getProfile(userId);
          if (recheck) {
            setProfile(recheck);
            setRole(recheck.role);
            return;
          }
        } catch (e) {
          console.warn('Profile fallback sync notice:', e);
        }

        setProfile({
          id: userId,
          full_name: metaName,
          email: fallbackUser.email,
          role: metaRole,
        });
        setRole(metaRole);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
          } else {
            setUser(null);
            setProfile(null);
            setRole(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (credentials) => {
    setError(null);
    const result = await authService.signUp(credentials);
    return result;
  };

  const signIn = async (credentials) => {
    setError(null);
    const result = await authService.signIn(credentials);
    if (result?.user) {
      setUser(result.user);
      await fetchProfile(result.user.id, result.user);
    }
    return result;
  };

  const signOut = async () => {
    setError(null);
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        error,
        isConfigured: isSupabaseConfigured,
        configError: supabaseConfigError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
