from rest_framework import serializers
from .models import Notes, Folders
from rest_framework.renderers import JSONRenderer


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = '__all__'

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folders
        fields = '__all__'