import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Building2, Menu, X, ArrowRight, ShieldCheck, Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/welcome' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/welcome" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="text-white h-5.5 w-5.5" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              HouseIntel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-semibold transition-all relative py-2 ${isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-in fade-in zoom-in-75 duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/">
                <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl shadow-md shadow-indigo-600/10 font-bold px-6 py-2.5 flex items-center gap-2 group">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-700 hover:text-indigo-600 font-bold hover:bg-slate-100/50 rounded-xl px-5 py-2.5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold px-6 py-2.5 shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-lg px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-bold px-4 py-3 rounded-xl transition-all ${location.pathname === link.href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="h-px bg-slate-200/60 my-4" />
            <div className="flex flex-col gap-3 px-2">
              {user ? (
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2">
                    Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-slate-700 rounded-xl py-3 font-bold">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand column */}
            <div className="space-y-5">
              <Link to="/welcome" className="flex items-center gap-2">
                <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">HouseIntel</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400/90">
                Experience the intelligence-driven house renting platform. Find matching smart rentals, coordinate with certified landlords, and finalize agreements seamlessly.
              </p>
              <div className="flex items-center gap-3.5 text-slate-500">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-400">100% Verified Properties</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Find Homes</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">List Your Property</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Smart AI Matcher</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Safety Standards</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">Our Mission</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Rental Guide</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Get In Touch</h4>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>GMGC Faisalabad, Punjab, Pakistan</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <span>+92 300 0000000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <span>support@houseintel.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-slate-900 my-12" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} HouseIntel. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for final year project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
