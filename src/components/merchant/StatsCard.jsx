import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'forest' }) {
  let iconBg = 'bg-forest-100 text-forest-800 border-forest-200';
  if (color === 'emerald') iconBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (color === 'amber') iconBg = 'bg-amber-100 text-amber-800 border-amber-200';
  if (color === 'blue') iconBg = 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-card hover:shadow-lifted transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
