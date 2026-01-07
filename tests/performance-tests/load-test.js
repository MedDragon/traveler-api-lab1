import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENDPOINTS } from './config/endpoints.js';
import { generateTravelPlan } from './utils/data-generator.js';

export const options = {
    stages: [
        { duration: '1m', target: 100 }, // Наростання до 100 користувачів
        { duration: '3m', target: 100 }, // Утримання 100 користувачів
        { duration: '1m', target: 0 },   // Зниження до 0
    ],
};

export default function () {
    const res = http.post(ENDPOINTS.TRAVEL_PLANS, JSON.stringify(generateTravelPlan()), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'status is 201': (r) => r.status === 201 });
    sleep(1);
}