# Integracja Slack (powiadomienia DM)

Backend wysyła **wiadomości prywatne (DM)** do pożyczających przez Slack Web API. Nie jest to bot konwersacyjny — brak komend, przycisków i Event Subscriptions.

## Wymagania

- Workspace Slack (np. firmowy)
- E-mail w profilu Slack **zgodny** z e-mailem logowania Google OAuth w aplikacji
- Token bota (`xoxb-...`) w zmiennych środowiskowych backendu

## Konfiguracja aplikacji Slack

1. Otwórz [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch** (np. nazwa `Ocado Library`).
2. **OAuth & Permissions** → **Bot Token Scopes**:
   - `chat:write` — wysyłka wiadomości
   - `users:read.email` — wyszukanie użytkownika po adresie e-mail
3. **Install App to Workspace** → zatwierdź uprawnienia.
4. Skopiuj **Bot User OAuth Token** (`xoxb-...`).

## Zmienne środowiskowe (backend)

W katalogu `backend/` utwórz plik `.env` (na podstawie `.env.example`):

```env
SLACK_ENABLED=true
SLACK_BOT_TOKEN=xoxb-your-token-here
```

| Zmienna | Opis |
|---------|------|
| `SLACK_ENABLED` | `true` włącza wysyłkę; `false` — cron i przypomnienia są pomijane (domyślnie `false`) |
| `SLACK_BOT_TOKEN` | Bot User OAuth Token z kroku instalacji |

Dodatkowe ustawienia w `application.yml` (bez sekretów):

- `app.notifications.loan-limits-days.book` — domyślnie 120 dni
- `app.notifications.loan-limits-days.board-game` — domyślnie 240 dni
- `app.notifications.cron` — harmonogram crona (domyślnie codziennie o 08:00)
- `app.notifications.reminder-cooldown-days` — minimalny odstęp między automatycznymi przypomnieniami o ten sam egzemplarz (domyślnie 7 dni)

## Zachowanie systemu

| Wyzwalacz | Opis |
|-----------|------|
| Cron | Codziennie sprawdza wypożyczenia po terminie (książka 120 dni, gra planszowa 240 dni) i wysyła DM |
| Admin | `POST /api/admin/reminders/{internal_id}` — ręczne przypomnienie (egzemplarz musi być `BORROWED`) |
| Użytkownik (Ping) | `POST /api/items/{internal_id}/ping` — DM do pożyczającego z treścią zawierającą e-mail pingującego |

## Udostępnienie aplikacji Slack innej firmie / workspace

Są dwa typowe modele. **Backend Ocado Library** (Spring + baza) to osobna aplikacja — Slack to tylko kanał powiadomień.
### Sposób 1: Dystrybucja wewnętrzna (Public Distribution — bez Slack Marketplace)

**Dla:** inna firma / inny workspace ma używać tej samej appki Slack, bez publikacji w globalnym katalogu.

1. [api.slack.com/apps](https://api.slack.com/apps) → Twoja appka → **Manage Distribution**.
2. Włącz **Public Distribution** (udostępnienie poza jednym workspace).
3. Udostępnij **link instalacji** administratorowi docelowego workspace — instaluje appkę u siebie.
4. W nowym workspace wygeneruje się **własny** Bot User OAuth Token (`xoxb-...`) — wklej go do `SLACK_BOT_TOKEN` w `.env` **tamtej** instancji backendu.
5. Użytkownicy w docelowym workspace muszą mieć w profilu Slack **ten sam e-mail** co przy logowaniu Google w bibliotece.

**Przeniesienie własności appki** (np. z konta deweloperskiego na firmę): w appce Slack → **Settings** → współpracownicy / transfer ownership — bez zmiany kodu repozytorium.

**Zalety:** szybko, bez review Slacka, wystarczy dla firmowej biblioteki.  
**Wady:** każdy workspace = osobna instalacja i osobny token; nie ma „jednego przycisku” dla całego świata bez Waszego hostingu.

### Sposób 2: Slack App Directory (Marketplace)

**Dla:** publiczna appka w katalogu Slack, instalowalna przez wiele organizacji z oficjalnym listingiem.

1. Spełnij wymagania Slacka (polityka prywatności, opis, ikony, uzasadnienie scope’ów, często OAuth użytkownika itd.).
2. **Manage Distribution** → przygotowanie i zgłoszenie do **App Directory**.
3. Po akceptacji inne firmy instalują appkę z Marketplace — nadal zwykle **osobny token / konfiguracja per workspace**.

**Zalety:** widoczność, standardowy proces dla SaaS.  
**Wady:** długi review, większe wymagania compliance; dla wewnętrznej biblioteki Ocado zwykle **nie jest potrzebne** — wystarczy sposób 1.

### Co musi mieć firma, żeby z tego korzystać

| Element | Opis |
|---------|------|
| Workspace Slack | Firmowy workspace z zainstalowaną appką |
| `SLACK_BOT_TOKEN` | Z instalacji appki w **ich** workspace |
| Instancja biblioteki | Backend + frontend + PostgreSQL (Wasz deploy lub ich) |
| Zgodność e-maili | Slack profile = e-mail Google OAuth w aplikacji |


## Rozwiązywanie problemów

- **DM nie dochodzi** — sprawdź `SLACK_ENABLED` i token w logach backendu.
- **`users_not_found`** — e-mail w Slacku różni się od e-maila w Google; ujednolic profil Slack.
- **Lokalny dev** — ustaw `SLACK_ENABLED=false`, aby nie wywoływać API Slack podczas testów.

