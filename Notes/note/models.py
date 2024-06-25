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


class Notes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default='1')
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    time_create = models.DateTimeField(auto_now_add=True)
    time_update = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    folder = models.ForeignKey(Folders, on_delete=models.SET_DEFAULT, default='1')