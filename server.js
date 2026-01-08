const express = require('express');
const { Sequelize } = require('sequelize');
const sequelize = require('./db');
const { TravelPlan, Location } = require('./models');
const { LRUCache } = require('lru-cache');
require('dotenv').config();

const app = express();
app.use(express.json());

// --- БОНУС №4: LRU CACHE ---
const plansCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 5,
});

// 0. Обробка помилок JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: "Validation error: Malformed JSON" });
    }
    next();
});

// --- ДОПОМІЖНІ ФУНКЦІЇ ВАЛІДАЦІЇ ---
const validatePlan = (data, isUpdate = false) => {
    // Додано нові поля: description, is_public, metadata
    const { title, start_date, end_date, budget, currency, version, description, is_public, metadata } = data;

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) return "Validation error: empty title";
        if (title.length > 200) return "Validation error: title too long";
    } else if (!isUpdate) return "Validation error: title is required";

    if (isUpdate && (version === undefined || version === null || version <= 0)) {
        return "Validation error: version required and must be positive";
    }

    // Валідація JSONB ( metadata )
    if (metadata !== undefined && (typeof metadata !== 'object' || Array.isArray(metadata) || metadata === null)) {
        return "Validation error: metadata must be an object";
    }

    if (start_date && isNaN(new Date(start_date).getTime())) return "Validation error: invalid start_date";
    if (end_date && isNaN(new Date(end_date).getTime())) return "Validation error: invalid end_date";
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) return "Validation error: dates range";

    if (budget !== undefined && budget !== null) {
        if (budget < 0) return "Validation error: negative budget";
    }

    if (currency !== undefined && currency !== null && !/^[A-Z]{3}$/.test(currency)) return "Validation error: invalid currency";

    // Перевірка типу для нових полів
    if (description !== undefined && typeof description !== 'string') return "Validation error: description must be string";
    if (is_public !== undefined && typeof is_public !== 'boolean') return "Validation error: is_public must be boolean";

    return null;
};

const validateLocation = (data) => {
    const { name, latitude, longitude, arrival_date, departure_date, budget } = data;
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) return "Validation error: invalid name";
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) return "Validation error: lat out of range";
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) return "Validation error: lng out of range";
    if (arrival_date && isNaN(new Date(arrival_date).getTime())) return "Validation error: arrival date";
    if (departure_date && isNaN(new Date(departure_date).getTime())) return "Validation error: departure date";
    if (budget !== undefined && budget < 0) return "Validation error: negative budget";
    return null;
};

// --- МАРШРУТИ ---

app.post('/api/travel-plans', async (req, res) => {
    const error = validatePlan(req.body);
    if (error) return res.status(400).json({ error });
    try {
        const plan = await TravelPlan.create(req.body);
        res.status(201).json(plan);
    } catch (e) {
        res.status(400).json({ error: "Validation error" });
    }
});

app.get('/api/travel-plans', async (req, res) => {
    const plans = await TravelPlan.findAll({ include: [{ model: Location, as: 'locations' }] });
    res.json(plans);
});

app.get('/api/travel-plans/:id', async (req, res) => {
    const { id } = req.params;
    const cachedData = plansCache.get(id);
    if (cachedData) return res.json(cachedData);

    const plan = await TravelPlan.findByPk(id, {
        include: [{ model: Location, as: 'locations' }],
        order: [[ { model: Location, as: 'locations' }, 'visit_order', 'ASC']]
    });

    if (!plan) return res.status(404).json({ error: 'plan not found' });

    const data = plan.toJSON();
    data.current_version = data.version;
    plansCache.set(id, data);
    res.json(data);
});

app.put('/api/travel-plans/:id', async (req, res) => {
    const error = validatePlan(req.body, true);
    if (error) return res.status(400).json({ error });

    const plan = await TravelPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'plan not found' });

    if (plan.version !== req.body.version) {
        return res.status(409).json({ error: "Conflict: modified", current_version: plan.version });
    }

    await plan.update({ ...req.body, version: plan.version + 1 });
    plansCache.delete(req.params.id);

    const updated = await plan.reload({ include: [{ model: Location, as: 'locations' }] });
    const data = updated.toJSON();
    data.current_version = data.version;
    res.json(data);
});

app.post('/api/travel-plans/:id/locations', async (req, res) => {
    if (!req.body.name) return res.status(400).json({ error: "Validation error: name required" });
    const error = validateLocation(req.body);
    if (error) return res.status(400).json({ error });

    try {
        const result = await sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async (t) => {
            const plan = await TravelPlan.findByPk(req.params.id, { transaction: t });
            if (!plan) return null;

            const maxOrder = await Location.max('visit_order', { where: { travel_plan_id: req.params.id }, transaction: t }) || 0;
            const location = await Location.create({ ...req.body, travel_plan_id: req.params.id, visit_order: maxOrder + 1 }, { transaction: t });
            await plan.update({ version: plan.version + 1 }, { transaction: t });

            return location;
        });

        if (!result) return res.status(404).json({ error: "plan not found" });
        plansCache.delete(req.params.id);
        res.status(201).json(result);
    } catch (e) { res.status(400).json({ error: "Validation error" }); }
});

app.put('/api/locations/:id', async (req, res) => {
    const error = validateLocation(req.body);
    if (error) return res.status(400).json({ error });

    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ error: 'location not found' });

    await sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, async (t) => {
        await location.update(req.body, { transaction: t });
        const plan = await TravelPlan.findByPk(location.travel_plan_id, { transaction: t });
        await plan.update({ version: plan.version + 1 }, { transaction: t });
    });

    plansCache.delete(location.travel_plan_id.toString());
    res.json(await location.reload());
});

app.delete('/api/locations/:id', async (req, res) => {
    const loc = await Location.findByPk(req.params.id);
    if (loc) {
        const planId = loc.travel_plan_id;
        await loc.destroy();
        const plan = await TravelPlan.findByPk(planId);
        if (plan) await plan.update({ version: plan.version + 1 });
        plansCache.delete(planId.toString());
    }
    res.status(204).send();
});

app.delete('/api/travel-plans/:id', async (req, res) => {
    await TravelPlan.destroy({ where: { id: req.params.id } });
    plansCache.delete(req.params.id);
    res.status(204).send();
});

app.get('/health', (req, res) => res.status(200).send('OK'));

sequelize.sync({ force: false }).then(() => {
    app.listen(3000, () => console.log(`🚀 Server on http://localhost:3000`));
});