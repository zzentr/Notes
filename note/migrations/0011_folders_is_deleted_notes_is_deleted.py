# Generated by Django 5.0.4 on 2024-04-29 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('note', '0010_alter_folders_main_folder_alter_notes_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='folders',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='notes',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
