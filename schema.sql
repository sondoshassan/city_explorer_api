DROP TABLE IF EXISTS location;

CREATE TABLE IF NOT EXISTS location(
id SERIAL PRIMARY KEY, 
city VARCHAR(255),
formatted_query VARCHAR(255),
latitude NUMERIC,
longitude NUMERIC
);

DROP TABLE IF EXISTS movies;

CREATE TABLE IF NOT EXISTS movies(
id SERIAL PRIMARY KEY, 
city VARCHAR(255),
title VARCHAR(255),
overview VARCHAR(600),
average_votes NUMERIC,
total_votes NUMERIC,
image_url VARCHAR(600),
popularity NUMERIC,
released_on VARCHAR(255)
);

