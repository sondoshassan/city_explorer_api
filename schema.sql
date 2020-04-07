DROP TABLE IF EXISTS location;

CREATE TABLE IF NOT EXISTS location(
id SERIAL PRIMARY KEY, 
city VARCHAR(255),
formatted_query VARCHAR(255),
latitude NUMERIC,
longitude NUMERIC
);

