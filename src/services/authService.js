import { supabase, isSupabaseConfigured } from './supabase';

export const authService = {
  /**
   * Register a new user with full name and role (customer or merchant)
   */
  async signUp({ email, password, fullName, role = 'customer' }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your credentials to the .env file.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;

    // In case the PostgreSQL trigger on auth.users is delayed or restricted,
    // ensure profile existence if user session exists immediately
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: role,
        }, { onConflict: 'id' });
      } catch (profileErr) {
        console.warn('Profile auto-sync notice:', profileErr);
      }
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your credentials to the .env file.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log out the current user
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Fetch current authenticated user's profile from profiles table
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update profile information (excluding role)
   */
  async updateProfile(userId, { fullName, phone, avatarUrl }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const updates = {
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
