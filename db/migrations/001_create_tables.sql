-- Створення таблиці планів подорожей
CREATE TABLE IF NOT EXISTS "TravelPlans" (
                                             "id" UUID PRIMARY KEY,
                                             "title" VARCHAR(200) NOT NULL,
    "start_date" TIMESTAMP WITH TIME ZONE,
    "end_date" TIMESTAMP WITH TIME ZONE,
                             "budget" DECIMAL(10, 2),
    "currency" VARCHAR(3),
    "version" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
                             );

-- Створення таблиці локацій
CREATE TABLE IF NOT EXISTS "Locations" (
                                           "id" UUID PRIMARY KEY,
                                           "name" VARCHAR(200) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "arrival_date" TIMESTAMP WITH TIME ZONE,
    "departure_date" TIMESTAMP WITH TIME ZONE,
                                   "budget" DECIMAL(10, 2),
    "visit_order" INTEGER,
    "travel_plan_id" UUID REFERENCES "TravelPlans"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
                                   );