from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from .forms import LoginUserForm, RegisterUserForm
from note.models import Folders, Notes
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
import random, string, datetime


class LoginUser(LoginView):
    form_class = LoginUserForm
    template_name = 'login/login.html'
    extra_context = {'title': 'Авторизация'}


def registation_user(request):
    if request.method == 'POST':
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.set_password(form.cleaned_data['password'])
            new_user.save()
            request.session['user'] = new_user.email
            send_confirmation_email(new_user.email, new_user)
            return redirect('confirmation_email')
    else:
        form = RegisterUserForm()
    return render(request, 'login/registration.html', {'form': form, 'title': 'Регистрация'})


def confirmation_email(request, error=None):
    print(error)
    return render(request, 'login/confirmation_email.html', {'error': error})


def send_confirmation_email(email, new_user):
    confirmation_code = ''.join(random.choices(string.digits, k=6))
    new_user.first_name = "confirmation"
    new_user.last_name = confirmation_code
    new_user.last_login = datetime.datetime.now()
    new_user.save()
    subject = 'Подтверждение почты'
    message = f'Привет 💗! Ваш код подтверждения: {confirmation_code}'
    from_email = settings.EMAIL_HOST_USER 
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


def check_code(request):
    if request.method == 'POST':
        current_time = datetime.datetime.now()
        code = request.POST.get('code')
        user = User.objects.get(email=request.session.get('user')) 
        db_time = user.last_login
        db_time = db_time.replace(tzinfo=datetime.timezone.utc)
        
        current_time = datetime.datetime.now()
        current_time = current_time.replace(tzinfo=datetime.timezone.utc)

        time_difference = current_time - db_time
        if time_difference.total_seconds() < 600:
            if(user.last_name == code):
                user.first_name = ''
                user.last_name = ''
                user.save()
                folder = Folders.objects.create(title="Заметки", main_folder=True, user=user)
                Notes.objects.create(title="Новая заметки", folder_id=folder.pk, user=user)
                return render(request, 'login/registration_done.html')
            return redirect('confirmation_email', 'incorrect_code')
        user.delete()
        return redirect('confirmation_email', 'time_has_out')