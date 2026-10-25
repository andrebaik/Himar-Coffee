import httpx
import logging
from typing import List, Dict, Any
from .config import BACKEND_URL

logger = logging.getLogger("catalog")

_menus_cache: List[Dict[str, Any]] = []
_events_cache: List[Dict[str, Any]] = []

async def fetch_catalog():
    global _menus_cache, _events_cache
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # Fetch menus
            menu_res = await client.get(f"{BACKEND_URL}/api/v1/menus")
            if menu_res.status_code == 200:
                _menus_cache = menu_res.json().get("data", [])
                logger.info(f"Loaded {len(_menus_cache)} menus into cache.")

            # Fetch events
            event_res = await client.get(f"{BACKEND_URL}/api/v1/events?scope=upcoming")
            if event_res.status_code == 200:
                _events_cache = event_res.json().get("data", [])
                logger.info(f"Loaded {len(_events_cache)} events into cache.")
    except Exception as e:
        logger.warning(f"Could not fetch catalog from backend: {e}. Using fallback defaults.")

def get_catalog_context() -> str:
    lines = ["--- DATA KATALOG HIMAR COFFEE GARUT ---"]

    if _menus_cache:
        lines.append("\n[Daftar Menu Tersedia]")
        for m in _menus_cache:
            if not m.get("is_available", True):
                continue
            featured = " (UNGGULAN)" if m.get("is_featured") else ""
            price_str = f"Rp{m.get('price', 0):,}".replace(",", ".")
            variants = ", ".join([v.get("name") for v in m.get("variants", [])])
            var_str = f" | Varian: {variants}" if variants else ""
            desc = f" - {m.get('description')}" if m.get("description") else ""
            lines.append(f"- {m.get('name')}{featured} ({m.get('category')}): {price_str}{var_str}{desc}")
    else:
        # Fallback knowledge base if backend is not yet reached
        lines.append("\n[Daftar Menu Default]")
        lines.append("- The Lost Sheep (UNGGULAN, Kopi): Rp25.000 | Varian: Hot, Iced - Signature blend aroma karamel")
        lines.append("- Merry Gloss (UNGGULAN, Kopi): Rp28.000 | Varian: Hot, Iced - Kopi susu dengan berry glaze")
        lines.append("- Espresso (Kopi): Rp18.000 | Varian: Single Shot, Double Shot")
        lines.append("- Matcha Latte (Non-Kopi): Rp30.000 | Varian: Hot, Iced")

    if _events_cache:
        lines.append("\n[Jadwal Event Mendatang]")
        for e in _events_cache:
            lines.append(f"- {e.get('title')} pada {e.get('event_date')} di {e.get('location', 'Himar Coffee')}")
    else:
        lines.append("\n[Jadwal Event]")
        lines.append("- Live Acoustic Night setiap akhir pekan di panggung indoor")

    lines.append("\n[Cara Pemesanan]")
    lines.append("- Pelanggan dapat memilih menu di website lalu mengklik 'Pesan via WhatsApp'. Pesanan akan otomatis terhubung ke WhatsApp barista.")

    return "\n".join(lines)
