const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // GEÇİCİ TEST: MONGO_URI'yi elle yaz
        const mongoURI = "mongodb://localhost:27017/kalemmeydani"; 
        // const mongoURI = process.env.MONGO_URI; // Bu satırı yorumla

        if (!mongoURI) {
            console.error('MongoDB Bağlantı Hatası: MONGO_URI ortam değişkeni tanımlanmamış.');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;