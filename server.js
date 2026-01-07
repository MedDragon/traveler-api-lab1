const express = require('express');
const sequelize = require('./db');
const { TravelPlan, Location } = require('./models');
require('dotenv').config();

const app = express();
app.use(express.json()); // дозволяє серверу розуміти JSON у запитах

const PORT = process.env.PORT || 3000;

// Функція для запуску сервера
async function startServer() {
    try {
        // sync({ force: false }) створює таблиці, якщо їх немає
        await sequelize.sync({ force: false });
        console.log('✅ Таблиці в базі створено/оновлено.');

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Помилка при запуску:', error);
    }
}

// Простий Test Endpoint
app.get('/health', (req, res) => res.status(200).send('API is working!'));

startServer();