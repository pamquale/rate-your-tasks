#!/bin/sh
export PGUSER="postgres"

psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'djtaskmanager'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE djtaskmanager"

psql -U postgres -d djtaskmanager -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
