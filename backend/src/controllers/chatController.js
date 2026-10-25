import * as aiClient from '../services/aiClient.js';
import { saveChatLog } from '../services/logService.js';
import { config } from '../config/env.js';
import { success } from '../utils/response.js';

export const handleChat = async (req, res, next) => {
  try {
    const { session_id, message } = req.body;

    // 1. Call AI service (mock or real)
    const aiResponse = await aiClient.chat({ session_id, message });

    // 2. Map actions based on intent
    const actions = [];
    const waNumber = config.WHATSAPP_NUMBER.replace(/\D/g, '');

    if (aiResponse.intent === 'tanya_menu') {
      actions.push({
        type: 'link',
        label: 'Lihat menu',
        path: '/menu',
      });
    } else if (aiResponse.intent === 'tanya_event') {
      actions.push({
        type: 'link',
        label: 'Lihat jadwal event',
        path: '/events',
      });
    } else if (aiResponse.intent === 'pemesanan') {
      const waText = 'Halo Himar Coffee Garut, saya ingin memesan. Nama pemesan:';
      actions.push({
        type: 'whatsapp',
        label: 'Pesan via WhatsApp',
        url: `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`,
      });
    } else if (aiResponse.intent === 'keluhan') {
      const waText = 'Halo Himar Coffee Garut, saya ingin menyampaikan masukan/keluhan:';
      actions.push({
        type: 'whatsapp',
        label: 'Hubungi pemilik',
        url: `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`,
      });
    }

    // 3. Best effort save to chat_logs (does not fail the response)
    saveChatLog({
      session_id,
      user_message: message,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      bot_response: aiResponse.reply,
    }).catch(() => {});

    // 4. Return formatted response
    return success(res, {
      reply: aiResponse.reply,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      actions,
    });
  } catch (err) {
    next(err);
  }
};
