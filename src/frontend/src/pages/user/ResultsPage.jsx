import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { scanService } from '../../services/scanService';
import { weatherService } from '../../services/weatherService';
import { irrigationService } from '../../services/irrigationService';
import { 
  AlertTriangle, Wind, Droplet, Sun, CheckCircle2, 
  MessageSquare, Save, Download, Share2, FileText, Loader2,
  Sparkles, Cpu, AlertOctagon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ResultsPage = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ scan: null, weather: null, irrigation: null });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scan = await scanService.getScanResult(scanId || 'AG-SCAN-001');
        let weather = null;
        try {
          weather = await weatherService.getCurrentWeather(scan.farmContext?.location);
        } catch (weatherError) {
          console.error('Unable to load live weather for this scan.', weatherError);
        }
        const irrigation = await irrigationService.getRecommendation(
          weather,
          scan.farmContext?.soilMoisture,
          scan.crop
        );
        setData({ scan, weather, irrigation });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scanId]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Scan_Result_${data.scan.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("There was an issue generating the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgriSmart AI Scan Result',
          text: `Check out the crop analysis for my ${data.scan.crop}. Disease: ${data.scan.disease}.`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link.'));
    }
  };

  if (loading || !data.scan) {
    return (
      <div className="flex h-screen bg-[#FAFCF7]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center text-[#087A4B] font-medium animate-pulse">
            Loading Scan Results...
          </div>
        </div>
      </div>
    );
  }

  const { scan, weather, irrigation } = data;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto w-full">
          
          <div ref={reportRef} className="bg-[#FAFCF7] rounded-3xl p-4">
            {/* Header Info */}
            <div className="flex justify-between items-center mb-6 text-sm text-[#789187] font-medium gap-6">
              <h1 className="text-2xl font-bold text-[#063F2F] font-sora">Diagnostic Report</h1>
              <div className="flex gap-4">
                <div>Scan ID: <span className="text-[#123D31]">{scan.id}</span></div>
                <div>{scan.date}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ── Column 1 ── */}
              <div className="space-y-6">
                
                {/* Original Image */}
                <div className="bg-white rounded-3xl p-3 shadow-sm border border-[#D5E8D5] relative overflow-hidden h-[240px]">
                  {scan.imageUrl ? (
                    <img
                      src={scan.imageUrl}
                      alt="Uploaded crop leaf"
                      className="w-full h-full object-cover rounded-2xl"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-[#FAFCF7] flex items-center justify-center p-6 text-center text-sm text-[#789187]">
                      The original upload is only available in this browser session. Run a new scan to view the image again.
                    </div>
                  )}
                </div>

                {/* Disease Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                  {/* Diagnostic Source Badge & Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {scan.diagnosisSource === 'ai_vision' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Vision Fallback (Gemini Multimodal)
                      </div>
                    ) : scan.diagnosisSource === 'invalid_image' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                        <AlertOctagon className="w-3.5 h-3.5 text-amber-600" /> Not a Plant Leaf Image
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Trained Neural Net (PyTorch EfficientNet-B0)
                      </div>
                    )}

                    {scan.status !== 'Healthy' && scan.diagnosisSource !== 'invalid_image' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wide">
                        <AlertTriangle className="w-3.5 h-3.5" /> Disease Detected
                      </div>
                    )}
                  </div>

                  {/* Context Notice Banner */}
                  {scan.diagnosisSource === 'invalid_image' && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                      <strong className="font-semibold">Image Quality Notice:</strong> The uploaded image does not appear to be a crop or plant leaf. Please retake the photo closely framing an actual leaf in natural daylight.
                    </div>
                  )}

                  {scan.diagnosisSource === 'ai_vision' && (
                    <div className="mb-5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-purple-900 text-xs leading-relaxed">
                      <strong className="font-semibold">AI Multimodal Vision:</strong> The local model was uncertain on this leaf image, so Gemini Multimodal Vision performed a direct visual assessment of observed symptoms.
                    </div>
                  )}

                  <h2 className="text-3xl font-bold text-[#063F2F] font-sora mb-1">{scan.disease}</h2>
                  <p className="text-[#789187] italic mb-6">({scan.crop})</p>

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#F3FAEF]">
                    <div className="text-center relative">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke={scan.status === 'Healthy' ? "#dcfce7" : "#fee2e2"} strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={scan.status === 'Healthy' ? "#22c55e" : "#ef4444"} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * scan.confidence) / 100} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold font-sora ${scan.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>{scan.confidence}%</span>
                      </div>
                    </div>
                    <div className={`${scan.status === 'Healthy' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'} font-bold px-4 py-2 rounded-xl text-sm border`}>
                      {scan.severity}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#183F34] mb-3">Symptoms / Indicators:</h4>
                    <ul className="space-y-2">
                      {scan.symptoms.length > 0 ? scan.symptoms.map((sym, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#45665A]">
                          <div className={`w-1.5 h-1.5 rounded-full ${scan.status === 'Healthy' ? 'bg-green-400' : 'bg-red-400'} mt-1.5 shrink-0`} />
                          <span>{sym}</span>
                        </li>
                      )) : (
                        <li className="text-sm text-[#789187]">No specific symptoms listed.</li>
                      )}
                    </ul>
                  </div>
                </div>

              </div>

              {/* ── Column 2 ── */}
              <div className="space-y-6">
                
                {/* Sustainability Score */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5] flex flex-col items-center text-center">
                  <h3 className="font-semibold text-[#183F34] self-start w-full text-left mb-6">Sustainability Impact</h3>
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F3FAEF" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#35A866" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * (scan.sustainabilityScore || 50)) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-[#063F2F] font-sora">{scan.sustainabilityScore || 'N/A'}</span>
                      <span className="text-xs text-[#789187]">/ 100</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#087A4B] mb-6">Calculated <span className="text-xl">↗</span></p>
                  
                  {/* Hide this interactive button from PDF export context by removing it from the ref, but since it's inside we just leave it for now or conditionally hide it if we want. It's fine to print it. */}
                  <button 
                    onClick={() => navigate(`/assistant?scanId=${scan.id}`)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#087A4B] bg-[#E8F6E6] hover:bg-[#DDF1DD] w-full justify-center py-3 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Ask Assistant about this scan
                  </button>
                </div>

              </div>

              {/* ── Column 3 ── */}
              <div className="space-y-6">
                
                {/* Weather Forecast */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                  <div className="flex items-center gap-2 mb-4 text-[#063F2F] font-semibold">
                    <Sun className="w-5 h-5 text-yellow-500" /> Weather Context
                  </div>
                  {weather ? (
                    <>
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F3FAEF]">
                        <Sun className="w-12 h-12 text-yellow-500" />
                        <div>
                          <div className="text-3xl font-bold text-[#063F2F] font-sora">{weather.temperature}°C</div>
                          <div className="text-sm text-[#789187]">{weather.condition} · {weather.location}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <Droplet className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                          <div className="text-[#183F34] font-semibold">{weather.humidity}%</div>
                        </div>
                        <div>
                          <Wind className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                          <div className="text-[#183F34] font-semibold">{weather.windSpeed} km/h</div>
                        </div>
                        <div>
                          <Droplet className="w-4 h-4 mx-auto text-blue-500 mb-1 fill-blue-500" />
                          <div className="text-[#183F34] font-semibold">{weather.rainProbability}%</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#789187]">Live weather is unavailable.</p>
                  )}
                </div>

                {/* Irrigation Recommendation */}
                <div className="bg-[#FAFCF7] rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                  <div className="flex items-center gap-2 mb-4 text-[#063F2F] font-semibold">
                    <Droplet className="w-5 h-5 text-blue-500" /> Irrigation Recommendation
                  </div>
                  <h3 className="text-xl font-bold text-[#063F2F] font-sora mb-2">{irrigation?.title || 'Unknown'}</h3>
                  {irrigation?.waterAmountLiters !== null && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium border border-blue-100 mb-4">
                      Recommended: {irrigation?.waterAmountLiters?.toLocaleString()}L • {irrigation?.durationHours} hrs
                    </div>
                  )}
                  <p className="text-sm text-[#789187]">{irrigation?.reason || 'No recommendation could be generated.'}</p>
                </div>

                {/* AI Recommendations */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                  <div className="flex items-center gap-2 mb-4 text-[#063F2F] font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-[#35A866]" /> Agronomy Recommendations
                  </div>
                  <ul className="space-y-3 mb-6">
                    {scan.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#45665A]">
                        <CheckCircle2 className="w-4 h-4 text-[#35A866] mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-4 pb-8">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#063F2F] bg-white border border-[#D5E8D5] hover:bg-[#FAFCF7] font-semibold transition-colors">
              <Save className="w-4 h-4" /> Save
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#063F2F] bg-white border border-[#D5E8D5] hover:bg-[#FAFCF7] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-[#087A4B] hover:bg-[#064D38] font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

