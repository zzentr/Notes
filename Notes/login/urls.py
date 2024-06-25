from django.contrib.auth.views import LogoutView
from django.shortcuts import redirect
from django.urls import path
from . import views

urlpatterns = [
    path('', lambda request: redirect('login'), name='users'),
    path('login/', views.LoginUser.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('registration/', views.registation_user, name='registation'),
    path('confirmation_email/<str:error>/', views.confirmation_email, name='confirmation_email'),
    path('check_code/', views.check_code, name='check_code'),
]