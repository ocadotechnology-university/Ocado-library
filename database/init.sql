-- Tabela dla książek
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    edition VARCHAR(50),
    status VARCHAR(50),
    borrower VARCHAR(255),
    category VARCHAR(100),
    borrowing_date DATE
);

-- Tabela dla gier planszowych
CREATE TABLE board_games (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    link_board_game_geek VARCHAR(500),
    number_of_players VARCHAR(50),
    status VARCHAR(50),
    borrower VARCHAR(255),
    borrowing_date DATE
);

-- Tabela dla gier PS5
CREATE TABLE ps5_games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50)
);