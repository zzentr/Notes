from django import forms
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User


class LoginUserForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form_input', 'title': 'Введите логин', 'placeholder': 'Введите имя пользователя', 'spellcheck':"false"}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form_input', 'title': 'Введите пароль', 'placeholder': 'Введите пароль', 'spellcheck':"false"}))

    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if username and password:
            user = User.objects.get(username=username)
            if user.first_name == 'confirmation':
                raise forms.ValidationError("Пожалуйста, подтвердите вашу почту.")
            self.user_cache = authenticate(self.request, username=username, password=password)
            if self.user_cache is None:
                raise forms.ValidationError("Неправильное имя пользователя или пароль. Пожалуйста, попробуйте снова.")
        
        return self.cleaned_data

class RegisterUserForm(forms.ModelForm):
    username = forms.CharField(label='Имя пользователя', widget=forms.TextInput(attrs={'class': 'form_input reg', 'title': 'Введите логин', 'spellcheck':"false"}))
    email = forms.CharField(label='Электронная почта', widget=forms.TextInput(attrs={'class': 'form_input reg', 'title': 'Введите почту', 'spellcheck':"false"}))
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput(attrs={'class': 'form_input reg', 'title': 'Введите пароль'}))
    password2 = forms.CharField(label='Повторите пароль', widget=forms.PasswordInput(attrs={'class': 'form_input reg', 'title': 'Введите пароль'}))

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password', 'password2']
    
    def clean_username(self):
        username = self.cleaned_data['username']
        if get_user_model().objects.filter(username=username).exists():
            raise forms.ValidationError('Такой пользователь уже есть')
        return username

    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password'] != cd['password2']:
            raise forms.ValidationError('Пароли не совпадают')
        return cd['password']
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if get_user_model().objects.filter(email=email).exists():
            raise forms.ValidationError("Такой email уже существует")
        return email