
-- ============================================================
-- init.sql — PostgreSQL schema for the Ocado Library API
-- Use this in docker-compose to initialise the database.
-- ============================================================

-- Clean up existing tables (in dependency order)
DROP TABLE IF EXISTS description_tags CASCADE;
DROP TABLE IF EXISTS notification_log CASCADE;
DROP TABLE IF EXISTS item CASCADE;
DROP TABLE IF EXISTS journal CASCADE;
DROP TABLE IF EXISTS book_description CASCADE;
DROP TABLE IF EXISTS board_game_description CASCADE;
DROP TABLE IF EXISTS psgame_description CASCADE;
DROP TABLE IF EXISTS description CASCADE;

-- ===================
-- Base description table (parent in JOINED inheritance)
-- ===================
CREATE TABLE description (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000)
);

-- ===================
-- Subtype tables (only subclass-specific columns + FK to parent)
-- ===================
CREATE TABLE book_description (
    id BIGINT PRIMARY KEY REFERENCES description(id),
    author VARCHAR(255),
    category VARCHAR(255),
    image VARCHAR(255)
);

CREATE TABLE board_game_description (
    id BIGINT PRIMARY KEY REFERENCES description(id),
    number_of_players INTEGER,
    bgg_link VARCHAR(255)
);

CREATE TABLE psgame_description (
    id BIGINT PRIMARY KEY REFERENCES description(id)
);

-- ===================
-- Element collection for tags
-- ===================
CREATE TABLE description_tags (
    description_id BIGINT NOT NULL REFERENCES description(id),
    tags VARCHAR(255)
);

-- ===================
-- Physical item copies
-- ===================
CREATE TABLE item (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    internal_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(255) NOT NULL,
    borrower VARCHAR(255),
    description_id BIGINT NOT NULL REFERENCES description(id)
);

-- ===================
-- In-app / Slack notification log
-- ===================
CREATE TABLE notification_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_internal_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    sent_at TIMESTAMP NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- ===================
-- Audit journal
-- ===================
CREATE TABLE journal (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    datetime TIMESTAMP NOT NULL,
    description VARCHAR(255) NOT NULL,
    user_email  VARCHAR(255) NOT NULL
);

