#!/bin/bash
set -e

# Розбиваємо список ID, переданий через змінні оточення
for id in $START_IDS; do
  echo "Creating database: db_$id"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE db_$id;
EOSQL
done