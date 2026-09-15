import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { 
  UploadCloud, X, ArrowRight, Zap, Shield, Leaf, 
  Image as ImageIcon, CheckCircle2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { scanService } from '../../services/scanService';

// Reusable decorative bottom leaves
const BotanicalDecorations = () => (
  <div className="fixed bottom-0 left-0 right-0 h-80 pointer-events-none z-0 overflow-hidden">
    {/* Elegant SVG Leaves - Right Side Only */}
    <svg className="absolute -bottom-10 -right-10 w-[400px] h-[400px] opacity-90 text-[#35A866] drop-shadow-2xl transform rotate-12" viewBox="0 0 200 200" fill="none">
      <path d="M20,180 C20,90 80,30 140,10 C160,40 170,100 130,160 C70,180 20,180 20,180 Z" fill="#087A4B" opacity="0.8" />
      <path d="M10,200 C10,110 60,50 120,30 C140,60 150,120 110,180 C50,200 10,200 10,200 Z" fill="currentColor" opacity="0.65" />
      <path d="M20,180 C60,130 100,50 140,10" stroke="#FAFCF7" strokeWidth="2" opacity="0.4" />
      <path d="M10,200 C50,150 90,70 120,30" stroke="#FAFCF7" strokeWidth="2" opacity="0.3" />
    </svg>
  </div>
);

export const ScanPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | error | processing
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([
    { id: 1, label: 'Image uploaded & checked', done: false },
    { id: 2, label: 'Detecting disease pattern', done: false },
    { id: 3, label: 'Preparing recommendation', done: false }
  ]);

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('processing');
    
    // Simulate premium processing animation
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.5, 95));
    }, 40);

    setTimeout(() => setSteps(s => [ { ...s[0], done: true }, s[1], s[2] ]), 500);
    setTimeout(() => setSteps(s => [ s[0], { ...s[1], done: true }, s[2] ]), 1500);

    try {
      const uploadRes = await scanService.uploadScan(file);
      // We pass empty/standard details so the backend uses the ML model's detected crop
      const defaultDetails = {
        crop: '', stage: '', soilType: '',
        soilPh: '0', soilMoisture: 'Medium', location: ''
      };
      const result = await scanService.analyzeCrop(uploadRes.id, defaultDetails);
      
      clearInterval(progressInterval);
      setProgress(100);
      setSteps(s => [ s[0], s[1], { ...s[2], done: true } ]);
      
      setTimeout(() => {
        navigate(`/results/${result.id}`);
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      setStatus('error');
    }
  };

  // Example placeholder images using local assets
  const exampleImages = [
    '/diseased_leaf.jpg', 
    '/tomato_leaf.jpg', 
    '/leaf_bg.jpg', 
    '/hero_farmer.jpg'  
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <Sidebar />
      <BotanicalDecorations />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="px-8 py-10 max-w-[1500px] mx-auto w-full flex-1 flex flex-col justify-center pb-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-12 items-center">
            
            {/* ── Left Column: Introduction ── */}
            <div className="space-y-12 pr-4 lg:pr-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-[#063F2F] font-sora tracking-tight leading-tight mb-4">
                  Scan Your Crop
                </h1>
                <p className="text-2xl lg:text-3xl text-[#183F34] font-medium leading-snug">
                  A <span className="text-[#087A4B]">healthier</span> tomorrow<br/>starts with a simple scan.
                </p>
                <p className="text-[#45665A] text-lg mt-6 leading-relaxed max-w-md">
                  Upload an image of a plant leaf or crop and let AgriSmart AI detect possible diseases in seconds.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Fast & Accurate", desc: "Get instant AI-powered results" },
                  { icon: Shield, title: "Actionable Guidance", desc: "Receive simple, practical advice" },
                  { icon: Leaf, title: "Healthier Crops", desc: "Make better decisions for higher yields" }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#E8F6E6] flex items-center justify-center shrink-0">
                      <benefit.icon className="w-6 h-6 text-[#087A4B]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#063F2F]">{benefit.title}</h4>
                      <p className="text-[#789187] text-sm mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: Upload Card ── */}
            <div className="flex flex-col items-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-[30px] p-8 lg:p-10 shadow-xl shadow-[#087A4B]/5 border border-[#D5E8D5] w-full max-w-[700px] min-h-[620px] flex flex-col relative z-20">
                
                {status === 'processing' ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 transition-all">
                    <div className="relative w-40 h-40 mb-10">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#F3FAEF" strokeWidth="4" />
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#087A4B" strokeWidth="4" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} strokeLinecap="round" className="transition-all duration-300 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-[#063F2F] font-sora">{Math.round(progress)}%</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#063F2F] font-sora mb-2">Analyzing your crop...</h3>
                    <p className="text-[#789187] text-sm mb-10">AI is examining the image for disease patterns.</p>
                    
                    <div className="w-full max-w-sm space-y-5">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-center gap-4">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            {step.done ? (
                              <CheckCircle2 className="w-6 h-6 text-[#35A866]" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#D5E8D5]" />
                            )}
                          </div>
                          <span className={`font-medium ${step.done ? 'text-[#063F2F]' : 'text-[#A0B8AD]'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : status === 'error' ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center transition-all">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 text-red-500">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#063F2F] font-sora mb-2">Unable to analyze this image.</h3>
                    <p className="text-[#789187] mb-8">Try uploading a clearer photo of the leaf.</p>
                    <div className="flex gap-4">
                      <button onClick={handleAnalyze} className="px-6 py-3 rounded-xl font-bold text-white bg-[#087A4B] hover:bg-[#064D38] transition-colors">Try Again</button>
                      <button onClick={() => setStatus('idle')} className="px-6 py-3 rounded-xl font-bold text-[#087A4B] bg-[#E8F6E6] hover:bg-[#DDF1DD] transition-colors">Choose Another</button>
                    </div>
                  </div>
                ) : preview ? (
                  <div className="flex-1 flex flex-col transition-all">
                    <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#D5E8D5] bg-[#FAFCF7]">
                      <img src={preview} alt="Crop Preview" className="w-full h-full object-contain absolute inset-0" />
                      <button 
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#123D31] px-4 py-2 rounded-full shadow-sm backdrop-blur-sm text-sm font-bold transition-transform hover:scale-105"
                      >
                        Change Image
                      </button>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#063F2F] truncate max-w-[200px] lg:max-w-[300px]">{file.name}</p>
                        <p className="text-xs text-[#789187] mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={handleAnalyze}
                        className="bg-[#087A4B] hover:bg-[#064D38] text-white px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-[#087A4B]/20 hover:-translate-y-0.5"
                      >
                        Scan Image <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full transition-all">
                    
                    {errorMsg && (
                      <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                      </div>
                    )}

                    <div 
                      className={`flex-1 min-h-[360px] border-[1.5px] border-dashed rounded-[22px] flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer group ${
                        isDragging ? 'border-[#087A4B] bg-[#F3FAEF]' : 'border-[#B7E6C4] bg-[#FAFCF7] hover:bg-[#F8FDF6] hover:border-[#35A866]'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png" />
                      
                      <div className="w-24 h-24 rounded-full bg-[#E8F6E6] flex items-center justify-center mb-6 text-[#087A4B] group-hover:-translate-y-2 transition-transform duration-300">
                        <UploadCloud className="w-12 h-12" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#063F2F] font-sora mb-3">Drag & drop an image here</h3>
                      <p className="text-[#789187] font-medium mb-6">or</p>
                      <button className="bg-[#087A4B] group-hover:bg-[#064D38] text-white px-10 py-3.5 rounded-xl font-bold text-base transition-all group-hover:shadow-md pointer-events-none">
                        Browse Files
                      </button>
                      <p className="text-[#A0B8AD] text-sm mt-6 font-medium">Supports: JPG, PNG, JPEG (Max 10MB)</p>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1 h-px bg-[#EAF5EC]" />
                        <span className="text-[#789187] text-xs font-bold uppercase tracking-wider">Try these example images</span>
                        <div className="flex-1 h-px bg-[#EAF5EC]" />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 lg:gap-4">
                        {exampleImages.map((src, i) => (
                          <div key={i} className="aspect-square rounded-[14px] overflow-hidden border border-[#D5E8D5] cursor-pointer group hover:border-[#087A4B] hover:shadow-md transition-all">
                            <img src={src} alt="Example leaf" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
              </div>

              {/* Security Message */}
              <div className="mt-6 bg-[#E8F6E6] border border-[#D5E8D5] text-[#087A4B] px-6 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-semibold shadow-sm z-20">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                Your images are secure and used only for disease detection.
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
