import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Minus, Package, AlertTriangle, Trash2, LayoutDashboard, PackagePlus, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Chart.js Setup
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (err) { console.error("Veri çekilemedi!"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateStock = async (id: number, quantity: number) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${id}/stock`, { quantity });
      fetchProducts();
    } catch (err) { alert("Güncelleme hatası!"); }
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (err) { alert("Silme hatası!"); }
    }
  };

  // Stats & Graphs
  const totalProducts = products.length;
  const criticalCount = products.filter(p => Number(p.stock_quantity) <= Number(p.min_stock_level)).length;
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

  const barData = {
    labels: products.map(p => p.product_name).slice(0, 6),
    datasets: [{
      label: 'Mevcut Stok',
      data: products.map(p => p.stock_quantity).slice(0, 6),
      backgroundColor: '#38bdf8',
      borderRadius: 8,
    }],
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={36} className="text-sky-400" />
          <h1 className="text-3xl font-black tracking-tight uppercase">BaristaFlow Pro</h1>
        </div>
        <button 
          onClick={() => navigate('/add-product')}
          className="bg-sky-500 hover:bg-sky-400 text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
        >
          <PackagePlus size={20} /> Yeni Ürün Ekle
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-800 text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Toplam Çeşit</p>
          <p className="text-5xl font-black text-sky-400">{totalProducts}</p>
        </div>
        <div className={`bg-[#1e293b] p-8 rounded-3xl border text-center transition-colors ${criticalCount > 0 ? 'border-red-500' : 'border-slate-800'}`}>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Kritik Stok</p>
          <p className={`text-5xl font-black ${criticalCount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>{criticalCount}</p>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
          <h3 className="flex items-center gap-2 text-slate-400 mb-6 font-semibold"><BarChart3 size={18} /> Stok Dağılımı</h3>
          <div className="h-64"><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
        </div>
        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800">
          <h3 className="flex items-center gap-2 text-slate-400 mb-6 font-semibold"><PieIcon size={18} /> Kategoriler</h3>
          <div className="h-64"><Pie data={pieData} options={{ maintainAspectRatio: false }} /></div>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="text-sky-400" /> Envanter Listesi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => {
          const isCritical = Number(p.stock_quantity) <= Number(p.min_stock_level);
          return (
            <div key={p.id} className={`bg-[#1e293b] p-6 rounded-3xl border-2 transition-all ${isCritical ? 'border-red-500 bg-red-950/10' : 'border-slate-800'}`}>
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-700">
                  {p.image_url ? (
                    <img src={`http://localhost:5000${p.image_url}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Package size={24} className="text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg leading-tight">{p.product_name}</h4>
                  <span className="text-xs text-sky-400 font-semibold">{p.category}</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className={`text-4xl font-black ${isCritical ? 'text-red-500' : 'text-emerald-400'}`}>
                  {p.stock_quantity} <span className="text-sm font-normal text-slate-500">{p.unit}</span>
                </p>
                {isCritical && <div className="text-red-500 flex items-center justify-center gap-1 text-xs mt-1 font-bold animate-pulse"><AlertTriangle size={12} /> KRİTİK SEVİYE!</div>}
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2 flex-1">
                  <button onClick={() => updateStock(p.id, -1)} className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl flex-1 flex justify-center transition-colors"><Minus size={18} /></button>
                  <button onClick={() => updateStock(p.id, 1)} className="bg-sky-500 hover:bg-sky-400 text-slate-900 p-3 rounded-xl flex-1 flex justify-center transition-colors"><Plus size={18} /></button>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;