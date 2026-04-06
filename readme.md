# ☕ BaristaFlow Pro: Akıllı Envanter & Stok Yönetim Sistemi

BaristaFlow Pro; kahve dükkanları için geliştirilmiş, gerçek zamanlı stok takibi, görsel veri analizi ve Telegram entegrasyonlu bildirim sistemlerini sunan **Full-Stack** bir yönetim panelidir.

---

## 🚀 Öne Çıkan Özellikler

- 📊 **Gelişmiş Veri Görselleştirme:** Chart.js ile kategori dağılımı ve stok seviyelerini anlık grafiklerle izleme.
- 🤖 **Akıllı Bildirim Sistemi:** Stoklar kritik limit altına düştüğünde otomatik Telegram mesajı gönderimi.
- 🛠️ **Tam Denetim (CRUD):** Ürün ekleme, silme ve düzenleme (modal ile).
- 🔍 **Akıllı Arama & Filtreleme:** Gerçek zamanlı ürün arama ve kategori filtreleme.
- 🌙 **Modern UX/UI:** Tailwind CSS v4 ile Dark Mode destekli tasarım.

---

## 🛠️ Kurulum

### 1. Frontend (React + TypeScript)

```bash
cd frontend
npm install axios lucide-react chart.js react-chartjs-2 tailwindcss @tailwindcss/vite
```

### 2. Backend (Node.js + Express + MySQL)

```bash
cd backend
npm install express mysql2 cors dotenv multer node-telegram-bot-api
npm install --save-dev @types/express @types/node @types/cors @types/multer
```

---

## ⚙️ Ortam Değişkenleri (.env)

Backend klasöründe `.env` dosyası oluştur:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=sifreniz
DB_NAME=barista_flow
TELEGRAM_TOKEN=bot_tokeniniz
TELEGRAM_CHAT_ID=chat_id_numaraniz
```

---

## ▶️ Uygulamayı Çalıştırma

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## 📈 Yol Haritası

- [x] Ürün düzenleme (Modal)
- [x] Dinamik kategori yönetimi
- [x] Grafik tabanlı analiz
- [x] Telegram stok uyarıları
- [ ] PDF raporlama
- [ ] QR kod ile stok yönetimi
- [ ] Çoklu kullanıcı sistemi

---

## 👨‍💻 Geliştirici

**Efe Can Bor 🚀**