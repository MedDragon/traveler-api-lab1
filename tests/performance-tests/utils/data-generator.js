export function generateTravelPlan() {
    return {
        title: `Perf Trip ${Math.floor(Math.random() * 1000000)}`,
        budget: parseFloat((Math.random() * 5000).toFixed(2)),
        currency: "USD",
        start_date: "2026-01-01",
        end_date: "2026-01-15"
    };
}