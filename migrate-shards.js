const { Sequelize } = require('sequelize'); // Додали це
const { registrySequelize, getShardConnection } = require('./db');

async function migrateAll() {
    console.log("🚀 Починаємо міграцію 16 баз даних...");

    try {
        // Додаємо QueryTypes.SELECT явно через Sequelize
        const shards = await registrySequelize.query("SELECT id_char FROM shards", {
            type: Sequelize.QueryTypes.SELECT
        });

        const ddl = `
            CREATE TABLE IF NOT EXISTS travel_plans (
                id UUID PRIMARY KEY,
                title TEXT,
                description TEXT,
                version INTEGER DEFAULT 0,
                metadata JSONB
            );
        `;

        for (const s of shards) {
            process.stdout.write(`Migrating db_${s.id_char}... `);
            const db = await getShardConnection(s.id_char);
            await db.query(ddl);
            console.log("✅");
        }

        console.log("\n🏁 Всі 16 баз успішно налаштовані!");
    } catch (err) {
        console.error("\n❌ Помилка міграції:", err.message);
    }
    process.exit();
}

migrateAll();