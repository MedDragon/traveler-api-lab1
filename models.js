const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const TravelPlan = sequelize.define('TravelPlan', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT // Додано (було в psql)
    },
    start_date: {
        type: DataTypes.DATE // timestamp with time zone
    },
    end_date: {
        type: DataTypes.DATE // timestamp with time zone
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2) // numeric(10,2)
    },
    currency: {
        type: DataTypes.STRING(3)
    },
    is_public: {
        type: DataTypes.BOOLEAN, // Додано (було в psql)
        defaultValue: false
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // Ключове поле Лабораторної №8
    metadata: {
        type: DataTypes.JSONB, // Додано (наша міграція)
        allowNull: false,
        defaultValue: {}
    }
}, {
    tableName: 'TravelPlans', // Велика літера, як у psql
    timestamps: true,         //createdAt та updatedAt (були в psql)
    version: true
});

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
    travel_plan_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'Locations', // Велика літера, як у psql
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