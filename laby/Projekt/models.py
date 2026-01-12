from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """Model użytkownika systemu"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # user, technician, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relacje
    created_tickets = db.relationship('Ticket', foreign_keys='Ticket.created_by', backref='author', lazy='dynamic')
    assigned_tickets = db.relationship('Ticket', foreign_keys='Ticket.assigned_to', backref='assigned_technician', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    
    def set_password(self, password):
        """Hashowanie hasła"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Weryfikacja hasła"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'


class Ticket(db.Model):
    """Model zgłoszenia (ticketu)"""
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(20), nullable=False)  # hardware, software, network, other
    priority = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    status = db.Column(db.String(20), nullable=False, default='new')  # new, in_progress, resolved, closed
    location = db.Column(db.String(100))
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    # Relacje
    comments = db.relationship('Comment', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ticket #{self.id}: {self.title}>'
    
    @property
    def status_label(self):
        """Etykiety statusów po polsku"""
        labels = {
            'new': 'Nowy',
            'in_progress': 'W trakcie',
            'resolved': 'Rozwiązany',
            'closed': 'Zamknięty'
        }
        return labels.get(self.status, self.status)
    
    @property
    def priority_label(self):
        """Etykiety priorytetów po polsku"""
        labels = {
            'low': 'Niski',
            'medium': 'Średni',
            'high': 'Wysoki',
            'critical': 'Krytyczny'
        }
        return labels.get(self.priority, self.priority)
    
    @property
    def category_label(self):
        """Etykiety kategorii po polsku"""
        labels = {
            'hardware': 'Sprzęt',
            'software': 'Oprogramowanie',
            'network': 'Sieć',
            'other': 'Inne'
        }
        return labels.get(self.category, self.category)


class Comment(db.Model):
    """Model komentarza do ticketu"""
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_internal = db.Column(db.Boolean, default=False)  # Notatki wewnętrzne (tylko dla techników)
    
    def __repr__(self):
        return f'<Comment #{self.id} on Ticket #{self.ticket_id}>'
