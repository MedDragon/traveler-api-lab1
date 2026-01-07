const { Sequelize } = require('sequelize');
require('dotenv').config();

// Використовуємо DATABASE_URL, якщо він є, інакше — окремі змінні
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false
        }
    );

module.exports = sequelize;