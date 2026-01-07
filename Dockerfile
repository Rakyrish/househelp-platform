# Use PostgreSQL 15 as the base image
FROM postgres:15

# Install PostGIS
RUN apt-get update && apt-get install -y \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# Create the PostGIS extension in the database upon initialization
RUN echo "CREATE EXTENSION IF NOT EXISTS postgis;" > /docker-entrypoint-initdb.d/postgis.sql
