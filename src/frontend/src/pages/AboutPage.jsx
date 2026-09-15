import React from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { BotanicalBg } from '../components/shared/BotanicalBg';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { Info, Activity, Database, Leaf } from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();

  const content = (
    <div className="space-y-8">
      
      <div className="bg-[#087A4B] rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
        <h1 className="text-4xl font-bold font-sora relative z-10 mb-4">Transparent AI. Reliable Results.</h1>
        <p className="text-[#DDF1DD] max-w-2xl mx-auto relative z-10">
          We believe in open models and reproducible research. Discover how AgriSmart AI connects satellite data, computer vision, and expert agronomy.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5]">
        <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-6 text-center">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 bg-[#FAFCF7] p-6 rounded-2xl border border-[#D5E8D5] text-center w-full">
            <Leaf className="w-8 h-8 text-[#35A866] mx-auto mb-3" />
            <div className="font-bold text-[#063F2F] mb-1">Image</div>
            <div className="text-sm text-[#789187]">Input crop/leaf image</div>
          </div>
          <div className="text-[#A0B8AD] font-bold text-2xl hidden md:block">→</div>
          <div className="flex-1 bg-[#E8F6E6] p-6 rounded-2xl border border-[#087A4B] text-center w-full">
            <Database className="w-8 h-8 text-[#087A4B] mx-auto mb-3" />
            <div className="font-bold text-[#063F2F] mb-1">AI Model</div>
            <div className="text-sm text-[#087A4B]">Deep Learning + CV</div>
          </div>
          <div className="text-[#A0B8AD] font-bold text-2xl hidden md:block">→</div>
          <div className="flex-1 bg-[#FAFCF7] p-6 rounded-2xl border border-[#D5E8D5] text-center w-full">
            <Activity className="w-8 h-8 text-[#35A866] mx-auto mb-3" />
            <div className="font-bold text-[#063F2F] mb-1">Advisory</div>
            <div className="text-sm text-[#789187]">Diseases, weather, irrigation</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5]">
          <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-6">Model Performance</h2>
          <div className="flex justify-between items-center bg-[#FAFCF7] p-6 rounded-2xl border border-[#D5E8D5]">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#087A4B] font-sora mb-1">96%</div>
              <div className="text-sm font-semibold text-[#183F34]">Lab Accuracy</div>
            </div>
            <div className="w-px h-16 bg-[#D5E8D5]" />
            <div className="text-center">
              <div className="text-4xl font-bold text-[#35A866] font-sora mb-1">91%</div>
              <div className="text-sm font-semibold text-[#183F34]">Field Accuracy</div>
            </div>
          </div>
          <p className="text-xs text-[#789187] mt-4 text-center">* Trained and validated on real farm data.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5E8D5]">
          <h2 className="text-xl font-bold text-[#063F2F] font-sora mb-6">Confusion Matrix</h2>
          <div className="w-full h-48 bg-[#FAFCF7] rounded-2xl border border-[#D5E8D5] flex items-center justify-center text-[#789187] font-medium">
            Interactive matrix visualization goes here
          </div>
        </div>
      </div>

    </div>
  );

  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
        <BotanicalBg />
        <Sidebar />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
          <Topbar />
          <main className="p-8 max-w-5xl mx-auto w-full flex-1">
            {content}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {content}
      </main>
      <Footer />
    </div>
  );
}
