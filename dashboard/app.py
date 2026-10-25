import os
import streamlit as st
import pandas as pd
import plotly.express as px
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Himar Coffee - Dasbor Penjualan",
    page_icon="H",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling to match Himar Coffee brand
st.markdown("""
<style>
    :root {
        --paper: #f7f2e9;
        --surface: #fffdf8;
        --ink: #281a13;
        --muted: #6b625b;
        --accent: #b5532c;
        --sage: #6f8f72;
        --line: #ded2c1;
    }
    .stApp, [data-testid="stAppViewContainer"] {
        background: var(--paper);
        color: var(--ink);
    }
    [data-testid="stSidebar"] {
        background: #281a13;
    }
    [data-testid="stSidebar"] * {
        color: #fffdf8 !important;
    }
    .metric-card {
        background-color: var(--surface);
        border-top: 2px solid var(--accent);
        border-bottom: 1px solid var(--line);
        padding: 18px 0;
    }
    .metric-title {
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
    }
    .metric-value {
        color: var(--ink);
        font-size: 25px;
        font-weight: 700;
        line-height: 1.15;
        margin-top: 6px;
    }
    .stSelectbox label, .stDateInput label {
        color: var(--ink) !important;
        font-weight: 700 !important;
    }
    h1, h2, h3 {
        color: var(--ink) !important;
        letter-spacing: -0.04em;
    }
    [data-testid="stMetric"] {
        background: transparent;
        border: 0;
    }
</style>
""", unsafe_allow_html=True)

# Supabase Credentials
def get_credentials():
    url = None
    key = None
    if hasattr(st, "secrets") and "SUPABASE_URL" in st.secrets:
        url = st.secrets["SUPABASE_URL"]
        key = st.secrets.get("SUPABASE_KEY")
    if not url:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
    return url, key

SUPABASE_URL, SUPABASE_KEY = get_credentials()

@st.cache_data(ttl=60)
def load_sales_data():
    if not SUPABASE_URL or not SUPABASE_KEY:
        st.warning("Konfigurasi SUPABASE_URL dan SUPABASE_KEY tidak ditemukan. Menampilkan data simulasi.")
        # Fallback dummy data
        data = [
            {"menu_name": "The Lost Sheep", "category": "Kopi", "unit_price": 25000, "quantity": 3, "total_amount": 75000, "transaction_date": "2024-10-20T10:00:00Z"},
            {"menu_name": "Merry Gloss", "category": "Kopi", "unit_price": 28000, "quantity": 2, "total_amount": 56000, "transaction_date": "2024-10-21T11:30:00Z"},
            {"menu_name": "Matcha Latte", "category": "Non-Kopi", "unit_price": 30000, "quantity": 1, "total_amount": 30000, "transaction_date": "2024-10-22T14:15:00Z"},
        ]
        df = pd.DataFrame(data)
        df["transaction_date"] = pd.to_datetime(df["transaction_date"])
        return df

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        response = supabase.table("sales").select("*").order("transaction_date", desc=True).limit(1000).execute()
        rows = response.data or []
        if not rows:
            return pd.DataFrame()
        df = pd.DataFrame(rows)
        df["transaction_date"] = pd.to_datetime(df["transaction_date"])
        return df
    except Exception as e:
        st.error(f"Gagal menghubungkan ke database: {e}")
        return pd.DataFrame()

# Header
st.title("Himar Coffee Garut. Dasbor Penjualan")
st.markdown("Analitik performa penjualan, tren pendapatan, dan produk terlaris.")

# Load Data
df_raw = load_sales_data()

if df_raw.empty:
    st.info("Belum ada data penjualan tercatat di sistem.")
else:
    # Sidebar Filters
    st.sidebar.header("Filter Data")

    # Date range filter
    min_date = df_raw["transaction_date"].min().date()
    max_date = df_raw["transaction_date"].max().date()

    selected_date_range = st.sidebar.date_input(
        "Rentang Tanggal",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date,
    )

    # Category filter
    all_categories = ["Semua Kategori"] + sorted(df_raw["category"].dropna().unique().tolist())
    selected_category = st.sidebar.selectbox("Kategori Menu", all_categories)

    # Apply Filters
    df = df_raw.copy()

    if isinstance(selected_date_range, (tuple, list)) and len(selected_date_range) == 2:
        start_d, end_d = selected_date_range
        df = df[(df["transaction_date"].dt.date >= start_d) & (df["transaction_date"].dt.date <= end_d)]

    if selected_category != "Semua Kategori":
        df = df[df["category"] == selected_category]

    # Metrics
    total_revenue = df["total_amount"].sum()
    total_qty_sold = df["quantity"].sum()
    total_transactions = len(df)
    avg_order_value = total_revenue / total_transactions if total_transactions > 0 else 0

    best_seller = "Belum ada"
    if not df.empty:
        top_item = df.groupby("menu_name")["quantity"].sum().sort_values(ascending=False)
        if not top_item.empty:
            best_seller = f"{top_item.index[0]} ({top_item.iloc[0]} cup)"

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Pendapatan</div>
            <div class="metric-value">Rp{total_revenue:,.0f}</div>
        </div>
        """.replace(",", "."), unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Produk Terjual</div>
            <div class="metric-value">{total_qty_sold} item</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Rata-rata Order (AOV)</div>
            <div class="metric-value">Rp{avg_order_value:,.0f}</div>
        </div>
        """.replace(",", "."), unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Menu Terlaris</div>
            <div class="metric-value" style="font-size: 18px; line-height: 1.3;">{best_seller}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Visualizations
    chart_col1, chart_col2 = st.columns([2, 1])

    with chart_col1:
        st.subheader("Tren Pendapatan Harian")
        if not df.empty:
            df_daily = df.copy()
            df_daily["date"] = df_daily["transaction_date"].dt.date
            daily_rev = df_daily.groupby("date")["total_amount"].sum().reset_index()

            fig_trend = px.area(
                daily_rev,
                x="date",
                y="total_amount",
                labels={"date": "Tanggal", "total_amount": "Total Pendapatan (Rp)"},
                color_discrete_sequence=["#B5532C"]
            )
            fig_trend.update_layout(
                plot_bgcolor="white",
                paper_bgcolor="transparent",
                margin=dict(l=20, r=20, t=20, b=20),
            )
            st.plotly_chart(fig_trend, use_container_width=True)

    with chart_col2:
        st.subheader("Penjualan per Kategori")
        if not df.empty:
            cat_summary = df.groupby("category")["total_amount"].sum().reset_index()
            fig_pie = px.pie(
                cat_summary,
                values="total_amount",
                names="category",
                color_discrete_sequence=["#B5532C", "#6F8F72", "#2B1B12", "#D4A373", "#CCD5AE"],
                hole=0.4
            )
            fig_pie.update_layout(
                paper_bgcolor="transparent",
                margin=dict(l=10, r=10, t=10, b=10)
            )
            st.plotly_chart(fig_pie, use_container_width=True)

    # Top Menu items
    st.subheader("5 Menu Paling Banyak Dipesan")
    if not df.empty:
        top_menus = (
            df.groupby("menu_name")["quantity"]
            .sum()
            .reset_index()
            .sort_values(by="quantity", ascending=True)
            .tail(5)
        )
        fig_bar = px.bar(
            top_menus,
            x="quantity",
            y="menu_name",
            orientation="h",
            labels={"quantity": "Jumlah Terjual (Cup/Porsi)", "menu_name": "Menu"},
            color_discrete_sequence=["#6F8F72"]
        )
        fig_bar.update_layout(
            plot_bgcolor="white",
            paper_bgcolor="transparent",
            margin=dict(l=20, r=20, t=20, b=20)
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    # Data Table
    with st.expander("Lihat Riwayat Transaksi Lengkap"):
        df_display = df[["transaction_date", "menu_name", "category", "unit_price", "quantity", "total_amount"]].copy()
        df_display["transaction_date"] = df_display["transaction_date"].dt.strftime("%d-%m-%Y %H:%M")
        df_display.columns = ["Waktu Transaksi", "Nama Menu", "Kategori", "Harga Satuan", "Kuantitas", "Total Harga"]
        st.dataframe(df_display, use_container_width=True)
