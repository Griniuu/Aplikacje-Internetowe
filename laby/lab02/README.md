# TODO List - LAB 02 - Instrukcja testowania

## 🎯 Wszystkie wymagania zostały spełnione + ROZSZERZONE:

### ✅ **Wymagania podstawowe:**
- [x] Pojedyncza strona HTML ze skryptem ładowanym z zewnętrznego pliku JS
- [x] Lista zadań z tytułem i opisem
- [x] Pole tekstowe do dodawania tytułu zadania (3-100 znaków)
- [x] Pole tekstowe do dodawania opisu zadania (0-500 znaków)
- [x] Pole typu data/czas do określenia terminu wykonania
- [x] Przycisk dodawania zadania

### ✅ **Walidacja rozszerzona:**
- [x] Tytuł: co najmniej 3 znaki, max 100 znaków
- [x] Opis: opcjonalny, max 500 znaków
- [x] Data musi być pusta albo w przyszłości

### ✅ **Wyszukiwarka rozszerzona:**
- [x] Pole wyszukiwarki na górze listy
- [x] Wyświetlanie wyników po wpisaniu min. 2 znaków
- [x] Przeszukiwanie zarówno tytułu jak i opisu
- [x] Wyróżnienie wyszukiwanej frazy w wynikach

### ✅ **Edycja w miejscu rozszerzona:**
- [x] Kliknięcie na pozycję listy zmienia ją w pola edycji
- [x] Edycja zarówno tytułu jak i opisu
- [x] Kliknięcie poza pozycję zapisuje zmiany
- [x] Obsługa klawiatury (Enter, Shift+Enter, Escape)

### ✅ **Usuwanie:**
- [x] Przycisk Usuń obok każdej pozycji
- [x] Potwierdzenie usunięcia

### ✅ **Trwałość danych:**
- [x] Zapis do Local Storage
- [x] Automatyczne ładowanie po odświeżeniu strony

## 🚀 **Dodatkowe funkcje:**
- **Struktura zadania:** Tytuł + Opis + Data
- **Inteligentna wyszukiwarka:** Przeszukuje tytuł i opis
- **Zaawansowana edycja:** Osobne pola dla tytułu i opisu
- Responsywny design
- Animacje i efekty hover
- Oznaczanie przeterminowanych zadań
- Statystyki (liczba zadań)
- Obsługa klawiatury
- Walidacja w czasie rzeczywistym
- Pusty stan aplikacji
- Komunikaty o błędach

## 🧪 **Jak przetestować:**

1. **Otwórz `index.html` w przeglądarce**

2. **Test dodawania zadań:**
   - Wprowadź tytuł krócej niż 3 znaki → przycisk nieaktywny
   - Wprowadź tytuł 3+ znaków → przycisk aktywny
   - Dodaj opis (opcjonalnie) → max 500 znaków
   - Dodaj zadanie z datą w przyszłości ✅
   - Spróbuj dodać zadanie z datą w przeszłości ❌

3. **Test wyszukiwania:**
   - Wpisz 1 znak → brak filtrowania
   - Wpisz 2+ znaków → filtrowanie listy
   - Sprawdź wyszukiwanie w tytule i opisie
   - Sprawdź wyróżnienie frazy

4. **Test edycji:**
   - Kliknij na zadanie → tryb edycji (tytuł + opis)
   - Zmień tytuł i opis, kliknij poza → zapis
   - Naciśnij Enter → zapis
   - Naciśnij Shift+Enter w opisie → nowa linia
   - Naciśnij Escape → anulowanie

5. **Test usuwania:**
   - Kliknij przycisk "🗑️ Usuń"
   - Potwierdź usunięcie

6. **Test Local Storage:**
   - Dodaj kilka zadań
   - Odśwież stronę (F5)
   - Sprawdź czy zadania się zachowały

## 📱 **Responsywność:**
Aplikacja działa na urządzeniach mobilnych i desktopowych.

## 🎨 **Design:**
- Nowoczesny interfejs
- Gradientowe tła
- Płynne animacje
- Intuicyjna nawigacja