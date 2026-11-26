import json
import re
import logging
from typing import Dict, Any
from .config import GROQ_API_KEY
from .catalog import get_catalog_context

logger = logging.getLogger("llm")

SYSTEM_PROMPT = """Kamu adalah asisten barista cerdas dan ramah untuk kedai kopi "Himar Coffee Garut" (kedai kopi hangat dan bersahaja di Garut, Jawa Barat).

Tugasmu:
1. Menjawab pertanyaan pelanggan dengan ramah, hangat, dan ringkas dalam Bahasa Indonesia.
2. Mengklasifikasikan maksud (intent) pengguna secara tepat ke dalam salah satu dari 5 kategori:
   - "tanya_menu": Pertanyaan seputar menu, kopi, minuman, makanan, harga, rekomendasi, varian.
   - "tanya_event": Pertanyaan seputar acara, jadwal event, workshop, live music, atau kegiatan komunitas.
   - "pemesanan": Niat membeli, cara pesan, checkout, atau order.
   - "keluhan": Kritik, komplain, kekecewaan terhadap pelayanan/rasa/kecepatan.
   - "di_luar_konteks": Pertanyaan yang tidak ada kaitannya dengan Himar Coffee Garut (misal: cuaca umum, politik, matematika, dll).

PENTING:
- Jawab HANYA berdasarkan konteks data katalog yang diberikan. Jangan mengarang menu atau event yang tidak ada.
- Format keluaran WAJIB berupa JSON murni tanpa markdown pembungkus dengan struktur:
{
  "intent": "tanya_menu | tanya_event | pemesanan | keluhan | di_luar_konteks",
  "confidence": 0.95,
  "reply": "Teks jawaban ramah untuk pelanggan..."
}
"""

def fallback_keyword_classifier(message: str) -> Dict[str, Any]:
    lower = message.lower()
    if re.search(r"(pesan|order|beli|checkout|cara pesan)", lower):
        return {
            "intent": "pemesanan",
            "confidence": 0.9,
            "reply": "Untuk memesan, kamu bisa memilih menu di website lalu klik 'Pesan via WhatsApp', atau langsung chat barista kami di WhatsApp!"
        }
    if re.search(r"(keluhan|kecewa|lambat|komplain|kritik|masalah)", lower):
        return {
            "intent": "keluhan",
            "confidence": 0.9,
            "reply": "Mohon maaf atas ketidaknyamanan yang kamu alami. Kami sangat menghargai setiap masukan untuk Himar Coffee. Silakan hubungi pengelola kami."
        }
    if re.search(r"(event|acara|jadwal|komunitas|workshop|live music|akustik)", lower):
        return {
            "intent": "tanya_event",
            "confidence": 0.9,
            "reply": "Di Himar Coffee sering ada live acoustic dan temu komunitas. Silakan cek jadwal event di website kami!"
        }
    if re.search(r"(menu|harga|kopi|minum|makan|katalog|daftar|rekomendasi)", lower):
        return {
            "intent": "tanya_menu",
            "confidence": 0.9,
            "reply": "Menu unggulan kami adalah The Lost Sheep dan Merry Gloss. Silakan cek halaman menu untuk melihat semua pilihan!"
        }
    return {
        "intent": "di_luar_konteks",
        "confidence": 0.85,
        "reply": "Maaf, aku hanya bisa membantu seputar menu, event, dan pemesanan di Himar Coffee Garut."
    }

async def generate_chat_response(message: str) -> Dict[str, Any]:
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not configured, using keyword fallback")
        return fallback_keyword_classifier(message)

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        catalog_context = get_catalog_context()

        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{catalog_context}"},
            {"role": "user", "content": message}
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )

        raw_content = chat_completion.choices[0].message.content
        data = json.loads(raw_content)

        # Ensure valid intent
        valid_intents = ["tanya_menu", "tanya_event", "pemesanan", "keluhan", "di_luar_konteks"]
        intent = data.get("intent", "di_luar_konteks")
        if intent not in valid_intents:
            intent = "di_luar_konteks"

        return {
            "intent": intent,
            "confidence": float(data.get("confidence", 0.95)),
            "reply": str(data.get("reply", "Halo, ada yang bisa kubantu seputar Himar Coffee?"))
        }

    except Exception as e:
        logger.error(f"Error calling Groq API: {e}. Falling back to keywords.")
        return fallback_keyword_classifier(message)
