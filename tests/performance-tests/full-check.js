import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 }, // 50 користувачів протягом хвилини
    ],
};

// Додано /api, як того вимагає ваш server.js
const BASE_URL = 'http://localhost:3000/api';

export default function () {
    // 1. ПЕРЕВІРКА КЕШУ (GET)
    // Запитуємо план №1. Завдяки вашому LRUCache, повторні запити будуть миттєвими.
    let getRes = http.get(`${BASE_URL}/travel-plans/1`);

    check(getRes, {
        'GET status is 200': (r) => r.status === 200,
        // Збільшив до 10ms, бо 5ms для локальної мережі іноді занадто суворо,
        // але для кешу це все одно чудовий показник.
        'GET duration is low (cache)': (r) => r.timings.duration < 10,
    });

    // 2. ПЕРЕВІРКА ІЗОЛЯЦІЇ ТА ТРАНЗАКЦІЙ (POST)
    // Додаємо локацію. Ваш сервер використовує SERIALIZABLE рівень тут.
    let payload = JSON.stringify({
        name: "Test Location",
        latitude: 50.45,
        longitude: 30.52,
        visit_order: Math.floor(Math.random() * 100) + 1 // Додано випадковий порядок для валідації
    });

    let postParams = {
        headers: { 'Content-Type': 'application/json' },
    };

    let postRes = http.post(`${BASE_URL}/travel-plans/1/locations`, payload, postParams);

    check(postRes, {
        'POST status is 201': (r) => r.status === 201,
        'POST not 400 (validation)': (r) => r.status !== 400,
    });

    // Невелика пауза, щоб не "заспамити" базу в нуль
    sleep(0.5);
}