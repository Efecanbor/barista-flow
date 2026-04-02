import express from 'express';
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- TELEGRAM BOT YAPILANDIRMASI ---
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
// Eğer token varsa botu başlat, yoksa null bırak (hata vermemesi için)
const bot = token ? new TelegramBot(token, { polling: false }) : null;

// --- ES MODULES PATH AYARI ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fotoğraflar için statik klasör
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- VERİTABANI BAĞLANTISI ---
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'barista_flow',
});

// --- MULTER AYARLARI ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- API ROUTES ---

// 1. Ürünleri Listele
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY product_name ASC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Yeni Ürün Ekle
app.post('/api/products', upload.single('image'), async (req: any, res: Response) => {
  try {
    const { product_name, category, stock_quantity, min_stock_level, unit } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    await db.query(
      'INSERT INTO products (product_name, category, stock_quantity, min_stock_level, unit, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [product_name, category, stock_quantity, min_stock_level, unit, image_url]
    );
    res.status(201).json({ message: 'Ürün eklendi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Stok Güncelle ve Telegram Bildirimi Gönder
app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Önce stoğu güncelle
    await db.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);

    // Güncel stok ve limit bilgilerini çek
    const [rows]: any = await db.query(
      'SELECT product_name, stock_quantity, min_stock_level, unit FROM products WHERE id = ?', 
      [id]
    );
    const p = rows[0];

    // KRİTİK STOK KONTROLÜ: Stok, limitin altına düştüyse Telegram'a haber ver
    if (bot && chatId && Number(p.stock_quantity) <= Number(p.min_stock_level)) {
      const message = `⚠️ *STOK UYARISI* ⚠️\n\n📌 *Ürün:* ${p.product_name}\n📉 *Kalan:* ${p.stock_quantity} ${p.unit}\n🚨 *Kritik Limit:* ${p.min_stock_level} ${p.unit}\n\n_Lütfen sipariş oluşturun!_`;
      
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' }).catch(e => console.error("Bot Hatası:", e));
    }

    res.json({ message: 'Stok güncellendi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Ürün Sil
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ürün silindi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BaristaFlow API Yayında: http://localhost:${PORT}`);
});