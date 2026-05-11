-- Metadane książek (opis)
CREATE TABLE book_description (
    id SERIAL PRIMARY KEY, -- ID łączące opis książki z fizycznym obiektem
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255) -- URL do obrazu przechowywanego lokalnie
);

-- Tabela dla gier planszowych
CREATE TABLE board_game_description (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    number_of_players VARCHAR(50),
    description TEXT
);

-- Tabela dla gier PS5
CREATE TABLE ps5_game (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Tabela dla przedmiotów (fizyczne obiekty)
CREATE TABLE items (
    id SERIAL PRIMARY KEY, -- Wewnętrzne ID dla bazy danych (raczej nie będzie używane)
    internal_id VARCHAR(50) UNIQUE NOT NULL, -- ID przypisywane jako OC-WR-x-xxxx
    status VARCHAR(50) DEFAULT  'AVAILABLE', -- Status domyślny jako AVAILABLE
    type VARCHAR(50) NOT NULL,
    description_id INT NOT NULL, -- Referencja do metadanych książki (autor, opis, kategoria, itd...)
    borrower VARCHAR(255)

    FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id)
);

-- Tabela dla tagów
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);



-- Tabela do oczekiwania na książkę
CREATE TABLE book_waitlist (
    id SERIAL PRIMARY KEY,
    book_description_id INT NOT NULL, -- Na jaką książkę oczekujemy
    waiter_name VARCHAR(255) NOT NULL, -- Kto oczekuje
    joined_queue_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kto wcześniej zaczął czekać
    FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id) ON DELETE CASCADE -- Integralność przy usuwaniu
);

-- Tabela dla historii zdarzeń
CREATE TABLE journal (
    id SERIAL PRIMARY KEY,
    user VARCHAR(255), -- Kto wprowadził zmianę
    description TEXT, -- Opis zmiany w tekście (ktoś coś wypożyczył, ktoś coś zwrócił, itd...)
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Data zdarzenia
);



