// const { Sequelize } = require('sequelize');
// require('dotenv').config();
//
// /**
//  * Створення екземпляру Sequelize.
//  * Ми додаємо параметр isolationLevel у dialectOptions,
//  * щоб можна було глобально тестувати різні рівні для Бонусного завдання №3.
//  */
// const sequelize = process.env.DATABASE_URL
//     ? new Sequelize(process.env.DATABASE_URL, {
//         dialect: 'postgres',
//         logging: false,
//         // Опціонально для Бонусу 3: можна задати рівень ізоляції за замовчуванням тут
//         // або керувати ним безпосередньо в транзакціях у server.js
//         dialectOptions: {
//             // За замовчуванням PostgreSQL використовує 'READ COMMITTED'
//         },
//         pool: {
//             max: 20,       // Збільшуємо пул для Stress/Spike тестів
//             min: 0,
//             acquire: 30000,
//             idle: 10000
//         }
//     })
//     : new Sequelize(
//         process.env.DB_NAME || 'traveler_db',
//         process.env.DB_USER || 'postgres',
//         process.env.DB_PASS || 'password',
//         {
//             host: process.env.DB_HOST || '127.0.0.1',
//             dialect: 'postgres',
//             logging: false,
//             pool: {
//                 max: 20,
//                 min: 0,
//                 acquire: 30000,
//                 idle: 10000
//             }
//         }
//     );
//
// module.exports = sequelize;
//це з лаби 2


const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // щоб не засмічувати консоль запитами
    }
);

module.exports = sequelize;