# Ocado-library

System Zarządzania Zasobami Bibliotecznymi

## 1. Opis projektu

Celem projektu jest stworzenie aplikacji webowej, która zastąpi dotychczasowy arkusz kalkulacyjny służący do ewidencji zasobów firmowej biblioteki (książki, gry planszowe, gry PS5).

### Problemy obecnego rozwiązania

- **Podatność na błędy:** brak walidacji danych i ogólnodostępna edycja arkusza.
- **Brak automatyzacji:** brak śledzenia czasu wypożyczeń.
- **Komunikacja:** brak systemu powiadomień o terminach zwrotu.
- **Ograniczona funkcjonalność:** brak kolejek oczekujących oraz historii wypożyczeń.

Nowa aplikacja ma zautomatyzować procesy, zwiększyć przejrzystość zasobów i ułatwić zarządzanie administratorom.

## 2. Stos technologiczny

### Frontend

- **Framework:** Vite + React + TypeScript
- **Jakość kodu:** np. ESLint + Prettier
- **Testy:** Vitest (jednostkowe), Playwright (E2E)

### Backend

- **Framework:** Java + Spring Boot
- **Build tool:** Gradle
- **Baza danych:** PostgreSQL
- **Dokumentacja:** OpenAPI (Swagger)

## 3. Wymagania funkcjonalne

### 3.1 Role użytkowników

- **Niezalogowany:** ma dostęp wyłącznie do strony logowania.
- **Pracownik (zalogowany):** przeglądanie zasobów, wypożyczanie, podgląd własnych wypożyczeń, zapisywanie się do kolejek.
- **Administrator (zalogowany):** pełne uprawnienia pracownika + zarządzanie zasobami (CRUD), wgląd w historię, wysyłanie ręcznych przypomnień.

### 3.2 Zasoby

- Książki
- Gry planszowe
- Gry PS5 (brak możliwości wypożyczania - funkcja wyłącznie katalogowa)

#### Książki - fragment tabeli z arkusza


| ID          | Tytuł                                                                                       | Autor                         | Wydanie           | Status         | Data wypożyczenia | Kategoria  |
| ----------- | ------------------------------------------------------------------------------------------- | ----------------------------- | ----------------- | -------------- | ----------------- | ---------- |
| OC-B-WR-001 | Building Microservices                                                                      | Sam Newman                    | 1st edition, 2015 | UZYTKOWNIK_001 | 14.06.2023        | Technology |
| OC-B-WR-002 | #Workout: Games, Tools & Practices to Engage People, Improve Work, and Delight Clients      | Jurgen Appelo                 | 2016              | IN_OFFICE      |                   | Business   |
| OC-B-WR-003 | User Friendly. Jak niewidoczne zasady projektowania zmieniają nasze życie, pracę i rozrywkę | Robert Fabricant, Cliff Kuang | 2022              | IN_OFFICE      |                   | UX/UI      |
| OC-B-WR-004 | Programming in Scala                                                                        | Martin Odersky                |                   | LOST           |                   |            |
| OC-B-WR-005 | JavaScript: The Good Parts                                                                  | Douglas Crockford             |                   | IN_OFFICE      |                   |            |


Uwaga: tabela odzwierciedla historyczny format arkusza, gdzie w kolumnie `Status` mogło pojawić się nazwisko wypożyczającego (np. `UZYTKOWNIK_001`). W docelowym systemie pola `status` i `borrower` powinny być rozdzielone.

#### Gry planszowe - fragment tabeli z arkusza


| ID          | Nazwa               | Link BoardGameGeek                                                                                                       | Liczba graczy | Wypożyczający  | Data wypożyczenia |
| ----------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------- | -------------- | ----------------- |
| OC-G-WR-9   | Barrage             | [boardgamegeek.com/boardgame/251247/barrage](https://boardgamegeek.com/boardgame/251247/barrage)                         | 1-4           |                |                   |
| OC-G-WR-10  | Fantastyczne swiaty | [boardgamegeek.com/boardgame/223040/fantasy-realms](https://boardgamegeek.com/boardgame/223040/fantasy-realms)           | 2-6           | UZYTKOWNIK_001 | 14/02/2026        |
| OC-G-WR-11  | Azul                | [boardgamegeek.com/boardgame/230802/azul](https://boardgamegeek.com/boardgame/230802/azul)                               | 2-4           |                |                   |
| OC-G-WR-12  | Latajace burito     | [boardgamegeek.com/boardgame/274533/throw-throw-burrito](https://boardgamegeek.com/boardgame/274533/throw-throw-burrito) | 2-6           |                |                   |
| OC-G-WR-13  | Carcassonne         | [boardgamegeek.com/boardgame/822/carcassonne](https://boardgamegeek.com/boardgame/822/carcassonne)                       | 2-5           |                |                   |
| OC-G-WR-137 | Catan               | [boardgamegeek.com/boardgame/13/catan](https://boardgamegeek.com/boardgame/13/catan)                                     | 3-4           |                |                   |


#### Gry PS5 - fragment tabeli z arkusza


| ID         | Nazwa                        | Status              |
| ---------- | ---------------------------- | ------------------- |
| OC-PS-WR-1 | Mortal Kombat Ultimate       | For office use only |
| OC-PS-WR-2 | FIFA 22                      | For office use only |
| OC-PS-WR-3 | Gran Turismo 7               | For office use only |
| OC-PS-WR-4 | Horizon Forbidden West       | For office use only |
| OC-PS-WR-5 | Worms Battlegrounds + W.M.D. | For office use only |
| OC-PS-WR-6 | Spiderman                    | For office use only |
| OC-PS-WR-7 | Tekken 7                     | For office use only |
| OC-PS-WR-8 | UFC 4                        | For office use only |


### 3.3 Logowanie

Logowanie przez Google OAuth2.

### 3.4 Zarządzanie zasobami

Zarządzanie zasobami jest dostępne wyłącznie dla roli Administratora.

#### Dodawanie

- System nadaje kolejne ID zgodnie ze wzorcem dla typu zasobu (np. `OC-B-WR-124`).
- Dla książek można użyć ISBN do automatycznego uzupełnienia danych (tytuł, autor, rok wydania, okładka).
- Domyślny status po dodaniu:
  - książki i gry planszowe: `IN_OFFICE`
  - gry PS5: `FOR_OFFICE_USE_ONLY`
- Pola dodatkowe:
  - książki: kategoria
  - gry planszowe: link BoardGameGeek, liczba graczy

#### Edycja i zmiana statusu

- Administrator może edytować metadane zasobu (np. tytuł, autora, kategorię, pola dedykowane).
- Dostępne statusy:
  - `IN_OFFICE` - zasób dostępny do wypożyczenia
  - `BORROWED` - zasób wypożyczony
  - `LOST` - zasób zagubiony, bez możliwości wypożyczenia
  - `FOR_OFFICE_USE_ONLY` - zasób tylko do użytku w biurze (PS5)
  - `ARCHIVED` - zasób zarchiwizowany, niewidoczny w aktywnym katalogu

#### Usuwanie

Brak trwałego usuwania rekordów. Archiwizacja odbywa się przez zmianę statusu na `ARCHIVED`, aby zachować historię.

### 3.5 Wyszukiwanie i przeglądanie

- Wyszukiwanie tekstowe po tytule i autorze
- Filtrowanie po kategorii / nowościach
- Sortowanie
- Domyślnie ukryte zasoby ze statusem `ARCHIVED` i `LOST` (opcjonalny filtr: "pokaż archiwalne i utracone" dla administratora)

### 3.6 Wypożyczanie i zwracanie zasobów

Proces dotyczy wyłącznie książek oraz gier planszowych. Gry PS5 są wyłączone z tego obiegu (tylko podgląd).

- **Wypożyczenie:** automatyczne przypisanie do konta użytkownika, zmiana statusu na `BORROWED`.
- **Zwrot:** wpisanie daty zwrotu, zmiana statusu na `IN_OFFICE`.
- **Kolejka (opcjonalnie):** mechanizm zapisu na wypożyczony przedmiot z powiadomieniem dla aktualnego posiadacza.

### 3.7 Powiadomienia

Powiadomienia realizowane są w pierwszej kolejności przez Slack, ewentualnie przez e-mail.


| Wyzwalacz (Trigger)                           | Odbiorca                                 | Cel                                          |
| --------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Przekroczenie limitu 120/240/N dni (Cron Job) | Wypożyczająca/y                          | Prośba o zwrot                               |
| Ręczne przypomnienie (opcjonalnie)            | Wypożyczająca/y                          | Indywidualna prośba od Administratora        |
| Dołączenie do kolejki (opcjonalnie)           | Wypożyczająca/y                          | Informacja, że inna osoba oczekuje na zwrot  |
| Zwrot zasobu (opcjonalnie)                    | Pracownicy wpisani na listę oczekujących | Informacja, że zasób jest już dostępny       |
| Nowe zgłoszenie zakupu (opcjonalnie)          | Administrator                            | Informacja o zapotrzebowaniu na nową pozycję |


### 3.8 Lista oczekujących (opcjonalne)

Jeśli zasób jest wypożyczony, użytkownik może się zapisać na listę oczekujących. Zwrot zasobu powoduje wysłanie powiadomienia o dostępności do wszystkich osób z listy oczekujących.

### 3.9 Zgłoszenie zapotrzebowania

Pracownik może wysłać prośbę o zakup konkretnego tytułu. Administrator otrzymuje wtedy powiadomienie (Slack).

## 4. Wymagania niefunkcjonalne

### 4.1 API i kontrakt

Backend udostępnia REST API, a kontrakt endpointów jest definiowany w `openapi.yaml` (Swagger UI generowane automatycznie).

### 4.2 Bezpieczeństwo

- Klucze API, OAuth2 itp. są przechowywane w zmiennych środowiskowych.
- Zakaz przechowywania `.env` w repozytorium (wymagany `.env.example`).
- Automatyczna weryfikacja zależności (npm oraz Gradle) pod kątem znanych luk bezpieczeństwa.

### 4.3 Analityka

Integracja z Google Analytics 4 (GA4) lub GTM do śledzenia kluczowych zdarzeń (logowanie, wypożyczenie, wyszukiwanie).

### 4.4 Logi

Ustrukturyzowane logi w formacie JSON (`INFO`, `WARN`, `ERROR`) bez danych wrażliwych.

### 4.5 Testy

- **Unit:** logika biznesowa
- **E2E:** kluczowe przepływy użytkownika (Playwright)

### 4.6 GitHub Actions (CI/CD)

Projekt musi mieć skonfigurowane GitHub Actions do automatycznego uruchamiania testów, statycznej analizy kodu i skanowania bezpieczeństwa.

## 5. Praca z kodem

- **Code review:** każdy Pull Request (PR) musi zostać sprawdzony i zatwierdzony przez co najmniej jedną osobę przed zmergowaniem do głównej gałęzi.
- **Małe commity:** małe, logiczne zmiany.
- **Conventional Commits:** stosujemy standard nazewnictwa commitów (np. `feat:`, `fix:`, `chore:`, `docs:`, `test:`), aby historia zmian była czytelna.
- **Testowanie zmian:** PR powinien zawierać testy weryfikujące wprowadzoną logikę.
- **Bezpieczeństwo:** zakaz umieszczania haseł, kluczy API i innych danych wrażliwych w kodzie oraz historii commitów (poczytać o dotenv).
- **Powiązanie z zadaniami:** każdy PR musi odnosić się do konkretnego zgłoszenia (Issue) w GitHubie, które opisuje dane zadanie.
- **Aktualizacja README:** dokumentacja techniczna w pliku `README.md` musi być aktualizowana równolegle z wprowadzanymi zmianami w kodzie.

