import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ShoppingCart, PlusCircle, 
  Package, AlertTriangle, Trash2, Search, Filter, Edit3, X 
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Product {
  id: number;
  product_name: string;
  category: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    category: 'Kahve',
    stock_quantity: '',
    min_stock_level: '', 
    unit: 'Kg'
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const updateStock = async (id: number, amount: number) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${id}/stock`, { quantity: amount });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  // --- DÜZENLEME FONKSİYONU (Hata Veren Kısım Burasıydı) ---
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      // Backend'deki endpoint'in doğruluğundan emin oluyoruz
      await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, {
        product_name: editingProduct.product_name,
        category: editingProduct.category,
        unit: editingProduct.unit,
        min_stock_level: Number(editingProduct.min_stock_level),
        stock_quantity: Number(editingProduct.stock_quantity)
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) { 
      console.error(err);
      alert("Güncelleme başarısız! Backend rotasını kontrol et."); 
    }
  };

  const deleteProduct = async (id: number) => {
    if(window.confirm("Bu ürünü silmek istediğine emin misin?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (err) { alert("Silme hatası!"); }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', formData);
      setFormData({ product_name: '', category: 'Kahve', stock_quantity: '', min_stock_level: '', unit: 'Kg' });
      fetchProducts();
    } catch (error) { alert("Ekleme başarısız!"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = ['Kahve', 'Süt', 'Şurup', 'Ekipman', 'Giyim', 'Temizlik'];
  
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => products.filter(p => p.category === cat).length),
      backgroundColor: ['#fbbf24', '#f472b6', '#38bdf8', '#10b981', '#a78bfa', '#64748b'],
      borderColor: '#111827',
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: products.map(p => p.product_name).slice(0, 6),
    datasets: [{
      label: 'Stok Seviyesi',
      data: products.map(p => p.stock_quantity).slice(0, 6),
      backgroundColor: '#38bdf8',
      borderRadius: 8,
    }],
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Hepsi' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const criticalCount = products.filter(p => Number(p.stock_quantity) <= Number(p.min_stock_level)).length;

  if (loading) return <div style={{backgroundColor:'#0f172a', color:'white', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Yükleniyor...</div>;

  return (
    <div style={{display:'flex', width:'100vw', height:'100vh', backgroundColor:'#0f172a', color:'white', overflow:'hidden', fontFamily:'sans-serif'}}>
      
      {/* SIDEBAR */}
      <aside style={{width:'300px', backgroundColor:'#111827', borderRight:'2px solid #1e293b', padding:'30px', display:'flex', flexDirection:'column', flexShrink:0}}>
        <div style={{marginBottom:'40px'}}>
          <h1 style={{fontSize:'22px', fontWeight:'900', margin:0, letterSpacing:'-1px'}}>BARISTA<span style={{color:'#38bdf8'}}>FLOW</span></h1>
          <p style={{fontSize:'9px', color:'#4b5563', fontWeight:'bold', letterSpacing:'3px'}}>PRO DASHBOARD</p>
        </div>

        <div style={{backgroundColor:'#1e293b', padding:'20px', borderRadius:'24px', marginBottom:'30px', border:'1px solid #334155'}}>
          <p style={{fontSize:'10px', color:'#38bdf8', fontWeight:'900', marginBottom:'15px'}}>HIZLI ÜRÜN EKLE</p>
          <form onSubmit={handleAddProduct} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <input type="text" placeholder="Ürün Adı" required style={{backgroundColor:'#0f172a', border:'1px solid #334155', padding:'10px', borderRadius:'10px', color:'white', fontSize:'12px'}} value={formData.product_name} onChange={(e)=>setFormData({...formData, product_name:e.target.value})} />
            <select style={{backgroundColor:'#0f172a', border:'1px solid #334155', padding:'10px', borderRadius:'10px', color:'white', fontSize:'12px'}} value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div style={{display:'flex', gap:'8px'}}>
                <input type="number" placeholder="Stok" style={{width:'50%', backgroundColor:'#0f172a', border:'1px solid #334155', padding:'10px', borderRadius:'10px', color:'white', fontSize:'12px'}} value={formData.stock_quantity} onChange={(e)=>setFormData({...formData, stock_quantity:e.target.value})} required/>
                <input type="number" placeholder="Limit" style={{width:'50%', backgroundColor:'#0f172a', border:'1px solid #334155', padding:'10px', borderRadius:'10px', color:'white', fontSize:'12px'}} value={formData.min_stock_level} onChange={(e)=>setFormData({...formData, min_stock_level:e.target.value})} required/>
            </div>
            <button type="submit" style={{backgroundColor:'#38bdf8', color:'#0f172a', fontWeight:'900', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'11px'}}>ÜRÜNÜ KAYDET</button>
          </form>
        </div>
        <nav style={{marginTop:'auto'}}>
           <button style={{width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'15px', backgroundColor:'rgba(56,189,248,0.1)', color:'#38bdf8', border:'none', borderRadius:'16px', fontWeight:'bold'}}><LayoutDashboard size={20}/> Dashboard</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main style={{flex:1, padding:'40px', overflowY:'auto'}}>
        <div style={{maxWidth:'1300px', margin:'0 auto'}}>
          
          {/* GRAFİKLER */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'25px', marginBottom:'40px'}}>
             <div style={{backgroundColor:'#1e293b', padding:'25px', borderRadius:'35px', height:'260px'}}>
                <p style={{fontSize:'10px', color:'#64748b', fontWeight:'900', marginBottom:'15px'}}>KATEGORİ ANALİZİ</p>
                <div style={{height:'170px', display:'flex', justifyContent:'center'}}>
                   <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
             </div>
             <div style={{backgroundColor:'#1e293b', padding:'25px', borderRadius:'35px', height:'260px'}}>
                <p style={{fontSize:'10px', color:'#64748b', fontWeight:'900', marginBottom:'15px'}}>STOK DURUMU</p>
                <div style={{height:'170px'}}><Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { display: false }, x: { ticks: { color: '#64748b', font: { size: 9 } } } } }} /></div>
             </div>
             <div style={{backgroundColor:'#1e293b', padding:'25px', borderRadius:'35px', height:'260px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <AlertTriangle size={48} color={criticalCount > 0 ? "#ef4444" : "#10b981"} />
                <h3 style={{fontSize:'42px', fontWeight:'900', margin:'10px 0 0 0', color: criticalCount > 0 ? '#ef4444' : '#10b981'}}>{criticalCount}</h3>
                <p style={{fontSize:'10px', color:'#64748b', fontWeight:'900'}}>KRİTİK ÜRÜN</p>
             </div>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
             <div style={{display:'flex', alignItems:'center', gap:'15px', backgroundColor:'#111827', padding:'10px 20px', borderRadius:'15px', flex:1, marginRight:'20px'}}>
                <Search size={18} color="#64748b" /><input type="text" placeholder="Ürün Ara..." style={{backgroundColor:'transparent', border:'none', color:'white', outline:'none', width:'100%'}} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/>
             </div>
             <select style={{backgroundColor:'#111827', color:'white', border:'none', padding:'10px 20px', borderRadius:'15px'}} value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}>
                <option value="Hepsi">Tüm Kategoriler</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>

          {/* LISTE */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'25px'}}>
            {filteredProducts.map((p) => {
              const isCritical = Number(p.stock_quantity) <= Number(p.min_stock_level);
              return (
                <div key={p.id} style={{backgroundColor:'#1e293b', padding:'25px', borderRadius:'35px', border: isCritical ? '2px solid #ef4444' : '1px solid #334155', position:'relative'}}>
                  <div style={{position:'absolute', top:'20px', right:'20px', display:'flex', gap:'8px'}}>
                    <button onClick={() => setEditingProduct(p)} style={{backgroundColor:'transparent', border:'none', cursor:'pointer', color:'#38bdf8'}}><Edit3 size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)} style={{backgroundColor:'transparent', border:'none', cursor:'pointer', color:'#4b5563'}}><Trash2 size={16} /></button>
                  </div>
                  <h4 style={{fontSize:'16px', fontWeight:'800', margin:'0 0 5px 0', textTransform:'uppercase'}}>{p.product_name}</h4>
                  <span style={{fontSize:'9px', color:'#38bdf8', fontWeight:'900'}}>{p.category}</span>
                  <div style={{textAlign:'center', margin:'25px 0'}}>
                    <span style={{fontSize:'48px', fontWeight:'900', color: isCritical ? '#ef4444' : 'white'}}>{p.stock_quantity}</span>
                    <span style={{fontSize:'12px', color:'#64748b', marginLeft:'5px'}}>{p.unit}</span>
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={()=>updateStock(p.id, -1)} style={{flex:1, padding:'12px', backgroundColor:'#0f172a', border:'1px solid #334151', color:'white', borderRadius:'15px'}}>-</button>
                    <button onClick={()=>updateStock(p.id, 1)} style={{flex:1, padding:'12px', backgroundColor:'#38bdf8', border:'none', color:'#0f172a', borderRadius:'15px', fontWeight:'bold'}}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 🚀 MODAL FIX (Hata Çözüldü) */}
      {editingProduct && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', backgroundColor:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{backgroundColor:'#1e293b', padding:'35px', borderRadius:'30px', width:'380px', border:'2px solid #38bdf8 shadow-2xl'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
              <h2 style={{margin:0, fontSize:'18px', fontWeight:'bold'}}>Ürünü Düzenle</h2>
              <button onClick={() => setEditingProduct(null)} style={{backgroundColor:'transparent', border:'none', color:'white', cursor:'pointer'}}><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateProduct} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              <input type="text" style={{backgroundColor:'#0f172a', border:'1px solid #334155', padding:'12px', borderRadius:'12px', color:'white'}} value={editingProduct.product_name} onChange={(e) => setEditingProduct({...editingProduct, product_name: e.target.value})}/>
              <select style={{backgroundColor:'#0f172a', border:'1px solid #334155', padding:'12px', borderRadius:'12px', color:'white'}} value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div style={{display:'flex', gap:'10px'}}>
                  <input type="number" placeholder="Stok" style={{width:'50%', backgroundColor:'#0f172a', border:'1px solid #334155', padding:'12px', borderRadius:'12px', color:'white'}} value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: Number(e.target.value)})}/>
                  <input type="number" placeholder="Limit" style={{width:'50%', backgroundColor:'#0f172a', border:'1px solid #334155', padding:'12px', borderRadius:'12px', color:'white'}} value={editingProduct.min_stock_level} onChange={(e) => setEditingProduct({...editingProduct, min_stock_level: Number(e.target.value)})}/>
              </div>
              <button type="submit" style={{backgroundColor:'#38bdf8', color:'#0f172a', fontWeight:'900', padding:'15px', borderRadius:'15px', border:'none', cursor:'pointer'}}>GÜNCELLE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;