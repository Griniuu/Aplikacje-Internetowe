#Komenda do uruchomienia - .\venv\Scripts\python.exe app.py

from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Ticket, Comment
from config import Config
from forms import LoginForm, RegisterForm, TicketForm, CommentForm
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

# Inicjalizacja rozszerzeń
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Zaloguj się, aby uzyskać dostęp do tej strony.'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Tworzenie tabel
with app.app_context():
    db.create_all()
    # Tworzenie domyślnego admina jeśli nie istnieje
    admin = User.query.filter_by(email='admin@helpdesk.pl').first()
    if not admin:
        admin = User(
            email='admin@helpdesk.pl',
            full_name='Administrator',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('Utworzono domyślnego admina: admin@helpdesk.pl / admin123')

# ========== ROUTES ==========

@app.route('/')
def index():
    """Strona główna - przekierowanie do dashboardu lub logowania"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

# ========== AUTENTYKACJA ==========

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Logowanie użytkownika"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Zalogowano pomyślnie!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Nieprawidłowy email lub hasło.', 'danger')
    
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Rejestracja nowego użytkownika"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(
            email=form.email.data,
            full_name=form.full_name.data,
            role=form.role.data
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Konto utworzone pomyślnie! Możesz się teraz zalogować.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    """Wylogowanie użytkownika"""
    logout_user()
    flash('Wylogowano pomyślnie.', 'info')
    return redirect(url_for('login'))

# ========== DASHBOARD ==========

@app.route('/dashboard')
@login_required
def dashboard():
    """Panel główny użytkownika"""
    if current_user.role == 'user':
        # Użytkownik widzi tylko swoje tickety
        tickets = Ticket.query.filter_by(created_by=current_user.id).order_by(Ticket.created_at.desc()).limit(10).all()
        stats = {
            'total': Ticket.query.filter_by(created_by=current_user.id).count(),
            'new': Ticket.query.filter_by(created_by=current_user.id, status='new').count(),
            'in_progress': Ticket.query.filter_by(created_by=current_user.id, status='in_progress').count(),
            'resolved': Ticket.query.filter_by(created_by=current_user.id, status='resolved').count()
        }
    else:
        # Technik i admin widzą wszystkie tickety
        if current_user.role == 'technician':
            assigned_tickets = Ticket.query.filter_by(assigned_to=current_user.id, status='in_progress').all()
        else:
            assigned_tickets = []
        
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).limit(10).all()
        stats = {
            'total': Ticket.query.count(),
            'new': Ticket.query.filter_by(status='new').count(),
            'in_progress': Ticket.query.filter_by(status='in_progress').count(),
            'critical': Ticket.query.filter_by(priority='critical').count(),
            'assigned': len(assigned_tickets) if current_user.role == 'technician' else 0
        }
    
    return render_template('dashboard.html', tickets=tickets, stats=stats)

# ========== TICKETY ==========

@app.route('/tickets')
@login_required
def ticket_list():
    """Lista wszystkich ticketów (z filtrowaniem)"""
    query = Ticket.query
    
    # Filtrowanie dla zwykłych użytkowników
    if current_user.role == 'user':
        query = query.filter_by(created_by=current_user.id)
    
    # Filtrowanie według parametrów URL
    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')
    category_filter = request.args.get('category')
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)
    if category_filter:
        query = query.filter_by(category=category_filter)
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return render_template('ticket_list.html', tickets=tickets)

@app.route('/tickets/new', methods=['GET', 'POST'])
@login_required
def ticket_create():
    """Tworzenie nowego ticketu"""
    form = TicketForm()
    if form.validate_on_submit():
        ticket = Ticket(
            title=form.title.data,
            description=form.description.data,
            category=form.category.data,
            priority=form.priority.data,
            location=form.location.data,
            created_by=current_user.id,
            status='new'
        )
        db.session.add(ticket)
        db.session.commit()
        flash(f'Ticket #{ticket.id} został utworzony pomyślnie!', 'success')
        return redirect(url_for('ticket_detail', ticket_id=ticket.id))
    
    return render_template('ticket_create.html', form=form)

@app.route('/tickets/<int:ticket_id>')
@login_required
def ticket_detail(ticket_id):
    """Szczegóły ticketu"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Sprawdzenie uprawnień
    if current_user.role == 'user' and ticket.created_by != current_user.id:
        flash('Nie masz dostępu do tego ticketu.', 'danger')
        return redirect(url_for('dashboard'))
    
    form = CommentForm()
    comments = Comment.query.filter_by(ticket_id=ticket_id).order_by(Comment.created_at.asc()).all()
    
    # Lista techników dla przypisania
    technicians = User.query.filter(User.role.in_(['technician', 'admin'])).all()
    
    return render_template('ticket_detail.html', ticket=ticket, form=form, comments=comments, technicians=technicians)

@app.route('/tickets/<int:ticket_id>/comment', methods=['POST'])
@login_required
def add_comment(ticket_id):
    """Dodanie komentarza do ticketu"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Sprawdzenie uprawnień
    if current_user.role == 'user' and ticket.created_by != current_user.id:
        flash('Nie masz dostępu do tego ticketu.', 'danger')
        return redirect(url_for('dashboard'))
    
    form = CommentForm()
    if form.validate_on_submit():
        comment = Comment(
            ticket_id=ticket_id,
            user_id=current_user.id,
            content=form.content.data,
            is_internal=form.is_internal.data if current_user.role in ['technician', 'admin'] else False
        )
        db.session.add(comment)
        ticket.updated_at = datetime.utcnow()
        db.session.commit()
        flash('Komentarz dodany.', 'success')
    
    return redirect(url_for('ticket_detail', ticket_id=ticket_id))

@app.route('/tickets/<int:ticket_id>/assign', methods=['POST'])
@login_required
def assign_ticket(ticket_id):
    """Przypisanie ticketu do technika"""
    if current_user.role not in ['technician', 'admin']:
        flash('Brak uprawnień.', 'danger')
        return redirect(url_for('dashboard'))
    
    ticket = Ticket.query.get_or_404(ticket_id)
    technician_id = request.form.get('technician_id')
    
    if technician_id == 'me':
        ticket.assigned_to = current_user.id
        ticket.status = 'in_progress'
        flash('Ticket został przypisany do Ciebie.', 'success')
    elif technician_id:
        ticket.assigned_to = int(technician_id)
        ticket.status = 'in_progress'
        flash('Ticket został przypisany.', 'success')
    
    ticket.updated_at = datetime.utcnow()
    db.session.commit()
    
    return redirect(url_for('ticket_detail', ticket_id=ticket_id))

@app.route('/tickets/<int:ticket_id>/status', methods=['POST'])
@login_required
def change_status(ticket_id):
    """Zmiana statusu ticketu"""
    if current_user.role not in ['technician', 'admin']:
        flash('Brak uprawnień.', 'danger')
        return redirect(url_for('dashboard'))
    
    ticket = Ticket.query.get_or_404(ticket_id)
    new_status = request.form.get('status')
    
    if new_status in ['new', 'in_progress', 'resolved', 'closed']:
        ticket.status = new_status
        if new_status == 'resolved':
            ticket.resolved_at = datetime.utcnow()
        ticket.updated_at = datetime.utcnow()
        db.session.commit()
        flash(f'Status zmieniony na: {ticket.status_label}', 'success')
    
    return redirect(url_for('ticket_detail', ticket_id=ticket_id))

# ========== ADMIN ==========

@app.route('/admin')
@login_required
def admin_panel():
    """Panel administratora"""
    if current_user.role != 'admin':
        flash('Brak uprawnień.', 'danger')
        return redirect(url_for('dashboard'))
    
    users = User.query.all()
    stats = {
        'total_users': User.query.count(),
        'total_tickets': Ticket.query.count(),
        'new_tickets': Ticket.query.filter_by(status='new').count(),
        'in_progress_tickets': Ticket.query.filter_by(status='in_progress').count(),
        'resolved_tickets': Ticket.query.filter_by(status='resolved').count(),
        'critical_tickets': Ticket.query.filter_by(priority='critical').count()
    }
    
    return render_template('admin_panel.html', users=users, stats=stats)

@app.route('/admin/user/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_user(user_id):
    """Edycja użytkownika przez administratora"""
    if current_user.role != 'admin':
        flash('Brak uprawnień.', 'danger')
        return redirect(url_for('dashboard'))
    
    user = User.query.get_or_404(user_id)
    
    if request.method == 'POST':
        user.full_name = request.form.get('full_name')
        user.email = request.form.get('email')
        user.role = request.form.get('role')
        user.is_active = request.form.get('is_active') == 'on'
        
        # Zmiana hasła opcjonalna
        new_password = request.form.get('new_password')
        if new_password:
            user.set_password(new_password)
        
        db.session.commit()
        flash(f'Użytkownik {user.full_name} został zaktualizowany.', 'success')
        return redirect(url_for('admin_panel'))
    
    return render_template('edit_user.html', user=user)

@app.route('/admin/user/<int:user_id>/delete', methods=['POST'])
@login_required
def delete_user(user_id):
    """Usunięcie użytkownika przez administratora"""
    if current_user.role != 'admin':
        flash('Brak uprawnień.', 'danger')
        return redirect(url_for('dashboard'))
    
    user = User.query.get_or_404(user_id)
    
    # Nie pozwól usunąć samego siebie
    if user.id == current_user.id:
        flash('Nie możesz usunąć własnego konta.', 'danger')
        return redirect(url_for('admin_panel'))
    
    # Usuń użytkownika
    db.session.delete(user)
    db.session.commit()
    flash(f'Użytkownik {user.email} został usunięty.', 'success')
    return redirect(url_for('admin_panel'))

# ========== FILTRY JINJA ==========

@app.template_filter('datetime')
def format_datetime(value):
    """Formatowanie daty i czasu"""
    if value is None:
        return ''
    return value.strftime('%d.%m.%Y %H:%M')

# ========== URUCHOMIENIE ==========

if __name__ == '__main__':
    app.run(debug=True, port=5000)
