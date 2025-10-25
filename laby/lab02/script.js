class TodoApp {
    constructor() {
        this.todos = [];
        this.currentEditingId = null;
        this.searchTerm = '';
        
        // DOM elements
        this.todoList = document.getElementById('todoList');
        this.searchInput = document.getElementById('searchInput');
        this.addForm = document.getElementById('addTodoForm');
        this.todoTitleInput = document.getElementById('todoTitle');
        this.todoDescriptionInput = document.getElementById('todoDescription');
        this.todoDateInput = document.getElementById('todoDate');
        this.addBtn = document.getElementById('addBtn');
        this.emptyState = document.getElementById('emptyState');
        this.stats = document.getElementById('stats');
        this.totalTasks = document.getElementById('totalTasks');
        this.titleError = document.getElementById('titleError');
        this.descriptionError = document.getElementById('descriptionError');
        this.dateError = document.getElementById('dateError');
        
        this.init();
    }
    
    init() {
        // Załaduj dane z Local Storage
        this.loadFromLocalStorage();
        
        // Event listeners
        this.addForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.todoTitleInput.addEventListener('input', () => this.validateForm());
        this.todoDescriptionInput.addEventListener('input', () => this.validateForm());
        this.todoDateInput.addEventListener('change', () => this.validateForm());
        
        // Kliknięcie poza listą kończy edycję
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.todo-item') && !e.target.closest('.add-todo')) {
                this.finishEditing();
            }
        });
        
        // Renderuj listę
        this.render();
        
        console.log('✅ TODO App zainicjalizowana');
    }
    
   
    
    addTodo(title, description = '', dueDate = null) {
        const todo = {
            id: Date.now() + Math.random(), // Unikalny ID
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate,
            createdAt: new Date().toISOString(),
            completed: false
        };
        
        this.todos.unshift(todo); // Dodaj na początek listy
        this.saveToLocalStorage();
        this.render();
        
        console.log('✅ Dodano zadanie:', todo.title);
    }
    
    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && confirm(`Czy na pewno chcesz usunąć zadanie: "${todo.title}"?`)) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
            console.log('🗑️ Usunięto zadanie:', todo.title);
        }
    }
    
    updateTodo(id, newTitle, newDescription = '', newDate = null) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && this.validateTitle(newTitle)) {
            todo.title = newTitle.trim();
            todo.description = newDescription.trim();
            todo.dueDate = newDate || null;
            this.saveToLocalStorage();
            this.render();
            console.log('📝 Zaktualizowano zadanie:', todo.title);
        }
    }
    
    // === EDYCJA W MIEJSCU ===
    
    startEditing(id) {
        this.finishEditing(); // Zakończ poprzednią edycję
        this.currentEditingId = id;
        
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const titleElement = todoElement.querySelector('.todo-title');
        const descriptionElement = todoElement.querySelector('.todo-description');
        const dateElement = todoElement.querySelector('.todo-date');
        
        // Zamień tytuł na input
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = todo.title;
        titleInput.className = 'todo-title editing';
        titleInput.maxLength = 100;
        titleInput.setAttribute('data-field', 'title');
        
        // Zamień opis na textarea
        const descriptionInput = document.createElement('textarea');
        descriptionInput.value = todo.description;
        descriptionInput.className = 'todo-description editing';
        descriptionInput.maxLength = 500;
        descriptionInput.rows = 2;
        descriptionInput.setAttribute('data-field', 'description');
        
        // Zamień datę na input datetime-local
        const dateInput = document.createElement('input');
        dateInput.type = 'datetime-local';
        dateInput.value = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';
        dateInput.className = 'todo-date editing';
        dateInput.setAttribute('data-field', 'date');
        
        // Event listeners
        const cancelEdit = () => {
            this.currentEditingId = null;
            this.render();
        };
        
        // Event listenery dla wszystkich pól edycji
        [titleInput, descriptionInput, dateInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    cancelEdit();
                } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.finishEditing();
                }
            });
            
            input.addEventListener('blur', (e) => {
                // Sprawdź czy focus przechodzi do innego pola edycji tego samego zadania
                setTimeout(() => {
                    const newActiveElement = document.activeElement;
                    const isStillEditingThisTask = newActiveElement && 
                                                  newActiveElement.closest(`[data-id="${id}"]`) &&
                                                  newActiveElement.classList.contains('editing');
                    
                    // Jeśli focus nie przeszedł do innego pola edycji tego zadania, zakończ edycję
                    if (!isStillEditingThisTask) {
                        this.finishEditing();
                    }
                }, 10);
            });
        });
        
        // Zamień elementy
        titleElement.replaceWith(titleInput);
        
        if (descriptionElement) {
            descriptionElement.replaceWith(descriptionInput);
        } else {
            // Jeśli nie ma opisu, dodaj textarea po tytule
            titleInput.parentNode.insertBefore(descriptionInput, titleInput.nextSibling);
        }
        
        if (dateElement) {
            dateElement.replaceWith(dateInput);
        } else {
            // Jeśli nie ma daty, dodaj input po opisie
            descriptionInput.parentNode.insertBefore(dateInput, descriptionInput.nextSibling);
        }
        
        titleInput.focus();
        titleInput.select();
    }
    
    finishEditing() {
        if (!this.currentEditingId) return;
        
        const todoElement = document.querySelector(`[data-id="${this.currentEditingId}"]`);
        if (!todoElement) {
            this.currentEditingId = null;
            return;
        }
        
        const titleInput = todoElement.querySelector('.todo-title.editing');
        const descriptionInput = todoElement.querySelector('.todo-description.editing');
        const dateInput = todoElement.querySelector('.todo-date.editing');
        
        if (titleInput) {
            const newTitle = titleInput.value.trim();
            const newDescription = descriptionInput ? descriptionInput.value.trim() : '';
            const newDate = dateInput ? dateInput.value : null;
            
            if (newTitle && this.validateTitle(newTitle)) {
                this.updateTodo(this.currentEditingId, newTitle, newDescription, newDate);
            } else {
                this.render(); // Przywróć oryginalny tekst
            }
        }
        
        this.currentEditingId = null;
    }
    
    // === WYSZUKIWANIE ===
    
    handleSearch(e) {
        this.searchTerm = e.target.value.trim();
        this.render();
    }
    
    getFilteredTodos() {
        if (this.searchTerm.length < 2) {
            return this.todos;
        }
        
        return this.todos.filter(todo => 
            todo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            todo.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
    
    highlightSearchTerm(text) {
        if (this.searchTerm.length < 2) {
            return text;
        }
        
        const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // === WALIDACJA ===
    
    validateTitle(title) {
        if (!title || title.trim().length < 3) {
            return false;
        }
        if (title.length > 100) {
            return false;
        }
        return true;
    }
    
    validateDescription(description) {
        if (description.length > 500) {
            return false;
        }
        return true;
    }
    
    validateDate(dateString) {
        if (!dateString) return true; // Pusta data jest OK
        
        const selectedDate = new Date(dateString);
        const now = new Date();
        
        // Data musi być w przyszłości
        return selectedDate > now;
    }
    
    validateForm() {
        const title = this.todoTitleInput.value.trim();
        const description = this.todoDescriptionInput.value.trim();
        const date = this.todoDateInput.value;
        
        let isValid = true;
        
        // Walidacja tytułu
        this.titleError.style.display = 'none';
        if (title.length > 0 && title.length < 3) {
            this.titleError.textContent = 'Tytuł musi mieć co najmniej 3 znaki';
            this.titleError.style.display = 'block';
            isValid = false;
        } else if (title.length > 100) {
            this.titleError.textContent = 'Tytuł nie może mieć więcej niż 100 znaków';
            this.titleError.style.display = 'block';
            isValid = false;
        }
        
        // Walidacja opisu
        this.descriptionError.style.display = 'none';
        if (description.length > 500) {
            this.descriptionError.textContent = 'Opis nie może mieć więcej niż 500 znaków';
            this.descriptionError.style.display = 'block';
            isValid = false;
        }
        
        // Walidacja daty
        this.dateError.style.display = 'none';
        if (date && !this.validateDate(date)) {
            this.dateError.textContent = 'Data musi być w przyszłości lub pusta';
            this.dateError.style.display = 'block';
            isValid = false;
        }
        
        // Aktywuj/dezaktywuj przycisk
        this.addBtn.disabled = !isValid || title.length < 3;
        
        return isValid;
    }
    
    // === OBSŁUGA FORMULARZA ===
    
    handleAddTodo(e) {
        e.preventDefault();
        
        const title = this.todoTitleInput.value.trim();
        const description = this.todoDescriptionInput.value.trim();
        const date = this.todoDateInput.value || null;
        
        if (!this.validateTitle(title)) {
            alert('Nieprawidłowy tytuł zadania!');
            return;
        }
        
        if (!this.validateDescription(description)) {
            alert('Opis zadania jest za długi!');
            return;
        }
        
        if (date && !this.validateDate(date)) {
            alert('Data musi być w przyszłości lub pusta!');
            return;
        }
        
        this.addTodo(title, description, date);
        
        // Wyczyść formularz
        this.todoTitleInput.value = '';
        this.todoDescriptionInput.value = '';
        this.todoDateInput.value = '';
        this.addBtn.disabled = true;
        
        // Focus na pole tytułu
        this.todoTitleInput.focus();
    }
    
    // === RENDEROWANIE ===
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Wyczyść listę
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            if (this.searchTerm.length >= 2) {
                this.todoList.innerHTML = `
                    <div class="empty-state">
                        <i>🔍</i>
                        <h3>Brak wyników</h3>
                        <p>Nie znaleziono zadań zawierających "${this.searchTerm}"</p>
                    </div>
                `;
            } else {
                this.todoList.appendChild(this.emptyState);
            }
        } else {
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }
        
        // Aktualizuj statystyki
        this.updateStats();
    }
    
    createTodoElement(todo) {
        const div = document.createElement('div');
        div.className = 'todo-item';
        div.setAttribute('data-id', todo.id);
        
        // Sprawdź czy zadanie jest przeterminowane
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date();
        
        // Formatuj datę
        let dateDisplay = '';
        if (todo.dueDate) {
            const date = new Date(todo.dueDate);
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            };
            dateDisplay = `📅 ${date.toLocaleDateString('pl-PL', options)}`;
        }
        
        div.innerHTML = `
            <div class="todo-content">
                <div class="todo-title">${this.highlightSearchTerm(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${this.highlightSearchTerm(todo.description)}</div>` : '<div class="todo-description" style="display: none;"></div>'}
                ${dateDisplay ? `<div class="todo-date ${isOverdue ? 'overdue' : ''}">${dateDisplay}</div>` : '<div class="todo-date" style="color: #999; font-style: italic;">📅 Brak terminu</div>'}
            </div>
            <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                🗑️ Usuń
            </button>
        `;
        
        // Event listener dla kliknięcia w zadanie (edycja)
        div.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                this.startEditing(todo.id);
            }
        });
        
        return div;
    }
    
    updateStats() {
        this.totalTasks.textContent = this.todos.length;
    }
    
    // === LOCAL STORAGE ===
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.todos));
            console.log('💾 Zadania zapisane do Local Storage');
        } catch (error) {
            console.error('❌ Błąd zapisywania do Local Storage:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            if (saved) {
                this.todos = JSON.parse(saved);
                console.log('📂 Załadowano zadania z Local Storage:', this.todos.length);
            }
        } catch (error) {
            console.error('❌ Błąd ładowania z Local Storage:', error);
            this.todos = [];
        }
    }
}

// === INICJALIZACJA APLIKACJI ===

let todoApp;

// Uruchom aplikację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Dodatkowe funkcje globalne dla compatibility
window.todoApp = null;

// Ustaw referencję globalną po inicjalizacji
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.todoApp = todoApp;
    }, 100);
});

console.log('📝 TODO List Script załadowany - LAB 02');