from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse, reverse_lazy
from .forms import LoginUserForm, RegisterUserForm
from note.models import Folders, Notes
from django.core.mail import send_mail
from django.conf import settings


class LoginUser(LoginView):
    form_class = LoginUserForm
    template_name = 'login/confirmation_email.html'
    extra_context = {'title': 'Авторизация'}


def registation_user(request):
    if request.method == 'POST':
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.set_password(form.cleaned_data['password'])
            new_user.save()

            folder = Folders.objects.create(title="Заметки", main_folder=True, user=new_user)
            Notes.objects.create(title="Новая заметки", folder_id=folder.pk, user=new_user)
            send_confirmation_email(new_user.email)
            return render(request, 'login/confirmation_email.html')
    else:
        form = RegisterUserForm()
    return render(request, 'login/registration.html', {'form': form, 'title': 'Регистрация'})


def send_confirmation_email(email):
    subject = 'Подтверждение почты'
    message = f'Здравствуйте! Ваш код подтверждения: {confirmation_code}'
    from_email = settings.EMAIL_HOST_USER 
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


def check_code(request):
    pass