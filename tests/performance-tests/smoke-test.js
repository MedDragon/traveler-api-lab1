import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENDPOINTS } from './config/endpoints.js';
import { generateTravelPlan } from './utils/data-generator.js';

export const options = {
    vus: 1,            // 1 віртуальний користувач
    duration: '5s',    // тривалість 5 секунд
};

export default function () {
    const payload = JSON.stringify(generateTravelPlan());
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(ENDPOINTS.TRAVEL_PLANS, payload, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
        'has id': (r) => JSON.parse(r.body).id !== undefined,
    });

    sleep(1); // пауза 1 секунда між запитами
}