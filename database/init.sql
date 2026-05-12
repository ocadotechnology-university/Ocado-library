-- -- Metadane książek (opis)
-- CREATE TABLE book_description (
--     id SERIAL PRIMARY KEY, -- ID łączące opis książki z fizycznym obiektem
--     title VARCHAR(255) NOT NULL,
--     author VARCHAR(255) NOT NULL,
--     description TEXT,
--     image VARCHAR(255) -- URL do obrazu przechowywanego lokalnie
-- );
--
-- -- Tabela dla gier planszowych
-- CREATE TABLE board_game_description (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     number_of_players VARCHAR(50),
--     description TEXT
-- );
--
-- -- Tabela dla gier PS5
-- CREATE TABLE ps5_game (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     description TEXT
-- );
--
-- -- Tabela dla przedmiotów (fizyczne obiekty)
-- CREATE TABLE items (
--     id SERIAL PRIMARY KEY, -- Wewnętrzne ID dla bazy danych (raczej nie będzie używane)
--     internal_id VARCHAR(50) UNIQUE NOT NULL, -- ID przypisywane jako OC-WR-x-xxxx
--     status VARCHAR(50) DEFAULT  'AVAILABLE', -- Status domyślny jako AVAILABLE
--     type VARCHAR(50) NOT NULL,
--     description_id INT NOT NULL, -- Referencja do metadanych książki (autor, opis, kategoria, itd...)
--     borrower VARCHAR(255)
--
--     FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id)
-- );
--
-- -- Tabela dla tagów
-- CREATE TABLE tags (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) UNIQUE NOT NULL
-- );
--
--
--
-- -- Tabela do oczekiwania na książkę
-- CREATE TABLE book_waitlist (
--     id SERIAL PRIMARY KEY,
--     book_description_id INT NOT NULL, -- Na jaką książkę oczekujemy
--     waiter_name VARCHAR(255) NOT NULL, -- Kto oczekuje
--     joined_queue_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kto wcześniej zaczął czekać
--     FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id) ON DELETE CASCADE -- Integralność przy usuwaniu
-- );
--
-- -- Tabela dla historii zdarzeń
-- CREATE TABLE journal (
--     id SERIAL PRIMARY KEY,
--     user VARCHAR(255), -- Kto wprowadził zmianę
--     description TEXT, -- Opis zmiany w tekście (ktoś coś wypożyczył, ktoś coś zwrócił, itd...)
--     date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Data zdarzenia
-- );
--
--
--

-- ============================================================
-- init.sql — PostgreSQL schema for the Ocado Library API
-- Use this in docker-compose to initialise the database.
-- ============================================================

-- Clean up existing tables (in dependency order)
DROP TABLE IF EXISTS description_tags CASCADE;
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
-- Audit journal
-- ===================
CREATE TABLE journal (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    datetime TIMESTAMP NOT NULL,
    description VARCHAR(255) NOT NULL,
    user_email  VARCHAR(255) NOT NULL
);

