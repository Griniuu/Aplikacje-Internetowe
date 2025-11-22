
const API_KEY = '7ded80d91f2b280ec979100cc8bbba94'; 
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Elementy DOM
const cityInput = document.getElementById('cityInput');
const weatherBtn = document.getElementById('weatherBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorText = document.getElementById('errorText');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');

// Event listeners
weatherBtn.addEventListener('click', handleWeatherSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleWeatherSearch();
    }
});

// Główna funkcja obsługująca wyszukiwanie
async function handleWeatherSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Proszę wprowadzić nazwę miasta');
        return;
    }

    // Sprawdzenie czy klucz API został ustawiony
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Błąd: Nie ustawiono klucza API. Pobierz darmowy klucz z https://openweathermap.org/api');
        return;
    }

    showLoading();
    hideError();
    hideWeatherData();

    try {
        // Równoczesne pobieranie danych
        await Promise.all([
            getCurrentWeatherXHR(city),
            get5DayForecastFetch(city)
        ]);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Wystąpił błąd podczas pobierania danych pogodowych');
    } finally {
        hideLoading();
    }
}

// Pobieranie aktualnej pogody - XMLHttpRequest
function getCurrentWeatherXHR(city) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
        
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('XMLHttpRequest - Dane z API Current Weather:', data);
                    displayCurrentWeather(data);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Błąd parsowania danych'));
                }
            } else if (xhr.status === 404) {
                showError('Nie znaleziono miasta. Sprawdź poprawność nazwy.');
                reject(new Error('City not found'));
            } else {
                showError(`Błąd HTTP: ${xhr.status}`);
                reject(new Error(`HTTP Error: ${xhr.status}`));
            }
        };
        
        xhr.onerror = function() {
            showError('Błąd połączenia. Sprawdź połączenie internetowe.');
            reject(new Error('Network error'));
        };
        
        xhr.send();
    });
}

// Pobieranie prognozy 5-dniowej - Fetch API
async function get5DayForecastFetch(city) {
    const url = `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Nie znaleziono miasta');
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetch API - Dane z API 5 Day Forecast:', data);
        display5DayForecast(data);
        return data;
    } catch (error) {
        console.error('Forecast fetch error:', error);
        throw error;
    }
}

// Wyświetlanie aktualnej pogody
function displayCurrentWeather(data) {
    const {
        name,
        main: { temp, feels_like, humidity, pressure },
        weather,
        wind: { speed }
    } = data;

    document.getElementById('cityName').textContent = name;
    document.getElementById('temperature').textContent = Math.round(temp);
    document.getElementById('weatherDescription').textContent = 
        weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);
    document.getElementById('feelsLike').textContent = `${Math.round(feels_like)}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    document.getElementById('wind').textContent = `${speed.toFixed(1)} m/s`;
    
    // Ikona pogody
    const iconCode = weather[0].icon;
    document.getElementById('weatherIcon').innerHTML = getWeatherIcon(iconCode);
    
    currentWeatherDiv.classList.remove('hidden');
}

// Wyświetlanie prognozy 5-dniowej
function display5DayForecast(data) {
    const forecastContent = document.getElementById('forecastContent');
    forecastContent.innerHTML = '';
    
    console.log('Forecast data received:', data); // Debug
    
    // Grupowanie prognoz po dniach - bierzemy jeden wpis na dzień (najlepiej południe)
    const dailyMap = new Map();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString(); // Klucz: unikalna data
        
        // Jeśli nie mamy jeszcze wpisu dla tego dnia, dodaj
        // Lub jeśli nowy wpis jest bliżej południa (12:00)
        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, item);
        } else {
            const existingHour = new Date(dailyMap.get(dateKey).dt * 1000).getHours();
            const currentHour = date.getHours();
            // Preferuj wpisy bliżej 12:00
            if (Math.abs(currentHour - 12) < Math.abs(existingHour - 12)) {
                dailyMap.set(dateKey, item);
            }
        }
    });
    
    // Konwertuj mapę na tablicę i weź pierwsze 5 dni
    const dailyForecasts = Array.from(dailyMap.values()).slice(0, 5);
    
    console.log('Daily forecasts to display:', dailyForecasts.length); // Debug
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = getDayName(date);
        const dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-item';
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">${getWeatherIcon(forecast.weather[0].icon)}</div>
            <div class="forecast-temp">
                <span class="temp-high">${Math.round(forecast.main.temp_max)}°</span>
                <span class="temp-low">${Math.round(forecast.main.temp_min)}°</span>
            </div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
            <div class="forecast-details">
                <span>💧 ${forecast.main.humidity}%</span>
                <span>💨 ${forecast.wind.speed.toFixed(1)} m/s</span>
            </div>
        `;
        
        forecastContent.appendChild(forecastCard);
    });
    
    forecastDiv.classList.remove('hidden');
}

// Pomocnicze funkcje
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
}

function getDayName(date) {
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Dziś';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Jutro';
    }
    return days[date.getDay()];
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function hideWeatherData() {
    currentWeatherDiv.classList.add('hidden');
    forecastDiv.classList.add('hidden');
}

// Informacja startowa
console.log('Aplikacja Pogodowa załadowana');
console.log('UWAGA: Aby aplikacja działała, ustaw swój klucz API w pliku weather.js');
console.log('Darmowy klucz API można uzyskać na: https://openweathermap.org/api');
