// Funkcje do obsługi uprawnień - lokalizacja i powiadomienia

// Funkcja do pytania o zgodę na lokalizację
async function requestLocationPermission() {
    try {
        // Sprawdzenie czy geolokalizacja jest dostępna
        if (!navigator.geolocation) {
            throw new Error('Geolokalizacja nie jest obsługiwana przez tę przeglądarkę');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                // Sukces - użytkownik zgodził się
                (position) => {
                    console.log('Lokalizacja otrzymana:', position.coords);
                    resolve({
                        status: 'granted',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                // Błąd - użytkownik odmówił lub wystąpił błąd
                (error) => {
                    let message;
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = "Użytkownik odmówił dostępu do lokalizacji";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Informacje o lokalizacji są niedostępne";
                            break;
                        case error.TIMEOUT:
                            message = "Przekroczono czas oczekiwania na lokalizację";
                            break;
                        default:
                            message = "Wystąpił nieznany błąd";
                            break;
                    }
                    reject({ status: 'denied', message });
                },
                // Opcje
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    } catch (error) {
        throw { status: 'error', message: error.message };
    }
}

// Funkcja do pytania o zgodę na powiadomienia
async function requestNotificationPermission() {
    try {
        // Sprawdzenie czy powiadomienia są obsługiwane
        if (!('Notification' in window)) {
            throw new Error('Powiadomienia nie są obsługiwane przez tę przeglądarkę');
        }

        // Sprawdzenie obecnego statusu uprawnień
        let permission = Notification.permission;
        
        if (permission === 'default') {
            // Pytanie o zgodę
            permission = await Notification.requestPermission();
        }

        switch (permission) {
            case 'granted':
                console.log('Zgoda na powiadomienia udzielona');
                return { status: 'granted', message: 'Powiadomienia zostały włączone' };
            
            case 'denied':
                console.log('Zgoda na powiadomienia odrzucona');
                return { status: 'denied', message: 'Powiadomienia zostały zablokowane' };
            
            default:
                console.log('Zgoda na powiadomienia nie została udzielona');
                return { status: 'default', message: 'Nie podjęto decyzji o powiadomieniach' };
        }
    } catch (error) {
        throw { status: 'error', message: error.message };
    }
}

// Funkcja do wysłania powiadomienia
function sendNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: options.icon || 'https://via.placeholder.com/64x64.png?text=🧩',
            tag: options.tag || 'puzzle-notification',
            requireInteraction: options.requireInteraction || false,
            ...options
        });

        // Obsługa kliknięcia w powiadomienie
        notification.onclick = function() {
            console.log('Powiadomienie zostało kliknięte');
            window.focus();
            notification.close();
        };

        // Automatyczne zamknięcie po 5 sekundach
        setTimeout(() => {
            notification.close();
        }, 5000);

        return notification;
    } else {
        console.log('Brak uprawnień do wysyłania powiadomień');
        return null;
    }
}

// Sprawdzenie statusu uprawnień
function checkLocationPermission() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ status: 'not-supported' });
            return;
        }

        // Sprawdzenie przez próbę uzyskania lokalizacji (szybka metoda)
        navigator.geolocation.getCurrentPosition(
            () => resolve({ status: 'granted' }),
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    resolve({ status: 'denied' });
                } else {
                    resolve({ status: 'prompt' });
                }
            },
            { timeout: 100, maximumAge: 60000 }
        );
    });
}

function checkNotificationPermission() {
    if (!('Notification' in window)) {
        return { status: 'not-supported' };
    }
    
    return { status: Notification.permission };
}

console.log('🔐 Moduł uprawnień załadowany');