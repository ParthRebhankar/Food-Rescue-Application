import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConfigBanner() {
  const { isConfigured } = useAuth();

  if (isConfigured) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-md border-b border-amber-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-slate-950" />
          <span>
            <strong>Supabase Setup Required:</strong> Connect your Supabase project in the <code className="bg-amber-600/30 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file to enable database operations and authentication.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-600/40 px-2 py-1 rounded font-mono">
            VITE_SUPABASE_URL &amp; KEY
          </span>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold underline hover:text-white transition-colors"
          >
            Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
