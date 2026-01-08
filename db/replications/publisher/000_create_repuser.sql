-- Створюємо користувача для реплікації
CREATE ROLE repuser WITH REPLICATION LOGIN PASSWORD 'reppassword';

-- Надаємо права на таблиці
GRANT SELECT ON ALL TABLES IN SCHEMA public TO repuser;

-- Створюємо публікацію для всіх таблиць
CREATE PUBLICATION my_publication FOR ALL TABLES;