import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ArrowLeft, Upload, CheckCircle } from 'lucide-react';

// --- TASARIM STİLLERİ ---
const labelStyle: React.CSSProperties = { 
  display: 'block', 
  marginBottom: '8px', 
  fontSize: '14px', 
  color: '#94a3b8' 
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #334155', 
  backgroundColor: '#0f172a', 
  color: 'white', 
  outline: 'none', 
  boxSizing: 'border-box' 
};

const submitBtnStyle: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px', 
  marginTop: '10px', 
  padding: '15px', 
  backgroundColor: '#38bdf8', 
  color: '#0f172a', 
  border: 'none', 
  borderRadius: '8px', 
  fontWeight: 'bold', 
  cursor: 'pointer', 
  fontSize: '16px' 
};

const cardStyle: React.CSSProperties = { 
  backgroundColor: '#1e293b', 
  padding: '30px', 
  borderRadius: '15px', 
  border: '1px solid #334155' 
};

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Kahve');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [unit, setUnit] = useState('Adet');
  const [image, setImage] = useState<File | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fotoğraf gönderdiğimiz için FormData kullanmalıyız
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('category', category);
    formData.append('stock_quantity', stockQuantity.toString());
    formData.append('min_stock_level', minStock.toString());
    formData.append('unit', unit);
    if (image) formData.append('image', image);

    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Ürün başarıyla eklendi!");
      navigate('/dashboard');
    } catch (err) {
      alert("Ürün eklenirken hata oluştu.");
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Geri Dön Butonu */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '20px' }}
      >
        <ArrowLeft size={20} /> Panele Dön
      </button>

      {/* Form Kartı */}
      <div style={cardStyle}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'white' }}>
          <PackagePlus color="#38bdf8" /> Yeni Envanter Ekle
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ürün Adı */}
          <div>
            <label style={labelStyle}>Ürün Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Tam Yağlı Süt" 
              style={inputStyle} 
              value={productName} 
              onChange={(e) => setProductName(e.target.value)} 
              required 
            />
          </div>

          {/* Kategori ve Birim */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Kahve">Kahve</option>
                <option value="Süt">Süt</option>
                <option value="Sarf Malzeme">Sarf Malzeme</option>
                <option value="Şurup">Şurup</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Birim</label>
              <select style={inputStyle} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="Adet">Adet</option>
                <option value="Litre">Litre</option>
                <option value="Kg">Kg</option>
                <option value="Paket">Paket</option>
              </select>
            </div>
          </div>

          {/* Stok ve Limit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Mevcut Stok</label>
              <input 
                type="number" 
                style={inputStyle} 
                value={stockQuantity} 
                onChange={(e) => setStockQuantity(Number(e.target.value))} 
              />
            </div>
            <div>
              <label style={labelStyle}>Kritik Limit</label>
              <input 
                type="number" 
                style={inputStyle} 
                value={minStock} 
                onChange={(e) => setMinStock(Number(e.target.value))} 
              />
            </div>
          </div>

          {/* Fotoğraf Yükleme Alanı */}
          <div>
            <label style={labelStyle}>Ürün Fotoğrafı</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
              />
              <div style={{ ...inputStyle, textAlign: 'center', border: '2px dashed #334155', padding: '30px' }}>
                <Upload size={24} style={{ marginBottom: '10px', color: '#38bdf8' }} />
                <div style={{ color: image ? '#10b981' : '#94a3b8', fontSize: '14px' }}>
                  {image ? `✓ ${image.name}` : "Fotoğraf Seç veya Sürükle"}
                </div>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button type="submit" style={submitBtnStyle}>
            <CheckCircle size={20} /> Ürünü Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;