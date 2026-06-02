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

## Rozwiązywanie problemów

- **DM nie dochodzi** — sprawdź `SLACK_ENABLED` i token w logach backendu.
- **`users_not_found`** — e-mail w Slacku różni się od e-maila w Google; ujednolic profil Slack.
- **Lokalny dev** — ustaw `SLACK_ENABLED=false`, aby nie wywoływać API Slack podczas testów.
