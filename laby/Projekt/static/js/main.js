// Podstawowa interaktywność

document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide flash messages po 5 sekundach
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(function(message) {
        setTimeout(function() {
            message.style.opacity = '0';
            setTimeout(function() {
                message.remove();
            }, 300);
        }, 5000);
    });

    // Potwierdzenie akcji
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Zaznaczanie aktywnego menu
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.nav-menu a');
    menuLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentPath) {
            link.style.fontWeight = 'bold';
            link.style.color = '#4F46E5';
        }
    });
});

// Funkcja do aktualizacji statusu ticketu
function updateTicketStatus(ticketId, status) {
    if (confirm('Czy na pewno chcesz zmienić status?')) {
        document.getElementById('status-form-' + ticketId).submit();
    }
}

// Walidacja formularza
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(function(input) {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#EF4444';
        } else {
            input.style.borderColor = '#E5E7EB';
        }
    });

    return isValid;
}
