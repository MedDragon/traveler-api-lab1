const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Модель Плану подорожі
const TravelPlan = sequelize.define('TravelPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    budget: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    version: true, // ВКЛЮЧАЄ ОПТИМІСТИЧНЕ БЛОКУВАННЯ (колонка version)
    timestamps: true // додає createdAt та updatedAt
});

// Модель Локації
const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

// Зв'язок: Один план має багато локацій
TravelPlan.hasMany(Location, { foreignKey: 'plan_id', onDelete: 'CASCADE' });
Location.belongsTo(TravelPlan, { foreignKey: 'plan_id' });

module.exports = { TravelPlan, Location };