# Generated by Django 5.0.4 on 2024-04-28 03:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('note', '0009_folders_main_folder_alter_notes_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='folders',
            name='main_folder',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='notes',
            name='title',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]