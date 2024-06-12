from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse, reverse_lazy
from .forms import LoginUserForm, RegisterUserForm
from note.models import Folders, Notes


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

            folder = Folders.objects.create(title="Заметки", subfolder=0, main_folder=True, user=new_user)
            Notes.objects.create(title="Новая заметки", folder_id=folder.pk, user=new_user)
            return render(request, 'login/registration_done.html')
    else:
        form = RegisterUserForm()
    return render(request, 'login/registration.html', {'form': form, 'title': 'Регистрация'})