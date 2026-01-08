const { getShardConnection } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function test() {
    // Створюємо 3 випадкові подорожі
    const ids = [uuidv4(), uuidv4(), uuidv4()];

    for (const id of ids) {
        const char = id.slice(-1);
        console.log(`\nInserting ID ending in '${char}' into Shard db_${char}...`);

        const db = await getShardConnection(id);
        await db.query(
            "INSERT INTO travel_plans (id, title, description) VALUES (:id, :title, :desc)",
            { replacements: { id, title: 'Тест шардування', desc: `Цей запис лежить у базі db_${char}` } }
        );

        // Відразу перевіряємо
        const [result] = await db.query("SELECT * FROM travel_plans WHERE id = :id", {
            replacements: { id }, type: 'SELECT'
        });
        console.log(`✅ Знайдено в базі: ${result.description}`);
    }
    process.exit();
}

test();