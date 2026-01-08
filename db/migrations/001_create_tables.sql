-- Створення таблиці планів подорожей
CREATE TABLE IF NOT EXISTS "TravelPlans" (
                                             "id" UUID PRIMARY KEY,
                                             "title" VARCHAR(200) NOT NULL,
    "description" TEXT,                      -- ДОДАТИ ЦЕ
    "start_date" TIMESTAMP WITH TIME ZONE,
    "end_date" TIMESTAMP WITH TIME ZONE,
                             "budget" DECIMAL(10, 2),
    "currency" VARCHAR(3),
    "is_public" BOOLEAN DEFAULT false,       -- ДОДАТИ ЦЕ
    "version" INTEGER DEFAULT 1,
    "metadata" JSONB DEFAULT '{}' NOT NULL,  -- ДОДАТИ ЦЕ (Лаба №8)
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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