import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Building2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">Welcome Back</h1>
            <p className="text-slate-500">Sign in to find your next perfect home</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
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
              </div>

              <div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 shadow-inner outline-none transition-all placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg shadow-lg shadow-indigo-200"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}