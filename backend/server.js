const express = require('express');
const dotenv = require('dotenv'); // dotenv importu
const cors = require('cors');
const connectDB = require('./config/db');

// Rota dosyalarını import et
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const battleRoutes = require('./routes/battleRoutes');
const userRoutes = require('./routes/userRoutes'); // Kullanıcı profili için

// .env dosyasındaki ortam değişkenlerini yükle
// BU SATIR ÇOK ÖNEMLİ ve process.env kullanılmadan ÖNCE olmalı
dotenv.config();

// Veritabanı bağlantısını başlat
// Bu fonksiyon içinde process.env.MONGO_URI kullanılacak
connectDB();

const app = express();

// CORS (Cross-Origin Resource Sharing) Middleware'i
// Geliştirme ortamında tüm kaynaklardan gelen isteklere izin verir.
// Üretim ortamında daha kısıtlayıcı bir konfigürasyon gerekebilir.
app.use(cors());

// Gelen isteklerin body'sini parse etmek için Middleware'ler
app.use(express.json()); // JSON formatındaki body'leri parse eder
app.use(express.urlencoded({ extended: true })); // URL-encoded formatındaki body'leri parse eder

// Basit bir ana rota (API'nin çalıştığını test etmek için)
app.get('/', (req, res) => {
    res.send('Kalem Meydanı API başarıyla çalışıyor...');
});

// API Rotalarını kullan
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/users', userRoutes);

// Bulunamayan Rotalar için Middleware (404 Hata Yönetimi)
// Eğer yukarıdaki rotalardan hiçbiri eşleşmezse bu middleware çalışır.
app.use((req, res, next) => {
    const error = new Error(`Kaynak Bulunamadı - ${req.originalUrl}`);
    res.status(404);
    next(error); // Hatayı bir sonraki hata yönetimi middleware'ine ilet
});

// Genel Hata Yönetimi Middleware'i
// Tüm 'next(error)' çağrıları buraya gelir.
// Bu middleware her zaman en sonda tanımlanmalıdır.
app.use((err, req, res, next) => {
    // Eğer statusCode set edilmemişse varsayılan olarak 500 (Sunucu Hatası) ata
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Hata detaylarını logla (sunucu tarafında)
    console.error(`[HATA] ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack); // Geliştirme modunda stack trace'i göster
    }

    // İstemciye JSON formatında hata mesajı gönder
    res.json({
        message: err.message,
        // Üretim ortamında stack trace'i istemciye gönderme
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

const PORT = process.env.PORT || 5001; // .env'den portu al veya varsayılan 5001 kullan

app.listen(
    PORT,
    () => { // Arrow function olarak güncellendi (isteğe bağlı)
        console.log(
            `Sunucu ${process.env.NODE_ENV || 'geliştirme'} modunda ${PORT} portunda başarıyla başlatıldı.`
        );
    }
);