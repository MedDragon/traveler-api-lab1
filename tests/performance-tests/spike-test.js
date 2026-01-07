import http from 'k6/http';
import { check, sleep } from 'k6';
import { ENDPOINTS } from './config/endpoints.js';
import { generateTravelPlan } from './utils/data-generator.js';

export const options = {
    stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 1000 }, // Різкий сплеск до 1000
        { duration: '30s', target: 0 },   // Різке падіння
    ],
};

export default function () {
    const res = http.post(ENDPOINTS.TRAVEL_PLANS, JSON.stringify(generateTravelPlan()), {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'status is 201': (r) => r.status === 201 });
    sleep(1);
}