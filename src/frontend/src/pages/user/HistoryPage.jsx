import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { BotanicalBg } from '../../components/shared/BotanicalBg';
import { scanService } from '../../services/scanService';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sort, setSort] = useState('Latest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await scanService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history
    .filter(item => (search === '' || item.crop.toLowerCase().includes(search.toLowerCase()) || item.disease.toLowerCase().includes(search.toLowerCase())))
    .filter(item => (cropFilter === 'All Crops' || item.crop === cropFilter))
    .filter(item => (statusFilter === 'All Status' || item.status === statusFilter))
    .sort((a, b) => {
      if (sort === 'Latest') return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const currentData = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderBadge = (status) => {
    if (status === 'Detected') {
      return <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold">Detected</span>;
    }
    return <span className="bg-[#E8F6E6] text-[#087A4B] border border-[#DDF1DD] px-3 py-1 rounded-full text-xs font-bold">Healthy</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF7] text-[#123D31] font-sans">
      <BotanicalBg />
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          <div className="bg-white rounded-3xl shadow-sm border border-[#D5E8D5] flex-1 flex flex-col overflow-hidden">
            
            {/* ── Filters Bar ── */}
            <div className="p-6 border-b border-[#F3FAEF] flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#789187] w-4 h-4" />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by crop, disease or date..." 
                  className="w-full bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#087A4B] text-[#123D31]"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select 
                    value={cropFilter} onChange={e => setCropFilter(e.target.value)}
                    className="appearance-none bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#183F34] focus:outline-none focus:border-[#087A4B] font-medium min-w-[140px]"
                  >
                    <option>All Crops</option>
                    <option>Tomato</option>
                    <option>Wheat</option>
                    <option>Corn</option>
                    <option>Rice</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#789187] w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#183F34] focus:outline-none focus:border-[#087A4B] font-medium min-w-[140px]"
                  >
                    <option>All Status</option>
                    <option>Detected</option>
                    <option>Healthy</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#789187] w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative flex items-center gap-2">
                  <span className="text-sm text-[#789187] font-medium">Sort by:</span>
                  <div className="relative">
                    <select 
                      value={sort} onChange={e => setSort(e.target.value)}
                      className="appearance-none bg-[#FAFCF7] border border-[#D5E8D5] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#183F34] focus:outline-none focus:border-[#087A4B] font-medium min-w-[120px]"
                    >
                      <option>Latest</option>
                      <option>Oldest</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#789187] w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFCF7] border-b border-[#F3FAEF]">
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider w-12">#</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Crop</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Disease</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Confidence</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Sustainability</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-[#063F2F] uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="py-12 text-center text-[#789187]">Loading...</td></tr>
                  ) : currentData.length === 0 ? (
                    <tr><td colSpan="8" className="py-12 text-center text-[#789187]">No records found.</td></tr>
                  ) : (
                    currentData.map((item, i) => {
                      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
                      const rawUrl = item.imageUrl || item.image;
                      const thumbSrc = !rawUrl ? '/tomato_leaf.jpg' : (rawUrl.startsWith('http') || rawUrl.startsWith('blob:')) ? rawUrl : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

                      return (
                        <tr key={item.id} className="border-b border-[#F3FAEF] hover:bg-[#FAFCF7] transition-colors group">
                          <td className="py-4 px-6 text-[#789187] font-medium">
                            <img 
                              src={thumbSrc} 
                              alt={item.crop || 'Leaf photo'} 
                              className="w-10 h-10 rounded-xl object-cover border border-[#D5E8D5] shadow-xs" 
                              onError={(e) => { e.target.src = '/tomato_leaf.jpg'; }}
                            />
                          </td>
                        <td className="py-4 px-6 font-semibold text-[#183F34]">{item.crop}</td>
                        <td className="py-4 px-6 text-sm text-[#45665A]">{item.date}</td>
                        <td className="py-4 px-6 text-sm font-medium text-[#183F34]">{item.disease}</td>
                        <td className="py-4 px-6 text-sm text-[#45665A]">{item.confidence ? `${item.confidence}%` : 'N/A'}</td>
                        <td className="py-4 px-6 text-sm text-[#45665A]">{item.sustainability}</td>
                        <td className="py-4 px-6">{renderBadge(item.status)}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => navigate(`/results/${item.id}`)}
                            className="bg-[#087A4B] text-white hover:bg-[#064D38] px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="p-4 border-t border-[#F3FAEF] flex items-center justify-between text-sm text-[#789187]">
              <div>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} scans</div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#D5E8D5] text-[#183F34] hover:bg-[#FAFCF7] disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center transition-colors ${
                        currentPage === i + 1 ? 'bg-[#087A4B] text-white' : 'text-[#183F34] hover:bg-[#FAFCF7]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#D5E8D5] text-[#183F34] hover:bg-[#FAFCF7] disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
