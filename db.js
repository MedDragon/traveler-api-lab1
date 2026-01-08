const { Sequelize } = require('sequelize');

// Визначаємо URL реєстру залежно від оточення
const registryUrl = process.env.DOCKER_ENV
    ? 'postgres://travel_user:123rty789@postgres_registry:5432/registry_db'
    : 'postgres://travel_user:123rty789@localhost:5431/registry_db';

const registrySequelize = new Sequelize(registryUrl, { logging: false });

const connections = new Map();

async function getShardConnection(id) {
    const shardKey = id.slice(-1).toLowerCase();
    if (connections.has(shardKey)) return connections.get(shardKey);

    const [shard] = await registrySequelize.query(
        "SELECT host, db_name FROM shards WHERE id_char = :key",
        { replacements: { key: shardKey }, type: Sequelize.QueryTypes.SELECT }
    );

    if (!shard) throw new Error("Shard not found for: " + shardKey);

    // Мапінг портів для локального запуску
    const portMap = { 'postgres_00': 5432, 'postgres_01': 5433, 'postgres_02': 5434, 'postgres_03': 5435 };

    const sequelize = new Sequelize(shard.db_name, 'travel_user', '123rty789', {
        host: process.env.DOCKER_ENV ? shard.host : 'localhost',
        port: process.env.DOCKER_ENV ? 5432 : portMap[shard.host],
        dialect: 'postgres',
        logging: false
    });

    connections.set(shardKey, sequelize);
    return sequelize;
}

module.exports = { getShardConnection, registrySequelize };