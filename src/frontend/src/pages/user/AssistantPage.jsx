import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { assistantService } from '../../services/assistantService';
import { scanService } from '../../services/scanService';
import { weatherService } from '../../services/weatherService';
import { irrigationService } from '../../services/irrigationService';
import { Send, CheckCircle2, Cloud, Droplet, Bot, User, Check, PlusCircle, FileText } from 'lucide-react';

// ─── Session storage key ────────────────────────────────────────
const SESSION_KEY = 'agrismart_chat_messages';
const CONTEXT_KEY = 'agrismart_chat_context_id'; // track which scan the session belongs to

// ─── Greeting message ───────────────────────────────────────────
const GREETING = "Hey! I'm AgriSmart AI, your farming assistant. Ask me anything about your crops, soil, irrigation, diseases, or general farming — I'm here to help. What's on your mind?";

// ─── Report-mode keyword detector ──────────────────────────────
const REPORT_KEYWORDS = [
  'report', 'generate report', 'show report', 'scan report', 'diagnostic report',
  'give me a report', 'create report', 'make a report', 'full report', 'summarize scan',
  'scan summary', 'summary of scan', 'what does the scan say', 'diagnosis report',
];

function isReportRequest(text) {
  const t = text.toLowerCase().trim();
  return REPORT_KEYWORDS.some(kw => t.includes(kw));
}

// ─── Inline Markdown Renderer ───────────────────────────────────
// Renders **bold**, ## headers, - bullet lists, and line breaks.
// No external dependency needed.
function MarkdownText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="my-2 space-y-1 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (str) => {
    // Bold: **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#063F2F]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Empty line → flush list, add spacing
    if (trimmed === '') {
      flushList();
      elements.push(<div key={key++} className="h-1" />);
      return;
    }

    // Header: ## or ###
    if (/^#{1,3}\s/.test(trimmed)) {
      flushList();
      const headerText = trimmed.replace(/^#{1,3}\s/, '');
      elements.push(
        <p key={key++} className="font-bold text-[#063F2F] mt-3 mb-1 text-[13px] uppercase tracking-wide">
          {renderInline(headerText)}
        </p>
      );
      return;
    }

    // Bullet: - or * or numbered list (1. 2.)
    if (/^[-*•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
      listItems.push(
        <li key={key++} className="flex items-start gap-2 text-sm text-[#45665A] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087A4B] mt-2 shrink-0" />
          <span>{renderInline(bulletText)}</span>
        </li>
      );
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="text-sm text-[#183F34] leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Suggested questions ────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'How do I prevent early blight on tomatoes?',
  'What fertilizer is best for wheat at the flowering stage?',
  'When should I irrigate next?',
  'How do I improve sandy soil quality?',
  'What are signs of nitrogen deficiency?',
  'Best organic pest control for vegetables?',
];

// ─── Main Component ─────────────────────────────────────────────
export const AssistantPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');
  const urlScanId = searchParams.get('scanId');
  const scanId = urlScanId || sessionStorage.getItem('ag_last_scan_id') || null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('English');
  const [activeContext, setActiveContext] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [irrigation, setIrrigation] = useState(null);
  const hasSentInitialQuery = useRef(false);
  const chatEndRef = useRef(null);

  // ── Session-persistent messages ──
  // Load from sessionStorage on first mount. Key includes scanId so switching
  // scans doesn't mix up history. Only "New Chat" clears the history.
  const storageKey = `${SESSION_KEY}_${scanId || 'general'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [{ role: 'assistant', text: GREETING }];
  });

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (_) {}
  }, [messages, storageKey]);

  // ── Load weather & irrigation ──
  useEffect(() => {
    const loadWeather = async () => {
      try {
        const scan = scanId ? await scanService.getScanResult(scanId) : null;
        const farmContext = scan?.farmContext;
        const w = await weatherService.getCurrentWeather(farmContext?.location);
        setLiveWeather(w);
        setIrrigation(await irrigationService.getRecommendation(w, farmContext?.soilMoisture));
      } catch (e) {
        console.error('Failed to load weather', e);
        setLiveWeather(null);
        setIrrigation(null);
      }
    };
    loadWeather();
  }, [scanId]);

  // ── Load scan context ──
  useEffect(() => {
    const fetchContext = async () => {
      const defaultContext = { crop: 'General', disease: 'None', weather: liveWeather, irrigation: null };
      if (scanId) {
        try {
          const scan = await scanService.getScanResult(scanId);
          setActiveContext({
            crop: scan.crop,
            disease: scan.disease,
            confidence: scan.confidence,
            severity: scan.severity,
            symptoms: scan.symptoms,
            recommendations: scan.recommendations,
            weather: liveWeather,
            irrigation,
            imageShared: Boolean(scan.imageUrl),
            diagnosisSource: scan.diagnosisSource || 'ml_model',
          });
        } catch (err) {
          console.error('Failed to load scan context', err);
          setActiveContext(defaultContext);
        }
      } else {
        setActiveContext(defaultContext);
      }
    };
    fetchContext();
  }, [scanId, liveWeather, irrigation]);

  // ── Auto-send initial query from URL params ──
  useEffect(() => {
    if (initialQuery && activeContext && !hasSentInitialQuery.current) {
      hasSentInitialQuery.current = true;
      handleSend(null, initialQuery);
    }
  }, [initialQuery, activeContext]);

  // ── Auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── New Chat: clears session ──
  const handleNewChat = useCallback(() => {
    const fresh = [{ role: 'assistant', text: GREETING }];
    setMessages(fresh);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(fresh));
    } catch (_) {}
    hasSentInitialQuery.current = false;
  }, [storageKey]);

  // ── Send message ──
  const handleSend = useCallback(async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history for backend: exclude the greeting and the message we just added
    // Send all previous messages (up to last 20 turns to keep context manageable)
    const currentMessages = [...messages, userMsg];
    const historyForBackend = currentMessages
      .slice(Math.max(0, currentMessages.length - 21), currentMessages.length - 1)
      .map(m => ({ role: m.role, text: m.text }));

    const reportMode = isReportRequest(text);

    try {
      const res = await assistantService.sendMessage(
        text,
        { ...activeContext, weather: liveWeather, irrigation },
        historyForBackend,
        reportMode
      );
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting right now. Please check your network and try again."
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activeContext, liveWeather, irrigation]);

  const hasScanContext = activeContext?.crop && activeContext.crop !== 'General';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col h-full pb-8">

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 overflow-hidden min-h-[600px]">

            {/* ── Left Column: Chat Window ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D5E8D5] flex flex-col overflow-hidden">

              {/* Chat header with New Chat button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3FAEF]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-semibold text-[#063F2F] text-sm font-sora">
                    AgriSmart AI
                    {hasScanContext && (
                      <span className="ml-2 text-xs font-normal text-[#087A4B] bg-[#E8F6E6] px-2 py-0.5 rounded-full">
                        {activeContext.crop} context active
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#087A4B] hover:text-[#064D38] bg-[#E8F6E6] hover:bg-[#DDF1DD] px-3 py-1.5 rounded-xl transition-colors"
                  title="Start a new conversation"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      msg.role === 'user'
                        ? 'bg-[#087A4B] text-white border-[#D5E8D5]'
                        : 'bg-[#E8F6E6] text-[#087A4B] border-[#DDF1DD]'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-[#087A4B] text-white rounded-tr-sm text-sm leading-relaxed'
                        : 'bg-[#FAFCF7] text-[#183F34] border border-[#D5E8D5] rounded-tl-sm'
                    }`}>
                      {msg.role === 'user'
                        ? <span className="whitespace-pre-wrap">{msg.text}</span>
                        : <MarkdownText text={msg.text} />
                      }
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8F6E6] text-[#087A4B] flex items-center justify-center shrink-0 border-2 border-[#DDF1DD]">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-[#FAFCF7] border border-[#D5E8D5] rounded-tl-sm flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-[#087A4B] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#087A4B] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[#087A4B] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-[#F3FAEF]">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={hasScanContext
                      ? `Ask about your ${activeContext.crop} scan...`
                      : 'Ask anything about farming...'
                    }
                    className="flex-1 bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl px-5 py-3.5 text-[#123D31] focus:outline-none focus:border-[#087A4B] text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-[#087A4B] hover:bg-[#064D38] disabled:bg-[#A0B8AD] text-white px-5 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* ── Right Column: Context Panel ── */}
            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar">

              {/* Context Block */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                <h3 className="font-bold text-[#063F2F] font-sora mb-4 flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Context
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-[#FAFCF7] rounded-xl border border-[#D5E8D5]">
                    <div className="text-xs text-[#789187] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {scanId ? 'Active Scan' : 'General Chat'}
                    </div>
                    <p className="text-[13px] text-[#183F34] font-medium leading-relaxed">
                      Crop: {activeContext?.crop || '—'}<br />
                      {activeContext?.disease && activeContext.disease !== 'None' && (
                        <>Disease: {activeContext.disease}<br /></>
                      )}
                      {activeContext?.confidence !== undefined && (
                        <>Confidence: {activeContext.confidence}%<br /></>
                      )}
                      {activeContext?.diagnosisSource && (
                        <span className="text-[11px] inline-flex items-center gap-1 mt-1 font-semibold text-[#087A4B] bg-[#E8F6E6] px-2 py-0.5 rounded-md">
                          {activeContext.diagnosisSource === 'ai_vision' ? '✨ Gemini AI Vision' : activeContext.diagnosisSource === 'invalid_image' ? '⚠️ Non-Leaf Upload' : '🔬 PyTorch Neural Net'}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAFCF7] rounded-xl border border-[#D5E8D5]">
                    <div className="text-xs text-[#789187] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5" /> Weather ({liveWeather?.location || 'Local'})
                    </div>
                    <p className="text-[13px] text-[#183F34] font-medium">
                      {liveWeather
                        ? `${liveWeather.temperature}°C, ${liveWeather.condition}, Rain ${liveWeather.rainProbability}%`
                        : 'Loading weather...'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAFCF7] rounded-xl border border-[#D5E8D5]">
                    <div className="text-xs text-[#789187] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5" /> Irrigation
                    </div>
                    <p className="text-[13px] text-[#183F34] font-medium">
                      {irrigation
                        ? irrigation.waterAmountLiters === null
                          ? irrigation.reason
                          : `${irrigation.title}: ${irrigation.waterAmountLiters?.toLocaleString()} L over ${irrigation.durationHours} hrs`
                        : 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                <h3 className="font-bold text-[#063F2F] font-sora mb-4 text-sm">Language</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['English', 'ગુજરાતી', 'हिंदी'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        lang === l
                          ? 'bg-[#087A4B] text-white border-[#087A4B]'
                          : 'bg-[#FAFCF7] text-[#45665A] border-[#D5E8D5] hover:border-[#087A4B]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D5E8D5]">
                <h3 className="font-bold text-[#063F2F] font-sora mb-4 text-sm">Ask About</h3>
                <ul className="space-y-1.5">
                  {/* Show report option only when scan context exists */}
                  {hasScanContext && (
                    <li>
                      <button
                        onClick={() => handleSend(null, 'Generate a full diagnostic report for my scan')}
                        disabled={loading}
                        className="w-full text-left flex items-start gap-2 text-[13px] text-[#087A4B] font-semibold hover:text-[#064D38] py-1.5 transition-colors group bg-[#E8F6E6] hover:bg-[#DDF1DD] px-3 rounded-xl"
                      >
                        <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                        Generate scan report
                      </button>
                    </li>
                  )}
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleSend(null, q)}
                        disabled={loading}
                        className="w-full text-left flex items-start gap-2 text-[13px] text-[#45665A] hover:text-[#087A4B] py-1.5 transition-colors group"
                      >
                        <Check className="w-4 h-4 text-[#35A866] mt-0.5 shrink-0 opacity-50 group-hover:opacity-100" />
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
