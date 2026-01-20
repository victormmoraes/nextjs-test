#!/bin/bash
set -e

echo "Restoring database from dump..."
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges /docker-entrypoint-initdb.d/regmanager-prod-dump.backup || true
echo "Database restore completed."
