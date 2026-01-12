from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from models import User

class LoginForm(FlaskForm):
    """Formularz logowania"""
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Hasło', validators=[DataRequired()])
    submit = SubmitField('Zaloguj się')

class RegisterForm(FlaskForm):
    """Formularz rejestracji"""
    email = StringField('Email', validators=[DataRequired(), Email()])
    full_name = StringField('Imię i nazwisko', validators=[DataRequired(), Length(min=3, max=100)])
    password = PasswordField('Hasło', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField('Powtórz hasło', validators=[DataRequired(), EqualTo('password', message='Hasła muszą być identyczne')])
    role = SelectField('Rola', choices=[('user', 'Użytkownik'), ('technician', 'Technik')], default='user')
    submit = SubmitField('Zarejestruj się')
    
    def validate_email(self, email):
        """Sprawdzenie czy email jest unikalny"""
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Ten adres email jest już zajęty.')

class TicketForm(FlaskForm):
    """Formularz tworzenia ticketu"""
    title = StringField('Tytuł problemu', validators=[DataRequired(), Length(min=5, max=200)])
    category = SelectField('Kategoria', 
                          choices=[
                              ('hardware', 'Sprzęt'),
                              ('software', 'Oprogramowanie'),
                              ('network', 'Sieć'),
                              ('other', 'Inne')
                          ],
                          validators=[DataRequired()])
    priority = SelectField('Priorytet',
                          choices=[
                              ('low', 'Niski'),
                              ('medium', 'Średni'),
                              ('high', 'Wysoki'),
                              ('critical', 'Krytyczny')
                          ],
                          validators=[DataRequired()])
    location = StringField('Lokalizacja (opcjonalnie)', validators=[Length(max=100)])
    description = TextAreaField('Opis problemu', validators=[DataRequired(), Length(min=10, max=2000)])
    submit = SubmitField('Zgłoś ticket')

class CommentForm(FlaskForm):
    """Formularz dodawania komentarza"""
    content = TextAreaField('Komentarz', validators=[DataRequired(), Length(min=1, max=1000)])
    is_internal = BooleanField('Notatka wewnętrzna (tylko dla techników)')
    submit = SubmitField('Dodaj komentarz')
