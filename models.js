const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // ЦЬОГО РЯДКА НЕ ВИСТАЧАЛО

const TravelPlan = sequelize.define('TravelPlan', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    budget: { type: DataTypes.FLOAT },
    currency: { type: DataTypes.STRING },
    is_public: { type: DataTypes.BOOLEAN },
    version: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
    version: true
});

const Location = sequelize.define('Location', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    arrival_date: { type: DataTypes.DATE },
    departure_date: { type: DataTypes.DATE },
    budget: { type: DataTypes.FLOAT },
    notes: { type: DataTypes.TEXT },
    visit_order: { type: DataTypes.INTEGER, allowNull: false }
}, {
    timestamps: false
});

TravelPlan.hasMany(Location, { as: 'locations', foreignKey: 'travel_plan_id', onDelete: 'CASCADE' });
Location.belongsTo(TravelPlan, { foreignKey: 'travel_plan_id' });

module.exports = { TravelPlan, Location };