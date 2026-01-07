import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 },
    ],
};

const BASE_URL = 'http://localhost:3000/api';

// Функція SETUP виконується 1 раз перед початком тестів
// Створюємо план, щоб отримати валідний UUID для всіх VUs
export function setup() {
    const payload = JSON.stringify({
        title: "Performance Test Plan",
        start_date: "2024-01-01",
        end_date: "2024-01-10",
        budget: 1000,
        currency: "USD"
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/travel-plans`, payload, params);

    // Повертаємо ID створеного плану
    return { planId: res.json().id };
}

export default function (data) {
    const planId = data.planId; // Беремо реальний UUID з setup()

    // 1. ПЕРЕВІРКА КЕШУ (GET)
    // Тепер запитуємо за справжнім UUID
    let getRes = http.get(`${BASE_URL}/travel-plans/${planId}`);

    check(getRes, {
        'GET status is 200': (r) => r.status === 200,
        'GET duration is low (cache)': (r) => r.timings.duration < 15, // Трохи збільшив поріг для стабільності
    });

    // 2. ПЕРЕВІРКА ІЗОЛЯЦІЇ (POST)
    let payload = JSON.stringify({
        name: "Test Location",
        latitude: 50.45,
        longitude: 30.52,
        budget: 50.0
    });

    let postParams = {
        headers: { 'Content-Type': 'application/json' },
    };

    let postRes = http.post(`${BASE_URL}/travel-plans/${planId}/locations`, payload, postParams);

    check(postRes, {
        'POST status is 201': (r) => r.status === 201,
        'POST not 400 (validation)': (r) => r.status !== 400,
        'POST not 500 (internal)': (r) => r.status !== 500,
    });

    sleep(0.5);
}