from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name="home"),
    path('rename_folder/', views.rename_folder, name="rename_folder"),
    path('rename_note/', views.rename_note, name="rename_folder"),
    path('create_new_folder/', views.create_new_folder, name="create_new_folder"),
    path('create_addsubfolder/', views.create_addsubfolder, name="create_addsubfolder"),
    path('create_new_note/', views.create_new_note, name="create_new_note"),
    path('save_title_note/', views.save_title_note, name='new_title'),
    path('save_text_note/', views.save_text_note, name='new_text'),
    path('save_timezone_offset/', views.save_timezone_offset, name="timeset"),
    path('get_notes_folder/', views.get_notes_folder, name="get_notes_folder"),
    path('get_note/', views.get_note, name="get_note"),
    path('delete_folder/', views.delete_folder, name="delete_notes"),
    path('delete_all_subfolders/', views.delete_all_subfolders, name="delete_all_subfolders"),
    path('delete_note/', views.delete_note, name="delete_note"),
    path('restore_note/', views.restore_note, name="restore_note"),
    path('<slug:folder_slug>/', views.folder_detail, name='folder'),
    path('<slug:folder_slug>/<slug:note_slug>/', views.note_detail, name='note'),
]