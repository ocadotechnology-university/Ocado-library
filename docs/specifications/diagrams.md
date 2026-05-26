
# Dokumentacja Projektu: Ocado-library

System zarządzania zasobami bibliotecznymi (książki, gry planszowe, gry PS5).

---

## 1. Priorytetyzacja wymagań (MoSCoW)

Poniższa tablica Kanban przedstawia podział funkcjonalności według ich ważności dla projektu. 

```mermaid
flowchart LR
    %% Wymuszenie kolejności pionowej dla sekcji
    MUST --> SHOULD --> COULD --> WONT

    subgraph MUST ["Must Have"]
        m1[Logowanie Google OAuth2] --- m2[Zarządzanie zasobami CRUD] --- m3[Wypożyczanie i zwroty] --- m4[Centralne REST API] --- m5[System tagów kategorii] --- m6[Migrazja bd z pliku xls do lokalnej bazy]
    end

    subgraph SHOULD ["Should Have"]
        s1[Wyszukiwanie po tagach i tekście] --- s2[Interaktywny Bot Slack] --- s3[Flaga zasobu: 'Nowość'] --- s4[Sortowanie i filtrowanie]
    end

    subgraph COULD ["Could Have"]
        c1[Lista oczekujących i kolejki] --- c2[Generowanie kodów QR] --- c3[Limity wypożyczeń] --- c4[Rozszerzony Audit Log]
    end

    subgraph WONT ["Won't Have"]
        w1[Moduł zgłaszania zakupów] --- w2[Trwałe usuwanie z bazy] --- w3[Wypożyczanie gier PS5] --- w4[Inne metody logowania]
    end

    %% Ukrycie linii łączących wewnątrz grup oraz między grupami
    linkStyle default stroke-width:0px,fill:none
    
    %% Stylizacja sekcji
    style MUST fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style SHOULD fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style COULD fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px
    style WONT fill:#fafafa,stroke:#9e9e9e,stroke-width:2px
```

  

## 2. Przepływ procesu (Flowchart)

  

Diagram przedstawia ścieżkę użytkownika od wejścia do aplikacji po interakcję z konkretnym typem zasobu.

  

```mermaid

flowchart TD

A([Pracownik otwiera aplikację]) --> B{Czy jest zalogowany?}

B -- Nie --> C([Logowanie przez Google OAuth2])

C --> D

B -- Tak --> D(Przeglądanie katalogu zasobów)

  

D --> E(Wybór zasobu)

E --> F{Jaki to typ zasobu?}

  

F -- Gra PS5 --> G([Tylko podgląd katalogowy])

  

F -- Książka lub Gra Planszowa --> H{Jaki jest status zasobu?}

  

H -- AVAILABLE --> I(Kliknięcie Wypożycz)

I --> J(System przypisuje zasób do użytkownika)

J --> K([Status zmienia się na BORROWED])

  

H -- BORROWED --> L(Kliknięcie Zapisz do kolejki)

L --> M([Oczekiwanie na powiadomienie o zwrocie])

  

H -- BORROWED BY ME --> N(Kliknięcie Zwróć) --> O([Zasób niedostępny / niewidoczny])

```

  

## 3. Diagram przypadków użycia (Use Case Diagram)

  

Podział uprawnień i dostępnych akcji dla poszczególnych ról w systemie.

  

```mermaid

flowchart LR

Niezalogowany

Pracownik

Administrator

  

subgraph Ocado-library System

U1([Logowanie Google OAuth2])

  

U2([Przeglądanie zasobów])

U3([Wyszukiwanie i filtrowanie])

U4([Wypożyczanie zasobu])

U5([Podgląd własnych wypożyczeń])

U6([Zapisywanie się do kolejek])

U7([Zwrot wypożyczonych książek])

  

U8([Zarządzanie zasobami CRUD])

U9([Wgląd w pełną historię])

U10([Wysyłanie ręcznych przypomnień])

U11([Zmiana statusu - Archiwizacja])

end

  

Niezalogowany --> U1

  

Pracownik --> U2

Pracownik --> U3

Pracownik --> U4

Pracownik --> U5

Pracownik --> U6

Pracownik --> U7

  

Administrator -. "dziedziczy uprawnienia" .-> Pracownik

Administrator --> U8

Administrator --> U9

Administrator --> U10

Administrator --> U11

```

  

## 4. Interakcje w systemie (Sequence Diagram)

  

Przykładowy scenariusz: wypożyczenie przez jednego użytkownika, zapisanie się do kolejki przez drugiego oraz system powiadomień Slack.

  

```mermaid

sequenceDiagram

participant Pracownik 1

participant Frontend

participant Backend

participant Baza Danych

participant Slack

participant Pracownik 2

  

Pracownik 1->>Frontend: Kliknięcie "Wypożycz" (Książka)

Frontend->>Backend: POST /api/borrow/{id}

Backend->>Baza Danych: Sprawdzenie statusu (AVAILABLE?)

Baza Danych-->>Backend: Status OK

Backend->>Baza Danych: Update: status=BORROWED, borrower=U1

Backend-->>Frontend: 200 OK

Frontend-->>Pracownik 1: Wyświetl sukces

  

Note over Pracownik 2, Backend: Scenariusz kolejki

Pracownik 2->>Frontend: Kliknięcie "Zapisz do kolejki"

Frontend->>Backend: POST /api/queue/{id}

Backend->>Baza Danych: Dodaj użytkownika do listy oczekujących

Backend-->>Frontend: 200 OK

  

Note over Backend, Slack: Automatyczne przypomnienie

Backend->>Backend: Cron Job (Sprawdź termin)

Backend->>Slack: Wyślij wiadomość do Pracownik 1

Slack-->>Pracownik 1: "Pamiętaj o zwrocie książki"

  

Pracownik 1->>Frontend: Kliknięcie "Zwróć"

Frontend->>Backend: POST /api/return/{id}

Backend->>Baza Danych: Update: status=AVAILABLE

Backend->>Slack: Powiadom osoby z kolejki

Slack-->>Pracownik 2: "Zasób jest już dostępny!"

```