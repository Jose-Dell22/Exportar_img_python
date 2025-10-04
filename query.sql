SELECT datname, pg_encoding_to_char(encoding) AS encoding
FROM pg_database;


CREATE DATABASE personas_db
  WITH OWNER = postgres
  ENCODING = 'UTF8'
  TEMPLATE template0
  LC_COLLATE='es_ES.UTF-8'
  LC_CTYPE='es_ES.UTF-8';
CREATE TABLE personas (
    id_persona INT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    foto_gridfs_id VARCHAR(100)
);
