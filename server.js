const express = require('express');
const sequelize = require('./db');
const { TravelPlan, Location } = require('./models');
require('dotenv').config();

const app = express();
app.use(express.json());

// 0. Обробка помилок JSON (Test 28 у validation.hurl)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: "Validation error: Malformed JSON" });
    }
    next();
});

// --- ДОПОМІЖНІ ФУНКЦІЇ ВАЛІДАЦІЇ ---

const validatePlan = (data, isUpdate = false) => {
    const { title, start_date, end_date, budget, currency, version } = data;

    // Валідація заголовка
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) return "Validation error: empty title";
        if (title.length > 200) return "Validation error: title too long";
    } else if (!isUpdate) {
        return "Validation error: title is required";
    }

    // Валідація версії для Update (Test 11, 12, 13)
    if (isUpdate) {
        if (version === undefined || version === null || version <= 0) {
            return "Validation error: version required and must be positive";
        }
    }

    // Валідація дат
    if (start_date && isNaN(new Date(start_date).getTime())) return "Validation error: invalid start_date";
    if (end_date && isNaN(new Date(end_date).getTime())) return "Validation error: invalid end_date";
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) return "Validation error: dates range";

    // Валідація бюджету (Test 6, 9)
    if (budget !== undefined && budget !== null) {
        if (budget < 0) return "Validation error: negative budget";
        // Математичне виправлення для 2500.99 (Floating point fix)
        if (Math.abs(budget * 100 - Math.round(budget * 100)) > 0.001) return "Validation error: too many decimals";
    }

    // Валідація валюти (Test 7, 8)
    if (currency !== undefined && currency !== null) {
        if (!/^[A-Z]{3}$/.test(currency)) return "Validation error: invalid currency";
    }
    return null;
};

const validateLocation = (data) => {
    const { name, latitude, longitude, arrival_date, departure_date, budget } = data;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) return "Validation error: invalid name";
        if (name.length > 200) return "Validation error: name too long";
    }

    // Координати (Test 17, 18, 30)
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) return "Validation error: lat out of range";
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) return "Validation error: lng out of range";

    // Дати (Test 19, 21)
    if (arrival_date && isNaN(new Date(arrival_date).getTime())) return "Validation error: arrival date";
    if (departure_date && isNaN(new Date(departure_date).getTime())) return "Validation error: departure date";
    if (arrival_date && departure_date && new Date(arrival_date) > new Date(departure_date)) return "Validation error: time range";

    // Бюджет (Test 20)
    if (budget !== undefined && budget < 0) return "Validation error: negative budget";
    return null;
};

// --- МАРШРУТИ ---

// Створення плану
app.post('/api/travel-plans', async (req, res) => {
    const error = validatePlan(req.body);
    if (error) return res.status(400).json({ error });
    try {
        const plan = await TravelPlan.create(req.body);
        res.status(201).json(plan);
    } catch (e) { res.status(400).json({ error: "Validation error" }); }
});

app.get('/api/travel-plans', async (req, res) => {
    const plans = await TravelPlan.findAll({ include: [{ model: Location, as: 'locations' }] });
    res.json(plans);
});

app.get('/api/travel-plans/:id', async (req, res) => {
    const plan = await TravelPlan.findByPk(req.params.id, {
        include: [{ model: Location, as: 'locations' }],
        order: [[ { model: Location, as: 'locations' }, 'visit_order', 'ASC']]
    });
    if (!plan) return res.status(404).json({ error: 'plan not found' });
    const data = plan.toJSON();
    data.current_version = data.version;
    res.json(data);
});

// Оновлення плану
app.put('/api/travel-plans/:id', async (req, res) => {
    const error = validatePlan(req.body, true);
    if (error) return res.status(400).json({ error });

    const plan = await TravelPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'plan not found' });

    if (plan.version !== req.body.version) {
        return res.status(409).json({ error: "Conflict: modified", current_version: plan.version });
    }

    await plan.update({ ...req.body, version: plan.version + 1 });
    const updated = await plan.reload({ include: [{ model: Location, as: 'locations' }] });
    const data = updated.toJSON();
    data.current_version = data.version;
    res.json(data);
});

// Додавання локації
app.post('/api/travel-plans/:id/locations', async (req, res) => {
    if (!req.body.name) return res.status(400).json({ error: "Validation error: name required" });
    const error = validateLocation(req.body);
    if (error) return res.status(400).json({ error });

    try {
        const result = await sequelize.transaction(async (t) => {
            const plan = await TravelPlan.findByPk(req.params.id, { transaction: t });
            if (!plan) return null;

            const maxOrder = await Location.max('visit_order', { where: { travel_plan_id: req.params.id }, transaction: t }) || 0;
            const location = await Location.create({ ...req.body, travel_plan_id: req.params.id, visit_order: maxOrder + 1 }, { transaction: t });
            await plan.update({ version: plan.version + 1 }, { transaction: t });
            return location;
        });
        if (!result) return res.status(404).json({ error: "plan not found" });
        res.status(201).json(result);
    } catch (e) { res.status(400).json({ error: "Validation error" }); }
});

// Оновлення локації
app.put('/api/locations/:id', async (req, res) => {
    const error = validateLocation(req.body);
    if (error) return res.status(400).json({ error });

    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ error: 'location not found' });

    await sequelize.transaction(async (t) => {
        await location.update(req.body, { transaction: t });
        const plan = await TravelPlan.findByPk(location.travel_plan_id, { transaction: t });
        await plan.update({ version: plan.version + 1 }, { transaction: t });
    });
    res.json(await location.reload());
});

app.delete('/api/locations/:id', async (req, res) => {
    const loc = await Location.findByPk(req.params.id);
    if (loc) {
        const plan = await TravelPlan.findByPk(loc.travel_plan_id);
        await loc.destroy();
        if (plan) await plan.update({ version: plan.version + 1 });
    }
    res.status(204).send();
});

app.delete('/api/travel-plans/:id', async (req, res) => {
    await TravelPlan.destroy({ where: { id: req.params.id } });
    res.status(204).send();
});

app.get('/health', (req, res) => res.status(200).send('OK'));

sequelize.sync({ force: true }).then(() => {
    app.listen(3000, () => console.log(`🚀 Server on http://localhost:3000`));
});