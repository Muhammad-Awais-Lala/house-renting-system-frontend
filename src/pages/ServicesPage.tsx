import React from 'react';
import { Sparkles, Map, MessageCircle, Calendar, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    icon: Sparkles,
    color: 'text-indigo-600 bg-indigo-50',
    borderColor: 'border-indigo-100',
    title: 'AI Recommendation Matcher',
    tagline: 'Match score calculation based on HSL profiles',
    desc: 'Input your budget, preferred size in sqft, unit type, location and required rooms. Our matching backend calculates a percentage match using direct weighted compatibility parameters, skipping the frustration of irrelevant search strings.',
    bullets: [
      'Weighted priority pricing algorithms',
      'Dynamic size comparison matchers',
      'Instantaneous compatibility metrics display',
    ],
  },
  {
    icon: Map,
    color: 'text-violet-600 bg-violet-50',
    borderColor: 'border-violet-100',
    title: 'Interactive Map Coordinates Verification',
    tagline: 'Guaranteed physically existing properties',
    desc: 'We require landlords to specify properties using precise physical coordinate pins on Google Maps. Tenants can filter rentals dynamically based on distance coordinates, ensuring safety and actual proximity to universities or business hubs.',
    bullets: [
      'Interactive visual map browse catalog',
      'Precise longitude/latitude validation',
      'Location proximity filters',
    ],
  },
  {
    icon: MessageCircle,
    color: 'text-fuchsia-600 bg-fuchsia-50',
    borderColor: 'border-fuchsia-100',
    title: 'Direct In-App Socket Messaging',
    tagline: 'Secure real-time chats with landlords',
    desc: 'Establish secure websocket connections straight from the browser to communicate with listing owners. Discuss lease duration, negotiate pricing formats, request image buffers, or schedule in-person tours without sharing personal telephone details.',
    bullets: [
      'Websocket real-time updates via Socket.io',
      'Integrated contact participant lists',
      'Instant lease pipeline negotiation',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-24 py-12">
      {/* 1. HERO HEADER */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <BadgeInfo className="h-4 w-4" /> Platform Features
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Sophisticated Services Tailored For{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Seamless Leasing
          </span>
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          We combine cutting-edge technology integrations to create the ultimate automated real estate ecosystem.
        </p>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {SERVICES.map((srv, idx) => (
          <div key={idx} className="flex flex-col lg:flex-row gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-slate-100 transition-colors" />

            {/* Icon & Title area */}
            <div className="space-y-6 flex-grow lg:max-w-xl">
              <div className={`h-16 w-16 rounded-2xl ${srv.color} flex items-center justify-center flex-shrink-0 shadow-sm border ${srv.borderColor}`}>
                <srv.icon className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                  {srv.tagline}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{srv.title}</h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                {srv.desc}
              </p>
              
              {/* Bullet highlights */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-100">
                {srv.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Graphic mock representation area */}
            <div className="w-full lg:w-96 h-64 bg-slate-50 border border-slate-200/80 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 pointer-events-none" />
              <div className="text-center p-6 space-y-4">
                <srv.icon className="h-16 w-16 text-indigo-300 mx-auto animate-pulse" />
                <div className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">Active Integration</div>
                <div className="text-sm font-black text-slate-800">100% Client-Server Sync</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. SAFETY AND FRAUD PROTECTION */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <ShieldAlert className="h-14 w-14 text-indigo-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black">Certified Anti-Fraud Standards</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            By embedding required map coordinates validation and verification workflows, we completely eliminate ghost listings, fake addresses, and unverified broker claims.
          </p>
          <div className="pt-4">
            <Link to="/register">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black px-6 py-3 shadow-md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
