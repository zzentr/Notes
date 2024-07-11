# Generated by Django 5.0.4 on 2024-04-18 06:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('note', '0005_folders'),
    ]

    operations = [
        migrations.AddField(
            model_name='notes',
            name='folder_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='note.folders'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='folders',
            name='title',
            field=models.CharField(max_length=100),
        ),
    ]
