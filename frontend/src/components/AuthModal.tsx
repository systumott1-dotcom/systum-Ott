import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setAuthModalTab, login, signup } = useAuth();
  useBodyScrollLock(isAuthModalOpen);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError('');
    setSuccessMessage('');
    setIsForgotPassword(false);
    setForgotStep('request');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
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

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message || 'A 6-digit verification code has been dispatched to your email.');
        setForgotStep('reset');
      } else {
        setError(data.message || 'Failed to send reset code. Please try again.');
      }
    } catch {
      setError('Network error while requesting password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP & Update Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetOtp.trim() || !newPassword.trim()) {
      setError('Please enter the 6-digit verification code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: resetOtp.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          setIsForgotPassword(false);
          setForgotStep('request');
          setPassword('');
          setResetOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccessMessage('Password changed! You can now log in.');
        }, 1500);
      } else {
        setError(data.message || 'Failed to reset password. Please check your verification code.');
      }
    } catch {
      setError('Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            {isForgotPassword ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {isForgotPassword
              ? 'Reset Password'
              : authModalTab === 'signup'
              ? 'Create Your Account'
              : authModalTab === 'admin'
              ? 'Admin Portal Access'
              : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isForgotPassword
              ? forgotStep === 'request'
                ? 'Enter your registered email to receive a recovery code'
                : 'Enter the 6-digit code sent to your email and set a new password'
              : authModalTab === 'signup'
              ? 'Join 50,000+ members saving on subscriptions'
              : authModalTab === 'admin'
              ? 'Secure admin dashboard for managing orders & products'
              : 'Sign in to access your digital subscriptions & warranty'}
          </p>
        </div>

        {/* Tab Switcher (Visible only during normal auth) */}
        {!isForgotPassword && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setError('');
                setSuccessMessage('');
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
                setSuccessMessage('');
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
                setSuccessMessage('');
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
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORGOT PASSWORD: Step 1 (Request OTP) */}
        {isForgotPassword && forgotStep === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email / Gmail Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setSuccessMessage('');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD: Step 2 (Verify OTP & Set New Password) */}
        {isForgotPassword && forgotStep === 'reset' && (
          <form onSubmit={handleConfirmReset} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6-Digit Verification Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-black tracking-widest text-brand-700 focus:outline-none focus:bg-white focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block text-center">
                Check your inbox (and spam folder) for the 6-digit code
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotStep('request');
                setError('');
              }}
              className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email Address</span>
            </button>
          </form>
        )}

        {/* NORMAL LOGIN / SIGNUP FORM */}
        {!isForgotPassword && (
          <form onSubmit={handleSubmitAuth} className="space-y-3.5">
            {authModalTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password *</label>
                {authModalTab !== 'signup' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotStep('request');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group mt-3 disabled:opacity-50"
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
        )}

        <div className="mt-5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit Encrypted & Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};
