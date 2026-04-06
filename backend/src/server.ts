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

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const bot = token ? new TelegramBot(token, { polling: false }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'barista_flow',
});

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => { cb(null, uploadDir); },
    filename: (_req, file, cb) => { cb(null, `${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage: storage });

// --- API ROUTES ---

// 1. TÜM ÜRÜNLERİ GETİR
app.get('/api/products', async (_req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY product_name ASC');
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. YENİ ÜRÜN EKLE
app.post('/api/products', upload.single('image'), async (req: Request, res: Response) => {
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

// 🚀 3. ÜRÜNÜ KOMPLE GÜNCELLE (YENİ EKLENDİ - MODAL İÇİN)
app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { product_name, category, stock_quantity, min_stock_level, unit } = req.body;
        
        const sql = `
            UPDATE products 
            SET product_name = ?, category = ?, stock_quantity = ?, min_stock_level = ?, unit = ? 
            WHERE id = ?
        `;
        
        await db.query(sql, [product_name, category, stock_quantity, min_stock_level, unit, id]);
        res.json({ message: 'Ürün başarıyla güncellendi.' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. SADECE STOK MİKTARINI DEĞİŞTİR (+ / - butonları için)
app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        await db.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);
        
        const [rows]: any = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        const p = rows[0];

        // Telegram bildirimi gönder (Kritik seviyenin altına düşerse)
        if (bot && chatId && Number(p.stock_quantity) <= Number(p.min_stock_level)) {
            const message = `⚠️ *STOK UYARISI*\n\n📌 *Ürün:* ${p.product_name}\n📉 *Kalan:* ${p.stock_quantity} ${p.unit}\n🚨 *Limit:* ${p.min_stock_level}`;
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' }).catch(e => console.error("Bot Hatası:", e));
        }
        
        res.json({ message: 'Güncellendi', current_stock: p.stock_quantity });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 5. ÜRÜNÜ SİL
app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Silindi' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API: http://localhost:${PORT}`));