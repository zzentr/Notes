from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from transliterate import translit
import random, string

class Folders(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    title = models.CharField(max_length=100)
    main_folder = models.BooleanField(default=False)
    parent_folder = models.TextField(default=0)
    there_subfolders = models.BooleanField(default=False)
    subfolder_level = models.TextField(default='0')
    slug = models.SlugField(max_length=255, db_index=True)

    def save(self, *args, **kwargs):
        original_slug = slugify(translit(self.title, 'ru', reversed=True))  # Транслитерируем и создаем слаг из title
        random_suffix = ''.join(random.choices(string.ascii_letters + string.digits, k=6))  # Генерируем случайную строку из букв и цифр длиной 6 символов
        self.slug = original_slug + '-' + random_suffix
        super(Folders, self).save(*args, **kwargs)


class Notes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    slug = models.SlugField(max_length=255, db_index=True)
    time_create = models.DateTimeField(auto_now_add=True)
    time_update = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    folder = models.ForeignKey(Folders, on_delete=models.SET_DEFAULT, default='1')

    def save(self, *args, **kwargs):
        original_slug = slugify(translit(self.title, 'ru', reversed=True))
        random_suffix = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        self.slug = original_slug + '-' + random_suffix
        super(Notes, self).save(*args, **kwargs)