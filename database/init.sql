-- Metadane książek (opis)
CREATE TABLE book_descriptions (
    id SERIAL PRIMARY KEY, -- ID łączące opis książki z fizycznym obiektem
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    desc TEXT,
    image BYTEA -- Obraz przechowywany w bitach, będzie zabierał bardzo dużo pamięci
);

-- Tabela dla książek (jako obiekty)
CREATE TABLE books (
    id SERIAL PRIMARY KEY, -- Wewnętrzne ID dla bazy danych (raczej nie będzie używane)
    inventory_code VARCHAR(50) UNIQUE NOT NULL, -- ID przypisywane jako OC-WR-B-xxxx
    status VARCHAR(50) DEFAULT  'AVAILABLE', -- Status domyślny jako AVAILABLE
    book_description_id INT NOT NULL, -- Referencja do metadanych książki (autor, opis, kategoria, itd...)
    borrower VARCHAR(255),
    borrowing_date DATE,

    FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id)
);

-- Tabela dla tagów
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela łącząca tagi z książkami
CREATE TABLE book_tags (
    book_description_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (book_description_id, tag_id), -- Primary Key zapewnia unikalność tagów dla danej książki
    FOREIGN KEY (book_description_id) REFERENCES book_descriptions(id) ON DELETE CASCADE, -- Foreign Key z delete on cascade zapewnia integralność danych i eliminuje 'ghost data' przy usuwaniu
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE -- Podobnie jak powyżej, dane są usuwane równolegle
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
    who_did VARCHAR(255), -- Kto wprowadził zmianę
    change_desc TEXT -- Opis zmiany w tekście (ktoś coś wypożyczył, ktoś coś zwrócił, itd...)
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