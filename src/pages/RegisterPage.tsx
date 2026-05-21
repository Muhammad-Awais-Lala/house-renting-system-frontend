import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Building2, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState < 'tenant' | 'landlord' > ('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide first and last name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        role,
      });
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex h-16 w-16 bg-indigo-600 rounded-2xl items-center justify-center mb-6 shadow-indigo-100 shadow-lg">
              <Building2 className="text-white h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Join HouseIntel</h1>
            <p className="text-slate-500">Create your account to start renting smarter</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5 ml-1">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['tenant', 'landlord'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all capitalize shadow-sm ${role === r
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-indigo-50'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                        }`}
                      disabled={isLoading}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password (min. 6 chars)"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-lg shadow-lg" isLoading={isLoading}>
              Create Account
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}