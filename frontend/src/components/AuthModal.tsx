import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setAuthModalTab, login, signup } = useAuth();
  useBodyScrollLock(isAuthModalOpen);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authModalTab === 'signup') {
      const res = await signup(name, email, password, phone);
      if (!res.success) {
        setError(res.message || 'Signup failed');
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || 'Invalid email or password');
      }
    }
    setLoading(false);
  };

  const handleFillAdminDemo = () => {
    setEmail('admin@systumott.in');
    setPassword('admin1234');
    setAuthModalTab('admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setError('');
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {authModalTab === 'signup'
              ? 'Create Your Account'
              : authModalTab === 'admin'
              ? 'Admin Portal Access'
              : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authModalTab === 'signup'
              ? 'Join 50,000+ members saving on subscriptions'
              : authModalTab === 'admin'
              ? 'Secure admin dashboard for managing orders & products'
              : 'Sign in to access your digital subscriptions & warranty'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('signup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authModalTab === 'signup'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('admin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authModalTab === 'admin'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalTab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authModalTab === 'admin' ? 'admin@systumott.in' : 'name@example.com'}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
              />
            </div>
          </div>

          {authModalTab === 'admin' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
              <span>Demo Admin: <strong>admin@systumott.in</strong> / <strong>admin1234</strong></span>
              <button
                type="button"
                onClick={handleFillAdminDemo}
                className="text-amber-900 font-bold underline ml-2 shrink-0"
              >
                Auto-fill
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {authModalTab === 'signup'
                    ? 'Create Free Account'
                    : authModalTab === 'admin'
                    ? 'Login as Admin'
                    : 'Sign In to Systum OTT'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit Encrypted & Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};
