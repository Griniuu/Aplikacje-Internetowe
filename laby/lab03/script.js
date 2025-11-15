// Podstawowy plik script.js - główna logika znajduje się w puzzle-map.js

// Funkcje pomocnicze i dodatkowe funkcjonalności

// Sprawdzenie obsługi funkcji przez przeglądarkę
function checkBrowserSupport() {
    const support = {
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        dragDrop: 'draggable' in document.createElement('div'),
        canvas: !!document.createElement('canvas').getContext
    };
    
    console.log('Obsługa przeglądarki:', support);
    return support;
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplikacja Puzzle Mapowe załadowana');
    
    // Sprawdź obsługę przeglądarki
    const support = checkBrowserSupport();
    
    // Wyświetl ostrzeżenia jeśli brak obsługi
    if (!support.geolocation) {
        console.warn('Geolokalizacja nie jest obsługiwana');
    }
    
    if (!support.notifications) {
        console.warn('Powiadomienia nie są obsługiwane');
    }
    
    if (!support.dragDrop) {
        console.warn('Drag & Drop nie jest obsługiwany');
    }
});

// Funkcje debug (można usunąć w produkcji)
window.debugPuzzle = {
    logState: () => {
        if (window.puzzleApp) {
            console.log('Stan puzzle:', {
                location: window.puzzleApp.currentLocation,
                puzzleGenerated: window.puzzleApp.puzzleGenerated,
                correctPositions: window.puzzleApp.correctPositions,
                currentPositions: window.puzzleApp.currentPositions
            });
        }
    },
    
    solvePuzzle: () => {
        if (window.puzzleApp) {
            window.puzzleApp.solvePuzzle();
        }
    }
};
