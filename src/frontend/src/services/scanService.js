import { detectApi } from '../api/detect.api';
import { historyApi } from '../api/history.api';

// ── Client-side scan result cache ────────────────────────────
// The backend has a single POST /api/farmer/scan endpoint (no GET by ID).
// We cache the response from analyzeCrop() so getScanResult() can read
// it without needing a re-fetch endpoint that doesn't exist yet.
let _cachedFile = null;
const _resultCache = {};

export const scanService = {
  /**
   * Step 1 — stash the file client-side and return a temporary scan ID.
   * No backend call here; the real API call happens in analyzeCrop().
   */
  uploadScan: async (file) => {
    _cachedFile = file;
    return { id: `pending-${Date.now()}`, status: 'processing' };
  },

  analyzeCrop: async (_scanId, details) => {
    if (!_cachedFile) {
      throw new Error('No file uploaded — call uploadScan() first.');
    }

    const formData = new FormData();
    formData.append('image', _cachedFile);
    formData.append('crop', details.crop || '');
    formData.append('stage', details.stage || '');
    formData.append('soilType', details.soilType || '');
    formData.append('soilPh', details.soilPh || '');
    formData.append('soilMoisture', details.soilMoisture || '');
    formData.append('location', details.location || '');

    const result = await detectApi.analyzeScan(formData);

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
    if (result.imageUrl && !result.imageUrl.startsWith('http')) {
      result.imageUrl = `${baseUrl}${result.imageUrl.startsWith('/') ? '' : '/'}${result.imageUrl}`;
    } else if (!result.imageUrl && _cachedFile) {
      result.imageUrl = URL.createObjectURL(_cachedFile);
    }

    // Cache the result so getScanResult() can retrieve it by ID
    _resultCache[result.id] = result;
    
    // Persist to sessionStorage so context survives a page reload
    sessionStorage.setItem(`ag_scan_${result.id}`, JSON.stringify(result));
    sessionStorage.setItem('ag_last_scan_id', result.id);

    // Clear the stashed file
    _cachedFile = null;

    return result;
  },

  /**
   * Read-back from the client-side cache or backend API.
   */
  getScanResult: async (scanId) => {
    const cached = _resultCache[scanId];
    if (cached) return cached;

    // Check sessionStorage as a fallback
    const storageKey = `ag_scan_${scanId}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const result = JSON.parse(stored);
        _resultCache[scanId] = result; // rehydrate
        return result;
      } catch (error) {
        console.warn(`[scanService] Discarding unreadable result for scanId="${scanId}".`, error);
        sessionStorage.removeItem(storageKey);
      }
    }

    // Fetch from backend API
    try {
      const backendScan = await detectApi.getScan(scanId);
      if (backendScan) {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
        if (backendScan.imageUrl && !backendScan.imageUrl.startsWith('http')) {
          backendScan.imageUrl = `${baseUrl}${backendScan.imageUrl.startsWith('/') ? '' : '/'}${backendScan.imageUrl}`;
        }
        _resultCache[scanId] = backendScan;
        sessionStorage.setItem(storageKey, JSON.stringify(backendScan));
        return backendScan;
      }
    } catch (error) {
      console.warn(`[scanService] Scan ${scanId} not found on backend:`, error);
    }

    // If no cache hit, return a safe fallback.
    return {
      id: scanId,
      crop: 'Unknown',
      disease: 'No Data',
      confidence: 0,
      severity: 'Unknown',
      symptoms: [],
      sustainabilityScore: null,
      date: new Date().toISOString(),
      recommendations: ['No scan data available. Please run a new scan.'],
      is_uncertain: true,
      top_k_predictions: [],
      imageUrl: null
    };
  },

  /**
   * Scan history — calls the real backend stub (returns [] for now).
   */
  getHistory: async () => {
    return historyApi.getScans();
  },
};
