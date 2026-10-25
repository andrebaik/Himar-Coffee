import axios from 'axios';
import { config } from '../config/env.js';
import { getMockReply } from './aiMock.js';
import { AppError } from '../utils/AppError.js';

export const chat = async ({ session_id, message }) => {
  if (config.AI_MOCK === 'true') {
    return await getMockReply(message);
  }

  if (!config.AI_SERVICE_URL) {
    throw new AppError(
      'AI_UNAVAILABLE',
      503,
      'Asisten sedang tidak tersedia. Silakan coba lagi sebentar lagi atau pesan langsung via WhatsApp.'
    );
  }

  try {
    const res = await axios.post(
      `${config.AI_SERVICE_URL}/api/v1/chat`,
      { session_id, message },
      { timeout: Number(config.AI_TIMEOUT_MS) || 20000 }
    );

    const data = res.data;
    if (
      !data ||
      typeof data.intent !== 'string' ||
      typeof data.reply !== 'string' ||
      !data.reply.trim()
    ) {
      console.error('[aiClient] Invalid response format from ai-service:', data);
      throw new AppError(
        'AI_UNAVAILABLE',
        503,
        'Asisten sedang tidak tersedia. Silakan coba lagi sebentar lagi atau pesan langsung via WhatsApp.'
      );
    }

    return {
      intent: data.intent,
      confidence: typeof data.confidence === 'number' ? data.confidence : null,
      reply: data.reply,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;

    if (err.response?.status === 429) {
      throw new AppError(
        'AI_RATE_LIMITED',
        429,
        'Asisten sedang ramai. Coba lagi dalam beberapa saat.'
      );
    }

    console.error('[aiClient] AI Service error:', err.message);
    throw new AppError(
      'AI_UNAVAILABLE',
      503,
      'Asisten sedang tidak tersedia. Silakan coba lagi sebentar lagi atau pesan langsung via WhatsApp.'
    );
  }
};

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
