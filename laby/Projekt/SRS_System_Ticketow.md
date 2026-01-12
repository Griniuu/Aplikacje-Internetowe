# Software Requirements Specification (SRS)
# System Ticketów Helpdesk

**Nazwa zespołu:** [Nazwa Zespołu]  
**Członkowie zespołu:**
- [Imię Nazwisko 1] - Backend & Baza Danych
- [Imię Nazwisko 2] - Frontend & UX
- [Imię Nazwisko 3] - Logika Biznesowa & Integracja

**Data:** 7 grudnia 2024  
**Wersja dokumentu:** 1.0

---

## 1. Wprowadzenie

### 1.1 Cel dokumentu
Dokument SRS określa wymagania funkcjonalne i niefunkcjonalne dla systemu zarządzania zgłoszeniami helpdesk. System ma umożliwić użytkownikom zgłaszanie problemów technicznych oraz śledzenie ich rozwiązania przez zespół techników.

### 1.2 Zakres produktu
System Ticketów Helpdesk to aplikacja webowa umożliwiająca:
- Zgłaszanie problemów technicznych przez użytkowników
- Zarządzanie zgłoszeniami przez techników
- Śledzenie statusu zgłoszeń
- Komunikację między użytkownikami a technikami
- Generowanie raportów dla administratorów

### 1.3 Definicje, akronimy i skróty
- **Ticket** - zgłoszenie problemu/zapytania
- **SLA** - Service Level Agreement (umowa o poziomie usług)
- **Dashboard** - panel główny użytkownika
- **Helpdesk** - dział wsparcia technicznego
- **ORM** - Object-Relational Mapping

### 1.4 Odniesienia
- Framework: Flask (Python)
- Baza danych: SQLite/PostgreSQL
- Dokumentacja Flask: https://flask.palletsprojects.com/

### 1.5 Przegląd dokumentu
Dokument zawiera pełną specyfikację wymagań dla systemu helpdesk, w tym opis funkcjonalności, interfejsów użytkownika, wymagań niefunkcjonalnych oraz ograniczeń technicznych.

---

## 2. Ogólny opis systemu

### 2.1 Perspektywa produktu
System jest samodzielną aplikacją webową, dostępną przez przeglądarkę internetową. Nie wymaga integracji z zewnętrznymi systemami (w wersji MVP).

### 2.2 Funkcje produktu
Główne funkcje systemu:
1. **Zarządzanie użytkownikami**
   - Rejestracja i logowanie
   - Role użytkowników (użytkownik, technik, administrator)
   - Zarządzanie profilami

2. **Zarządzanie ticketami**
   - Tworzenie nowych zgłoszeń
   - Przeglądanie listy ticketów
   - Filtrowanie i wyszukiwanie
   - Szczegółowy widok ticketu
   - Przypisywanie ticketów do techników
   - Zmiana statusu i priorytetu

3. **Komunikacja**
   - Dodawanie komentarzy do ticketów
   - Historia zmian
   - Wewnętrzne notatki techników

4. **Kategoryzacja i priorytetyzacja**
   - Kategorie: Sprzęt, Oprogramowanie, Sieć, Inne
   - Priorytety: Niski, Średni, Wysoki, Krytyczny
   - Statusy: Nowy, W trakcie, Rozwiązany, Zamknięty

5. **Panel administratora**
   - Statystyki zgłoszeń
   - Zarządzanie użytkownikami
   - Raporty i wykresy

### 2.3 Charakterystyka użytkowników

#### 2.3.1 Użytkownik końcowy
- **Opis:** Pracownik/student zgłaszający problemy techniczne
- **Uprawnienia:** Tworzenie ticketów, komentowanie własnych zgłoszeń, przeglądanie swoich ticketów
- **Wiedza techniczna:** Podstawowa

#### 2.3.2 Technik
- **Opis:** Osoba rozwiązująca zgłoszenia
- **Uprawnienia:** Przeglądanie wszystkich ticketów, przypisywanie do siebie, zmiana statusów, dodawanie rozwiązań
- **Wiedza techniczna:** Średnia/zaawansowana

#### 2.3.3 Administrator
- **Opis:** Zarządca systemu
- **Uprawnienia:** Pełne uprawnienia + zarządzanie użytkownikami, dostęp do raportów
- **Wiedza techniczna:** Zaawansowana

### 2.4 Ograniczenia
- System działa tylko w środowisku webowym (wymaga przeglądarki)
- Brak mobilnej aplikacji natywnej (tylko responsywny web)
- Brak integracji z systemami zewnętrznymi (email, LDAP) w wersji MVP
- Obsługa załączników ograniczona do obrazów (opcjonalnie)
- Maksymalny rozmiar załącznika: 5 MB

### 2.5 Założenia i zależności
- Użytkownicy mają dostęp do przeglądarki internetowej
- Serwer aplikacji będzie dostępny w sieci lokalnej/internet
- Python 3.10+ jest zainstalowany na serwerze
- Dostępna jest baza danych SQLite lub PostgreSQL

---

## 3. Szczegółowe wymagania

### 3.1 Wymagania funkcjonalne

#### 3.1.1 Moduł Autentykacji (AUTH)

**AUTH-001: Rejestracja użytkownika**
- **Opis:** System umożliwia rejestrację nowego użytkownika
- **Dane wejściowe:** Email, hasło, imię i nazwisko, rola
- **Walidacja:**
  - Email musi być unikalny i w poprawnym formacie
  - Hasło min. 8 znaków
  - Wszystkie pola wymagane
- **Dane wyjściowe:** Potwierdzenie utworzenia konta lub komunikat błędu

**AUTH-002: Logowanie**
- **Opis:** System umożliwia logowanie użytkownika
- **Dane wejściowe:** Email, hasło
- **Walidacja:** Weryfikacja poprawności danych
- **Dane wyjściowe:** Przekierowanie do dashboardu lub komunikat błędu

**AUTH-003: Wylogowanie**
- **Opis:** System umożliwia wylogowanie użytkownika
- **Dane wyjściowe:** Usunięcie sesji, przekierowanie do strony logowania

**AUTH-004: Zarządzanie rolami**
- **Opis:** System rozróżnia role użytkowników
- **Role:** user, technician, admin
- **Funkcjonalność:** Różne uprawnienia dla każdej roli

#### 3.1.2 Moduł Ticketów (TICKET)

**TICKET-001: Tworzenie ticketu**
- **Aktorzy:** Użytkownik, Technik, Administrator
- **Dane wejściowe:**
  - Tytuł (wymagane, max 200 znaków)
  - Kategoria (wymagane, wybór z listy)
  - Priorytet (wymagane, wybór z listy)
  - Opis (wymagane, max 2000 znaków)
  - Lokalizacja (opcjonalne, max 100 znaków)
  - Załączniki (opcjonalne, max 3 pliki)
- **Walidacja:** Wszystkie wymagane pola wypełnione
- **Proces:**
  1. Wypełnienie formularza
  2. Walidacja danych
  3. Zapis do bazy danych
  4. Automatyczne ustawienie statusu "Nowy"
  5. Przypisanie timestamp utworzenia
- **Dane wyjściowe:** Numer ticketu, potwierdzenie utworzenia

**TICKET-002: Przeglądanie listy ticketów**
- **Aktorzy:** Wszyscy zalogowani użytkownicy
- **Funkcjonalność:**
  - Użytkownik widzi tylko swoje tickety
  - Technik i Admin widzą wszystkie tickety
- **Wyświetlane informacje:**
  - Numer ticketu
  - Tytuł
  - Status
  - Priorytet
  - Data utworzenia
  - Przypisany technik (jeśli istnieje)
- **Sortowanie:** Po dacie utworzenia (najnowsze pierwsze)
- **Paginacja:** 20 ticketów na stronę

**TICKET-003: Filtrowanie ticketów**
- **Aktorzy:** Technik, Administrator
- **Kryteria filtrowania:**
  - Status (wielokrotny wybór)
  - Priorytet (wielokrotny wybór)
  - Kategoria (wielokrotny wybór)
  - Data utworzenia (zakres)
  - Przypisany technik
  - Tekst w tytule (wyszukiwanie)
- **Dane wyjściowe:** Przefiltrowana lista ticketów

**TICKET-004: Szczegóły ticketu**
- **Aktorzy:** Wszyscy zalogowani użytkownicy
- **Wyświetlane informacje:**
  - Wszystkie dane ticketu
  - Historia komentarzy
  - Historia zmian statusu
  - Załączniki
  - Informacje o autorze
  - Przypisany technik
  - Czas utworzenia i ostatniej aktualizacji
- **Uprawnienia:** Użytkownik widzi tylko swoje tickety, Technik i Admin wszystkie

**TICKET-005: Przypisywanie ticketu**
- **Aktorzy:** Technik, Administrator
- **Dane wejściowe:** ID ticketu, ID technika
- **Proces:**
  1. Wybór ticketu
  2. Wybór technika z listy
  3. Zapis przypisania
  4. Automatyczna zmiana statusu na "W trakcie"
- **Dane wyjściowe:** Potwierdzenie przypisania

**TICKET-006: Zmiana statusu ticketu**
- **Aktorzy:** Technik (przypisany), Administrator
- **Statusy i przejścia:**
  - Nowy → W trakcie (przy przypisaniu)
  - W trakcie → Rozwiązany (po rozwiązaniu)
  - Rozwiązany → Zamknięty (potwierdzenie użytkownika)
  - W trakcie → Nowy (odrzucenie)
- **Dane wejściowe:** ID ticketu, nowy status
- **Walidacja:** Sprawdzenie uprawnień i poprawności przejścia
- **Dane wyjściowe:** Zaktualizowany ticket

**TICKET-007: Zmiana priorytetu**
- **Aktorzy:** Technik, Administrator
- **Priorytety:** Niski, Średni, Wysoki, Krytyczny
- **Dane wejściowe:** ID ticketu, nowy priorytet
- **Dane wyjściowe:** Zaktualizowany ticket

#### 3.1.3 Moduł Komentarzy (COMMENT)

**COMMENT-001: Dodawanie komentarza**
- **Aktorzy:** Wszyscy zalogowani użytkownicy
- **Dane wejściowe:**
  - ID ticketu
  - Treść komentarza (wymagane, max 1000 znaków)
  - Typ: publiczny/wewnętrzny (tylko dla techników)
- **Walidacja:**
  - Użytkownik może komentować tylko swoje tickety
  - Technik i Admin mogą komentować wszystkie
- **Proces:**
  1. Wprowadzenie komentarza
  2. Walidacja uprawnień
  3. Zapis do bazy
  4. Aktualizacja timestamp ticketu
- **Dane wyjściowe:** Wyświetlenie komentarza w historii

**COMMENT-002: Przeglądanie komentarzy**
- **Aktorzy:** Wszyscy z dostępem do ticketu
- **Wyświetlane informacje:**
  - Autor komentarza
  - Data i godzina
  - Treść komentarza
  - Oznaczenie komentarzy wewnętrznych (tylko dla techników)
- **Sortowanie:** Chronologicznie (od najstarszego)

#### 3.1.4 Moduł Administratora (ADMIN)

**ADMIN-001: Zarządzanie użytkownikami**
- **Aktor:** Administrator
- **Funkcjonalność:**
  - Lista wszystkich użytkowników
  - Edycja ról użytkowników
  - Dezaktywacja kont
  - Resetowanie haseł
- **Dane wyjściowe:** Zaktualizowana lista użytkowników

**ADMIN-002: Dashboard statystyk**
- **Aktor:** Administrator, Technik (ograniczone)
- **Wyświetlane dane:**
  - Liczba ticketów według statusu
  - Liczba ticketów według priorytetu
  - Liczba ticketów według kategorii
  - Średni czas rozwiązania
  - Liczba ticketów per technik
  - Wykres ticketów w czasie
- **Zakres czasowy:** Dzisiaj, Ten tydzień, Ten miesiąc, Wszystkie

**ADMIN-003: Zarządzanie kategoriami**
- **Aktor:** Administrator
- **Funkcjonalność:**
  - Dodawanie nowych kategorii
  - Edycja istniejących
  - Usuwanie (jeśli nie ma powiązanych ticketów)
- **Dane wyjściowe:** Lista kategorii

#### 3.1.5 Moduł Dashboard (DASH)

**DASH-001: Dashboard użytkownika**
- **Aktor:** Użytkownik
- **Wyświetlane elementy:**
  - Przycisk "Nowy ticket"
  - Statystyki własnych ticketów (otwarte, w trakcie, zamknięte)
  - Lista ostatnich 5 ticketów
  - Filtr szybki (wszystkie/otwarte/zamknięte)

**DASH-002: Dashboard technika**
- **Aktor:** Technik
- **Wyświetlane elementy:**
  - Przypisane do mnie (liczba)
  - Nowe tickety (liczba)
  - Lista ticketów do wzięcia
  - Lista moich ticketów w trakcie
  - Krytyczne tickety (alert)

**DASH-003: Dashboard administratora**
- **Aktor:** Administrator
- **Wyświetlane elementy:**
  - Wszystkie statystyki
  - Wykresy
  - Ostatnia aktywność w systemie
  - Alerty (tickety bez przypisania > 24h)

### 3.2 Wymagania niefunkcjonalne

#### 3.2.1 Wydajność
- **PERF-001:** System obsługuje minimum 50 jednoczesnych użytkowników
- **PERF-002:** Czas ładowania strony głównej < 2 sekundy
- **PERF-003:** Wyszukiwanie ticketów < 1 sekunda
- **PERF-004:** Baza danych obsługuje minimum 10 000 ticketów

#### 3.2.2 Bezpieczeństwo
- **SEC-001:** Hasła przechowywane jako hash (bcrypt/argon2)
- **SEC-002:** Sesje użytkowników z timeout 30 minut nieaktywności
- **SEC-003:** Walidacja danych wejściowych (XSS, SQL injection)
- **SEC-004:** HTTPS w środowisku produkcyjnym
- **SEC-005:** CSRF protection dla formularzy

#### 3.2.3 Niezawodność
- **REL-001:** System dostępny 99% czasu (z wyłączeniem konserwacji)
- **REL-002:** Backup bazy danych co 24h
- **REL-003:** Logowanie błędów do pliku
- **REL-004:** Graceful degradation przy awarii bazy

#### 3.2.4 Użyteczność
- **USA-001:** Interfejs intuicyjny, nie wymaga szkolenia
- **USA-002:** Responsywny design (desktop, tablet, mobile)
- **USA-003:** Wsparcie dla przeglądarek: Chrome, Firefox, Safari, Edge (ostatnie 2 wersje)
- **USA-004:** Komunikaty błędów w języku polskim, zrozumiałe dla użytkownika
- **USA-005:** Formularze z walidacją w czasie rzeczywistym

#### 3.2.5 Utrzymywalność
- **MAIN-001:** Kod zgodny z PEP 8 (Python)
- **MAIN-002:** Dokumentacja kodu (docstrings)
- **MAIN-003:** README z instrukcjami instalacji
- **MAIN-004:** Struktura projektu zgodna z best practices Flask
- **MAIN-005:** Separacja logiki biznesowej od prezentacji (MVC)

#### 3.2.6 Przenośność
- **PORT-001:** Możliwość uruchomienia na Windows, Linux, MacOS
- **PORT-002:** Baza danych: SQLite (dev) lub PostgreSQL (prod)
- **PORT-003:** Aplikacja w kontenerze Docker (opcjonalnie)

---

## 4. Interfejsy systemu

### 4.1 Interfejs użytkownika

#### 4.1.1 Strona logowania
- **URL:** `/login`
- **Elementy:**
  - Formularz email + hasło
  - Przycisk "Zaloguj"
  - Link "Zarejestruj się"
  - Link "Przypomnij hasło" (opcjonalnie)

#### 4.1.2 Strona rejestracji
- **URL:** `/register`
- **Elementy:**
  - Formularz: email, hasło, potwierdzenie hasła, imię i nazwisko
  - Wybór roli (jeśli dostępny)
  - Przycisk "Zarejestruj"
  - Link "Masz konto? Zaloguj się"

#### 4.1.3 Dashboard
- **URL:** `/dashboard` lub `/`
- **Elementy:** Opisane w DASH-001, DASH-002, DASH-003

#### 4.1.4 Lista ticketów
- **URL:** `/tickets`
- **Elementy:**
  - Filtry boczne/górne
  - Tabela/karty ticketów
  - Paginacja
  - Przycisk "Nowy ticket"

#### 4.1.5 Formularz ticketu
- **URL:** `/tickets/new`
- **Elementy:** Opisane w TICKET-001

#### 4.1.6 Szczegóły ticketu
- **URL:** `/tickets/<id>`
- **Elementy:** Opisane w TICKET-004

#### 4.1.7 Panel administratora
- **URL:** `/admin`
- **Elementy:**
  - Zakładki: Użytkownicy, Statystyki, Kategorie
  - Tabele z danymi
  - Wykresy (Chart.js lub podobne)

### 4.2 Interfejsy sprzętowe
- Nie dotyczy (aplikacja webowa)

### 4.3 Interfejsy programowe

#### 4.3.1 API REST (opcjonalnie)
Jeśli planowana integracja z zewnętrznymi systemami:

**Endpoints:**
- `GET /api/tickets` - lista ticketów
- `GET /api/tickets/<id>` - szczegóły ticketu
- `POST /api/tickets` - utworzenie ticketu
- `PUT /api/tickets/<id>` - aktualizacja ticketu
- `POST /api/tickets/<id>/comments` - dodanie komentarza

**Format:** JSON  
**Autentykacja:** Token-based (JWT)

### 4.4 Interfejsy komunikacyjne
- **Protokół:** HTTP/HTTPS
- **Format danych:** JSON (API), HTML (strony)
- **Session management:** Flask-Session (server-side)

---

## 5. Model danych

### 5.1 Diagram ERD

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │         │   Tickets    │         │  Comments    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │◄───────┤ created_by   │◄───────┤ ticket_id    │
│ email        │         │ assigned_to  │         │ user_id      │
│ password_hash│         ├──────────────┤         ├──────────────┤
│ full_name    │         │ id (PK)      │         │ id (PK)      │
│ role         │         │ title        │         │ content      │
│ created_at   │         │ description  │         │ created_at   │
│ is_active    │         │ category     │         │ is_internal  │
└──────────────┘         │ priority     │         └──────────────┘
                         │ status       │
                         │ created_at   │         ┌──────────────┐
                         │ updated_at   │         │ Attachments  │
                         │ resolved_at  │         ├──────────────┤
                         └──────────────┘◄───────┤ ticket_id    │
                                                  ├──────────────┤
                                                  │ id (PK)      │
                                                  │ filename     │
                                                  │ filepath     │
                                                  │ uploaded_by  │
                                                  │ uploaded_at  │
                                                  └──────────────┘
```

### 5.2 Słowniki danych

#### Tabela: Users
| Pole           | Typ          | Ograniczenia           | Opis                          |
|----------------|--------------|------------------------|-------------------------------|
| id             | Integer      | PK, Auto Increment     | Unikalny identyfikator        |
| email          | String(120)  | Unique, Not Null       | Adres email (login)           |
| password_hash  | String(255)  | Not Null               | Zahashowane hasło             |
| full_name      | String(100)  | Not Null               | Imię i nazwisko               |
| role           | Enum         | Not Null               | user/technician/admin         |
| created_at     | DateTime     | Not Null, Default NOW  | Data rejestracji              |
| is_active      | Boolean      | Default True           | Czy konto aktywne             |

#### Tabela: Tickets
| Pole           | Typ          | Ograniczenia           | Opis                          |
|----------------|--------------|------------------------|-------------------------------|
| id             | Integer      | PK, Auto Increment     | Unikalny identyfikator        |
| title          | String(200)  | Not Null               | Tytuł zgłoszenia              |
| description    | Text         | Not Null               | Szczegółowy opis              |
| category       | Enum         | Not Null               | Kategoria problemu            |
| priority       | Enum         | Not Null               | Priorytet                     |
| status         | Enum         | Not Null               | Status zgłoszenia             |
| location       | String(100)  | Nullable               | Lokalizacja (pokój itp.)      |
| created_by     | Integer      | FK → Users, Not Null   | Autor zgłoszenia              |
| assigned_to    | Integer      | FK → Users, Nullable   | Przypisany technik            |
| created_at     | DateTime     | Not Null, Default NOW  | Data utworzenia               |
| updated_at     | DateTime     | Not Null, Auto Update  | Data ostatniej aktualizacji   |
| resolved_at    | DateTime     | Nullable               | Data rozwiązania              |

**Wartości Enum:**
- **category:** 'hardware', 'software', 'network', 'other'
- **priority:** 'low', 'medium', 'high', 'critical'
- **status:** 'new', 'in_progress', 'resolved', 'closed'

#### Tabela: Comments
| Pole           | Typ          | Ograniczenia           | Opis                          |
|----------------|--------------|------------------------|-------------------------------|
| id             | Integer      | PK, Auto Increment     | Unikalny identyfikator        |
| ticket_id      | Integer      | FK → Tickets, Not Null | Powiązany ticket              |
| user_id        | Integer      | FK → Users, Not Null   | Autor komentarza              |
| content        | Text         | Not Null               | Treść komentarza              |
| created_at     | DateTime     | Not Null, Default NOW  | Data utworzenia               |
| is_internal    | Boolean      | Default False          | Czy notatka wewnętrzna        |

#### Tabela: Attachments (opcjonalna)
| Pole           | Typ          | Ograniczenia           | Opis                          |
|----------------|--------------|------------------------|-------------------------------|
| id             | Integer      | PK, Auto Increment     | Unikalny identyfikator        |
| ticket_id      | Integer      | FK → Tickets, Not Null | Powiązany ticket              |
| filename       | String(255)  | Not Null               | Nazwa pliku                   |
| filepath       | String(500)  | Not Null               | Ścieżka do pliku              |
| uploaded_by    | Integer      | FK → Users, Not Null   | Kto dodał załącznik           |
| uploaded_at    | DateTime     | Not Null, Default NOW  | Data uploadu                  |

---

## 6. Stack technologiczny

### 6.1 Backend
- **Framework:** Flask 3.0.0
- **ORM:** SQLAlchemy 2.0+
- **Autentykacja:** Flask-Login
- **Formularze:** Flask-WTF
- **Migracje:** Flask-Migrate (Alembic)
- **Hashing haseł:** Werkzeug Security

### 6.2 Frontend
- **HTML5/CSS3**
- **JavaScript:** Vanilla JS lub Vue.js 3
- **CSS Framework:** Bootstrap 5 lub Tailwind CSS (opcjonalnie)
- **Ikony:** Font Awesome

### 6.3 Baza danych
- **Development:** SQLite
- **Production:** PostgreSQL (opcjonalnie)

### 6.4 Narzędzia deweloperskie
- **Kontrola wersji:** Git + GitHub
- **Virtual env:** venv lub virtualenv
- **Package manager:** pip
- **Linter:** flake8, pylint
- **Formatter:** black

### 6.5 Deployment (opcjonalnie)
- **Serwer:** Gunicorn + Nginx
- **Hosting:** Heroku, PythonAnywhere, lub VPS
- **Konteneryzacja:** Docker (opcjonalnie)

---

## 7. Harmonogram i podział pracy

### 7.1 Kamienie milowe

| Milestone | Termin     | Zadania                                                    |
|-----------|------------|------------------------------------------------------------|
| M1        | Tydzień 1  | Dokument SRS, setup projektu, struktura bazy danych        |
| M2        | Tydzień 2  | Moduł autentykacji, podstawowe modele                      |
| M3        | Tydzień 3  | Tworzenie i wyświetlanie ticketów                          |
| M4        | Tydzień 4  | Komentarze, zmiana statusów, przypisywanie                 |
| M5        | Tydzień 5  | Filtrowanie, wyszukiwanie, dashboard                       |
| M6        | Tydzień 6  | Panel administratora, statystyki                           |
| M7        | Tydzień 7  | Frontend styling, responsywność                            |
| M8        | Tydzień 8  | Testy, bugfixy, dokumentacja                               |
| M9        | Tydzień 9  | Deployment, finalizacja, prezentacja                       |

### 7.2 Podział odpowiedzialności

#### Osoba 1: Backend & Baza Danych
- Setup projektu Flask
- Modele SQLAlchemy (Users, Tickets, Comments, Attachments)
- Migracje bazy danych
- Routing i kontrolery
- System autentykacji (login, register, logout)
- API endpoints (jeśli planowane)
- Logika biznesowa (zmiana statusów, przypisywanie)

#### Osoba 2: Frontend & UX
- Szablony HTML (Jinja2)
- Stylowanie CSS (Bootstrap/custom)
- Formularze HTML + walidacja
- JavaScript (interaktywność, AJAX)
- Responsywny design
- UX/UI design (layout, kolorystyka)
- Accessibility (A11Y)

#### Osoba 3: Logika Biznesowa & Integracja
- System komentarzy
- Filtrowanie i wyszukiwanie ticketów
- Dashboard i statystyki
- Wykresy (Chart.js)
- Powiadomienia (opcjonalnie)
- Integracja frontend-backend
- Testy jednostkowe i integracyjne
- Dokumentacja (README, instrukcje)
- Deployment

---

## 8. Instrukcje instalacji (wstępne)

### 8.1 Wymagania wstępne
- Python 3.10 lub nowszy
- pip
- Git
- Przeglądarka internetowa (Chrome/Firefox/Edge)

### 8.2 Instalacja lokalna

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/[nazwa-zespolu]/helpdesk-system.git
cd helpdesk-system

# 2. Utworzenie wirtualnego środowiska
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Instalacja zależności
pip install -r requirements.txt

# 4. Konfiguracja zmiennych środowiskowych
cp .env.example .env
# Edytować .env (klucz SECRET_KEY, database URL)

# 5. Inicjalizacja bazy danych
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 6. Utworzenie użytkownika administracyjnego (opcjonalnie)
python create_admin.py

# 7. Uruchomienie aplikacji
flask run
```

### 8.3 Dostęp do aplikacji
- Aplikacja dostępna pod: `http://localhost:5000`
- Login administratora: admin@example.com / haslo (do zmiany)

---

## 9. Testowanie

### 9.1 Scenariusze testowe

#### Test 1: Rejestracja i logowanie
1. Użytkownik wchodzi na `/register`
2. Wypełnia formularz rejestracyjny
3. System tworzy konto
4. Użytkownik loguje się
5. **Oczekiwany rezultat:** Przekierowanie do dashboardu

#### Test 2: Utworzenie ticketu
1. Użytkownik klika "Nowy ticket"
2. Wypełnia formularz (tytuł, kategoria, opis)
3. Przesyła formularz
4. **Oczekiwany rezultat:** Ticket widoczny na liście, status "Nowy"

#### Test 3: Przypisanie ticketu przez technika
1. Technik loguje się
2. Widzi listę ticketów
3. Otwiera ticket, klika "Przypisz do mnie"
4. **Oczekiwany rezultat:** Status zmienia się na "W trakcie", ticket przypisany

#### Test 4: Dodanie komentarza
1. Użytkownik otwiera swój ticket
2. Dodaje komentarz
3. **Oczekiwany rezultat:** Komentarz widoczny w historii

#### Test 5: Filtrowanie ticketów
1. Technik wybiera filtry (status: "Nowy", priorytet: "Wysoki")
2. Klika "Filtruj"
3. **Oczekiwany rezultat:** Lista zawiera tylko pasujące tickety

#### Test 6: Statystyki administratora
1. Admin wchodzi na `/admin`
2. **Oczekiwany rezultat:** Widzi wykresy i liczby ticketów

### 9.2 Testy jednostkowe
- Testy modeli (tworzenie, walidacja)
- Testy routingu (status codes)
- Testy formularzy (walidacja)

### 9.3 Testy bezpieczeństwa
- Próba dostępu do cudzych ticketów (bez uprawnień)
- XSS w komentarzach
- SQL injection w formularzach
- CSRF w akcjach modyfikujących

---

## 10. Ryzyka i ograniczenia

### 10.1 Ryzyka techniczne
| Ryzyko                          | Prawdopodobieństwo | Wpływ  | Mitygacja                               |
|---------------------------------|--------------------|--------|-----------------------------------------|
| Problemy z bazą danych          | Średnie            | Wysoki | Regularne backupy, testy                |
| Błędy w logice przypisywania    | Średnie            | Średni | Code review, testy jednostkowe          |
| Wydajność przy dużej liczbie    | Niskie             | Średni | Indeksy w bazie, paginacja              |
| Problemy z uploadem plików      | Średnie            | Niski  | Walidacja, limity rozmiaru              |

### 10.2 Ryzyka organizacyjne
| Ryzyko                          | Prawdopodobieństwo | Wpływ  | Mitygacja                               |
|---------------------------------|--------------------|--------|-----------------------------------------|
| Opóźnienia w harmonogramie      | Średnie            | Wysoki | Bufor czasowy, priorytetyzacja funkcji  |
| Konflikty w zespole             | Niskie             | Średni | Regularne spotkania, jasny podział      |
| Brak komunikacji                | Niskie             | Wysoki | Daily standups (opcjonalnie), Slack/Discord |

### 10.3 Ograniczenia wersji MVP
- Brak integracji z email (powiadomienia)
- Brak systemu uprawnień zaawansowanych
- Brak SLA automation
- Brak knowledge base
- Brak raportów w PDF
- Brak API publicznego
- Brak wsparcia wielojęzycznego

---

## 11. Kryteria akceptacji

### 11.1 Funkcjonalne
- ✅ Użytkownik może zarejestrować się i zalogować
- ✅ Użytkownik może utworzyć ticket z wszystkimi wymaganymi polami
- ✅ Technik widzi wszystkie tickety i może je filtrować
- ✅ Technik może przypisać ticket do siebie i zmienić status
- ✅ Użytkownicy mogą dodawać komentarze
- ✅ Administrator widzi statystyki i może zarządzać użytkownikami
- ✅ System zapisuje dane do bazy danych
- ✅ Wszystkie formularze mają walidację

### 11.2 Niefunkcjonalne
- ✅ Aplikacja działa w przeglądarkach: Chrome, Firefox, Edge
- ✅ Interfejs jest responsywny (działa na mobile)
- ✅ Hasła są zahashowane
- ✅ Strony ładują się < 2 sekundy (na lokalnym serwerze)
- ✅ Kod jest czytelny i udokumentowany
- ✅ Projekt jest na GitHubie z README

### 11.3 Dokumentacja
- ✅ Dokument SRS kompletny
- ✅ README z instrukcjami instalacji
- ✅ requirements.txt z zależnościami
- ✅ Komentarze w kodzie (docstrings)
- ✅ Diagram ERD bazy danych

---

## 12. Słownik pojęć

| Termin       | Definicja                                                                 |
|--------------|---------------------------------------------------------------------------|
| Ticket       | Zgłoszenie problemu lub zapytania w systemie helpdesk                    |
| Status       | Stan ticketu (Nowy, W trakcie, Rozwiązany, Zamknięty)                    |
| Priorytet    | Ważność ticketu (Niski, Średni, Wysoki, Krytyczny)                       |
| Kategoria    | Rodzaj problemu (Sprzęt, Oprogramowanie, Sieć, Inne)                     |
| Dashboard    | Panel główny użytkownika z podsumowaniem                                 |
| Technik      | Użytkownik z rolą rozwiązującą problemy                                  |
| SLA          | Service Level Agreement - umowa o poziomie usług (czas reakcji)          |
| MVP          | Minimum Viable Product - minimalna wersja produktu                       |
| ORM          | Object-Relational Mapping - mapowanie obiektów na bazę danych            |
| CRUD         | Create, Read, Update, Delete - podstawowe operacje na danych             |
| Session      | Sesja użytkownika - stan zalogowania                                     |
| Hash         | Zahashowane hasło - nieodwracalne szyfrowanie                            |
| Migration    | Migracja bazy danych - zmiana struktury                                  |

---

## 13. Załączniki

### 13.1 Wireframes (do dodania)
- Szkice interfejsów użytkownika
- Mockupy formularzy
- Flowcharty procesów

### 13.2 Przykładowe dane
- Testowi użytkownicy
- Przykładowe tickety
- Scenariusze demo

### 13.3 Referencje
- Dokumentacja Flask: https://flask.palletsprojects.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Bootstrap: https://getbootstrap.com/
- GitHub Repo: https://github.com/[nazwa-zespolu]/helpdesk-system

---

## 14. Historia zmian dokumentu

| Wersja | Data       | Autor              | Opis zmian                    |
|--------|------------|--------------------|-------------------------------|
| 1.0    | 2024-12-07 | [Nazwa Zespołu]    | Pierwsza wersja dokumentu SRS |

---

## 15. Zatwierdzenie

**Opracował:**
- [Imię Nazwisko 1] - Backend Developer
- [Imię Nazwisko 2] - Frontend Developer  
- [Imię Nazwisko 3] - Full Stack Developer

**Data:** 7 grudnia 2024

**Zatwierdzono przez:**
- Prowadzący: ................................

---

**Koniec dokumentu SRS**
