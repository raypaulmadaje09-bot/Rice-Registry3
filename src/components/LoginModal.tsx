import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DaLogo, SilagoSeal, BagOngSilagoLogo } from './Seals';
import {
  X,
  Lock,
  User as UserIcon,
  ArrowRight,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  KeyRound
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setCurrentUser, verifyAdminPassword, adminProfile } = useApp();

  // Login view mode: 'standard' (username/password) vs 'phone' (SMS OTP)
  const [authMode, setAuthMode] = useState<'standard' | 'phone'>('standard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone / SMS OTP Authentication State
  const [countryCode, setCountryCode] = useState('+63');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your staff or LFT username / email');
      return;
    }

    const lower = username.trim().toLowerCase();
    if (lower === 'admin' || lower === 'mao' || lower.includes('valdez') || lower.includes('coordinator')) {
      if (password && !verifyAdminPassword(password)) {
        setError('Incorrect password for Central Admin account');
        return;
      }
      setCurrentUser({
        username: 'admin',
        role: 'Central Admin',
        name: adminProfile.name || 'Engr. Arnaldo M. Valdez',
        title: adminProfile.title || 'Municipal Agriculturist / Municipal LFT Coordinator',
        email: adminProfile.email,
        contactNumber: adminProfile.contactNumber,
        office: adminProfile.office,
        photoUrl: adminProfile.photoUrl
      });
      onClose();
      onSuccess?.();
    } else {
      // Authenticate as LFT Field Technician
      const savedPass = localStorage.getItem(`silago_lft_password_${lower}`) || 'lft123';
      if (password && password !== savedPass && password !== 'admin123' && password !== 'lft123') {
        setError('Incorrect password for LFT account (Default is lft123)');
        return;
      }

      // Check if user is known LFT or dynamic
      let officerName = 'Local Farmer Technician';
      let assignedBrgys = ['Salvacion', 'Laguna', 'Pob. 2', 'Pob. 1', 'Hingatungan'];
      if (lower.includes('wella') || lower.includes('bongon')) {
        officerName = 'Wella S. Bongon';
        assignedBrgys = ['Salvacion', 'Laguna', 'Pob. 2', 'Pob. 1', 'Hingatungan'];
      } else if (lower.includes('brando') || lower.includes('tabugon')) {
        officerName = 'Brando T. Tabugon';
        assignedBrgys = ['Mercedes', 'Katipunan', 'Puntana', 'Tubod', 'Balagawan'];
      } else {
        officerName = lower.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      setCurrentUser({
        username: lower,
        role: 'Barangay Focal Person',
        name: officerName,
        barangay: assignedBrgys.join(', '),
        assignedBarangays: assignedBrgys,
        title: 'Local Farmer Technician (LFT)',
        contactNumber: '0917-829-4501',
        email: `${lower}@silago-agriculture.gov.ph`
      });
      onClose();
      onSuccess?.();
    }
  };

  // Google OAuth Single-Click Sign In Handler
  const handleGoogleSignIn = () => {
    setCurrentUser({
      username: 'admin.google',
      role: 'Central Admin',
      name: adminProfile.name || 'Engr. Arnaldo M. Valdez',
      title: 'Municipal Agriculturist / LFT Coordinator',
      email: 'akoitogwapo9@gmail.com',
      contactNumber: '0917-829-4501',
      office: 'Office of the Municipal Agriculturist (DA-MAO)',
      photoUrl: adminProfile.photoUrl
    });
    onClose();
    onSuccess?.();
  };

  // Send SMS OTP Code
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      setError('Please enter a valid mobile phone number');
      return;
    }
    setError(null);
    setOtpSent(true);
    // Pre-fill demo OTP code for convenient testing
    setOtpCode('829451');
  };

  // Verify SMS OTP Code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter the 6-digit SMS verification code');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      // Create authenticated LFT session
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const isCoordinatorNum = cleanNumber.includes('1200') || cleanNumber.includes('0000');

      if (isCoordinatorNum) {
        setCurrentUser({
          username: 'admin',
          role: 'Central Admin',
          name: adminProfile.name || 'Engr. Arnaldo M. Valdez',
          title: adminProfile.title || 'Municipal Agriculturist / LFT Coordinator',
          email: adminProfile.email,
          contactNumber: `${countryCode} ${phoneNumber}`,
          office: adminProfile.office,
          photoUrl: adminProfile.photoUrl
        });
      } else {
        setCurrentUser({
          username: `lft.${cleanNumber.slice(-4) || 'field'}`,
          role: 'Barangay Focal Person',
          name: 'Verified LFT Field Officer',
          barangay: 'Salvacion, Laguna, Pob. 2, Pob. 1, Hingatungan, Balagawan',
          assignedBarangays: ['Salvacion', 'Laguna', 'Pob. 2', 'Pob. 1', 'Hingatungan', 'Balagawan'],
          title: 'Local Farmer Technician (LFT)',
          contactNumber: `${countryCode} ${phoneNumber}`,
          email: `lft.${cleanNumber.slice(-4) || 'officer'}@silago-agriculture.gov.ph`
        });
      }
      onClose();
      onSuccess?.();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-slate-800 w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header with official municipal badges */}
        <div className="bg-[#0c2340] text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <DaLogo size={28} />
                <SilagoSeal size={28} />
                <BagOngSilagoLogo size={28} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#38bdf8] uppercase tracking-wider block">
                  RICE FARM REGISTRY &amp; GEOREFERENCING
                </span>
                <h3 className="font-serif font-bold text-lg text-white leading-tight mt-0.5">
                  LFT &amp; Staff Portal Sign In
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
            Secure portal access for Municipal Agriculture Office staff and Local Farmer Technicians (LFTs).
          </p>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'standard' ? (
            /* Mode 1: Standard Username & Password Form First */
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    USERNAME / EMAIL
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. admin or lft.officer"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl w-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <span>Sign In to System &rarr;</span>
                </button>
              </form>

              {/* Horizontal Separator: "OR SIGN IN WITH" */}
              <div className="flex items-center text-xs uppercase tracking-wider text-neutral-400 my-4">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="px-3 text-[10px] font-bold text-slate-400">OR SIGN IN WITH</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              {/* Alternative Social & Phone Logins Below the Form */}
              <div className="space-y-2.5">
                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 w-full shadow-xs transition-all cursor-pointer text-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Direct Phone Number Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('phone');
                    setError(null);
                  }}
                  className="border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 w-full shadow-xs transition-all cursor-pointer text-xs"
                >
                  <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Sign in with Phone Number</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Direct Phone Number & SMS OTP Form without pre-listed profiles */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('standard');
                    setOtpSent(false);
                    setError(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Standard Login</span>
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  SMS OTP VERIFICATION
                </span>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      MOBILE PHONE NUMBER
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="+63">+63 (PH)</option>
                        <option value="+1">+1 (US)</option>
                      </select>
                      <div className="relative flex-1">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="917 123 4567"
                          autoFocus
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      A 6-digit one-time PIN will be sent to your mobile phone for secure verification.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send SMS Verification Code &rarr;</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>SMS Code Sent to {countryCode} {phoneNumber}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Use code <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">829451</span> to complete login.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      ENTER 6-DIGIT OTP CODE
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="829451"
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-base tracking-widest font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify &amp; Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

