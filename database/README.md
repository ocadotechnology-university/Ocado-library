# 📚 Lokalna Baza Danych (PostgreSQL + Docker)

W projekcie używany jest **Docker** do konteneryzacji lokalnej bazy danych **PostgreSQL**.

## 🛠 Wymagania wstępne
Aby uruchomić bazę, trzeba mieć zainstalowane:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) lub Docker Engine (Linux).
* Docker Compose w wersji V2 (komenda `docker compose` ze spacją).

---

## 🚀 Pierwsze uruchomienie (Krok po kroku)

### 1. Konfiguracja zmiennych środowiskowych
Aby zapewnić bezpieczeństwo i elastyczność, dane logowania trzymamy w pliku `.env`, który jest ignorowany przez Gita.
1. Skopiuj plik szablonu `.env.example` i zmień jego nazwę na `.env`.
2. Otwórz plik `.env` i uzupełnij go swoimi danymi (lub zostaw domyślne dla środowiska lokalnego):
   ```env
   POSTGRES_USER=dev_user
   POSTGRES_PASSWORD=dev_password
   POSTGRES_DB=dev_database
   ```
### 2. Uruchamianie kontenera
Otwórz terminal w głównym katalogu projektu i wpisz:
   ```bash
   docker compose up -d
   ```
Podczas pierwszego uruchomienia, Docker automatycznie utworzy bazę danych na podstawie pliku .env oraz wykona skrypt init.sql, który zbuduje tabele (books, board_games, ps5_games).
### 3. Łączenie się z bazą
Konfiguracja dla Spring Boota (application.properties):
 ```application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/${POSTGRES_DB}
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
 ```

### Przydatne komendy Dockera
Zatrzymanie bazy danych:
   ```bash
   docker compose down
   ```
Sprawdzenie logów bazy (przydatne przy błędach):
   ```bash
   docker compose logs db
   ```
Wejście do bazy przez terminal (zmienne środowiskowe wedle własnego pliku .env):
   ```bash
   docker compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_PASSWORD}
   ```
Resetowanie bazy danych (Kasowanie danych)
   ```bash
   docker compose down -v
   docker compose up -d
   ```