// Główna aplikacja Puzzle Mapowe
class PuzzleMapApp {
    constructor() {
        this.map = null;
        this.currentLocation = null;
        this.mapImageUrl = null;
        this.draggedElement = null;
        this.puzzleGenerated = false;
        
        this.init();
    }

    init() {
        // Inicjalizacja po załadowaniu DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.requestInitialPermissions();
        });
    }

    setupEventListeners() {
        // Przyciski
        document.getElementById('getLocationBtn').addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('randomLocationBtn').addEventListener('click', () => this.getRandomLocation());
        document.getElementById('downloadMapBtn').addEventListener('click', () => this.downloadMap());
        document.getElementById('generatePuzzleBtn').addEventListener('click', () => this.generatePuzzle());
        document.getElementById('solvePuzzleBtn').addEventListener('click', () => this.solvePuzzle());
    }

    // Automatyczne pytanie o uprawnienia przy starcie
    async requestInitialPermissions() {
        this.showStatus('Pytanie o uprawnienia...', 'info');
        
        // Najpierw poproś o powiadomienia
        try {
            this.showStatus('Poproszę o zgodę na powiadomienia...', 'info');
            const notificationResult = await requestNotificationPermission();
            
            if (notificationResult.status === 'granted') {
                this.showStatus('Zgoda na powiadomienia udzielona!', 'success');
            } else {
                this.showStatus('Brak zgody na powiadomienia - nie otrzymasz powiadomień', 'info');
            }
        } catch (error) {
            this.showStatus('Powiadomienia nie są obsługiwane', 'info');
            console.log('Błąd z powiadomieniami:', error);
        }

        // Potem poproś o lokalizację  
        try {
            this.showStatus('Poproszę o dostęp do lokalizacji...', 'info');
            const locationResult = await requestLocationPermission();
            
            if (locationResult.status === 'granted') {
                this.currentLocation = {
                    lat: locationResult.latitude,
                    lng: locationResult.longitude
                };
                this.showStatus('Lokalizacja pobrana automatycznie!', 'success');
                this.updateCoordinates(locationResult.latitude, locationResult.longitude);
                this.initializeMap(locationResult.latitude, locationResult.longitude);
                document.getElementById('getLocationBtn').disabled = false;
                document.getElementById('downloadMapBtn').disabled = false;
                document.getElementById('generatePuzzleBtn').disabled = false;
            } else {
                this.showStatus('Brak dostępu do lokalizacji - użyj "Losowa lokalizacja"', 'info');
                document.getElementById('getLocationBtn').disabled = true;
            }
        } catch (error) {
            this.showStatus('Błąd lokalizacji - użyj "Losowa lokalizacja"', 'error');
            document.getElementById('getLocationBtn').disabled = true;
        }
    }



    // Pobranie zgody na lokalizację i uzyskanie współrzędnych
    async getCurrentLocation() {
        this.showStatus('Pytanie o zgodę na lokalizację...', 'info');
        
        try {
            const result = await requestLocationPermission();
            
            if (result.status === 'granted') {
                this.currentLocation = {
                    lat: result.latitude,
                    lng: result.longitude
                };
                
                this.showStatus(`Lokalizacja pobrana: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`, 'success');
                this.updateCoordinates(result.latitude, result.longitude);
                this.initializeMap(result.latitude, result.longitude);
                
                // Włącz przyciski
                document.getElementById('downloadMapBtn').disabled = false;
                document.getElementById('generatePuzzleBtn').disabled = false;
                
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showStatus(`Błąd lokalizacji: ${error.message}`, 'error');
        }
    }

    // Losowa lokalizacja (dla testów)
    getRandomLocation() {
        const locations = [
            { lat: 52.2297, lng: 21.0122, name: "Warszawa" },
            { lat: 50.0647, lng: 19.9450, name: "Kraków" },
            { lat: 51.1079, lng: 17.0385, name: "Wrocław" },
            { lat: 54.3520, lng: 18.6466, name: "Gdańsk" },
            { lat: 52.4064, lng: 16.9252, name: "Poznań" }
        ];
        
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        this.currentLocation = randomLocation;
        
        this.showStatus(`Wybrano losową lokalizację: ${randomLocation.name}`, 'success');
        this.updateCoordinates(randomLocation.lat, randomLocation.lng);
        this.initializeMap(randomLocation.lat, randomLocation.lng);
        
        // Włącz przyciski
        document.getElementById('downloadMapBtn').disabled = false;
        document.getElementById('generatePuzzleBtn').disabled = false;
    }

    // Inicjalizacja mapy Leaflet
    initializeMap(lat, lng) {
        if (this.map) {
            this.map.remove();
        }

        this.map = L.map('sourceMap').setView([lat, lng], 15);
        
        // Dodanie warstwy OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Marker dla obecnej lokalizacji
        L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup('📍 Twoja lokalizacja')
            .openPopup();

        // Wymusz ponowne obliczenie rozmiaru mapy
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);

        this.showStatus('Mapa załadowana. Możesz pobrać mapę lub wygenerować puzzle!', 'success');
    }

    // Pobieranie mapy jako obraz rastrowy
    async downloadMap() {
        this.showStatus('Przygotowywanie mapy do pobrania...', 'info');
        
        try {
            // Eksport mapy jako obraz
            console.log('🔄 Rozpoczynam eksport mapy...');
            await this.exportMapAsImage();
            
            // Sprawdź czy obraz został wygenerowany
            if (!this.mapImageUrl) {
                throw new Error('Nie udało się wygenerować obrazu mapy');
            }
            
            console.log('📁 Tworzę link do pobrania...');
            
            // Stworzenie linku do pobrania
            const link = document.createElement('a');
            link.download = `mapa_${this.currentLocation.lat.toFixed(4)}_${this.currentLocation.lng.toFixed(4)}.png`;
            link.href = this.mapImageUrl;
            
            // Automatyczne pobranie
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showStatus('Mapa została pobrana! Sprawdź folder Pobrane.', 'success');
            console.log('✅ Mapa pobrana pomyślnie');
            
        } catch (error) {
            this.showStatus(`Błąd pobierania mapy: ${error.message}`, 'error');
            console.error('❌ Błąd pobierania mapy:', error);
        }
    }

    // Generowanie puzzle z mapy
    async generatePuzzle() {
        this.showStatus('Generowanie puzzle...', 'info');
        
        try {
            // Eksport mapy jako obraz rastrowy
            this.showStatus('Pobieranie obrazu mapy...', 'info');
            await this.exportMapAsImage();
            
            if (!this.mapImageUrl) {
                throw new Error('Nie udało się wygenerować obrazu mapy');
            }
            
            console.log('✅ Obraz mapy wygenerowany:', this.mapImageUrl.substring(0, 50) + '...');
            console.log('📏 Rozmiar obrazu:', this.mapImageUrl.length, 'znaków');
            
            // Sprawdź czy to prawdziwy obraz a nie fallback
            if (this.mapImageUrl.includes('data:image/png;base64,')) {
                console.log('🎨 Używam prawdziwego obrazu mapy (PNG)');
            } else if (this.mapImageUrl.includes('data:image/')) {
                console.log('🎨 Używam prawdziwego obrazu mapy');
            } else {
                console.log('⚠️ Używam fallback obrazu');
            }
            
            // Dodaj podgląd obrazu do debugowania
            this.showImagePreview();
            
            // Utworzenie 16 kawałków puzzle (4x4)
            this.showStatus('Tworzenie kawałków puzzle...', 'info');
            this.createPuzzlePieces();
            
            // Wymieszanie kawałków
            this.showStatus('Mieszanie kawałków...', 'info');
            this.shufflePuzzlePieces();
            
            this.puzzleGenerated = true;
            document.getElementById('solvePuzzleBtn').disabled = false;
            
            this.showStatus('Puzzle wygenerowane! Przeciągnij kawałki aby je ułożyć.', 'success');
            this.updatePuzzleStatus('Puzzle gotowe do układania (0/16 poprawnych)');
            
        } catch (error) {
            this.showStatus(`Błąd generowania puzzle: ${error.message}`, 'error');
            console.error('Błąd generowania puzzle:', error);
        }
    }



    // Eksport mapy jako obraz rastrowy
    async exportMapAsImage() {
        return new Promise(async (resolve) => {
            console.log('📸 Rozpoczynam eksport mapy jako obraz...');
            
            // Sprawdź rozmiary kontenera mapy
            const mapContainer = document.getElementById('sourceMap');
            const mapRect = mapContainer.getBoundingClientRect();
            console.log(`📏 Rozmiary mapy: ${mapRect.width}x${mapRect.height}px`);
            
            try {
                // Przygotuj mapę do przechwycenia
                await this.prepareMapForCapture();
                
                // Metoda 1: Użycie html2canvas (jeśli dostępne)
                if (typeof html2canvas !== 'undefined') {
                    console.log('🎨 Używam html2canvas...');
                    const mapContainer = document.getElementById('sourceMap');
                    
                    const canvas = await html2canvas(mapContainer, {
                        useCORS: true,
                        allowTaint: false,
                        width: 400,
                        height: 400,
                        backgroundColor: '#f0f0f0',
                        ignoreElements: (element) => {
                            // Ignoruj kontrolki mapy, popupy, itp.
                            return element.classList.contains('leaflet-control') ||
                                   element.classList.contains('leaflet-popup') ||
                                   element.classList.contains('leaflet-tooltip') ||
                                   element.tagName === 'BUTTON';
                        }
                    });
                    
                    this.mapImageUrl = canvas.toDataURL();
                    console.log('✅ Obraz wygenerowany przez html2canvas:', canvas.width + 'x' + canvas.height);
                    
                    // Przywróć elementy mapy
                    this.restoreMapAfterCapture();
                    resolve();
                    return;
                }
                
                // Metoda 2: Ręczne przechwycenie kafelków
                console.log('🔧 Próbuję ręczne przechwycenie kafelków...');
                const imageUrl = await this.captureLeafletTiles();
                this.mapImageUrl = imageUrl;
                console.log('✅ Obraz wygenerowany z kafelków');
                
                // Przywróć elementy mapy
                this.restoreMapAfterCapture();
                resolve();
                
            } catch (error) {
                console.log('⚠️ Błąd eksportu, używam fallback:', error);
                // Metoda 3: Fallback - generowany obraz
                this.mapImageUrl = this.generateFallbackMapImage();
                console.log('✅ Użyto fallback obrazu');
                
                // Przywróć elementy mapy
                this.restoreMapAfterCapture();
                resolve();
            }
        });
    }

    // Przygotowanie mapy do przechwycenia
    async prepareMapForCapture() {
        console.log('🛠️ Przygotowuję mapę do przechwycenia...');
        
        // Zamknij wszystkie popupy
        if (this.map) {
            this.map.closePopup();
        }
        
        // Ukryj kontrolki mapy
        const controls = document.querySelectorAll('#sourceMap .leaflet-control');
        controls.forEach(control => {
            control.style.display = 'none';
        });
        
        // Ukryj przyciski zoom
        const zoomControls = document.querySelectorAll('#sourceMap .leaflet-control-zoom');
        zoomControls.forEach(control => {
            control.style.display = 'none';
        });
        
        // Poczekaj chwilę na ukrycie elementów
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Przywrócenie elementów mapy po przechwyceniu
    restoreMapAfterCapture() {
        console.log('🔄 Przywracam elementy mapy...');
        
        // Pokaż kontrolki mapy
        const controls = document.querySelectorAll('#sourceMap .leaflet-control');
        controls.forEach(control => {
            control.style.display = '';
        });
        
        // Pokaż przyciski zoom
        const zoomControls = document.querySelectorAll('#sourceMap .leaflet-control-zoom');
        zoomControls.forEach(control => {
            control.style.display = '';
        });
    }

    // Przechwycenie kafelków z mapy Leaflet
    async captureLeafletTiles() {
        return new Promise((resolve, reject) => {
            console.log('�️ Przechwytywanie kafelków mapy Leaflet...');
            
            const mapContainer = document.getElementById('sourceMap');
            if (!mapContainer) {
                reject('Brak kontenera mapy');
                return;
            }

            // Znajdź wszystkie załadowane kafelki mapy
            const tiles = mapContainer.querySelectorAll('img[src*="tile.openstreetmap.org"], .leaflet-tile-loaded');
            console.log(`📦 Znaleziono ${tiles.length} kafelków`);

            if (tiles.length === 0) {
                reject('Brak załadowanych kafelków mapy');
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 400;

            // Wypełnij tło kolorem
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 400, 400);

            let loadedCount = 0;
            const maxTiles = Math.min(tiles.length, 4); // Użyj maksymalnie 4 kafelki

            if (maxTiles === 0) {
                reject('Brak dostępnych kafelków');
                return;
            }

            // Załaduj i narysuj kafelki
            for (let i = 0; i < maxTiles; i++) {
                const tile = tiles[i];
                if (!tile.src) continue;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    // Oblicz pozycję kafelka
                    const x = (i % 2) * 200;
                    const y = Math.floor(i / 2) * 200;
                    
                    // Narysuj kafelek
                    ctx.drawImage(img, x, y, 200, 200);
                    loadedCount++;
                    
                    console.log(`✅ Załadowany kafelek ${i + 1}/${maxTiles}`);
                    
                    if (loadedCount === maxTiles) {
                        console.log('🎨 Wszystkie kafelki załadowane, generuję obraz');
                        resolve(canvas.toDataURL());
                    }
                };
                
                img.onerror = () => {
                    console.log(`❌ Błąd ładowania kafelka ${i + 1}`);
                    loadedCount++;
                    
                    if (loadedCount === maxTiles) {
                        if (canvas.toDataURL() !== 'data:,') {
                            resolve(canvas.toDataURL());
                        } else {
                            reject('Nie udało się załadować żadnego kafelka');
                        }
                    }
                };
                
                img.src = tile.src;
            }

            // Timeout po 5 sekundach
            setTimeout(() => {
                if (loadedCount > 0) {
                    console.log('⏰ Timeout, ale mam częściowy obraz');
                    resolve(canvas.toDataURL());
                } else {
                    reject('Timeout - nie załadowano żadnego kafelka');
                }
            }, 5000);
        });
    }

    // Generowanie fallback obrazu mapy (gdy nie można pobrać prawdziwych kafelków)
    generateFallbackMapImage() {
        const { lat, lng } = this.currentLocation;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 400;

        // Tło - gradient nieba
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#98FB98'); // Pale green
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Siatka "ulic"
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 2;
        
        // Pionowe linie
        for (let x = 50; x < 400; x += 75) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 400);
            ctx.stroke();
        }
        
        // Poziome linie
        for (let y = 50; y < 400; y += 75) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(400, y);
            ctx.stroke();
        }

        // Znacznik lokalizacji w centrum
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(200, 200, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Obramowanie znacznika
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Tekst z współrzędnymi
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 200, 350);
        
        // Tekst "MAPA"
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText('MAPA', 200, 50);
        ctx.fillText('MAPA', 200, 50);

        return canvas.toDataURL();
    }

    // Tworzenie prostego obrazu testowego do debugowania puzzle
    createTestImage() {
        console.log('🎨 Tworzę obraz testowy 400x400px');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;

        // Tło gradientowe
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4'); 
        gradient.addColorStop(1, '#45B7D1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Narysuj siatkę, żeby zobaczyć jak dzieli się na kawałki
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // Linie pionowe (co 100px)
        for (let x = 100; x < 400; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 400);
            ctx.stroke();
        }
        
        // Linie poziome (co 100px)  
        for (let y = 100; y < 400; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(400, y);
            ctx.stroke();
        }

        // Numeruj każdy kawałek
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const num = row * 4 + col;
                const x = col * 100 + 50;
                const y = row * 100 + 60;
                
                // Tekst z obramowaniem
                ctx.strokeText(num.toString(), x, y);
                ctx.fillText(num.toString(), x, y);
                
                // Małe kropki w rogach dla orientacji
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(col * 100 + 10, row * 100 + 10, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
            }
        }

        console.log('✅ Obraz testowy utworzony');
        return canvas.toDataURL();
    }

    // Podgląd wygenerowanego obrazu (do debugowania)
    showImagePreview() {
        if (!this.mapImageUrl) return;
        
        console.log('🖼️ Tworzę podgląd wygenerowanego obrazu...');
        
        // Usuń poprzedni podgląd jeśli istnieje
        const existingPreview = document.getElementById('imagePreview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Stwórz nowy podgląd
        const preview = document.createElement('div');
        preview.id = 'imagePreview';
        preview.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 200px;
            height: 200px;
            background-image: url(${this.mapImageUrl});
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            border: 2px solid #007bff;
            border-radius: 8px;
            z-index: 9999;
            background-color: white;
        `;
        
        // Dodaj tytuł
        const title = document.createElement('div');
        title.textContent = 'Podgląd obrazu mapy';
        title.style.cssText = `
            position: absolute;
            top: -25px;
            left: 0;
            background: #007bff;
            color: white;
            padding: 2px 6px;
            font-size: 12px;
            border-radius: 4px;
        `;
        
        preview.appendChild(title);
        document.body.appendChild(preview);
        
        // Usuń podgląd po 10 sekundach
        setTimeout(() => {
            if (document.getElementById('imagePreview')) {
                document.getElementById('imagePreview').remove();
            }
        }, 10000);
    }

    // Tworzenie 16 kawałków puzzle (4x4)
    createPuzzlePieces() {
        const puzzleGrid = document.getElementById('puzzleGrid');
        puzzleGrid.innerHTML = '';

        // Ustawienie siatki 4x4
        puzzleGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        puzzleGrid.style.gridTemplateRows = 'repeat(4, 1fr)';

        console.log('🧩 Tworzenie kawałków puzzle...');

        // Tworzenie 16 kawałków
        for (let i = 0; i < 16; i++) {
            const piece = this.createPuzzlePiece(i);
            puzzleGrid.appendChild(piece);
        }

        console.log('✅ Utworzono 16 kawałków puzzle');
        
        // Sprawdź stan przed mieszaniem (powinno być 16/16)
        setTimeout(() => {
            this.checkPuzzleCompletion();
        }, 100);
    }

    // Tworzenie pojedynczego kawałka puzzle
    createPuzzlePiece(index) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-tile';
        piece.draggable = true;
        piece.dataset.tile = index; // ID kawałka (0-15)

        // Pozycja w siatce 4x4 - określa który fragment obrazu pokazujemy
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        // Rozmiary - kontener puzzle ma dokładnie 400px, każdy kawałek ma 100px
        const containerSize = 400;
        const pieceSize = containerSize / 4; // 100px na kawałek
        
        // Ustawienie tła - kawałek obrazu mapy
        piece.style.backgroundImage = `url(${this.mapImageUrl})`;
        
        // Pozycja tła - przesuwamy tło tak, żeby pokazać odpowiedni fragment
        const bgPosX = -(col * pieceSize); // Przesunięcie w lewo o odpowiednią ilość
        const bgPosY = -(row * pieceSize); // Przesunięcie w górę o odpowiednią ilość
        
        piece.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
        piece.style.backgroundSize = `${containerSize}px ${containerSize}px`; // Oryginalny rozmiar obrazu
        piece.style.backgroundRepeat = 'no-repeat';

        console.log(`Kawałek ${index}: pozycja tła ${bgPosX}px ${bgPosY}px`);

        // Dodaj wizualne oznaczenie dla debugowania
        piece.style.border = '2px solid #ccc';
        piece.style.boxSizing = 'border-box';

        // Obsługa drag & drop
        this.setupDragAndDrop(piece);

        return piece;
    }

    // Konfiguracja drag & drop
    setupDragAndDrop(piece) {
        piece.addEventListener('dragstart', (e) => {
            this.draggedElement = piece;
            piece.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        piece.addEventListener('dragend', () => {
            piece.classList.remove('dragging');
            this.draggedElement = null;
            
            // Usuń wszystkie drop-zone klasy
            document.querySelectorAll('.puzzle-tile').forEach(tile => {
                tile.classList.remove('drop-zone');
            });
        });

        piece.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (piece !== this.draggedElement) {
                piece.classList.add('drop-zone');
            }
        });

        piece.addEventListener('dragleave', () => {
            piece.classList.remove('drop-zone');
        });

        piece.addEventListener('drop', (e) => {
            e.preventDefault();
            piece.classList.remove('drop-zone');
            
            if (this.draggedElement && this.draggedElement !== piece) {
                this.swapPieces(this.draggedElement, piece);
            }
        });
    }

    // Zamiana miejscami dwóch kawałków
    swapPieces(piece1, piece2) {
        console.log(`🔄 Zamieniam kawałek ${piece1.dataset.tile} z kawałkiem ${piece2.dataset.tile}`);

        // Zamień miejscami w DOM
        const temp = document.createElement('div');
        piece1.parentNode.insertBefore(temp, piece1);
        piece2.parentNode.insertBefore(piece1, piece2);
        temp.parentNode.insertBefore(piece2, temp);
        temp.remove();

        // Sprawdź poprawność układu
        this.checkPuzzleCompletion();
    }

    // Wymieszanie kawałków puzzle
    shufflePuzzlePieces() {
        console.log('🔀 Mieszanie kawałków puzzle...');
        
        const puzzleGrid = document.getElementById('puzzleGrid');
        const pieces = Array.from(puzzleGrid.children);
        
        // Algorytm Fisher-Yates shuffle - mieszamy tablicę kawałków
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }

        // Przebuduj DOM według wymieszanej kolejności
        puzzleGrid.innerHTML = '';
        pieces.forEach(piece => puzzleGrid.appendChild(piece));

        console.log('✅ Kawałki wymieszane');
        this.updatePuzzleStatus('Puzzle wymieszane - zacznij układać!');
        
        // Sprawdź stan po wymieszaniu
        this.checkPuzzleCompletion();
    }

    // Sprawdzenie czy puzzle jest ułożone
    checkPuzzleCompletion() {
        let correctCount = 0;
        
        console.log('🔍 Sprawdzanie ukończenia puzzle...');
        
        // Pobierz wszystkie kawałki w obecnej kolejności
        const puzzleGrid = document.getElementById('puzzleGrid');
        const currentPieces = Array.from(puzzleGrid.children);
        
        currentPieces.forEach((piece, position) => {
            const tileId = parseInt(piece.dataset.tile);
            
            console.log(`Pozycja ${position}: kawałek ${tileId}, powinien być kawałek ${position}`);
            
            // Sprawdź czy na pozycji i jest kawałek o ID i (czyli czy jest na swoim miejscu)
            if (tileId === position) {
                piece.classList.add('correct');
                correctCount++;
                console.log(`✅ Kawałek ${tileId} jest na właściwym miejscu!`);
            } else {
                piece.classList.remove('correct');
                console.log(`❌ Kawałek ${tileId} jest w złym miejscu (pozycja ${position})`);
            }
        });

        console.log(`✅ Poprawnych kawałków: ${correctCount}/16`);
        this.updatePuzzleStatus(`Poprawne kawałki: ${correctCount}/16`);

        // Sprawdź czy puzzle jest kompletne
        if (correctCount === 16) {
            this.onPuzzleCompleted();
        }
    }

    // Obsługa ukończenia puzzle
    onPuzzleCompleted() {
        this.showStatus('🎉 Gratulacje! Puzzle zostało ułożone!', 'success');
        this.updatePuzzleStatus('✅ Puzzle ukończone!');
        
        // Wyświetl powiadomienie systemowe
        if (Notification.permission === 'granted') {
            new Notification('Puzzle ukończone! 🎉', {
                body: 'Gratulacje! Udało Ci się ułożyć wszystkie kawałki mapy!',
                icon: 'https://via.placeholder.com/64x64.png?text=🧩',
                tag: 'puzzle-completed'
            });
        }

        // Efekt wizualny
        document.querySelectorAll('.puzzle-tile').forEach(tile => {
            tile.style.animation = 'pulse 0.5s ease-in-out';
        });

        // Zablokuj dalsze przeciąganie
        document.querySelectorAll('.puzzle-tile').forEach(tile => {
            tile.draggable = false;
            tile.style.cursor = 'default';
        });
    }

    // Automatyczne rozwiązanie puzzle
    solvePuzzle() {
        if (!this.puzzleGenerated) return;

        this.showStatus('Rozwiązywanie puzzle...', 'info');

        const puzzleGrid = document.getElementById('puzzleGrid');
        const pieces = Array.from(puzzleGrid.children);

        console.log('🔧 Rozwiązywanie puzzle - sortowanie kawałków...');

        // Sortuj kawałki według ID (0, 1, 2, 3, ..., 15)
        pieces.sort((a, b) => 
            parseInt(a.dataset.tile) - parseInt(b.dataset.tile)
        );

        // Przebuduj DOM w poprawnej kolejności
        puzzleGrid.innerHTML = '';
        pieces.forEach(piece => puzzleGrid.appendChild(piece));

        console.log('✅ Puzzle rozwiązane');

        // Sprawdź ukończenie
        setTimeout(() => {
            this.checkPuzzleCompletion();
        }, 500);
    }

    // Funkcje pomocnicze
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    updateCoordinates(lat, lng) {
        document.getElementById('coordinates').textContent = 
            `Współrzędne: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    updatePuzzleStatus(message) {
        document.getElementById('puzzleStatus').textContent = `Status: ${message}`;
    }
}

// Sprawdzenie czy moduł uprawnień jest załadowany
if (typeof requestLocationPermission === 'undefined') {
    console.error('❌ Moduł permissions.js nie został załadowany!');
    alert('Błąd: Nie można załadować modułu uprawnień. Sprawdź czy plik permissions.js istnieje.');
} else {
    console.log('✅ Moduł permissions.js załadowany poprawnie');
}

// Inicjalizacja aplikacji
console.log('🚀 Inicjalizacja aplikacji Puzzle Mapowe...');
const puzzleApp = new PuzzleMapApp();

// Udostępnij globalnie dla debugowania
window.puzzleApp = puzzleApp;

// Dodaj style animacji do CSS (jeśli nie ma)
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);