import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Leaf, Droplet, CheckCircle2,
  CloudSun, Sun, Sprout, Bot, Menu, X, ArrowRight,
  Camera, Brain, Shield, Globe, Sparkles, Award, Eye,
  Activity, Users, Star, Zap, Tractor, Building, Landmark, ShieldCheck
} from "lucide-react";

const MarqueeStyles = () => (
  <style>{`
    @keyframes marquee-left {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes marquee-right {
      0%   { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    .marquee-left  { animation: marquee-left  44s linear infinite; display: flex; width: max-content; }
    .marquee-right { animation: marquee-right 38s linear infinite; display: flex; width: max-content; }
    .marquee-left:hover, .marquee-right:hover { animation-play-state: paused; }
    .marquee-wrap { overflow: hidden; }
    @keyframes marquee-brand { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .marquee-brand { animation: marquee-brand 30s linear infinite; display: flex; width: max-content; }
    .marquee-brand:hover { animation-play-state: paused; }
  `}</style>
);


/* ═══════════════════════════════════════════════
   BOTANICAL SVG DECORATIONS
═══════════════════════════════════════════════ */
const LeafDecor = ({ className = "", opacity = 0.12, size = 120, color = "#087A4B" }) => (
  <svg className={className} width={size} height={size * 1.4} viewBox="0 0 80 110" fill="none" style={{ opacity }}>
    <path d="M40 5C40 5 8 32 8 65C8 88 22 105 40 108C58 105 72 88 72 65C72 32 40 5 40 5Z" fill={color} />
    <path d="M40 108V45M40 80L22 62M40 80L58 62M40 65L28 52M40 65L52 52" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LeafOutline = ({ className = "", opacity = 0.08, size = 100 }) => (
  <svg className={className} width={size} height={size * 1.4} viewBox="0 0 80 110" fill="none" style={{ opacity }}>
    <path d="M40 5C40 5 8 32 8 65C8 88 22 105 40 108C58 105 72 88 72 65C72 32 40 5 40 5Z" stroke="#087A4B" strokeWidth="1.5" fill="none" />
    <path d="M40 108V45M40 80L22 62M40 80L58 62" stroke="#087A4B" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const BotanicalBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <LeafOutline className="absolute -top-8 -right-6" opacity={0.07} size={160} />
    <LeafOutline className="absolute top-1/2 -left-10" opacity={0.05} size={120} />
    <LeafOutline className="absolute bottom-0 right-1/4" opacity={0.06} size={90} />
    <svg className="absolute top-20 left-1/3" width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ opacity: 0.04 }}>
      <circle cx="100" cy="100" r="80" stroke="#087A4B" strokeWidth="1" strokeDasharray="4 6" />
      <circle cx="100" cy="100" r="50" stroke="#087A4B" strokeWidth="1" strokeDasharray="3 8" />
    </svg>
  </div>
);

/* ═══════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════ */
const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-white/15' : 'bg-[#0B4F3A]'}`}>
      <Leaf className={`w-5 h-5 ${light ? 'text-emerald-200' : 'text-white'}`} />
    </div>
    <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-[#0B4F3A]'}`} style={{ fontFamily: 'Manrope, Inter, sans-serif' }}>
      Agri<span style={{ color: light ? '#86EFAC' : '#087A4B' }}>Smart</span> AI
    </span>
  </div>
);

/* ═══════════════════════════════════════════════
   EYEBROW LABEL
═══════════════════════════════════════════════ */
const Eyebrow = ({ children, light = false }) => (
  <div className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-4 ${light ? 'text-emerald-300' : 'text-[#087A4B]'}`}>
    <span className={`w-6 h-px ${light ? 'bg-emerald-400' : 'bg-[#087A4B]'}`} />
    {children}
    <span className={`w-6 h-px ${light ? 'bg-emerald-400' : 'bg-[#087A4B]'}`} />
  </div>
);

/* ═══════════════════════════════════════════════
   SCROLL-ANIMATE WRAPPER
═══════════════════════════════════════════════ */
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   NAV LINKS
═══════════════════════════════════════════════ */
const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "AI Intelligence", href: "#ai-intelligence" },
  { name: "About", href: "#about" },
  { name: "Reviews", href: "#reviews" },
];

/* ═══════════════════════════════════════════════
   STAR RATING
═══════════════════════════════════════════════ */
const StarRating = ({ rating = 5 }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} style={{ fill: i <= rating ? '#F59E0B' : 'none', color: i <= rating ? '#F59E0B' : '#D1D5DB' }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════
   REVIEWS DATA
═══════════════════════════════════════════════ */
const REVIEWS = [
  { name: "Rajesh Kumar", role: "Wheat Farmer, Punjab", rating: 5, image: "/review1.jpg", text: "AgriSmart AI completely changed how I manage my farm. The disease detection saved my entire wheat crop last season. My yield improved by 28% this year — worth every rupee.", crop: "Wheat · 12 Acres" },
  { name: "Kavita Devi", role: "Organic Grower, Maharashtra", rating: 4, image: "/farmer_kavita.jpg", text: "Precision irrigation reduced my water usage by 35% while increasing vegetable yield. The AI assistant answers all my farming questions instantly — like having an expert on call.", crop: "Tomatoes & Chillies · 6 Acres" },
  { name: "Suresh Patel", role: "Rice Farmer, Tamil Nadu", rating: 5, image: "/farmer_suresh.jpg", text: "Good app, the weather alerts are spot-on. Crop scanning is fast and accurate. Still the single best tool for small and large scale farmers alike.", crop: "Paddy Rice · 8 Acres" },
  { name: "Ramesh Sharma", role: "Agri-Entrepreneur, Rajasthan", rating: 4, image: "/farmer_ramesh.jpg", text: "Managing multiple fields is easy now with AgriSmart AI. The sustainability score helped me qualify for green farming subsidies. ROI has been exceptional.", crop: "Mixed Crops · 45 Acres" },
  { name: "Arun Singh", role: "Vegetable Farmer, Karnataka", rating: 5, image: "/farmer_arun.jpg", text: "Soil health monitoring and nutrient tracking are remarkable. I now know exactly what my crops need and when. Produce quality has improved dramatically.", crop: "Mixed Vegetables · 4 Acres" },
];

/* ═══════════════════════════════════════════════
   REAL AGRITECH BRAND LOGOS (FROM SCREENSHOT)
═══════════════════════════════════════════════ */
const BrandLogoDeHaat = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4" />
    <path d="M18 7C13 7 9 11 9 16C9 22 18 29 18 29C18 29 27 22 27 16C27 11 23 7 18 7Z" fill="#15803D" />
    <path d="M18 11V21M18 15L14 11M18 17L22 13" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogoFasal = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#ECFDF5" />
    <path d="M11 25V13M11 17C15 17 18 14 18 11C22 14 25 17 25 21" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
    <circle cx="11" cy="11" r="2.5" fill="#34D399" />
    <circle cx="18" cy="9" r="2" fill="#059669" />
  </svg>
);

const BrandLogoNinjacart = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4" />
    <path d="M9 13H27L24 23H12L9 13Z" fill="#16A34A" />
    <circle cx="14" cy="27" r="2" fill="#15803D" />
    <circle cx="22" cy="27" r="2" fill="#15803D" />
    <path d="M14 16L18 20L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogoAgrostar = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#FEF2F2" />
    <path d="M18 7L21 14L28 15L23 20L24 27L18 24L12 27L13 20L8 15L15 14L18 7Z" fill="#DC2626" />
  </svg>
);

const BrandLogoBigHaat = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4" />
    <path d="M8 27V11H18C21 11 23 13 23 16C23 18 21 19 19 19C22 19 24 21 24 24C24 26 22 27 18 27H8Z" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 10C24 8 28 8 28 8C28 8 28 12 26 14" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogoCropin = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0F9FF" />
    <circle cx="18" cy="18" r="11" stroke="#0284C7" strokeWidth="3" />
    <circle cx="18" cy="18" r="5" fill="#38BDF8" />
    <path d="M18 7V13M18 23V29M7 18H13M23 18H29" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogoFarMart = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4" />
    <path d="M10 27V9H26M10 17H22" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const BrandLogoWaycool = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#EFF6FF" />
    <path d="M18 7L28 18L18 29L8 18L18 7Z" fill="#2563EB" />
    <path d="M18 12L23 18L18 24L13 18L18 12Z" fill="#93C5FD" />
  </svg>
);

const BrandLogoJaiKisan = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4" />
    <circle cx="18" cy="18" r="12" fill="#15803D" />
    <path d="M18 10V26M18 14L14 10M18 18L22 14M18 22L13 18" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BrandLogoStellapps = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F8FAFC" />
    <rect x="10" y="12" width="16" height="14" rx="3" fill="#334155" />
    <circle cx="14" cy="17" r="2" fill="#38BDF8" />
    <circle cx="22" cy="17" r="2" fill="#38BDF8" />
    <path d="M15 22H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 7V12" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ═══════════════════════════════════════════════
   BRAND TRUST DATA (REAL AGRITECH COMPANIES)
═══════════════════════════════════════════════ */
const BRANDS = [
  { name: "DeHaat",     sub: "Agricultural Ecosystem",  Logo: BrandLogoDeHaat },
  { name: "Fasal",      sub: "Precision Farming",       Logo: BrandLogoFasal },
  { name: "ninjacart",  sub: "Agri Supply Chain",       Logo: BrandLogoNinjacart },
  { name: "AgroStar",   sub: "Helping Farmers Win",     Logo: BrandLogoAgrostar },
  { name: "BigHaat",    sub: "Agri Digital Platform",   Logo: BrandLogoBigHaat },
  { name: "Cropin",     sub: "Smart Agri Cloud",        Logo: BrandLogoCropin },
  { name: "FarMart",    sub: "SaaS & Commerce",         Logo: BrandLogoFarMart },
  { name: "Waycool",    sub: "Food Supply Chain",       Logo: BrandLogoWaycool },
  { name: "Jai Kisan",  sub: "Financial Services",      Logo: BrandLogoJaiKisan },
  { name: "Stellapps",  sub: "Dairy IoT Solutions",     Logo: BrandLogoStellapps },
];

/* ═══════════════════════════════════════════════
   HOW IT WORKS STEPS
═══════════════════════════════════════════════ */
const HIW_STEPS = [
  {
    num: "01", title: "Capture",
    desc: "Take a photo or upload crop/farm data.",
    type: "image", src: "/hiw_capture.jpg", accent: "#087A4B"
  },
  {
    num: "02", title: "Analyze",
    desc: "AI processes the image and data.",
    type: "ai-chip", accent: "#0369A1"
  },
  {
    num: "03", title: "Understand",
    desc: "Get clear insights, risks and recommendations.",
    type: "document", accent: "#059669"
  },
  {
    num: "04", title: "Act",
    desc: "Follow guidance and improve your farm.",
    type: "image", src: "/hero_farmer.jpg", accent: "#D97706"
  },
];

/* ═══════════════════════════════════════════════
   REVIEW CARD COMPONENT
═══════════════════════════════════════════════ */
function ReviewCard({ review }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      width: 320, flexShrink: 0, margin: '0 10px',
      background: 'white', borderRadius: 22, overflow: 'hidden',
      border: '1px solid #DCEFD9', boxShadow: '0 4px 20px rgba(11,79,58,0.08)'
    }}>
      {/* Farmer photo with river/field backdrop */}
      <div style={{ position: 'relative', height: 165, overflow: 'hidden', flexShrink: 0 }}>
        <img src={review.image} alt={review.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(11,79,58,0.78) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', fontFamily: 'Manrope, sans-serif', lineHeight: 1.2 }}>{review.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.80)', marginTop: 2 }}>{review.role}</div>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(11,79,58,0.82)', backdropFilter: 'blur(8px)', color: '#86EFAC', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
          🌿 {review.crop}
        </div>
      </div>
      {/* Review content */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        <StarRating rating={review.rating} />
        <p style={{ fontSize: 13, color: '#3D6152', lineHeight: 1.65, flex: 1, fontStyle: 'italic', margin: 0 }}>"{review.text}"</p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════
   FEATURES DATA
═══════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Camera,
    title: "AI Crop Disease Detection",
    desc: "Upload a leaf photo and get instant disease diagnosis with 94% accuracy. Detects 50+ diseases across major crops.",
    badge: "94% Accuracy",
    color: "#087A4B",
    bg: "#EEF7EA",
    extra: (
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#DCEFD9] rounded-full overflow-hidden">
          <div className="w-[94%] h-full bg-[#087A4B] rounded-full" />
        </div>
        <span className="text-xs font-bold text-[#087A4B]">94%</span>
      </div>
    )
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    desc: "Hyper-local 14-day forecasts with planting-window alerts, frost warnings, and smart irrigation timing.",
    badge: "Real-time",
    color: "#0369A1",
    bg: "#EFF6FF",
    extra: (
      <div className="mt-3 flex items-center gap-3">
        {["Mon","Tue","Wed","Thu","Fri"].map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-gray-500">{d}</span>
            <span className="text-[10px] font-bold text-gray-700">{26+i}°</span>
          </div>
        ))}
      </div>
    )
  },
  {
    icon: Droplet,
    title: "Smart Irrigation",
    desc: "AI-driven water scheduling based on soil moisture, crop stage and weather. Save up to 40% water.",
    badge: "40% Water Saved",
    color: "#0E7490",
    bg: "#ECFEFF",
    extra: (
      <div className="mt-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#0E7490] flex items-center justify-center">
          <span className="text-[9px] font-bold text-[#0E7490]">68%</span>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Soil Moisture</div>
          <div className="text-xs font-bold text-[#0B4F3A]">Optimal — No watering needed</div>
        </div>
      </div>
    )
  },
  {
    icon: Activity,
    title: "Farm Health Monitoring",
    desc: "Real-time dashboard tracking crop vitality, soil pH, nutrient levels and environmental conditions.",
    badge: "Live Data",
    color: "#059669",
    bg: "#ECFDF5",
    extra: (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[["Crop","Healthy","#059669"],["Soil pH","6.8","#087A4B"],["Temp","28°C","#D97706"]].map(([l,v,c]) => (
          <div key={l} className="bg-white rounded-lg p-1.5 text-center border border-gray-100">
            <div className="text-[9px] text-gray-400">{l}</div>
            <div className="text-xs font-bold" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    icon: Shield,
    title: "Sustainability Score",
    desc: "Measure your environmental footprint and get recommendations to improve your farm's sustainability.",
    badge: "78/100",
    color: "#16A34A",
    bg: "#F0FDF4",
    extra: (
      <div className="mt-3 flex items-center gap-3">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#DCEFD9" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke="#087A4B" strokeWidth="4"
            strokeDasharray={`${(78/100)*113} 113`} strokeLinecap="round"
            transform="rotate(-90 22 22)" />
          <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0B4F3A">78</text>
        </svg>
        <div className="space-y-1 flex-1">
          {["Water Efficiency","Crop Health","Carbon Score"].map(l => (
            <div key={l} className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[#DCEFD9] rounded-full"><div className="h-full bg-[#087A4B] rounded-full" style={{ width: `${60+Math.random()*30}%` }} /></div>
              <span className="text-[9px] text-gray-400">{l}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: Bot,
    title: "AI Farmer Assistant",
    desc: "24/7 conversational AI assistant for instant farming advice, pest identification and personalized guidance.",
    badge: "24/7 Available",
    color: "#7C3AED",
    bg: "#F5F3FF",
    extra: (
      <div className="mt-3 space-y-1.5">
        {["How do I treat early blight?","Best time to irrigate?"].map(q => (
          <div key={q} className="bg-white text-[10px] text-gray-600 px-2.5 py-1.5 rounded-full border border-purple-100 truncate">{q}</div>
        ))}
        <div className="bg-purple-50 text-[10px] text-purple-700 px-2.5 py-1.5 rounded-xl border border-purple-100">
          💬 Apply copper-based fungicide every 7–10 days…
        </div>
      </div>
    )
  },
];

/* ═══════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════ */
const STEPS = [
  { num: "01", icon: Camera, title: "Capture", desc: "Upload a crop image or enter farm data using our simple mobile-friendly interface." },
  { num: "02", icon: Brain, title: "Analyze", desc: "Our AI processes your image against 50,000+ agricultural samples in seconds." },
  { num: "03", icon: Eye, title: "Understand", desc: "Get clear visual insights on crop health, disease severity and risk levels." },
  { num: "04", icon: Zap, title: "Act", desc: "Follow step-by-step treatment plans and preventive recommendations tailored to your farm." },
];

/* ═══════════════════════════════════════════════
   STAT COUNTER
═══════════════════════════════════════════════ */
const StatCounter = ({ value, suffix = "", label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const num = parseInt(value);
    if (isNaN(num)) { setCount(value); return; }
    let start = 0;
    const duration = 1800;
    const increment = num / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);
  return (
    <div ref={ref} className="text-center py-6">
      <div className="text-4xl lg:text-5xl font-bold text-[#0B4F3A] mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
        {typeof count === 'number' ? count : value}{suffix}
      </div>
      <div className="text-sm text-[#55665C] font-medium">{label}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % 4), 3500);
    return () => clearInterval(t);
  }, []);

  const reviewsDouble = [...REVIEWS, ...REVIEWS];
  const brandsDouble  = [...BRANDS,  ...BRANDS];
  const step = HIW_STEPS[activeStep];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{
      backgroundColor: '#F8FAF3',
      fontFamily: 'Inter, Manrope, sans-serif',
      color: '#183F32'
    }}>

      {/* ─────────────────── GOOGLE FONTS ─────────────────── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <MarqueeStyles />

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        transition: 'all 0.4s ease',
        background: isScrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(16px)',
        boxShadow: isScrolled ? '0 2px 24px rgba(11,79,58,0.10)' : '0 1px 0 rgba(11,79,58,0.06)',
        padding: isScrolled ? '10px 0' : '16px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <a key={link.name} href={link.href}
                style={{ fontSize: 14, fontWeight: 500, color: '#3D6152', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#087A4B'}
                onMouseLeave={e => e.target.style.color = '#3D6152'}>
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: '#3D6152', textDecoration: 'none' }}>
              Log in
            </Link>
            <Link to="/signup" style={{
              padding: '10px 22px', borderRadius: 100,
              background: '#0B4F3A', color: 'white',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(11,79,58,0.25)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#087A4B'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0B4F3A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0B4F3A' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
              paddingTop: 88, paddingLeft: 24, paddingRight: 24
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NAV_LINKS.map(link => (
                <a key={link.name} href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: 18, fontWeight: 600, color: '#183F32', padding: '12px 0', borderBottom: '1px solid #EEF7EA', textDecoration: 'none' }}>
                  {link.name}
                </a>
              ))}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  style={{ textAlign: 'center', padding: 14, borderRadius: 16, border: '1px solid #DCEFD9', color: '#0B4F3A', fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
                  style={{ textAlign: 'center', padding: 14, borderRadius: 16, background: '#0B4F3A', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}>
        {/* Hero background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="/hero_farmer.jpg" alt="Farmer in field" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          {/* Gradient overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,79,58,0.88) 0%, rgba(11,79,58,0.65) 50%, rgba(11,79,58,0.25) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,79,58,0.5) 0%, transparent 50%)' }} />
        </div>

        {/* Botanical leaf decors on hero */}
        <div style={{ position: 'absolute', top: 80, right: '5%', opacity: 0.12 }}>
          <LeafDecor size={200} color="white" opacity={1} />
        </div>
        <div style={{ position: 'absolute', bottom: 80, right: '30%', opacity: 0.08 }}>
          <LeafOutline size={120} opacity={1} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '60px 24px', width: '100%', display: 'flex', alignItems: 'center', gap: 48 }}>
          {/* Left: Text */}
          <div style={{ flex: 1.2, maxWidth: 620 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.20)', borderRadius: 100,
                padding: '6px 16px', marginBottom: 24,
                color: '#86EFAC', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={13} />
                AI for a Greener Tomorrow
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, fontFamily: 'Manrope, sans-serif' }}>
              <span style={{ color: 'white' }}>Smarter Farming.</span><br />
              <span style={{ color: 'white' }}>Healthier Crops.</span><br />
              <span style={{ color: '#86EFAC' }}>Better Tomorrow.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              AgriSmart AI uses advanced AI to help farmers detect crop health issues, get weather intelligence, optimize irrigation and make sustainable farming decisions.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <Link to="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 100,
                background: '#087A4B', color: 'white',
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(8,122,75,0.40)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#159447'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#087A4B'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 100,
                background: 'rgba(255,255,255,0.12)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                fontWeight: 600, fontSize: 16, textDecoration: 'none',
                backdropFilter: 'blur(8px)', transition: 'all 0.25s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                Watch How It Works
              </a>
            </motion.div>

            {/* Handwritten note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ marginTop: 36, display: 'flex', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
              <div style={{ width: 2, height: 48, background: 'rgba(134,239,172,0.4)', borderRadius: 2 }} />
              <div style={{ fontStyle: 'italic', lineHeight: 1.6, fontFamily: 'Georgia, serif' }}>
                "Better data.<br />Better decisions.<br />Higher yields."
              </div>
            </motion.div>
          </div>
        </div>

        {/* Curved bottom */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, zIndex: 5 }}>
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: 80 }}>
            <path d="M0,80 Q360,0 720,40 Q1080,80 1440,20 L1440,80 Z" fill="#F8FAF3" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ TRUST STATS BAR ═══════════════════ */}
      <section style={{ background: 'white', padding: '32px 24px', borderBottom: '1px solid #DCEFD9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          {[
            { value: "10K+", label: "Farmers Empowered", icon: Users },
            { value: "2M+", label: "Acres Monitored", icon: Globe },
            { value: "94%", label: "Detection Accuracy", icon: Award },
            { value: "40%", label: "Water Saved", icon: Droplet },
          ].map(({ value, label, icon: Icon }) => (
            <FadeUp key={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '8px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="#087A4B" />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', lineHeight: 1.1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#55665C' }}>{label}</div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
      <section id="features" style={{ padding: '100px 24px', background: '#F8FAF3', position: 'relative', overflow: 'hidden' }}>
        <BotanicalBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 64px' }}>
              <Eyebrow>Features</Eyebrow>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', marginBottom: 16, lineHeight: 1.15 }}>
                Powerful AI Features for<br />Smarter Agriculture
              </h2>
              <p style={{ fontSize: 17, color: '#55665C', lineHeight: 1.7 }}>
                Everything you need to monitor, analyze and improve your farm — powered by artificial intelligence.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
            {FEATURES.map((feat, idx) => (
              <FadeUp key={idx} delay={idx * 0.08} className="h-full">
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(11,79,58,0.12)' }}
                  transition={{ type: "spring", stiffness: 250 }}
                  style={{
                    background: 'white', borderRadius: 22,
                    padding: '28px 26px', border: '1px solid #DCEFD9',
                    boxShadow: '0 2px 12px rgba(11,79,58,0.06)',
                    cursor: 'default', height: '100%',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: feat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <feat.icon size={24} color={feat.color} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: feat.bg, color: feat.color, letterSpacing: '0.05em' }}>
                        {feat.badge}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0B4F3A', marginBottom: 8, fontFamily: 'Manrope, sans-serif' }}>{feat.title}</h3>
                    <p style={{ fontSize: 14, color: '#55665C', lineHeight: 1.65 }}>{feat.desc}</p>
                  </div>
                  {feat.extra}
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: '#F2F8ED', position: 'relative', overflow: 'hidden', borderTop: '1px solid #E1EFE0', borderBottom: '1px solid #E1EFE0' }}>
        <BotanicalBg />
        
        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative' }}>
          <div style={{
            background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(16px)',
            borderRadius: 32, padding: '48px 36px', border: '1px solid #D8EAD6',
            boxShadow: '0 12px 36px rgba(11,79,58,0.06)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '300px 1fr', gap: 40, alignItems: 'center' }} className="lg:grid-cols-[320px_1fr]">
              {/* Left Column: Heading text */}
              <FadeUp>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#087A4B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                    HOW IT WORKS
                  </div>
                  <h2 style={{ fontSize: 'clamp(2.2rem, 3vw, 2.8rem)', fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', lineHeight: 1.15, marginBottom: 16 }}>
                    From Image to Action<br />in 4 Simple Steps
                  </h2>
                  <p style={{ fontSize: 14, color: '#55665C', lineHeight: 1.65 }}>
                    Our AI turns farm data into actionable insights — so you can make better decisions, faster.
                  </p>
                </div>
              </FadeUp>

              {/* Right Column: 4 Circular Process Steps Flow */}
              <div style={{ display: 'flex', flexWrap: 'wrap', lg: 'nowrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, position: 'relative' }} className="grid grid-cols-2 md:grid-cols-4 lg:flex">
                {HIW_STEPS.map((s, idx) => (
                  <React.Fragment key={idx}>
                    <FadeUp delay={idx * 0.1} className="flex-1 flex flex-col items-center text-center group min-w-[140px]">
                      {/* Circular Container with Ring and Decorative Leaves */}
                      <div style={{ position: 'relative', width: 116, height: 116, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        
                        {/* Outer Glowing Green Circular Ring */}
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: '50%',
                          border: '2.5px solid #087A4B', boxShadow: '0 0 16px rgba(8,122,75,0.20)',
                          background: 'white'
                        }} />

                        {/* Floating botanical vine leaf decor on 1st & 2nd circle */}
                        {(idx === 0 || idx === 1) && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: -6, right: -4, transform: 'rotate(25deg)', zIndex: 10 }}>
                            <path d="M12 2C12 2 4 10 4 17C4 20.5 7 23 10.5 23C14 23 16 20.5 16 17C16 10 12 2 12 2Z" fill="#087A4B" />
                            <path d="M12 23V10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        )}
                        {(idx === 2 || idx === 3) && (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', bottom: -4, left: -4, transform: 'rotate(-40deg)', zIndex: 10 }}>
                            <path d="M12 2C12 2 4 10 4 17C4 20.5 7 23 10.5 23C14 23 16 20.5 16 17C16 10 12 2 12 2Z" fill="#15803D" opacity="0.9" />
                          </svg>
                        )}

                        {/* Inner Content depending on step type */}
                        <div style={{ position: 'relative', zIndex: 5, width: 102, height: 102, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF3' }}>
                          {s.type === 'image' && (
                            <img src={s.src} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}

                          {s.type === 'ai-chip' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                              {/* Microchip graphic */}
                              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF7EA', border: '1.5px solid #087A4B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 8px rgba(8,122,75,0.15)' }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#0B4F3A', letterSpacing: '0.05em', fontFamily: 'Manrope, sans-serif' }}>AI</span>
                              </div>
                            </div>
                          )}

                          {s.type === 'document' && (
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EFF6FF', border: '1.5px solid #0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="3" width="16" height="18" rx="2" stroke="#0369A1" strokeWidth="2" fill="white" />
                                <path d="M8 8H16M8 12H14M8 16H12" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="17" cy="16" r="3.5" fill="#087A4B" />
                                <path d="M15.5 16L16.5 17L18.5 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step Info */}
                      <div style={{ maxWidth: 160 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#087A4B', fontFamily: 'Manrope, sans-serif', marginBottom: 2 }}>
                          {s.num}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', marginBottom: 4 }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#55665C', lineHeight: 1.45 }}>
                          {s.desc}
                        </div>
                      </div>
                    </FadeUp>

                    {/* Connecting Line between steps */}
                    {idx < 3 && (
                      <div className="hidden lg:flex items-center justify-center pt-10 px-2 flex-1">
                        <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, #087A4B 0%, #86EFAC 50%, #087A4B 100%)', borderRadius: 2, position: 'relative' }}>
                          <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#087A4B', border: '2px solid white' }} />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ AI INTELLIGENCE SECTION ═══════════════════ */}
      <section id="ai-intelligence" style={{ padding: '100px 24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
        <BotanicalBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center', position: 'relative' }}>

          {/* Left: Crop Analysis Dashboard Card */}
          <FadeUp>
            <motion.div
              whileHover={{ y: -8 }}
              style={{
                background: 'white', borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 24px 70px rgba(11,79,58,0.16)', border: '1px solid #DCEFD9'
              }}>
              {/* Card header */}
              <div style={{ background: '#0B4F3A', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#86EFAC', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 2 }}>AI CROP ANALYSIS</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Manrope, sans-serif' }}>Tomato Leaf</div>
                </div>
                <div style={{ padding: '5px 12px', borderRadius: 100, background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700 }}>
                  High Risk
                </div>
              </div>

              {/* Leaf image */}
              <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <img src="/tomato_leaf.jpg" alt="Diseased tomato leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, padding: '5px 12px', borderRadius: 100, background: 'rgba(220,38,38,0.9)', color: 'white', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                  🦠 Disease Detected
                </div>
                <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '5px 12px', borderRadius: 100, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 12, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                  91% confidence
                </div>
              </div>

              {/* Analysis details */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#8BA99A', fontWeight: 600, marginBottom: 3 }}>DISEASE IDENTIFIED</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', fontFamily: 'Manrope, sans-serif' }}>Early Blight</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#8BA99A', fontWeight: 600, marginBottom: 3 }}>CONFIDENCE</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif' }}>91%</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #DCEFD9', paddingTop: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3D6152', marginBottom: 10, letterSpacing: '0.08em' }}>EVIDENCE & ANALYSIS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[["Leaf Pattern","Detected"],["Color Analysis","Abnormal"],["Shape Detection","Affected"],["Weather Context","High Risk"]].map(([l,v]) => (
                      <div key={l} style={{ background: '#F8FAF3', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #087A4B' }}>
                        <div style={{ fontSize: 10, color: '#8BA99A', marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0B4F3A' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#FFF7ED', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>RECOMMENDED ACTIONS</div>
                  <div style={{ fontSize: 12, color: '#78350F' }}>Apply copper-based fungicide immediately. Remove affected leaves. Ensure proper air circulation.</div>
                </div>
              </div>
            </motion.div>
          </FadeUp>

          {/* Right: Text content */}
          <FadeUp delay={0.15}>
            <div>
              <Eyebrow>AI Intelligence</Eyebrow>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', marginBottom: 20, lineHeight: 1.2 }}>
                Deep Analysis.<br />Trusted Recommendations.
              </h2>
              <p style={{ fontSize: 16, color: '#55665C', lineHeight: 1.75, marginBottom: 32 }}>
                AgriSmart AI combines computer vision, weather data and agricultural expertise to deliver accurate crop analysis and practical, actionable recommendations tailored to your specific farm conditions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {[
                  "Multi-layered disease detection with visual evidence",
                  "Explainable AI — understand exactly what was detected",
                  "Real-time weather + field context integration",
                  "Actionable, easy-to-follow treatment recommendations",
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#EEF7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <CheckCircle2 size={14} color="#087A4B" />
                    </div>
                    <span style={{ fontSize: 15, color: '#3D6152', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 100,
                background: '#0B4F3A', color: 'white',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(11,79,58,0.25)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0B4F3A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0B4F3A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Explore AI <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ IMPACT BANNER ═══════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 400 }}>
        {/* Background photo */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/our_impact.jpg" alt="Agricultural impact" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,79,58,0.85), rgba(8,122,75,0.65), rgba(11,79,58,0.80))' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <FadeUp>
            <div style={{ fontSize: 11, color: '#86EFAC', fontWeight: 700, letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}>OUR IMPACT</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'white', fontFamily: 'Manrope, sans-serif', marginBottom: 56, lineHeight: 1.2 }}>
              From Leaf to Life — Powered by AI
            </h2>
          </FadeUp>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[
              { icon: Sprout, title: "Healthier Crops", sub: "Stronger harvests, higher quality", stat: "30%" },
              { icon: Droplet, title: "Smarter Water Use", sub: "Every drop counts", stat: "40%" },
              { icon: Globe, title: "Sustainable Decisions", sub: "For a greener tomorrow", stat: "15+" },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div style={{ padding: '32px 24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <item.icon size={24} color="#86EFAC" />
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: 'white', fontFamily: 'Manrope, sans-serif', marginBottom: 6 }}>{item.stat}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#86EFAC', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>{item.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section id="about" style={{ padding: '100px 24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
        <BotanicalBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center', position: 'relative' }}>

          {/* Left: Organic image collage */}
          <FadeUp>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '100%', maxWidth: 480, borderRadius: 32, overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(11,79,58,0.18)', border: '4px solid white'
              }}>
                <img src="/about_farm.jpg" alt="Farming hands with seedlings" style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }} />
              </div>

              {/* Decorative floating card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: 'absolute', bottom: -20, right: -10,
                  background: '#0B4F3A', borderRadius: 18, padding: '16px 20px',
                  boxShadow: '0 16px 40px rgba(11,79,58,0.30)', color: 'white'
                }}>
                <div style={{ fontSize: 11, fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.7, color: '#86EFAC' }}>
                  "Empowering<br />Farmers<br />with AI"
                </div>
              </motion.div>

              {/* Leaf decoration */}
              <div style={{ position: 'absolute', top: -20, left: -20 }}>
                <LeafDecor size={100} opacity={0.15} />
              </div>
            </div>
          </FadeUp>

          {/* Right: Text */}
          <FadeUp delay={0.15}>
            <div>
              <Eyebrow>About</Eyebrow>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', marginBottom: 20, lineHeight: 1.2 }}>
                Our Mission
              </h2>
              <p style={{ fontSize: 16, color: '#55665C', lineHeight: 1.8, marginBottom: 24 }}>
                At AgriSmart AI, we believe technology should empower farmers, not complicate their work. Our mission is to help farmers make faster, evidence-based decisions using AI — so they can grow healthier crops, increase productivity and build a more sustainable future.
              </p>
              <p style={{ fontSize: 16, color: '#55665C', lineHeight: 1.8, marginBottom: 36 }}>
                Built with real agricultural data from diverse farming regions, AgriSmart AI is designed to be accessible, inclusive and offline-capable — because every farmer deserves intelligent support.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
                {[
                  { value: "15+", label: "Countries Served" },
                  { value: "50K+", label: "Crops Analyzed" },
                  { value: "12", label: "Languages" },
                  { value: "96%", label: "Accuracy" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ background: '#F8FAF3', borderRadius: 16, padding: '20px', border: '1px solid #DCEFD9', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#087A4B', fontFamily: 'Manrope, sans-serif', marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 12, color: '#55665C' }}>{label}</div>
                  </div>
                ))}
              </div>

              <Link to="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: '#087A4B', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                transition: 'gap 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.gap = '12px'}
                onMouseLeave={e => e.currentTarget.style.gap = '8px'}>
                Learn more about our technology <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ BRAND TRUST MARQUEE ═══════════════════ */}
      <section style={{ background: '#F8FAF3', borderTop: '1px solid #DCEFD9', borderBottom: '1px solid #DCEFD9', padding: '44px 0', overflow: 'hidden' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8BA99A', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Trusted & Recognized By</div>
          </div>
        </FadeUp>
        <div className="marquee-wrap">
          <div className="marquee-brand">
            {brandsDouble.map((brand, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                margin: '0 16px', padding: '14px 26px', borderRadius: 16,
                background: 'white', border: '1px solid #DCEFD9',
                boxShadow: '0 2px 8px rgba(11,79,58,0.06)',
                flexShrink: 0, minWidth: 195
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F4FAEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <brand.Logo />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif' }}>{brand.name}</div>
                  <div style={{ fontSize: 11, color: '#8BA99A' }}>{brand.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ REVIEWS MARQUEE ═══════════════════ */}
      <section id="reviews" style={{ padding: '100px 0 80px', background: '#EEF7EA', overflow: 'hidden', position: 'relative' }}>
        <BotanicalBg />
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 52, padding: '0 24px', position: 'relative', zIndex: 10 }}>
            <Eyebrow>Farmer Stories</Eyebrow>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0B4F3A', fontFamily: 'Manrope, sans-serif', marginBottom: 12, lineHeight: 1.15 }}>
              Trusted by Thousands<br />of Farmers
            </h2>
            <p style={{ fontSize: 17, color: '#3D6152', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              Hear from farmers who transformed their fields with AgriSmart AI.
            </p>
          </div>
        </FadeUp>

        <div className="marquee-wrap" style={{ marginBottom: 20 }}>
          <div className="marquee-left">
            {reviewsDouble.map((rev, i) => <ReviewCard key={i} review={rev} />)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 52, position: 'relative', zIndex: 10 }}>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 100,
            background: '#0B4F3A', color: 'white',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(11,79,58,0.28)'
          }}>
            Join Thousands of Farmers <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{ background: '#0B2A16', color: 'white', padding: '60px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <Logo light />
              <p style={{ fontSize: 13, color: 'rgba(166,220,179,0.65)', marginTop: 14, lineHeight: 1.7, maxWidth: 220 }}>
                AI-powered agricultural intelligence for modern, sustainable farming.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {[
                  { href: "#", label: "GitHub", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
                  { href: "#", label: "Twitter", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { href: "#", label: "LinkedIn", svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map(({ href, label, svg }) => (
                  <a key={label} href={href} aria-label={label} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(166,220,179,0.7)', textDecoration: 'none', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(166,220,179,0.7)'; }}>
                    {svg}
                  </a>
                ))}
              </div>

            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#86EFAC', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>Navigation</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {NAV_LINKS.map(link => (
                  <li key={link.name}>
                    <a href={link.href} style={{ fontSize: 13, color: 'rgba(166,220,179,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'white'}
                      onMouseLeave={e => e.target.style.color = 'rgba(166,220,179,0.65)'}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#86EFAC', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>Features</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {["Crop Disease Detection", "Weather Intelligence", "Smart Irrigation", "AI Assistant", "Farm Analytics", "Sustainability Score"].map(f => (
                  <li key={f}>
                    <a href="#features" style={{ fontSize: 13, color: 'rgba(166,220,179,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'white'}
                      onMouseLeave={e => e.target.style.color = 'rgba(166,220,179,0.65)'}>
                      {f}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#86EFAC', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ name: "About Us", href: "/about" }, { name: "Our Mission", href: "#about" }, { name: "Privacy Policy", href: "#" }, { name: "Terms of Service", href: "#" }].map(({ name, href }) => (
                  <li key={name}>
                    <a href={href} style={{ fontSize: 13, color: 'rgba(166,220,179,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'white'}
                      onMouseLeave={e => e.target.style.color = 'rgba(166,220,179,0.65)'}>
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(134,239,172,0.12)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(166,220,179,0.4)' }}>
              © {new Date().getFullYear()} AgriSmart AI. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Leaf size={14} color="rgba(134,239,172,0.4)" />
              <span style={{ fontSize: 12, color: 'rgba(134,239,172,0.4)' }}>Building a greener tomorrow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
