import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { inquiryService } from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setError('');

    try {
      await inquiryService.create({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 py-12">
      {/* 1. HERO HEADER */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="h-4 w-4" /> Got Questions?
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          We'd Love To Hear{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            From You
          </span>
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          Need support? Want to provide feedback? Our project team is standing by to help with any queries.
        </p>
      </section>

      {/* 2. CONTACT OPTIONS & INTERACTIVE FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

          {/* Contact Details (Left) */}
          <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-black">Contact Information</h3>
                <p className="text-slate-400 text-sm mt-2">Reach out directly and we will respond as soon as possible.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Main Office</h4>
                    <p className="text-xs text-slate-400 mt-1">Faisalabad Punjab, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Phone</h4>
                    <p className="text-xs text-slate-400 mt-1">+92 51 111-222-333</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Support Email</h4>
                    <p className="text-xs text-slate-400 mt-1">support@houseintel.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-xs font-semibold text-slate-400 mt-8">
              BS Comouter Sience Final Year Prototype Project
            </div>
          </div>

          {/* Interactive Form (Right) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-10 shadow-sm flex flex-col justify-center">

            {isSuccess ? (
              <div className="text-center py-12 space-y-5 animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Message Sent Successfully!</h3>
                <p className="text-slate-500 text-sm font-semibold max-w-sm mx-auto">
                  Thank you for contacting us. Your message has been saved in our database. An administrator will review it shortly.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="gap-2 text-slate-700 font-bold"
                  >
                    <ArrowLeft className="h-4 w-4" /> Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Send an Inquiry</h3>
                  <p className="text-slate-400 text-xs mt-1">Submit your name and email to send us an inquiry.</p>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm text-sm animate-in fade-in duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all hover:bg-slate-50/50"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="johndoe@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all hover:bg-slate-50/50"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Account activation problem..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all hover:bg-slate-50/50"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message details here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all hover:bg-slate-50/50 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2.5 shadow-md shadow-indigo-600/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" /> Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}
