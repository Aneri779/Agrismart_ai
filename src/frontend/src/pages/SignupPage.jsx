import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Mail, Lock, Eye, EyeOff, User as UserIcon,
  Sprout, Droplet, MapPin, CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#087A4B" />
      <path d="M20 8C20 8 10 14 10 22C10 27.52 14.48 32 20 32C25.52 32 30 27.52 30 22C30 14 20 8 20 8Z" fill="#4CAF63" />
      <path d="M20 32V20M20 20L15 16M20 20L25 16" stroke="#B7E6C4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#DCF3E3" />
    </svg>
    <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      AgriSmart <span style={{ color: '#087A4B' }}>AI</span>
    </span>
  </div>
);

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
  </div>
);

/* ── password rules ── */
const pwRules = [
  { id: 'len',   label: 'At least 8 characters',       test: v => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)',   test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter (a–z)',   test: v => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number (0–9)',              test: v => /[0-9]/.test(v) },
  { id: 'spec',  label: 'One special character (!@#$…)', test: v => /[^A-Za-z0-9]/.test(v) },
];

const isStrongPassword = (v) => pwRules.every(r => r.test(v));

const PasswordStrengthDrop = ({ value }) => {
  if (!value) return null;
  const passed = pwRules.filter(r => r.test(value)).length;
  const pct    = (passed / pwRules.length) * 100;
  const color  = pct <= 40 ? '#EF4444' : pct <= 80 ? '#F59E0B' : '#087A4B';
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 p-3 rounded-xl border bg-white shadow-lg" style={{ borderColor: '#D5E8D5' }}>
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
                : <XCircle     className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />}
              <span style={{ color: ok ? '#087A4B' : '#789187' }}>{r.label}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

const PwInput = ({ value, onChange, placeholder, error, showStrength = false }) => {
  const [show, setShow]       = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#45665A' }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-400 focus:ring-red-200' : 'border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]'}`}
          style={{ color: '#123D31' }} />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && (focused || value) && <PasswordStrengthDrop value={value} />}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const FieldErr = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

const StepBar = ({ step }) => {
  const steps = ['Account', 'Farm Profile', 'Ready'];
  return (
    <div className="flex items-center gap-2 mb-8 justify-center">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-[#087A4B] text-white' :
              i === step ? 'bg-[#DDF1DD] text-[#087A4B] ring-2 ring-[#087A4B]' : 'bg-gray-100 text-gray-400'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-sm font-semibold hidden sm:block ${i === step ? 'text-[#087A4B]' : i < step ? 'text-[#149B5C]' : 'text-gray-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-8 md:w-16 h-px mx-1" style={{ background: i < step ? '#087A4B' : '#D5E8D5' }} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const [account, setAccount] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  // Removed cropType from Farm Profile
  const [farm, setFarm]       = useState({ soilType: 'Loamy Soil', location: 'Ahmedabad, Gujarat' });
  const [errors, setErrors]   = useState({});

  const setA = (k) => (e) => {
    setAccount(a => ({ ...a, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
  };
  const setF = (k) => (e) => setFarm(f => ({ ...f, [k]: e.target.value }));

  const validateStep0 = () => {
    const e = {};
    if (!account.name.trim())             e.name     = 'Full name is required.';
    if (!account.email)                   e.email    = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(account.email)) e.email = 'Please enter a valid email address.';
    if (!account.password)                e.password = 'Password is required.';
    else if (!isStrongPassword(account.password))
      e.password = 'Password must be 8+ chars with uppercase, lowercase, number and special character.';
    if (!account.confirm)                 e.confirm  = 'Please confirm your password.';
    else if (account.password !== account.confirm) e.confirm = 'Passwords do not match.';
    if (!account.terms)                   e.terms    = 'You must agree to the Terms of Service and Privacy Policy.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = (ev) => {
    ev.preventDefault();
    if (validateStep0()) setStep(1);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    setLoading(true);
    try {
      const result = await register({
        name: account.name, email: account.email, password: account.password,
        cropType: '', // Fallback empty string for the backend
        soilType: farm.soilType, location: farm.location,
      });
      if (result.success) {
        setStep(2);
        setTimeout(() => navigate('/login', { state: { email: account.email } }), 500);
      } else {
        setApiError(result.message);
      }
    } catch (_) {
      setApiError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#F5FAF1' }}>
      <LeafBg />
      
      <div className="w-full max-w-4xl relative z-10 mb-6 flex justify-between items-center">
        <Link to="/"><Logo /></Link>
        <p className="text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm" style={{ color: '#45665A' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#087A4B' }}>Login</Link>
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col md:flex-row min-h-[500px]"
        style={{ borderColor: '#D5E8D5' }}>

        {/* ── LEFT PANEL (Hero side) ── */}
        <div className="md:w-5/12 relative overflow-hidden hidden md:block">
          <img src="/hero_farmer.jpg" alt="Farmer using tech in field" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(6,63,47,0.85) 0%,rgba(6,63,47,0.60) 100%)' }} />
          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                Join AgriSmart AI
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">Create your account and get personalized farm insights, AI analysis and sustainable farming recommendations.</p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Sprout, label: 'AI crop disease detection' },
                { icon: Droplet,label: 'Smart irrigation guidance' },
                { icon: Leaf,   label: 'Sustainability scoring' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-400/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-green-200" />
                  </div>
                  <span className="text-white/85 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/90 text-xl italic leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
              Better Farming<br />Brighter Future 🌿
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL (Form Area) ── */}
        <div className="md:w-7/12 p-8 lg:p-10 bg-[#FAFCF7] flex flex-col">
          <StepBar step={step} />
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* STEP 0: Account */}
              {step === 0 && (
                <motion.form key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleNext} className="space-y-5" noValidate>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#063F2F', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                      Create Account
                    </h3>
                    <p className="text-sm" style={{ color: '#45665A' }}>Get started in minutes. It's free and secure.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#45665A' }} />
                      <input type="text" value={account.name} onChange={setA('name')} placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]'}`}
                        style={{ color: '#123D31' }} />
                    </div>
                    <FieldErr msg={errors.name} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#45665A' }} />
                      <input type="email" value={account.email} onChange={setA('email')} placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]'}`}
                        style={{ color: '#123D31' }} />
                    </div>
                    <FieldErr msg={errors.email} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Password</label>
                      <PwInput value={account.password} onChange={setA('password')}
                        placeholder="Create password" error={errors.password} showStrength />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Confirm Password</label>
                      <PwInput value={account.confirm} onChange={setA('confirm')}
                        placeholder="Confirm password" error={errors.confirm} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-start gap-2 cursor-pointer select-none mt-2">
                      <input type="checkbox" checked={account.terms} onChange={setA('terms')} className="mt-1 w-4 h-4 rounded accent-[#087A4B]" />
                      <span className="text-sm" style={{ color: '#45665A' }}>
                        I agree to the{' '}
                        <a href="#" className="font-semibold hover:underline" style={{ color: '#087A4B' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="font-semibold hover:underline" style={{ color: '#087A4B' }}>Privacy Policy</a>
                      </span>
                    </label>
                    <FieldErr msg={errors.terms} />
                  </div>

                  <button type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity mt-4"
                    style={{ background: '#087A4B' }}>
                    Continue to Farm Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {/* STEP 1: Farm Profile */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: '#DDF1DD' }}>
                      <Sprout className="w-6 h-6" style={{ color: '#087A4B' }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#063F2F', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                      Build your farm profile
                    </h3>
                    <p className="text-sm" style={{ color: '#45665A' }}>
                      Tell us about your farm to help us personalize recommendations.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* soil */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Soil Type</label>
                      <div className="relative">
                        <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#087A4B' }} />
                        <select value={farm.soilType} onChange={setF('soilType')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white appearance-none focus:outline-none focus:ring-2 border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]"
                          style={{ color: '#123D31' }}>
                          {['Loamy Soil','Clay Soil','Sandy Soil','Silty Soil','Peaty Soil','Chalky Soil'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* location */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#123D31' }}>Default Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#087A4B' }} />
                        <select value={farm.location} onChange={setF('location')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white appearance-none focus:outline-none focus:ring-2 border-[#D5E8D5] focus:border-[#087A4B] focus:ring-[#DDF1DD]"
                          style={{ color: '#123D31' }}>
                          {['Ahmedabad, Gujarat','Surat, Gujarat','Mumbai, Maharashtra','Pune, Maharashtra',
                            'Delhi, India','Bangalore, Karnataka','Chennai, Tamil Nadu','Hyderabad, Telangana'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    {apiError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{apiError}</div>
                    )}
                    
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(0)} disabled={loading}
                        className="py-3.5 px-6 rounded-xl font-bold text-sm bg-white border border-[#D5E8D5] hover:bg-[#F5FAF1] transition-colors disabled:opacity-60"
                        style={{ color: '#063F2F' }}>
                        Back
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ background: '#087A4B' }}>
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><UserIcon className="w-5 h-5" /> Create Account</>}
                      </button>
                    </div>
                  </form>

                  {/* secure account */}
                  <div className="mt-6 flex items-center gap-3 p-4 rounded-xl" style={{ background: '#F5FAF1', border: '1px solid #D5E8D5' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#DDF1DD' }}>
                      <ShieldCheck className="w-5 h-5" style={{ color: '#087A4B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#063F2F' }}>Secure Account</p>
                      <p className="text-xs" style={{ color: '#789187' }}>Your data is protected with industry-standard security.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Success */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#DDF1DD' }}>
                    <CheckCircle2 className="w-12 h-12" style={{ color: '#087A4B' }} />
                  </div>
                  <h3 className="text-3xl font-bold mb-3" style={{ color: '#063F2F', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                    Account Created!
                  </h3>
                  <p className="text-base mb-8" style={{ color: '#45665A' }}>Your AgriSmart AI account is ready.</p>
                  <div className="flex items-center justify-center gap-2 text-base font-semibold" style={{ color: '#087A4B' }}>
                    <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to login...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
