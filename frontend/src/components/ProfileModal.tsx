import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CARTOON_AVATARS, getSafeCartoonAvatar } from './ReviewsSection';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Trash2, 
  ShieldCheck, 
  KeyRound, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ProfileModal: React.FC = () => {
  const toast = useToast();
  const { 
    user, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    updateProfile, 
    changePassword, 
    deleteAccount,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'danger'>('details');

  // Details Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Danger Zone State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Populate state whenever user or modal opens
  useEffect(() => {
    if (user && isProfileModalOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setSelectedAvatar(user.avatar || CARTOON_AVATARS[0].url);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setDeleteConfirmText('');
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  // Handle Profile Details & Avatar update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Please enter your full name.');
      return;
    }
    setUpdatingDetails(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar: selectedAvatar,
      });

      if (res.success) {
        toast.success(res.message || 'Profile updated successfully! ✨');
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setUpdatingDetails(false);
    }
  };

  // Handle Change Password (min 6 chars)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warning('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('New password and confirm password do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(res.message || 'Password changed successfully! 🔒');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to change password.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Permanent Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'CONFIRM') {
      toast.warning('Please type "CONFIRM" exactly to authorize deletion.');
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await deleteAccount('CONFIRM');
      if (res.success) {
        toast.success('Your account has been deleted. We hope to see you again!');
      } else {
        toast.error(res.message || 'Failed to delete account.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const currentAvatarUrl = getSafeCartoonAvatar(selectedAvatar || user.avatar, name || user.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <img 
              src={currentAvatarUrl} 
              alt={name || user.name} 
              className="w-11 h-11 rounded-2xl border-2 border-brand-300 shadow-sm bg-white object-cover"
            />
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Customer
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/80 gap-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-brand-600 text-brand-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & PFP</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-brand-600 text-brand-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'danger'
                ? 'border-rose-600 text-rose-700 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: DETAILS & CARTOON AVATAR */}
          {activeTab === 'details' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              {/* Cartoon PFP Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Choose Your Avatar / PFP
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  {CARTOON_AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={`relative p-1 rounded-xl transition-all flex flex-col items-center gap-1 group cursor-pointer ${
                          isSelected
                            ? 'bg-white ring-2 ring-brand-600 shadow-md scale-105'
                            : 'hover:bg-white hover:shadow-xs opacity-75 hover:opacity-100'
                        }`}
                        title={av.name}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-[9px] font-bold text-slate-600 truncate max-w-full block">
                          {av.name}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Delivery credentials and receipts are dispatched to this email.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingDetails}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {updatingDetails ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-amber-800">
                <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs">
                  <span className="font-bold block">Password Security Policy:</span>
                  <span>Your password must be at least 6 characters long to protect your subscription order data.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password * (Min 6 Chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Forgot your password? Send reset OTP</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {updatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 3: DANGER ZONE (DELETE ACCOUNT) */}
          {activeTab === 'danger' && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-black text-rose-800 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Warning: Permanent Account Deletion</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-700">
                  Deleting your account will permanently remove your login credentials, saved preferences, and account profile. Active subscription credentials already delivered to your email/WhatsApp will remain intact with their respective OTT providers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  To confirm, type <strong className="text-rose-600 font-mono">CONFIRM</strong> in the box below:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type CONFIRM to proceed"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'CONFIRM' || deletingAccount}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete My Account Permanently</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
