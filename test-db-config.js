// test-db-config.js
require('dotenv').config();

console.log("--- Перевірка зчитування .env ---");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);

const sequelize = require('./db');

sequelize.authenticate()
    .then(() => {
        console.log('Зв\'язок з конфігурацією встановлено (але БД може бути офлайн, поки не в Docker).');
    })
    .catch(err => {
        console.log('Помилка: Скоріш за все, база ще не запущена в Docker, але конфіг зчитано.');
        console.error('Деталі:', err.message);
    });