import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf, ShieldCheck, Mail, Lock, Eye, EyeOff, Home,
  Sprout, Droplet, BarChart2, CheckCircle2, XCircle, Loader2, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Logo ── */
const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#087A4B" />
      <path d="M20 8C20 8 10 14 10 22C10 27.52 14.48 32 20 32C25.52 32 30 27.52 30 22C30 14 20 8 20 8Z" fill="#4CAF63" />
      <path d="M20 32V20" stroke="#B7E6C4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 20L15 16M20 20L25 16" stroke="#B7E6C4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#DCF3E3" />
    </svg>
    <span className={`font-bold text-lg tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      AgriSmart <span style={{ color: light ? '#86EFAC' : '#087A4B' }}>AI</span>
    </span>
  </div>
);

/* ── Botanical bg ── */
const LeafBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <svg className="absolute -top-16 -left-16 w-72 h-72 opacity-[0.07]" viewBox="0 0 200 300" fill="none">
      <path d="M100 10C100 10 20 80 20 160C20 220 55 270 100 280C145 270 180 220 180 160C180 80 100 10 100 10Z" fill="#087A4B"/>
      <path d="M100 280L100 120M100 200L60 160M100 200L140 160" stroke="#149B5C" strokeWidth="2"/>
    </svg>
    <svg className="absolute -bottom-20 -right-10 w-64 h-80 opacity-[0.06]" viewBox="0 0 200 300" fill="none">
      <path d="M100 10C100 10 20 80 20 160C20 220 55 270 100 280C145 270 180 220 180 160C180 80 100 10 100 10Z" fill="#35A866"/>
      <path d="M100 280L100 120" stroke="#149B5C" strokeWidth="2.5"/>
    </svg>
    <svg className="absolute top-10 right-20 w-28 h-36 opacity-[0.04]" viewBox="0 0 200 300" fill="none">
      <path d="M100 10C100 10 20 80 20 160C20 220 55 270 100 280C145 270 180 220 180 160C180 80 100 10 100 10Z" fill="#087A4B"/>
    </svg>
    <svg className="absolute bottom-20 left-10 w-20 h-28 opacity-[0.04]" viewBox="0 0 200 300" fill="none">
      <path d="M100 10C100 10 20 80 20 160C20 220 55 270 100 280C145 270 180 220 180 160C180 80 100 10 100 10Z" fill="#35A866"/>
    </svg>
  </div>
);

/* ── Password requirements checker ── */
const pwRules = [
  { id: 'len',   label: 'At least 8 characters',      test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)',  test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter (a–z)',  test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number (0–9)',             test: (v) => /[0-9]/.test(v) },
  { id: 'spec',  label: 'One special character (!@#$…)',test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const PasswordStrengthDrop = ({ value }) => {
  if (!value) return null;
  const passed = pwRules.filter(r => r.test(value)).length;
  const pct    = (passed / pwRules.length) * 100;
  const color  = pct <= 40 ? '#EF4444' : pct <= 80 ? '#F59E0B' : '#087A4B';

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="mt-2 p-3 rounded-xl border bg-white shadow-lg z-20"
      style={{ borderColor: '#D5E8D5' }}
    >
      {/* strength bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-[10px] font-bold" style={{ color }}>
          {pct <= 40 ? 'Weak' : pct <= 80 ? 'Fair' : 'Strong'}
        </span>
      </div>
      <ul className="space-y-1">
        {pwRules.map(r => {
          const ok = r.test(value);
          return (
            <li key={r.id} className="flex items-center gap-2 text-[11px]">
              {ok
                ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#087A4B' }} />
                : <XCircle     className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />
              }
              <span style={{ color: ok ? '#087A4B' : '#789187' }}>{r.label}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

/* ── Password input with toggle ── */
const PwInput = ({ value, onChange, placeholder, error, showStrength = false }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#45665A' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]'
          }`}
          style={{ color: '#123D31' }}
        />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && (focused || value) && <PasswordStrengthDrop value={value} />}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const FieldErr = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

/* ── Validate password against all rules ── */
const validatePassword = (v) => {
  if (!v) return 'Password is required.';
  if (!pwRules.every(r => r.test(v)))
    return 'Password must be 8+ characters with uppercase, lowercase, number and special character.';
  return '';
};

/* ═══════════════════════════════════════════════════ */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email)                         e.email    = 'Please enter your email address.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.';
    const pwErr = validatePassword(form.password);
    if (pwErr) e.password = pwErr;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate(result.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } else {
        setApiError(result.message || 'Invalid email or password.');
      }
    } catch (_) {
      setApiError('Unable to connect to AgriSmart AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F5FAF1' }}>
      <LeafBg />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-xl border overflow-hidden"
        style={{ borderColor: '#D5E8D5' }}
      >
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E8F6E6', background: '#FAFCF7' }}>
          <Link to="/"><Logo /></Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: '#087A4B' }}>
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* ── LEFT PANEL ── */}
          <div className="lg:w-[55%] relative overflow-hidden min-h-[480px]">
            <img src="/hero_farmer.jpg" alt="Farmer in green field" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(6,63,47,0.72) 0%,rgba(6,63,47,0.45) 60%,rgba(6,63,47,0.20) 100%)' }} />

            <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-10 min-h-[480px]">
              {/* AI badges */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: Leaf,     label: 'Crop Health' },
                  { icon: Droplet,  label: 'Water Management' },
                  { icon: BarChart2,label: 'Better Yield' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/25">
                    <Icon className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-white text-xs font-semibold">{label}</span>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  Smart Farming<br />Starts Here
                </h2>
                <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                  Join thousands of farmers using AgriSmart AI to get real-time insights, save resources and build a more sustainable future.
                </p>
              </div>

              {/* 4 benefit icons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Sprout,   label: 'Healthy Crops' },
                  { icon: Droplet,  label: 'Save Water' },
                  { icon: BarChart2,label: 'Higher Yield' },
                  { icon: Leaf,     label: 'Sustainable Future' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <Icon className="w-5 h-5 text-green-300" />
                    <span className="text-white text-[10px] font-semibold text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:w-[45%] flex items-center justify-center p-8" style={{ background: '#FAFCF7' }}>
            <div className="w-full max-w-sm">
              {/* trust badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#E8F6E6' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: '#087A4B' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#087A4B' }}>Your farm data stays private</span>
              </div>

              <h2 className="text-2xl font-bold mb-1" style={{ color: '#063F2F', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Welcome back</h2>
              <p className="text-sm mb-6" style={{ color: '#45665A' }}>Sign in to your farm</p>

              {apiError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg">{apiError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* email */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#123D31' }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#45665A' }} />
                    <input type="email" value={form.email} onChange={set('email')}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]'}`}
                      style={{ color: '#123D31' }} />
                  </div>
                  <FieldErr msg={errors.email} />
                </div>

                {/* password with strength */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#123D31' }}>Password</label>
                  <PwInput
                    value={form.password}
                    onChange={(e) => { set('password')(e); setErrors(er => ({ ...er, password: '' })); }}
                    placeholder="Enter your password"
                    error={errors.password}
                    showStrength
                  />
                </div>

                {/* remember / forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-[#087A4B]" />
                    <span className="text-xs font-medium" style={{ color: '#45665A' }}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#087A4B' }}>
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#087A4B' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : '🌿 Login'}
                </button>
              </form>

              <p className="text-center text-xs mt-6" style={{ color: '#789187' }}>
                New to AgriSmart AI?{' '}
                <Link to="/signup" className="font-bold hover:underline" style={{ color: '#087A4B' }}>Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
