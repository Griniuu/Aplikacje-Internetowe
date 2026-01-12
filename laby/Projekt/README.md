# 🎫 System Ticketów Helpdesk

System webowy do zarządzania zgłoszeniami helpdesk, stworzony w ramach projektu z przedmiotu Aplikacje Internetowe.

## 📋 Opis projektu

System Ticketów Helpdesk to aplikacja webowa umożliwiająca:
- Zgłaszanie problemów technicznych przez użytkowników
- Zarządzanie zgłoszeniami przez techników
- Śledzenie statusu zgłoszeń
- Komunikację między użytkownikami a technikami
- Generowanie statystyk dla administratorów

## ✨ Funkcjonalności

### Dla użytkowników:
- ✅ Rejestracja i logowanie
- ✅ Tworzenie nowych ticketów z opisem problemu
- ✅ Przeglądanie własnych ticketów
- ✅ Dodawanie komentarzy do ticketów
- ✅ Dashboard z podsumowaniem

### Dla techników:
- ✅ Przeglądanie wszystkich ticketów
- ✅ Filtrowanie według statusu, priorytetu, kategorii
- ✅ Przypisywanie ticketów do siebie
- ✅ Zmiana statusów ticketów
- ✅ Dodawanie notatek wewnętrznych
- ✅ Dashboard z ticketami przypisanymi

### Dla administratorów:
- ✅ Wszystkie funkcje technika
- ✅ Zarządzanie użytkownikami
- ✅ Pełne statystyki systemu
- ✅ Panel administracyjny

## 🚀 Technologie

**Backend:**
- Python 3.10+
- Flask 3.0.0
- SQLAlchemy (ORM)
- Flask-Login (autentykacja)
- Flask-WTF (formularze)

**Frontend:**
- HTML5/CSS3
- JavaScript (Vanilla)
- Responsywny design

**Baza danych:**
- SQLite (development)

## 📦 Instalacja

### Wymagania wstępne
- Python 3.10 lub nowszy
- pip
- Git

### Krok po kroku

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/[nazwa-zespolu]/helpdesk-system.git
cd helpdesk-system
```

2. **Utwórz wirtualne środowisko**
```bash
python -m venv venv
```

3. **Aktywuj wirtualne środowisko**
- Windows (PowerShell):
```powershell
venv\Scripts\Activate.ps1
```
- Windows (CMD):
```cmd
venv\Scripts\activate.bat
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. **Zainstaluj zależności**
```bash
pip install -r requirements.txt
```

5. **Utwórz plik konfiguracyjny**
```bash
cp .env.example .env
```

Edytuj plik `.env` i ustaw własny klucz SECRET_KEY:
```
SECRET_KEY=twoj-unikalny-sekretny-klucz
```

6. **Uruchom aplikację**
```bash
python app.py
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5000`

## 🔐 Konta testowe

Po pierwszym uruchomieniu automatycznie tworzone jest konto administratora:

**Administrator:**
- Email: `admin@helpdesk.pl`
- Hasło: `admin123`

**⚠️ WAŻNE:** Zmień hasło admina po pierwszym logowaniu!

Możesz utworzyć dodatkowe konta poprzez formularz rejestracji.

## 📁 Struktura projektu

```
Projekt/
├── app.py                      # Główna aplikacja Flask
├── models.py                   # Modele bazy danych
├── forms.py                    # Formularze WTForms
├── config.py                   # Konfiguracja
├── requirements.txt            # Zależności Python
├── .env.example               # Przykładowa konfiguracja
├── .gitignore                 # Pliki ignorowane przez Git
├── README.md                  # Ten plik
├── SRS_System_Ticketow.md     # Dokumentacja SRS
├── static/
│   ├── css/
│   │   └── style.css          # Style CSS
│   └── js/
│       └── main.js            # JavaScript
├── templates/
│   ├── base.html              # Szablon bazowy
│   ├── login.html             # Strona logowania
│   ├── register.html          # Strona rejestracji
│   ├── dashboard.html         # Panel główny
│   ├── ticket_list.html       # Lista ticketów
│   ├── ticket_create.html     # Tworzenie ticketu
│   ├── ticket_detail.html     # Szczegóły ticketu
│   └── admin_panel.html       # Panel administratora
└── database.db                # Baza danych SQLite (tworzona automatycznie)
```

## 🗄️ Model bazy danych

### Tabele:

**Users**
- id, email, password_hash, full_name, role, created_at, is_active

**Tickets**
- id, title, description, category, priority, status, location
- created_by, assigned_to, created_at, updated_at, resolved_at

**Comments**
- id, ticket_id, user_id, content, created_at, is_internal

## 🎯 Przykłady użycia

### Tworzenie nowego ticketu
1. Zaloguj się jako użytkownik
2. Kliknij "Nowy Ticket"
3. Wypełnij formularz:
   - Tytuł: np. "Brak internetu w pokoju 301"
   - Kategoria: Sieć
   - Priorytet: Wysoki
   - Opis: Szczegółowy opis problemu
4. Kliknij "Zgłoś ticket"

### Przypisanie ticketu (technik)
1. Zaloguj się jako technik
2. Przejdź do listy ticketów
3. Otwórz wybrany ticket
4. Kliknij "Przypisz do mnie"
5. Dodaj komentarz z rozwiązaniem
6. Zmień status na "Rozwiązany"

## 🔍 Filtrowanie ticketów

Dostępne filtry:
- **Status:** Nowy, W trakcie, Rozwiązany, Zamknięty
- **Priorytet:** Niski, Średni, Wysoki, Krytyczny
- **Kategoria:** Sprzęt, Oprogramowanie, Sieć, Inne

## 🛠️ Rozwój i contribucje

### Uruchomienie w trybie deweloperskim

```bash
export FLASK_ENV=development  # Linux/Mac
set FLASK_ENV=development     # Windows CMD
$env:FLASK_ENV="development"  # Windows PowerShell

python app.py
```

### Dodawanie nowych funkcji

1. Utwórz nową gałąź
```bash
git checkout -b feature/nazwa-funkcji
```

2. Wprowadź zmiany i commituj
```bash
git add .
git commit -m "Dodano nową funkcję"
```

3. Wypchnij zmiany
```bash
git push origin feature/nazwa-funkcji
```

4. Utwórz Pull Request na GitHubie

## 📝 Licencja

Projekt stworzony na potrzeby akademickie.

## 👥 Zespół

- [Imię Nazwisko 1] - Backend & Baza Danych
- [Imię Nazwisko 2] - Frontend & UX
- [Imię Nazwisko 3] - Logika Biznesowa & Integracja

## 📞 Kontakt

W razie pytań skontaktuj się przez:
- GitHub Issues
- Email: [email]

## 🐛 Znane problemy

- Brak obsługi załączników (planowane w przyszłości)
- Brak powiadomień email (planowane w przyszłości)

## 🔮 Plany rozwoju

- [ ] System powiadomień email
- [ ] Obsługa załączników (obrazy, pliki)
- [ ] Eksport raportów do PDF
- [ ] API REST
- [ ] Aplikacja mobilna
- [ ] Integracja z systemami zewnętrznymi (LDAP)

---

**Data utworzenia:** Grudzień 2024  
**Wersja:** 1.0
