'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useAppState } from '../context/AppStateContext';

const CATEGORIES = [
  { id: 'crypto',      label: 'Crypto',      icon: 'BTC', color: '#f59e0b', desc: 'BTC, ETH & more' },
  { id: 'forex',       label: 'Forex',        icon: 'â‚¬', color: '#34d399', desc: 'Major currency pairs' },
  { id: 'stocks',      label: 'Stocks',       icon: '', color: '#818cf8', desc: 'US & global equities' },
  { id: 'shares',      label: 'Shares',       icon: 'ðŸ¢', color: '#60a5fa', desc: 'Fractional shares' },
  { id: 'real-estate', label: 'Real Estate',  icon: 'ðŸ ', color: '#fb923c', desc: 'REITs & property' },
];

const NOTIF = [
  { id: 'email', label: 'Email notifications',       icon: '', desc: 'Trade alerts & updates' },
  { id: 'sms',   label: 'Phone / SMS alerts',        icon: '', desc: 'Instant price alerts' },
  { id: 'web',   label: 'Web push notifications',    icon: '', desc: 'Browser notifications' },
  { id: 'digest',label: 'Weekly market digest',      icon: '', desc: 'Summary every Monday' },
];

const STEPS = ['Personal Details', 'Your Interests', 'Account Security'];

function getAuthRedirectUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/signin?confirmed=1`;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl.replace(/\/$/, '')}/signin?confirmed=1`;
  return undefined;
}

function PasswordStrength({ pw }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#60a5fa', '#10b981'];
  if (!pw) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : '#27272a' }} />
        ))}
      </div>
      <p className="text-[10px] font-mono" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

function Toggle({ on, onChange, color = '#7c3aed' }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        backgroundColor: on ? color : '#27272a',
        boxShadow: on ? `0 0 14px ${color}70` : 'none',
      }}
      className="relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none active:scale-95"
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Checkbox({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
      className={`w-6 h-6 rounded-md flex items-center justify-center border-2 cursor-pointer transition-all duration-200 flex-shrink-0 active:scale-90 ${
        checked ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 bg-transparent hover:border-violet-500'
      }`}
    >
      {checked && (
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function InputField({ id, label, type='text', value, onChange, placeholder, icon, prefix, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label htmlFor={id} className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">{label}</label>}
      <div className={`relative rounded-xl border transition-all duration-200 bg-zinc-900/60 ${
        error ? 'border-red-500/60' : focused ? 'border-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]' : 'border-zinc-700/80'}`}>
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>}
        {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">{prefix}</span>}
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`w-full bg-transparent py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl ${icon ? 'pl-10' : prefix ? 'pl-8' : 'pl-4'} pr-4`} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SignUpClient() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', countryCode: '+1',
    password: '', confirm: '', referral: '', twoFA: false, agreeTerms: false, agreePrivacy: false,
  });
  const [showPw, setShowPw]   = useState(false);
  const [cats, setCats]       = useState({});
  const [notifs, setNotifs]   = useState({});
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { isAuthenticated, authLoading } = useAppState();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [authLoading, isAuthenticated]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleCat  = id => setCats(p => ({ ...p, [id]: !p[id] }));
  const toggleNotif = id => setNotifs(p => ({ ...p, [id]: !p[id] }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = 'Required';
      if (!form.lastName.trim())  e.lastName  = 'Required';
      if (!form.username.trim())  e.username  = 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
      if (!form.phone.trim())     e.phone     = 'Required';
      if (form.password.length < 8) e.password = 'Min 8 characters';
      if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    }
    if (step === 2) {
      if (!form.twoFA) e.twoFA = 'Two-factor authentication is required';
      if (!form.agreeTerms)   e.agreeTerms   = 'You must accept the Terms';
      if (!form.agreePrivacy) e.agreePrivacy = 'You must accept the Privacy Policy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    
    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', form.username)
      .maybeSingle();

    if (existingUser) {
      setErrors({ ...errors, global: 'That username is already taken. Please choose another.' });
      setLoading(false);
      return;
    }

    const selectedCats = Object.keys(cats).filter(id => cats[id]);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          phone: form.phone,
          twoFA: form.twoFA,
          interests: selectedCats,
        }
      }
    });

    if (error) {
      setLoading(false);
      setErrors({ ...errors, global: error.message });
      return;
    }
    
    if (data.user?.id) {
      await supabase
        .from('profiles')
        .update({ email: form.email, interests: selectedCats, two_fa_enabled: form.twoFA })
        .eq('id', data.user.id);
    }

    if (data.session) {
      localStorage.setItem('assetflux_interests', JSON.stringify(selectedCats));
      document.cookie = `assetflux_interests=${encodeURIComponent(JSON.stringify(selectedCats))}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('assetflux_user', JSON.stringify({ username: form.username, email: form.email, name: `${form.firstName} ${form.lastName}` }));
    }
    localStorage.setItem('assetflux_pending_confirmation', form.email);
    localStorage.setItem('isNewUser', 'true');
    
    setLoading(false);
    setDone(true);
  };

  const verifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrors({ ...errors, otp: 'Please enter the 6-digit code.' });
      return;
    }
    setVerifying(true);
    setErrors({ ...errors, otp: '' });

    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email,
      token: otpCode.trim(),
      type: 'signup'
    });

    if (error) {
      setVerifying(false);
      setErrors({ ...errors, otp: error.message });
      return;
    }

    setVerifying(false);
    // On success, the session is created and the `onAuthStateChange` listener in AppStateContext 
    // will detect it and redirect the user via the `useEffect` above.
  };

  if (done) return (
    <div className="min-h-screen bg-[#05060f] flex items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[110px]" />
      </div>
      <div className="text-center max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Verify your email</h1>
        <p className="text-zinc-400 text-sm mb-8">Welcome to AssetFlux, <span className="text-violet-400 font-semibold">@{form.username}</span>. We sent a verification code to {form.email}. Enter it below to verify your account.</p>
        
        <div className="bg-[#0d0f2a]/70 backdrop-blur-xl border border-violet-900/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(109,40,217,0.08)] mb-6 text-left">
          <InputField 
            id="otpCode" 
            label="Verification Code" 
            value={otpCode} 
            onChange={e => setOtpCode(e.target.value)} 
            placeholder="Enter code" 
            error={errors.otp} 
          />
          <button 
            type="button" 
            onClick={verifyOtp} 
            disabled={verifying}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 text-sm flex items-center justify-center gap-2"
          >
            {verifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
            {verifying ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </div>
        
        <p className="text-sm text-zinc-500">
          Didn't get the code? Check your spam folder or <Link href="/signin" className="text-violet-400 font-semibold hover:text-violet-300">try signing in to resend</Link>.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060f] text-white px-4 py-10 flex flex-col items-center">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-700/18 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-fuchsia-500/8 rounded-full blur-[110px]" />
      </div>

      {/* Logo */}
      <Link href="/" className="text-xl font-black tracking-tighter uppercase mb-10">
        Asset<span className="text-violet-400">Flux</span>
      </Link>

      <div className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  i < step  ? 'bg-violet-600 border-violet-600 text-white' :
                  i === step ? 'border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.4)]' :
                  'border-zinc-700 text-zinc-600'}`}>
                  {i < step ? 'Check' : i + 1}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${i === step ? 'text-violet-400' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-all duration-500 ${i < step ? 'bg-violet-600' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0d0f2a]/70 backdrop-blur-xl border border-violet-900/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(109,40,217,0.08)]">

          {/* â”€â”€ STEP 0: Personal Details â”€â”€ */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight">Create your account</h2>
                <p className="text-zinc-500 text-sm mt-1">Your personal details to get started</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField id="firstName" label="First Name" value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} placeholder=""
                  error={errors.firstName} autoComplete="given-name" />
                <InputField id="lastName" label="Surname" value={form.lastName}
                  onChange={e => set('lastName', e.target.value)} placeholder=""
                  error={errors.lastName} autoComplete="family-name" />
              </div>

              <InputField id="username" label="Username" value={form.username}
                onChange={e => set('username', e.target.value.replace(/\s/g,''))}
                placeholder="" prefix="@" error={errors.username} autoComplete="username" />

              <InputField id="email" label="Email Address" type="email" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                error={errors.email} autoComplete="email" />

              {/* Phone with country code */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">Phone Number</label>
                <div className="flex gap-2">
                  <select value={form.countryCode} onChange={e => set('countryCode', e.target.value)}
                    className="bg-zinc-900/60 border border-zinc-700/80 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-violet-500 w-24 flex-shrink-0">
                    {['+1','+44','+234','+33','+49','+81','+86','+91','+61'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="flex-1">
                    <InputField id="phone" type="tel" value={form.phone}
                      onChange={e => set('phone', e.target.value)} placeholder="800 123 4567"
                      error={errors.phone} autoComplete="tel" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide">Password</label>
                <div className="relative rounded-xl border border-zinc-700/80 bg-zinc-900/60 focus-within:border-violet-500 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all duration-200">
                  <input id="password" type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters"
                    className="w-full bg-transparent pl-4 pr-12 py-3 text-sm text-white placeholder-zinc-600 outline-none rounded-xl"
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      {showPw
                        ? <><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></>}
                    </svg>
                  </button>
                </div>
                <PasswordStrength pw={form.password} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <InputField id="confirm" label="Confirm Password" type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} placeholder="Repeat password"
                error={errors.confirm} autoComplete="new-password" />
            </div>
          )}

          {/* â”€â”€ STEP 1: Interests â”€â”€ */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight">Your Interests</h2>
                <p className="text-zinc-500 text-sm mt-1">Personalise your terminal - pick as many as you like</p>
              </div>

              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Which categories are you interested in?</p>
              <div className="space-y-2.5 mb-8">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left active:scale-[0.99] ${
                      cats[c.id]
                        ? 'border-violet-600/60 bg-violet-900/15 shadow-[0_0_12px_rgba(124,58,237,0.1)]'
                        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{c.label}</p>
                        <p className="text-[10px] text-zinc-500">{c.desc}</p>
                      </div>
                    </div>
                    <Toggle on={!!cats[c.id]} onChange={() => toggleCat(c.id)} color={c.color} />
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">How do you want to be notified?</p>
              <div className="space-y-2.5">
                {NOTIF.map(n => (
                  <label key={n.id} htmlFor={`notif-${n.id}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      notifs[n.id]
                        ? 'border-violet-600/50 bg-violet-900/10'
                        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}>
                    <Checkbox id={`notif-${n.id}`} checked={!!notifs[n.id]} onChange={() => toggleNotif(n.id)} />
                    <div>
                      <p className="text-sm font-semibold text-white">{n.label}</p>
                      <p className="text-[10px] text-zinc-500">{n.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ STEP 2: Security â”€â”€ */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight">Account Security</h2>
                <p className="text-zinc-500 text-sm mt-1">Secure your account and finish up</p>
              </div>

              {/* 2FA toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-900/30 border border-violet-700/30 flex items-center justify-center text-lg"></div>
                  <div>
                    <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                    <p className="text-[10px] text-zinc-500">Required before creating an AssetFlux account</p>
                  </div>
                </div>
                <Toggle on={form.twoFA} onChange={() => set('twoFA', !form.twoFA)} />
              </div>
              {errors.twoFA && <p className="text-red-400 text-xs pl-1">{errors.twoFA}</p>}

              {/* Referral code */}
              <InputField id="referral" label="Referral Code (optional)" value={form.referral}
                onChange={e => set('referral', e.target.value)} placeholder="e.g. FLUX-XXXX"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>}
                autoComplete="off" />

              {/* Terms */}
              <div className="space-y-3 pt-2">
                <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                  errors.agreeTerms ? 'border-red-500/40 bg-red-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <Checkbox id="terms" checked={form.agreeTerms} onChange={() => set('agreeTerms', !form.agreeTerms)} />
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    I agree to the <Link href="#" className="text-violet-400 hover:text-violet-300 font-semibold">Terms of Service</Link> and understand my account is subject to AssetFlux policies.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-red-400 text-xs pl-1">{errors.agreeTerms}</p>}

                <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                  errors.agreePrivacy ? 'border-red-500/40 bg-red-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <Checkbox id="privacy" checked={form.agreePrivacy} onChange={() => set('agreePrivacy', !form.agreePrivacy)} />
                  <span className="text-sm text-zinc-400 leading-relaxed">
                    I have read and accept the <Link href="#" className="text-violet-400 hover:text-violet-300 font-semibold">Privacy Policy</Link> and consent to data processing.
                  </span>
                </label>
                {errors.agreePrivacy && <p className="text-red-400 text-xs pl-1">{errors.agreePrivacy}</p>}
              </div>

              {/* Summary */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500 space-y-1">
                <p> Interests: <span className="text-zinc-300">{Object.keys(cats).filter(k => cats[k]).map(k => CATEGORIES.find(c => c.id===k)?.label).join(', ') || 'None selected'}</span></p>
                <p> Notifications: <span className="text-zinc-300">{Object.keys(notifs).filter(k => notifs[k]).map(k => NOTIF.find(n => n.id===k)?.label).join(', ') || 'None'}</span></p>
                <p> 2FA: <span className={form.twoFA ? 'text-emerald-400' : 'text-zinc-500'}>{form.twoFA ? 'Enabled' : 'Disabled'}</span></p>
              </div>

              {errors.global && (
                <div className="p-3 mt-4 text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 rounded-xl">
                  {errors.global}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className={`flex gap-3 mt-8 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
            {step > 0 && (
              <button type="button" onClick={back}
                className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:border-violet-600/60 hover:text-violet-300 transition-all duration-200">
                &larr; Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" id={`step${step}-next`} onClick={next}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] transition-all duration-300 text-sm">
                Continue &rarr;
              </button>
            ) : (
              <button type="button" id="signup-submit" onClick={submit} disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_45px_rgba(124,58,237,0.6)] transition-all duration-300 text-sm flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</>
                ) : ' Create my account'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-6">
          Already have an account?{' '}
          <Link href="/signin" className="text-violet-400 font-semibold hover:text-violet-300 transition">Sign in &rarr;</Link>
        </p>
      </div>
    </div>
  );
}

