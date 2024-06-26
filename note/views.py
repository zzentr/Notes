from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
import json, pytz
from re import match
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import get_object_or_404, render
from .serializers import NoteSerializer, FolderSerializer
from .models import Notes, Folders

@login_required
def index(request):
    folders = Folders.objects.filter(user=request.user).order_by("subfolder_level")
    notes = Notes.objects.filter(user=request.user).order_by("-time_update")
    
    serialized_folders = FolderSerializer(folders, many=True).data

    for folder in serialized_folders[:]:
        if folder.get('parent_folder') != '0':
            parent_folder = next((el for el in serialized_folders if el.get('id') == int(folder.get('parent_folder'))), None)
            serialized_folders.pop(serialized_folders.index(folder))
            serialized_folders.insert(serialized_folders.index(parent_folder) + 1, folder)

    user_timezone_offset = request.session.get('user_timezone_offset')

    # Проверям на + и - в разнице времени и делаем противоположные знаки
    if user_timezone_offset:
        user_timezone_offset = int(user_timezone_offset)

        if user_timezone_offset < 0:
            offset_minutes = abs(user_timezone_offset)
        else:
            offset_minutes = -user_timezone_offset

        user_timezone = pytz.FixedOffset(offset_minutes)
    else:
        user_timezone = pytz.UTC

    formatted_notes_time = []
    current_date = datetime.now().date()
    yesterday = current_date - timedelta(days=1)
    
    for note in notes:
        # Создаем список с новым временем для заметок
        local_time = note.time_update.astimezone(user_timezone)
        if local_time.date() == current_date:
            formatted_time = local_time.strftime("%H:%M")
        elif local_time.date() == yesterday:
            formatted_time = "Вчера"
        else:
            formatted_time = local_time.strftime("%d-%m-%y")
        formatted_notes_time.append(formatted_time)

        if len(note.title) == 0:
            note.title = "Новая заметка"

    for note, new_time in zip(notes, formatted_notes_time):
        # Обновляем время для каждой заметки

        time_pattern = r"\d{1,2}:\d{2}"

        if match(time_pattern, new_time):
            time_obj = datetime.strptime(new_time, "%H:%M").time()  # Создаем объект времени без даты
            note.time_update = time_obj
        elif new_time == "Вчера":
            note.time_update = new_time
        else:
            time_obj = datetime.strptime(new_time, "%d-%m-%y").date()  # Создаем объект даты без времени
            note.time_update = time_obj

    context = {
        'notes': notes,
        'folders': serialized_folders
    }

    return render(request, 'note/index.html', context)

def folder_detail(request, folder_slug):
    folder = get_object_or_404(Folders, slug=folder_slug)
    return render(request, 'note/index.html')


def note_detail(request, folder_slug, note_slug):
    note = get_object_or_404(Notes, slug=note_slug)
    folder = get_object_or_404(Folders, slug=folder_slug)
    if note.folder == folder:
        return render(request, 'note/index.html')
    return render(request, 'note/404.html', {'error_message': 'Error: Note does not belong to this folder!'})


def save_timezone_offset(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:

            request.session['user_timezone_offset'] = data['timezone_offset']
            request.session.modified = True

            return HttpResponse()
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])


def rename_folder(request):
    if request.method == 'PATCH':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            folder_id = data.get('folder_id')
            new_name = data.get('new_name')

            folder = Folders.objects.get(pk=folder_id)
            folder.title = new_name
            folder.save()

            return HttpResponse("Folder renamed")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['PATCH'])


def rename_note(request):
    if request.method == 'PATCH':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            note_id = data.get('note_id')
            new_name = data.get('new_name')

            note = Notes.objects.get(pk=note_id)
            note.title = new_name
            note.save()

            return HttpResponse("Note renamed")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['PATCH'])
    

def create_new_folder(request):
    if request.method == 'POST':
        folder = Folders.objects.create(title="Новая папка", user=request.user)

        serialized_new_folder = {
            'id': folder.pk,
            'title': folder.title
        }
        return JsonResponse({'folder': serialized_new_folder})
    
    return HttpResponseNotAllowed(['POST'])


def create_addsubfolder(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        folder_id = data.get('id_folder')
        subfolder_level = data.get('subfolder_level')
        if data and folder_id and subfolder_level:

            folder = Folders.objects.create(title="Новая папка", parent_folder=folder_id, subfolder_level=subfolder_level, user=request.user)
            parent_folder = Folders.objects.get(pk=folder_id)
            parent_folder.there_subfolders = True
            parent_folder.save()

            serialized_new_folder = {
                'id': folder.pk,
                'title': folder.title
            }
            return JsonResponse({'folder': serialized_new_folder})
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])


def create_new_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            id_folder = data.get("folder_id")

            note = Notes.objects.create(title="Новая заметка", folder_id=id_folder, user=request.user)
            serialized_new_note = {
                'id': note.pk,
                'title': note.title,
                'folder_id': note.folder_id
            }
            return JsonResponse({"note": serialized_new_note})
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])

def save_title_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            new_title = data.get('new_title')
            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            note.title = new_title
            note.save()

            return HttpResponse("New title is saved")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])


def save_text_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            new_text = data.get('new_text')
            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            note.content = new_text
            note.save()

            return HttpResponse("New text is saved")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])


def get_notes_folder(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            id_folder = data.get('id_folder')

            notes = Notes.objects.filter(folder_id=id_folder)
            serialized_notes = NoteSerializer(notes, many=True).data

            return JsonResponse({'notes': serialized_notes})
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    if request.method == 'PATCH':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            id_folder = data.get('id_folder')

            notes = Notes.objects.filter(folder_id=id_folder)
            notes.update(is_deleted=True)

            return HttpResponse("Notes moved to trash")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST', 'PATCH'])


def delete_folder(request, folder_id=None):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data:
            if folder_id:
                id_folder = folder_id
                delete_notes = True
            else:
                id_folder = data.get('id_folder')
                delete_notes = data.get('delete_notes')

            if delete_notes:
                notes = Notes.objects.filter(folder_id=id_folder)
                notes.delete()
            else:
                notes = Notes.objects.filter(folder_id=id_folder)
                main_folder = Folders.objects.get(main_folder=True, user=request.user)

                notes.update(folder_id=main_folder.id) 
                notes.update(is_deleted=True)
            folder = Folders.objects.get(pk=id_folder)
            folder.delete()

            return HttpResponse("Folder is deleted") 
        return HttpResponseBadRequest('The request body cannot be empty')
    return HttpResponseNotAllowed(['POST'])

    
def delete_all_subfolders(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data.get('id_folder'):
            
            id_folder = data.get('id_folder')
            folder = Folders.objects.get(pk=id_folder)
            folder.there_subfolders = False
            folder.save()

            return HttpResponse()
        return HttpResponseBadRequest('The request body cannot be empty')
    return HttpResponseNotAllowed(['POST'])

def get_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data and data.get('id_note'):

            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            serialized_note = NoteSerializer(note).data

            return JsonResponse({'note': serialized_note})
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    if request.method == 'PATCH':
        data = json.loads(request.body.decode('utf-8'))
        if data and data.get('id_note'):

            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            note.is_deleted = True
            note.save()

            return HttpResponse("Note in cart")
    
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])


def delete_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data and data.get('id_note'):

            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            note.delete()

            return HttpResponse("Note deleted")
    
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])

def restore_note(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data and data.get('id_note'):

            id_note = data.get('id_note')

            note = Notes.objects.get(pk=id_note)
            note.is_deleted = False
            note.save()

            return HttpResponse("Note restored")
        
        return HttpResponseBadRequest('The request body cannot be empty')
    
    return HttpResponseNotAllowed(['POST'])

def change_folder(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data.get('id_note') and data.get('id_folder'):

            id_note = data.get('id_note')
            id_folder = data.get('id_folder')

            note = Notes.objects.get(pk=id_note)
            note.folder_id = id_folder
            note.save()

            return HttpResponse()
        return HttpResponseBadRequest('The request body cannot be empty')
    
    if request.method == 'PATCH':
        data = json.loads(request.body.decode('utf-8'))
        if data.get('id_to_folder') and data.get('id_folder'):

            id_to_folder = data.get('id_to_folder')
            id_folder = data.get('id_folder')

            folder = Folders.objects.get(pk=id_folder)
            to_folder = Folders.objects.get(pk=id_to_folder)

            if data.get('parent_folder') is True:
                parent_folder = Folders.objects.get(pk=folder.parent_folder)
                parent_folder.there_subfolders = False
                parent_folder.save()

            if(to_folder.subfolder_level != 3):
                folder.parent_folder = id_to_folder
                folder.subfolder_level = int(to_folder.subfolder_level) + 1
                to_folder.there_subfolders = True
                folder.save()
                to_folder.save()

            if folder.there_subfolders:
                up_subfolder_level(folder)

            return HttpResponse()
        return HttpResponseBadRequest('The request body cannot be empty')
    return HttpResponseNotAllowed(['POST', 'PATCH'])


def up_subfolder_level(folder):
    subfolders = Folders.objects.filter(parent_folder=folder.id)
    for subfolder in subfolders:
        subfolder.subfolder_level = int(folder.subfolder_level) + 1
        subfolder.save()
        if subfolder.there_subfolders:
            up_subfolder_level(subfolder)

def folder_to_container(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if data.get('id_folder'):

            folder = Folders.objects.get(pk=data.get('id_folder'))

            if data.get('parent_folder') is True:
                parent_folder = Folders.objects.get(pk=folder.parent_folder)
                parent_folder.there_subfolders = False
                parent_folder.save()

            folder.subfolder_level = 0
            folder.parent_folder = 0
            folder.save()
            up_subfolder_level(folder)

            return HttpResponse()
        return HttpResponseBadRequest('The request body cannot be empty')
    return HttpResponseNotAllowed(['POST'])

def page_not_found(request, exception):
    return render(request, '404.html', status=404)
