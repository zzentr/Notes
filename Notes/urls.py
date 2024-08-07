from django.contrib import admin
from django.urls import path, include
from note.views import page_not_found

handler404 = page_not_found

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('login.urls')),
    path('', include('note.urls')),
]