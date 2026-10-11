import React from 'react';
import { Sprout, Heart, Shield, Leaf, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-200 mt-20 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                HarvestHero
              </span>
            </div>
            <p className="text-sm text-forest-200 max-w-md leading-relaxed">
              Empowering local bakeries, markets, and restaurants to prevent edible surplus food from reaching landfills. Connect directly with conscious neighborhood food lovers.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-300 pt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-forest-900 border border-forest-800 text-forest-200 font-medium">
                📍 Nagpur Demo Hub
              </span>
              <span>• Certified RLS Database Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-forest-200">
              <li><a href="/customer" className="hover:text-white transition-colors">Surplus Marketplace</a></li>
              <li><a href="/impact" className="hover:text-white transition-colors">CO2e Impact Tracker</a></li>
              <li><a href="/signup" className="hover:text-white transition-colors">Merchant Onboarding</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Account Login</a></li>
            </ul>
          </div>

          {/* Environmental Methodology */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Impact Formula &amp; Science
            </h4>
            <p className="text-xs text-forest-300 leading-relaxed">
              Greenhouse gas savings estimated via FAO &amp; Poore &amp; Nemecek (2018) benchmark: <code className="text-emerald-300 font-mono">2.5 kg CO2e / kg rescued food</code>.
            </p>
            <div className="pt-1">
              <span className="text-[11px] text-forest-400 block">
                Hackathon Prototype v1.0. All sample stores around Nagpur, Maharashtra are for demonstrative purposes.
              </span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between text-xs text-forest-400 gap-4">
          <p>© {new Date().getFullYear()} HarvestHero Planner. Built for sustainability hackathon.</p>
          <p className="flex items-center gap-1">
            Rescuing fresh meals with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> &amp; PostgreSQL RLS
          </p>
        </div>
      </div>
    </footer>
  );
}
