const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // щоб не засмічувати консоль зайвими логами SQL
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ База підключена успішно!');
    } catch (error) {
        console.error('❌ Не вдалося підключитися до бази:', error);
    }
}

testConnection();

module.exports = sequelize;