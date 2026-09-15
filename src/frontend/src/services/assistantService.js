import { assistantApi } from '../api/assistant.api';

export const assistantService = {
  /**
   * Send a message to the agricultural AI assistant.
   *
   * @param {string} message      — the user's chat message
   * @param {object} context      — scan context (crop, disease, confidence, etc.)
   * @param {Array}  history      — previous {role, text} message turns for multi-turn chat
   * @param {boolean} reportMode  — when true, generates a structured grounded scan report
   * @returns {{ answer: string, timestamp: string }}
   */
  sendMessage: async (message, context, history = [], reportMode = false) => {
    return assistantApi.sendMessage({ message, context, history, report_mode: reportMode });
  },
};
