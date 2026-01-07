import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENDPOINTS } from './config/endpoints.js';
import { generateTravelPlan } from './utils/data-generator.js';

export const options = {
    stages: [
        { duration: '2m', target: 50 },  // Наростання
        { duration: '30m', target: 50 }, // Тримаємо 30 хвилин (згідно з лабою)
        { duration: '2m', target: 0 },   // Зниження
    ],
};

export default function () {
    const res = http.post(ENDPOINTS.TRAVEL_PLANS, JSON.stringify(generateTravelPlan()), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'status is 201': (r) => r.status === 201 });
    sleep(1);
}