#!/bin/bash
set -e

# Виконуємо міграції (створення таблиць) на обох серверах
for f in /docker-entrypoint-migrations/*.sql; do
    echo "Running migration $f..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
done

# Якщо це Publisher (основна база)
if [ -d "/docker-entrypoint-replications/publisher" ]; then
    for f in /docker-entrypoint-replications/publisher/*.sql; do
        echo "Running publisher setup $f..."
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
    done
fi

# Якщо це Subscriber (репліка)
if [ -d "/docker-entrypoint-replications/subscriber" ]; then
    for f in /docker-entrypoint-replications/subscriber/*.sql; do
        echo "Running subscriber setup $f..."
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
    done
fi