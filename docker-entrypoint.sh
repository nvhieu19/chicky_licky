
#!/bin/sh
set -e

echo "======================================"
echo " CHICKY LICKY - INITIALIZING DATABASE"
echo "======================================"

echo "Applying Prisma schema to MySQL..."

./node_modules/.bin/prisma db push --skip-generate

echo "Database schema is ready."
echo "Starting Next.js production server..."

exec node server.js
