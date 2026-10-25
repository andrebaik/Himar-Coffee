import axios from 'axios';
import { config } from '../config/env.js';

export const triggerReindex = async () => {
  if (config.AI_MOCK === 'true' || !config.AI_SERVICE_URL) {
    return;
  }

  try {
    await axios.post(
      `${config.AI_SERVICE_URL}/api/v1/reindex`,
      {},
      {
        headers: { 'X-Internal-Key': config.INTERNAL_API_KEY },
        timeout: 5000,
      }
    );
  } catch {
    // Fire-and-forget: log but don't throw
    console.error('[aiClient] Reindex gagal (fire-and-forget)');
  }
};
