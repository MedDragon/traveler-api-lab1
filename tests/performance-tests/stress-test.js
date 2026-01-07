import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENDPOINTS } from './config/endpoints.js';
import { generateTravelPlan } from './utils/data-generator.js';

export const options = {
    stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 600 }, // Критичне навантаження
        { duration: '5m', target: 0 },   // Поступове відновлення
    ],
};

export default function () {
    const res = http.post(ENDPOINTS.TRAVEL_PLANS, JSON.stringify(generateTravelPlan()), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'status is 201': (r) => r.status === 201 });
    sleep(1);
}