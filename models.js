const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const TravelPlan = sequelize.define('TravelPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    start_date: {
        type: DataTypes.DATEONLY
    },
    end_date: {
        type: DataTypes.DATEONLY
    },
    budget: {
        type: DataTypes.FLOAT
    },
    currency: {
        type: DataTypes.STRING
    },
    is_public: {
        type: DataTypes.BOOLEAN
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    version: true // Вмикає оптимістичне блокування через поле version
});

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING
    },
    latitude: {
        type: DataTypes.FLOAT
    },
    longitude: {
        type: DataTypes.FLOAT
    },
    arrival_date: {
        type: DataTypes.DATE
    },
    departure_date: {
        type: DataTypes.DATE
    },
    budget: {
        type: DataTypes.FLOAT
    },
    notes: {
        type: DataTypes.TEXT
    },
    visit_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

// Зв'язки
TravelPlan.hasMany(Location, {
    as: 'locations',
    foreignKey: 'travel_plan_id',
    onDelete: 'CASCADE'
});
Location.belongsTo(TravelPlan, {
    foreignKey: 'travel_plan_id'
});

module.exports = { TravelPlan, Location };