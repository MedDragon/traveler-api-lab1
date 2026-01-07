const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const TravelPlan = sequelize.define('TravelPlan', {
    id: {
        type: DataTypes.UUID,          // Змінено з INTEGER
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4 // Додано автоматичну генерацію UUID
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
    version: true
});

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,          // Змінено з INTEGER
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4 // Додано автоматичну генерацію UUID
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
    },
    // Важливо: додаємо опис зовнішнього ключа тут, щоб він теж був UUID
    travel_plan_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: false
});

// Зв'язки залишаються такими ж, Sequelize сам підхопить типи
TravelPlan.hasMany(Location, {
    as: 'locations',
    foreignKey: 'travel_plan_id',
    onDelete: 'CASCADE'
});
Location.belongsTo(TravelPlan, {
    foreignKey: 'travel_plan_id'
});

module.exports = { TravelPlan, Location };