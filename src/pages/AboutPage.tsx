import React from 'react';
import { ShieldCheck, Heart, Users, Sparkles, Building2, Code2, GraduationCap, Network } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    desc: 'Each home has coordinates mapped to guarantee the physical location actually exists before listing goes live.',
  },
  {
    icon: Heart,
    title: 'Renter Welfare First',
    desc: 'Dedicated matching models to support families and college students in finding appropriate, budget-friendly environments.',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching System',
    desc: 'Bypassing arbitrary search strings via a direct multi-variable preference match calculation for optimum compatibility.',
  },
];


export default function AboutPage() {
  return (
    <div className="space-y-24 py-12">
      {/* 1. HERO HEADER WITH GRADIENTS */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <GraduationCap className="h-4 w-4" /> Academic Research Initiative
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Pioneering Better Renting Through{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Intelligence & Design
          </span>
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          HouseIntel is an intelligent house renting ecosystem designed to close the gap between landlords and tenants through smart recommendation frameworks.
        </p>
      </section>

      {/* 2. GRAPHIC METRICS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-indigo-600/10 grid grid-cols-1 md:grid-cols-4 gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="text-4xl sm:text-5xl font-black">100%</div>
            <div className="text-xs uppercase font-bold text-indigo-100 tracking-wider">No Brokerage Fees</div>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0">
            <div className="text-4xl sm:text-5xl font-black">24/7</div>
            <div className="text-xs uppercase font-bold text-indigo-100 tracking-wider">Direct Landlord Chat</div>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0">
            <div className="text-4xl sm:text-5xl font-black">&lt; 3 Min</div>
            <div className="text-xs uppercase font-bold text-indigo-100 tracking-wider">AI Compatibility Match</div>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0">
            <div className="text-4xl sm:text-5xl font-black">PKR</div>
            <div className="text-xs uppercase font-bold text-indigo-100 tracking-wider">Localized Rental Pricing</div>
          </div>
        </div>
      </section>

      {/* 3. OUR VALUES */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Our Core Values</h2>
            <h3 className="text-3xl font-black text-slate-900">What Drives HouseIntel?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-8 space-y-5 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <v.icon className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">{v.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 5. ACADEMIC SUBMISSION STATEMENT */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <GraduationCap className="h-12 w-12 text-indigo-400 mx-auto" />
          <h3 className="text-2xl font-black">Final Year Project Contribution</h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            This application represents an interactive proof-of-concept final year prototype submitted for BS Computer Science. It addresses key house leasing challenges, specifically aiming to resolve issues like coordinate verification and direct online mediation.
          </p>
        </div>
      </section>
    </div>
  );
}
