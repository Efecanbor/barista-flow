import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Minus, Package, AlertTriangle, Trash2, LayoutDashboard, PackagePlus, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- CHART.JS BİLEŞENLERİ ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Chart.js Bileşenlerini Kayıt Ediyoruz (Bu kısım grafiklerin çalışması için şart)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- TASARIM STİLLERİ ---
const cardStyle: React.CSSProperties = { 
  backgroundColor: '#1e293b', 
  padding: '20px', 
  borderRadius: '15px',
  border: '1px solid #334155'
};

const statCardStyle: React.CSSProperties = { 
  backgroundColor: '#1e293b', 
  padding: '25px', 
  borderRadius: '15px', 
  textAlign: 'center', 
  border: '1px solid #1e293b' 
};

const imgStyle: React.CSSProperties = { 
  width: '70px', 
  height: '70px', 
  borderRadius: '10px', 
  objectFit: 'cover',
  backgroundColor: '#0f172a'
};

const actionBtn: React.CSSProperties = { 
  padding: '8px', 
  backgroundColor: '#0f172a', 
  border: 'none', 
  borderRadius: '8px', 
  color: 'white', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center' 
};

const Dashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) { 
      console.error("Veriler çekilemedi. Backend'i kontrol et!"); 
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const updateStock = async (id: number, quantity: number) => {
    try {
      await api.patch(`/products/${id}/stock`, { quantity });
      fetchProducts();
    } catch (err) { 
      alert("Güncelleme hatası!"); 
    }
  };

  // --- HESAPLAMALAR & GRAFİK VERİLERİ ---
  const totalProducts = products.length;
  const criticalCount = products.filter(p => Number(p.stock_quantity) <= Number(p.min_stock_level)).length;

  // Kategori Dağılımı (Pasta Grafiği İçin)
  const categories = Array.from(new Set(products.map(p => p.category || 'Diğer')));
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => products.filter(p => p.category === cat).length),
      backgroundColor: ['#38bdf8', '#fbbf24', '#f472b6', '#10b981', '#a78bfa'],
      borderColor: '#1e293b',
      borderWidth: 2,
    }],
  };

  // Stok Durumu (Çubuk Grafiği İçin - İlk 6 Ürün)
  const barData = {
    labels: products.map(p => p.product_name).slice(0, 6),
    datasets: [{
      label: 'Mevcut Stok',
      data: products.map(p => p.stock_quantity).slice(0, 6),
      backgroundColor: '#38bdf8',
      borderRadius: 5,
    }],
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'sans-serif', color: 'white' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={32} color="#38bdf8" />
          <h1 style={{ margin: 0, fontSize: '26px' }}>BaristaFlow Stok Paneli</h1>
        </div>
        <button 
          onClick={() => navigate('/add-product')}
          style={{ padding: '12px 20px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PackagePlus size={20} /> Yeni Ürün Ekle
        </button>
      </header>

      {/* İstatistik Özetleri */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={statCardStyle}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>TOPLAM ÇEŞİT</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#38bdf8' }}>{totalProducts}</div>
        </div>
        <div style={{ ...statCardStyle, border: criticalCount > 0 ? '1px solid #ef4444' : '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>KRİTİK STOK</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>{criticalCount}</div>
        </div>
      </div>

      {/* Grafikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} /> Stok Durumu
          </h3>
          <div style={{ height: '250px' }}>
            <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }} />
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} /> Kategori Dağılımı
          </h3>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Ürün Kartları Grid */}
      <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Envanter Listesi</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {products.map((p) => {
          const isCritical = Number(p.stock_quantity) <= Number(p.min_stock_level);
          
          return (
            <div key={p.id} style={{ ...cardStyle, border: isCritical ? '2px solid #ef4444' : '1px solid #334155' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                {p.image_url ? (
                  <img src={`http://localhost:5000${p.image_url}`} style={imgStyle} alt="" />
                ) : (
                  <div style={{ ...imgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package color="#94a3b8" size={30} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{p.product_name}</h3>
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px' }}>{p.category}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: isCritical ? '#ef4444' : '#10b981' }}>
                    {p.stock_quantity} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{p.unit}</span>
                    {isCritical && <AlertTriangle size={18} style={{ marginLeft: '10px', verticalAlign: 'middle' }} color="#ef4444" />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => updateStock(p.id, -1)} style={actionBtn}><Minus size={18} /></button>
                  <button onClick={() => updateStock(p.id, 1)} style={actionBtn}><Plus size={18} /></button>
                </div>
                <button 
                  onClick={async () => { if(window.confirm("Silinsin mi?")) { await api.delete(`/products/${p.id}`); fetchProducts(); } }} 
                  style={{ ...actionBtn, color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;