const userTimezoneOffset = new Date().getTimezoneOffset(); // Получаем часовой пояс пользователя
const userData = { timezone_offset: userTimezoneOffset };

// Отправляем часовой пояс пользователя на сервер
fetch('/save_timezone_offset/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(userData)
})

// Получаем ответ от сервера
.then(response => {
    if (!response.ok) {
        return response.text()
    } 
})

.then(data => {
    if(data){console.log(data)}
})

// Обрабатываем ошибку запроса
.catch(error => {
    console.error('Error:', error);
});

// Переменные с объектами HTML документа
let folders = document.getElementsByClassName("folder");
const main_folder = document.querySelector('[name="main_folder"]');
const search = document.getElementById("search");
const folderContainer = document.getElementById('folders');
let description_note = document.getElementsByClassName('description_note');
let img_edit_menu = document.getElementsByClassName("img_edit_menu");
const edit_menu_buttons = document.getElementsByClassName("button_edit_menu");
const edit_menu = document.getElementById("edit_menu");
let img_arrow = document.getElementsByClassName("arrow_img");
const rename_folder = document.getElementById("rename_folder");
const add_subfolder = document.getElementById("add_subfolder");
const delete_folder = document.getElementById("delete_folder");
const img_edit = document.getElementsByClassName("img_edit");
const textarea_name = document.getElementById("name");
const main_window = document.getElementsByClassName("main_window");
const no_notes = document.querySelector("#no_notes");
const add_folder = document.getElementById("add_folder");
const add_note = document.getElementById("add_note");
let textarea_title = document.getElementsByClassName('text_title');
let textarea_text = document.getElementsByClassName('text_input');
const img_delete_note = document.getElementById('trash_img');
const deleted_notes = document.getElementById("deleted_notes");
const text_about_deleted_notes = document.getElementById("text_about_deleted_notes");
const restore_note = document.getElementById("restore_note");

let id_folder = 0;
let id_current_folder = 0;
let id_current_note = null;
const timerMap_title = new Map();
const timerMap_text = new Map();
let save_text = false
let folderPaddings = {}

// HEX цвета
const color_default = "#f5f6f7";
const color_mouse = "#ededed";
const color_click = '#3F888F'; 
const color_clickmouse = "#48a2ab";
const color_clickout = "#d9dadb";

// Пути для изображений
const src_editMenuBlue = "/static/note/img/3points/blue.png";
const src_editMenuBlue_full = "/static/note/img/3points/blue_full.png";
const src_editMenuWhite = "/static/note/img/3points/white.png";
const src_editMenuWhite_full = "/static/note/img/3points/white_full.png";
const src_editMenuClick = "/static/note/img/3points/click.png";

const src_folderDefault = "/static/note/img/folder.png";
const src_folderWhite = "/static/note/img/folder_white.png";

const src_trashDefault = "/static/note/img/trash.png"
const src_trashWhite = "/static/note/img/trash_white.png"

const src_arrow_right = "/static/note/img/arrow_right.png"
const src_arrow_down= "/static/note/img/arrow_down.png"
const src_arrow_right_white = "/static/note/img/arrow_right_white.png"
const src_arrow_down_white = "/static/note/img/arrow_down_white.png"

// Запускаем функции для функциональности папок, заметок и сохранения текста
displays_folders() 

Array.from(folders).forEach(folder => {
    folder_functions(folder)
})

Array.from(description_note).forEach(note => {
    note_functions(note)
})

Array.from(textarea_title).forEach(title => {
    note_title_functions(title)
})

Array.from(textarea_text).forEach(text => {
    note_text_functions(text)
})

// Вызываем функции для первой папки, чтобы она сразу была выбрана
folder_click(main_folder)
displays_note_of_clicked_folder(main_folder)

// Добавляет клик для поиска
search.addEventListener('click', function() {
    folder_click(search);
})

search.addEventListener('input', function() {
    search_notes()
})

// Обрабатывает максимальное кол-во символов
document.addEventListener("DOMContentLoaded", function() {
    maxLength("folder_text");
    maxLength("name_note");
    maxLength("text_note");
});

// Добавляет для папки функции обрабатывания
function folder_functions(folder){

    folder.addEventListener('click', function(event) {
        folder_click(folder, event);

        not_readonly_textares()
        restore_note.style.display = "none";
        text_about_deleted_notes.style.display = "none";

        // Отображает заметки нажатой папки
        Array.from(description_note).forEach(note => {
            note.classList.remove('active');
        });
        displays_note_of_clicked_folder(folder)

        const arrow = folder.querySelector('.arrow_img')

        if(event.target == arrow){
            display_subfolders(folder, arrow, false, false)
        }
    });

    folder.addEventListener('mouseover', function() {
        folder_mouse(folder);
    });

    folder.addEventListener('mouseout', function() {
        folder_mouseout(folder);
    })

    // Обрабатывает подтверждение переименования папки
    if(folder.getAttribute("name") == "main_folder"){
        return;
    }

    inputFolder = folder.querySelector(".new_name_folder")

    inputFolder.addEventListener("blur", function() {
        if(folder.getAttribute("data-rename") == "true") {
            updateFolderName(folder);
        }
    })
    inputFolder.addEventListener("keydown", function(event) {
        if(folder.getAttribute("data-rename") == "true") {
            if(event.key == "Enter") {
                event.preventDefault();
                updateFolderName(folder);
            }
        }
    })

    const img_edit_menu = folder.querySelector('.img_edit_menu') 

    // Добавляет для меню редактирования папок функции
    img_edit_menu.addEventListener("click", function() {
        img_edit_menu_click(img_edit_menu);
    })
    img_edit_menu.addEventListener("mouseover", function() {
        img_edit_Menu_mouse(img_edit_menu);
    })
    img_edit_menu.addEventListener("mouseout", function() {
        img_edit_menu_mouseout(img_edit_menu);
    })
}
    
// Добавляет для каждой заметки функции обрабатывания
function note_functions(note){

    if(note.getAttribute("data-is-deleted")){
        deleted_notes.classList.add('active')
    }

    note.addEventListener('click', function() {
        note_click(note);

        id_current_note = note.id;

        text = document.querySelector(`[data-note-id='${id_current_note}']`);

        Array.from(main_window).forEach(text => {
            text.classList.remove("active");
        })
        text.classList.add("active");

    });

    note.addEventListener('mouseover', function() {
        note_mouse(note);
    });

    note.addEventListener('mouseout', function() {
        note_mouseout(note);
    })
};


// Добавляет для каждой заметки функции сохранения заголовка и текста
function note_title_functions(title){
    let noteId = title.parentElement.getAttribute("data-note-id");

    title.addEventListener("input", function(){
        display_valid_data(title);
        
        clearTimeout(timerMap_title.get(noteId));
        
        timerMap_title.set(noteId, setTimeout(() => {
            save_title_note(noteId, title.value);
        }, 2000));
    });
};

function note_text_functions(text){
    let noteId = text.parentElement.getAttribute("data-note-id");

    text.addEventListener("input", function(){
        display_valid_data(text);
        
        clearTimeout(timerMap_text.get(noteId));
        
        timerMap_text.set(noteId, setTimeout(() => {
            save_text_note(noteId, text.value);
        }, 2000));
    });
};

// Добавляет для кнопки редактирования папки функции
Array.from(edit_menu_buttons).forEach(edit => {
    edit.addEventListener("mouseover", function() {
        edit_menu_mouse(edit);
    })
    edit.addEventListener("mouseout", function() {
        edit_menu_mouseout(edit);
    })
})

// Добавляет для кнопки редактирования папки функции
Array.from(img_edit).forEach(img => {
    img.addEventListener("mouseover", function() {
        edit_menu_mouse(img);
    })
    img.addEventListener("mouseout", function() {
        edit_menu_mouseout(img);
    })
})

// Обрабатывает нажатие на rename папки
rename_folder.addEventListener("click", function() {
    rename_folder_click();
})

// Функция для создания новой папки
add_folder.addEventListener('click', function() {
    create_new_folder()
})

add_folder.addEventListener('mouseover', function() {
    add_folder_mouse(add_folder)
})

add_folder.addEventListener('mouseout', function() {
    add_folder_mouseout(add_folder)
})

// Функция для создания новой заметки
add_note.addEventListener('click', function() {
    if(!add_note.getAttribute('data-deleted')){
        create_new_note()
    }
})

add_note.addEventListener('mouseover', function() {
    if(!add_note.getAttribute('data-deleted')){
        add_note_mouse(add_note)
    }
})

add_note.addEventListener('mouseout', function() {
    if(!add_note.getAttribute('data-deleted')){
        add_note_mouseout(add_note) 
    }
})

deleted_notes.addEventListener('click', function() {
    deleted_notes_click(deleted_notes)
})

deleted_notes.addEventListener('mouseover', function() {
    deleted_notes_mouse(deleted_notes)
})

deleted_notes.addEventListener('mouseout', function() {
    deleted_notes_mouseout(deleted_notes)
})

delete_folder.addEventListener('click', function() {
    delete_folders()
})

restore_note.addEventListener('click', function() {
    restore_notes()
})

restore_note.addEventListener('mouseover', function() {
    button_mouse(restore_note)
})

restore_note.addEventListener('mouseout', function() {
    button_mouseout_white(restore_note)
})

img_delete_note.addEventListener('click', function() {
    moving_note_to_root()
})

add_subfolder.addEventListener('click', function() {
    create_addsubfolder();
})

// Добавляет обработчик событий для всего документа
document.addEventListener('click', function(event) {
    if (event.target !== search) {
        search.style.border = '3px solid transparent'; 
    }

    for(let i of folders) {
        if(i.getAttribute("data-clicked") === "true") {
            if(!i.contains(event.target) && event.target !== i) {
                i.style.backgroundColor = color_clickout;
                i.querySelector(".folder_text").style.color = "black";

                const img_folder = i.querySelector('.folder_img');
                img_folder.setAttribute('src', src_folderDefault);

                const arrow = i.querySelector('.arrow_img')

                if(i.getAttribute('name') != 'main_folder'){
                    if(arrow.getAttribute('data-side') == 'right'){
                        arrow.setAttribute('src', src_arrow_right)
                    }
                    else{arrow.setAttribute('src', src_arrow_down)}
                }
            }
        }
    }  

    for(let i of description_note) {
        if(i.getAttribute("data-clicked") === "true") {
            if(!i.contains(event.target) && event.target !== i) {
                i.style.backgroundColor = color_clickout;
                changeColorTextNoteDefault(i);
            }
        }
    }

    if(edit_menu.getAttribute("data-clicked") === "true" && 
    event.target !== edit_menu && 
    ![...img_edit_menu].some(img => img === event.target)
    ){
        edit_menu.style.visibility = "hidden";
        edit_menu.setAttribute("data-clicked", "false");
    }

    if(deleted_notes.getAttribute("data-clicked") === "true") {
        if(!deleted_notes.contains(event.target) && event.target !== deleted_notes) {
            deleted_notes.style.backgroundColor = color_clickout;
            deleted_notes.querySelector("#text_deleted_note").style.color = "black";
            const img = deleted_notes.querySelector('#img_deleted_notes');
            img.setAttribute('src', src_trashDefault);
        }
        const isChildOfFolder = Array.from(folders).some(folder => {
            return Array.from(folder.querySelectorAll('*')).includes(event.target);
        });
        if([...folders].some(folder => folder === event.target) || isChildOfFolder) {
            deleted_notes.style.backgroundColor = color_default
            deleted_notes.setAttribute("data-clicked", "false")
        }
    }
    
});

document.addEventListener('keydown', function(event) {
    if(event.key == 'Delete'){
        moving_note_to_root()
    }
})

// Обрабатывает нажатие мышки на папку
function folder_click(el, event=null) {
    if(el.id === "search") {
        el.style.border = "3px solid #3F888F";
        return;
    }
    if(el.getAttribute("data-rename") === "true") {
        return
    }  
    for(let i of folders) {
        if(i.getAttribute("data-clicked") === "true") {
            i.setAttribute('data-clicked', 'false')
            i.style.backgroundColor = color_default;

            i.querySelector(".folder_text").style.color = "black";
            const img_folder = i.querySelector('.folder_img');
            img_folder.setAttribute('src', src_folderDefault);

            if(i.getAttribute("name") == "main_folder"){

            } else {i.querySelector(".img_edit_menu").setAttribute("src", src_editMenuBlue);

            const arrow = i.querySelector('.arrow_img')

            if(arrow.getAttribute('data-side') == 'right'){
                arrow.setAttribute('src', src_arrow_right)
            }
            else{arrow.setAttribute('src', src_arrow_down)}
            }
        }
    }

    el.style.backgroundColor = color_click;
    el.querySelector(".folder_text").style.color = "white";
    const img_folder = el.querySelector('.folder_img');
    img_folder.setAttribute('src', src_folderWhite);
    el.setAttribute('data-clicked', 'true');
    if(el.getAttribute("name") == "main_folder"){
        return
    }
    const arrow = el.querySelector('.arrow_img')

    if(arrow.getAttribute('data-side') == 'right'){
        arrow.setAttribute('src', src_arrow_right_white)
    }
    else{arrow.setAttribute('src', src_arrow_down_white)}

    if(event){
        if(event.target == el.querySelector(".img_edit_menu")) {
            el.querySelector(".img_edit_menu").setAttribute("src", src_editMenuClick);
            el.style.backgroundColor = "#575b5c";
            return;
        }
    }
    el.querySelector(".img_edit_menu").setAttribute("src", src_editMenuWhite);
}

// Обрабатывает наведение мышки на папку
function folder_mouse(el) {
    if(el.getAttribute("data-rename") === "true") {
        return
    }
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_click;
        el.querySelector(".folder_text").style.color = "white";

        const img_folder = el.querySelector('.folder_img');
        img_folder.setAttribute('src', src_folderWhite);
        if(el.getAttribute("name") == "main_folder"){
            el.style.backgroundColor = color_click;
            return
        }
        const arrow = el.querySelector('.arrow_img')

        if(arrow.getAttribute('data-side') == 'right'){
            arrow.setAttribute('src', src_arrow_right_white)
        }
        else{arrow.setAttribute('src', src_arrow_down_white)}

        el.querySelector(".img_edit_menu").style.visibility = 'visible'; 
        if(edit_menu.getAttribute("data-clicked") === "true") {
            el.style.backgroundColor = "#575b5c";
            return

        } el.style.backgroundColor = color_click;
        return;
    }
    el.style.backgroundColor = color_mouse;
    el.style.cursor = "pointer";
    if(el.getAttribute("name") == "main_folder"){
        return
    }
    el.querySelector(".img_edit_menu").style.visibility = 'visible'; 
}

// Обрабатывает выведение мышки из папки
function folder_mouseout(el) {
    if(el.getAttribute("data-rename") === "true") {
        return
    }
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_clickmouse;
        if(el.getAttribute("name") == "main_folder"){
            return
        }
        el.querySelector(".img_edit_menu").style.visibility = 'hidden'; 
        if(edit_menu.getAttribute("data-clicked") === "true") {
            el.style.backgroundColor = "#575b5c";
            return
        }el.style.backgroundColor = color_clickmouse;
        return;
    }
    el.style.backgroundColor = color_default;
    if(el.getAttribute("name") == "main_folder"){
        return
    }
    el.querySelector(".img_edit_menu").style.visibility = 'hidden'; 
}

// Обрабатывает нажатие мышки на заметку
function note_click(el) {
    for(let i of description_note) {
        if(i.getAttribute("data-clicked") === "true") {
            i.setAttribute('data-clicked', 'false')
            i.style.backgroundColor = "";
            changeColorTextNoteDefault(i);
        }
    }
    el.style.backgroundColor = color_click;
    changeColorTextNote(el);
    el.setAttribute('data-clicked', 'true');
}

// Обрабатывает наведение мышки на заметку
function note_mouse(el) {
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_click;
        changeColorTextNote(el);
        return;
    }
    el.style.backgroundColor = color_mouse;
    el.style.cursor = "pointer";
}


// Обрабатывает выведение мышки из заметки
function note_mouseout(el) {
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_clickmouse;
        return;
    }
    el.style.backgroundColor = "";
}

// Функция для изменения цвета шрифта заметок на белый
function changeColorTextNote(el) {
    const name_note = el.getAttribute("name")
    let elements = document.querySelectorAll(`[name='${name_note}'] span`);
    elements.forEach(function(element) {
        element.style.color = 'white';
    });
}

// Функция для изменения цвета шрифта заметок на стандартный
function changeColorTextNoteDefault(el) {
    const name_note = el.getAttribute("name")
    let elements = document.querySelectorAll(`[name='${name_note}'] span`);
    elements.forEach(function(element) {
        element.style.color = '';
        if(element.className == "text_note") {
            element.style.color = "#88898a";
        }
    });
}

function search_notes() {
    
}

// Функция для нажатия на меню редактирования папки
function img_edit_menu_click(el) {
    id_folder = el.parentElement.id
    const rect = el.getBoundingClientRect();
    const y = rect.top; 
    edit_menu.style.top = y - 16 + "px"
    edit_menu.style.visibility = "visible";
    edit_menu.setAttribute("data-clicked", "true");
}

// Функция для обработки наводки на меню редактирования папки
function img_edit_Menu_mouse(el) {
    if(el.parentElement.getAttribute("data-clicked") === "true") {
        el.setAttribute("src", src_editMenuWhite_full);
        return;
    }
    el.setAttribute("src", src_editMenuBlue_full);
}

// Функция для обработки вывода мышки из меню редактирования папки
function img_edit_menu_mouseout(el) {
    if(el.parentElement.getAttribute("data-clicked") === "true") {
        el.setAttribute("src", src_editMenuWhite);
        return;
    }
    el.setAttribute("src", src_editMenuBlue);
}

function button_mouse(el) {
    el.style.backgroundColor = color_mouse
}

function button_mouseout_white(el) {
    el.style.backgroundColor = 'white'
}

// Меняет цвет у кнопок в меню редакт.
function edit_menu_mouse(el) {
    el.style.backgroundColor = color_mouse;
}

// Меняет цвет у кнопок в меню редакт.
function edit_menu_mouseout(el) {
    el.style.backgroundColor = "";
}

function add_folder_mouse(el) {
    el.style.backgroundColor = color_click
}

function add_folder_mouseout(el) {
    el.style.backgroundColor = color_clickmouse
}

function add_note_mouse(el) {
    el.style.backgroundColor = color_click
}

function add_note_mouseout(el) {
    el.style.backgroundColor = color_clickmouse
}

function deleted_notes_click(el) {
    for(let i of folders) {
        if(i.getAttribute("data-clicked") === "true") {
            i.setAttribute('data-clicked', 'false')
            i.style.backgroundColor = color_default;
            i.querySelector(".folder_text").style.color = "black";
            const img_folder = i.querySelector('.folder_img');
            img_folder.setAttribute('src', src_folderDefault);
            if(i.getAttribute("name") == "main_folder"){

            } else i.querySelector(".img_edit_menu").setAttribute("src", src_editMenuBlue);
        }
    }


    el.style.backgroundColor = color_click;
    el.querySelector("#text_deleted_note").style.color = "white";
    const img = el.querySelector('#img_deleted_notes');
    img.setAttribute('src', src_trashWhite);
    el.setAttribute('data-clicked', 'true');
    restore_note.style.display = "inline";
    display_deleted_note()
}

function deleted_notes_mouse(el) {
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_click;
        el.querySelector("#text_deleted_note").style.color = "white";
        const img = el.querySelector('#img_deleted_notes');
        img.setAttribute('src', src_trashWhite);
        return
    }
    el.style.backgroundColor = color_mouse;
    el.style.cursor = "pointer";
}

function deleted_notes_mouseout(el) {
    if(el.getAttribute("data-clicked") === "true") {
        el.style.backgroundColor = color_clickmouse;
        return;
    }
    el.style.backgroundColor = color_default;
}

// Алгоритм для нахождения той папки, у которой было вызвано меню редакт.
function rename_folder_click() {
    const folder = document.querySelector(`[data-folder-name='folder${id_folder}']`)
    const rename = folder.querySelector('.new_name_folder')
    rename.style.visibility = "visible"
    rename.select();
    rename.focus();
    folder.setAttribute("data-rename", "true");
    folder.style.backgroundColor = color_default;
}

// Устанавливает ограничение текста в разных местах ...
function maxLength(class_name) {
    let elements = document.getElementsByClassName(class_name);
    
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let text = element.textContent;
        const length = {
            "folder_text": 15,
            "name_note": 20,
            "text_note": 22,
        }
        let maxLength = length[class_name];
        if (text.length > maxLength) {
            let truncatedText = text.slice(0, maxLength - 1) + '...';
            element.textContent = truncatedText;
        }
    }
}

// Отображает заметки нажатой папки
function displays_note_of_clicked_folder(folder){
    id_current_folder = folder.id;
    const folderId = folder.id;

    Array.from(description_note).forEach(note => {
        note.classList.remove("active");  
    })

    Array.from(main_window).forEach(text => {
        text.classList.remove("active");  
    })

    let first = true;
    id_current_note = null;
    Array.from(description_note).forEach(note => {
        if(!note.getAttribute("data-is-deleted")){
            if (note.getAttribute('data-folder-id') === folderId) {
                note.classList.add('active');
                if(first) {
                    note_click(note);
                    first = false;
                    no_notes.style.display = "none"
                    id_current_note = note.id;
                    text = document.querySelector(`[data-note-id='${id_current_note}']`);
                    if(text){
                        Array.from(main_window).forEach(text => {
                            text.classList.remove("active");
                        })
                        text.classList.add("active");
                    }
                };
            } else if(!id_current_note) {
                Array.from(main_window).forEach(text => {
                    text.classList.remove("active");  
                })
                no_notes.style.display = "block"
            }
        }
    });
    if(first){
        no_notes.style.display = "block"
    }
}

// Отображает папки
function displays_folders() {
    Array.from(folders).forEach(folder => {
        folder.style.display = "flex";
        if(folder.getAttribute('name') != 'main_folder') {

            const subfolder_level = folder.getAttribute('data-subfolder-level')
            const rename_folder = folder.querySelector('.new_name_folder')

            switch(subfolder_level){
                case '0':
                    folder.style.paddingLeft = '10px'
                    folderPaddings[folder.id] = 10
                    rename_folder.style.left = '55px'
                    break
                case '1':
                    folder.style.paddingLeft = '20px'
                    folderPaddings[folder.id] = 20
                    rename_folder.style.left = '65px'
                    break
                case '2':
                    folder.style.paddingLeft = '30px'
                    folderPaddings[folder.id] = 30
                    rename_folder.style.left = '75px'
                    break
                case '3':
                    folder.style.paddingLeft = '40px'
                    folderPaddings[folder.id] = 40
                    rename_folder.style.left = '80px'
                    break    
            }

            if(folder.getAttribute("data-there-subfolders") === 'True') {   
                const img_arrow = folder.querySelector('.arrow_img')
                img_arrow.style.visibility = "visible";
            }

            else{
                const img_arrow = folder.querySelector('.arrow_img')
                img_arrow.style.visibility = "hidden";
            }
            
            if(folder.getAttribute('data-parent-folder') != 0){
                folder.style.display = 'none'
            }
        }
    })
}

// Отображает корректные данные если user изменяет заметку
function display_valid_data(el){
    const timeNow = new Date()
    const hours = timeNow.getHours().toString().padStart(2, '0');
    const minutes = timeNow.getMinutes().toString().padStart(2, '0');
    let id_note
    if(typeof el != 'number'){
        id_note = el.parentElement.getAttribute("data-note-id")
    }
    else{
        id_note = el
    }
    const note = document.querySelector(`[name='note${id_note}']`)
    const timeNote = note.querySelector('.date_note')
    if(timeNote.textContent.trim() != `${hours}:${minutes}`){
        timeNote.textContent = `${hours}:${minutes}` // Отображает настоящее время при изменении заметки
    }
    note.parentNode.prepend(note); // Переносим заметку на самый верх
}

// Отображение корзины и удаленных заметок
function display_deleted_note() {  
    id_current_folder = 0

    Array.from(description_note).forEach(note => {
        note.classList.remove('active');
    });

    Array.from(main_window).forEach(text => {
        text.classList.remove("active");  
    })

    text_about_deleted_notes.style.display = "block"
    add_note.style.backgroundColor = "#2e585c";
    add_note.setAttribute('data-deleted', 'true');
    add_note.style.cursor = "default"

    readonly_textares()

    let first = true;
    id_current_note = null;

    Array.from(description_note).forEach(note => {
        if(note.getAttribute("data-is-deleted")){
            note.classList.add('active');
            if(first) {
                note_click(note);
                first = false;
                no_notes.style.display = "none"
                id_current_note = note.id;
                text = document.querySelector(`[data-note-id='${id_current_note}']`);
                if(text){
                    Array.from(main_window).forEach(text => {
                        text.classList.remove("active");
                    })
                    text.classList.add("active");
                }
            };
        }
    })
    if(first){
        text_about_deleted_notes.style.display = "none"
        restore_note.style.display = "none";
        add_note.style.backgroundColor = color_clickmouse;
        add_note.removeAttribute('data-deleted');
        add_note.style.cursor = "pointer"

        deleted_notes.removeAttribute('data-clicked')
        deleted_notes.querySelector("#text_deleted_note").style.color = "black";
        const img = deleted_notes.querySelector('#img_deleted_notes');
        img.setAttribute('src', src_trashDefault);
        deleted_notes.style.background = color_default;

        deleted_notes.classList.remove('active')
        folder_click(main_folder)
        displays_note_of_clicked_folder(main_folder)
        not_readonly_textares()
    }
}

function display_subfolders(parent_folder, img_arrow, offSubfolders, createNewfolder) {

    if(img_arrow.getAttribute('data-clicked') && !createNewfolder || offSubfolders) {

        if(offSubfolders){
            img_arrow.setAttribute('src', src_arrow_right)
        }
        else {
            img_arrow.setAttribute('src', src_arrow_right_white)
        }
        img_arrow.setAttribute('data-side', 'right')
        img_arrow.removeAttribute('data-clicked')

        img_arrow.style.width = '6px'
        img_arrow.style.height = 'auto'

        parent_folder.style.paddingLeft = folderPaddings[parent_folder.id] + 'px'

        Array.from(folders).forEach(folder => {
            if(folder.getAttribute('data-parent-folder') == parent_folder.id){
                folder.style.display = "none"
                if(folder.getAttribute('data-there-subfolders')) {
                    const img_arrow = folder.querySelector('.arrow_img')
                    display_subfolders(folder, img_arrow, true)
                }
            } 
        })
    }

    else{
        img_arrow.setAttribute('src', src_arrow_down_white)
        img_arrow.setAttribute('data-side', 'down')
        img_arrow.setAttribute('data-clicked', 'true')

        img_arrow.style.width = 'auto'
        img_arrow.style.height = '6px'


        parent_folder.style.paddingLeft = folderPaddings[parent_folder.id] - 4 + 'px'
        
        Array.from(folders).forEach(folder => {
            if(folder.getAttribute('data-parent-folder') == parent_folder.id) {
                folder.style.display = "flex";
            }
        })
    }
}

function readonly_textares() {
    let textAreas = document.querySelectorAll('textarea');
    textAreas.forEach(function(textarea) {
        textarea.addEventListener('keydown', preventKeyEvent);
    });
}

function not_readonly_textares() {
    let textAreas = document.querySelectorAll('textarea');
    textAreas.forEach(function(textarea) {
        textarea.removeEventListener('keydown', preventKeyEvent);
    });
}

function preventKeyEvent(event) {
    event.preventDefault(); // Предотвращаем обработку события
}


// Обновляет имя папки
function updateFolderName(el) {
    let new_name = el.querySelector(".new_name_folder").value
    if(new_name != el.querySelector(".folder_text").textContent && new_name){
        el.querySelector(".folder_text").textContent = new_name;
        maxLength("folder_text");

        fetch('/rename_folder/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({'folder_id': id_folder, 'new_name': new_name})
        })

        .then(response => {
            if(response.ok){
                return response.text()
            }
        })

        .then(data => {
            if(data){console.log(data)}
        })

        .catch(error => {
            console.error('Error:', error)
        })
    }
    else {;}
    el.setAttribute("data-rename", "false");
    el.querySelector(".new_name_folder").style.visibility = "hidden";
}

// Создает новую папку
function create_new_folder() {
    fetch("/create_new_folder/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if(response.ok){
            return response.json()
        }
    })

    .then(data => {
        if(data){
            const newFolder = data.folder

            // Получаем необходимые теги
            const newFolderElement = document.createElement('div');

            // Заполняем папку данными
            newFolderElement.classList.add('folder');
            newFolderElement.setAttribute('id', newFolder.id);
            newFolderElement.setAttribute('name', newFolder.title); 
            newFolderElement.setAttribute('data-folder-name', 'folder' + newFolder.id);
            newFolderElement.setAttribute('data-parent-folder', '0');
            newFolderElement.setAttribute('data-there-subfolders', 'false');
            newFolderElement.setAttribute('data-subfolder-level', '0')
            newFolderElement.innerHTML += `
                <input class="new_name_folder" type="text" value="${newFolder.title}" maxlength="100" spellcheck="false">
                <img class="arrow_img" src="static/note/img/arrow_right.png">
                <img class="folder_img" src="static/note/img/folder.png">
                <span class="folder_text">${newFolder.title}</span>
                <img class="img_edit_menu" src="static/note/img/3points/blue.png">
            `;

            newFolderElement.style.display = 'flex'

            folderContainer.insertBefore(newFolderElement, deleted_notes);

            const folderStyles= window.getComputedStyle(newFolderElement)
            const folderPadding = parseInt(folderStyles.getPropertyValue('padding-left'), 10)
    
            folderPaddings[newFolder.id] = folderPadding
            
            // Выполняем функции папок для новой папки
            create_new_note(newFolder.id)
            folder_functions(newFolderElement)
            folder_click(newFolderElement)
            }
    })

    .catch(error => {
        console.error('Error:', error)
    })
}

function create_addsubfolder() {
    const parent_folder = document.getElementById(id_current_folder)

    let folder_indent = 10
    const subfolder_level = parseInt(parent_folder.getAttribute('data-subfolder-level')) + 1

    for(let i=0; i < subfolder_level; i++){
        folder_indent += 10
    }
    fetch("/create_addsubfolder/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({"id_folder": id_current_folder, 'subfolder_level': subfolder_level})
    })

    .then(response => {
        if(response.ok) {
            return response.json()
        }
    })

    .then(data => {
        if(data) {
            const newFolder = data.folder

            // Получаем необходимые теги
            const newFolderElement = document.createElement('div');

            // Заполняем папку данными
            newFolderElement.classList.add('folder');
            newFolderElement.setAttribute('id', newFolder.id);
            newFolderElement.setAttribute('name', newFolder.title); 
            newFolderElement.setAttribute('data-folder-name', 'folder' + newFolder.id);
            newFolderElement.setAttribute('data-there-subfolders', 'false');
            newFolderElement.setAttribute('data-subfolder-level', subfolder_level);
            newFolderElement.innerHTML += `
                <input class="new_name_folder" type="text" value="${newFolder.title}" maxlength="100" spellcheck="false">
                <img class="arrow_img" src="static/note/img/arrow_right.png">
                <img class="folder_img" src="static/note/img/folder.png">
                <span class="folder_text">${newFolder.title}</span>
                <img class="img_edit_menu" src="static/note/img/3points/blue.png">
            `;
            newFolderElement.style.display = 'flex'

            parent_folder.setAttribute('data-there-subfolders', 'True')
            const arrow_img = parent_folder.querySelector('.arrow_img')

            newFolderElement.style.paddingLeft = folder_indent + 'px';
            folderPaddings[newFolder.id] = folder_indent 

            newFolderElement.setAttribute('data-parent-folder', parent_folder.id)
            parent_folder.insertAdjacentElement('afterend', newFolderElement);

            const img_arrow = parent_folder.querySelector('.arrow_img')
            img_arrow.style.visibility = "visible";

            create_new_note(newFolder.id)
            folder_functions(newFolderElement)
            display_subfolders(parent_folder, arrow_img, false, true) 
            folder_click(newFolderElement)
        }
    })
}

// Создает новую заметку в текущей папке
function create_new_note(id_Newfolder=null) {
    let id_folder_for_note = id_current_folder

    if(id_Newfolder){
        id_folder_for_note = id_Newfolder
    }

    fetch("/create_new_note/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({"folder_id": id_folder_for_note})
    })

    .then(response => {
        if(response.ok){
            return response.json()
        }
    })

    .then(data => {
        // Динамически добавляем заметку в HTML
        const newNote = data.note;

        const newNoteElement = document.createElement('div')

        newNoteElement.classList.add('description_note')
        newNoteElement.setAttribute('data-folder-id', newNote.folder_id)
        newNoteElement.setAttribute('id', newNote.id)
        newNoteElement.setAttribute('name', 'note'+newNote.id)

        newNoteElement.innerHTML += `
            <span class="name_note">${newNote.title}</span>
            <br><span class="date_note"></span>
            <span class="text_note"></span> 
        `;

        const newNoteTextareas = document.createElement('div')

        newNoteTextareas.classList.add('main_window')
        newNoteTextareas.setAttribute('data-note-id', newNote.id)

        // Также добавляем текстовые поля для заметки
        newNoteTextareas.innerHTML += `
            <textarea class="text_title" id="title${ newNote.id }" name="title${ newNote.title }" spellcheck="false" maxlength="150" placeholder="Заголовок">${newNote.title}</textarea>
            <textarea class="text_input" id="text${ newNote.id }" name="text${ newNote.title }" spellcheck="false" placeholder="Текст"></textarea>
        `;

        const notes = document.getElementById('notes')
        const spacer = notes.querySelector('.spacer')
        const textareas = document.getElementById('textareas')

        notes.insertBefore(newNoteElement, spacer);
        textareas.appendChild(newNoteTextareas)

        Array.from(description_note).forEach(note => {
            note.classList.remove('active');
        });

        const folder = document.querySelector(`[data-folder-name='folder${id_folder_for_note}']`)
        const note = document.querySelector(`[name='note${ newNote.id }']`)
        const title = document.querySelector(`#title${ newNote.id }`)
        const text = document.querySelector(`#text${ newNote.id }`)

        // Выполняем функции заметок для новой заметки
        display_valid_data(newNote.id)
        note_title_functions(title)
        note_text_functions(text)
        note_functions(note)
        displays_note_of_clicked_folder(folder)
    })

    .catch(error => {
        console.error('Error:', error)
    })

}

// Сохраняет заголовок заметки
function save_title_note(id_note, new_title){
    const note = document.querySelector(`[name='note${id_note}']`)
    const title_note = note.querySelector('.name_note')
    if(new_title){
        title_note.textContent = new_title
    }
    else{
        title_note.textContent = "Новая заметка"
    }
    maxLength("name_note")
    fetch('/save_title_note/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({'id_note': id_note, 'new_title': new_title})
    })

    .then(response => {
        if(response.ok){
            return response.text()
        }
    })

    .then(data => {
        console.log(data)
    })

    .catch(error => {
        console.error('Error:', error)
    })
}

// Сохраняет текст заметки
function save_text_note(id_note, new_text){
    const note = document.querySelector(`[name='note${id_note}']`)
    const text_note = note.querySelector('.text_note')
    text_note.textContent = new_text
    maxLength("text_note")
    fetch('/save_text_note/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({'id_note': id_note, 'new_text': new_text})
    })

    .then(response => {
        if(response.ok){
            return response.text()
        }
    })

    .then(data => {
        console.log(data)
    })

    .catch(error => {
        console.error('Error:', error)
    })
}

// Удаляет папку и её заметки
function delete_folders(folder) {
    let id_delete_folder 
    if(folder){
        id_delete_folder = folder.id
    }
    else{
        id_delete_folder = id_folder
    }
    fetch('/get_notes_folder/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({'id_folder': id_delete_folder})
    })

    .then(response => {
        if(response.ok){
            return response.json()
        }
    })

    .then(data => {
        const notes = data['notes']
        let delete_notes = true
        
        for(let i=0; i < notes.length; i++){
            let note = notes[i]
            if(note.time_update != note.time_create){
                delete_notes = false
                fetch('/get_notes_folder/', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({'id_folder': id_delete_folder})
                })
            
                .then(response => {
                    if(response.ok){
                        for(let i=0; i < notes.length; i++){
                            const note = document.querySelector(`[name=note${notes[i].id}]`)
                            note.setAttribute("data-is-deleted", "true")
                            note.setAttribute('data-folder-id', main_folder.id)
                        }
                        deleted_notes.classList.add('active')
                        return response.text()
                    }
                })

                .then(data => {
                    console.log(data)
                })

                .catch(error => {
                    console.error('Error:', error)
                })
            }
        }
        fetch('/delete_folder/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({'id_folder': id_delete_folder, 'delete_notes': delete_notes})
        })
    
        .then(response => {
            if(response.ok){
                let delete_folder = document.querySelector(`[data-folder-name='folder${id_delete_folder}']`)
                const delete_folder_parent_id = parseInt(delete_folder.getAttribute('data-parent-folder'))

                const foldersContainer = document.getElementById('folders')

                const parent_folder = folderContainer.querySelector(`[data-folder-name='folder${delete_folder_parent_id}']`)

                let number_of_subfolders = 0

                if(delete_folder.getAttribute('data-there-subfolders') == 'True'){
                    let promises = []

                    Array.from(folders).forEach(folder => {
                        if(folder.getAttribute('data-parent-folder') == delete_folder.id) {
                            promises.push(delete_folders(folder))
                        }
                    })
                    
                    Promise.all(promises)
                    .then(() => {
                        Array.from(folders).forEach(folder => {
                            if(folder.getAttribute('data-parent-folder') == parent_folder.id){
                                number_of_subfolders += 1   
                            }
                        })
        
                        if(number_of_subfolders == 0 ){
                            console.log(parent_folder)
                            parent_folder.removeAttribute('data-there-subfolders')
                        }
                    })
                }

                delete_folder.remove()
                displays_folders()
                folder_click(main_folder)
                displays_note_of_clicked_folder(main_folder) 
                return response.text()
            }
        })
        
        .then(data => {
            console.log(data)
        })

        .catch(error => {
            console.error('Error:', error)
        })
    })

    .catch(error => {
        console.error('Error:', error)
    })
}

// Перемещает заметку в корзину
function moving_note_to_root() {
    if(id_current_note){

        const note = document.getElementById(id_current_note)

        if(!note.getAttribute('data-is-deleted')){
            fetch('/get_note/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({'id_note': id_current_note})
            })

            .then(response => {
                if(response.ok){
                    return response.json()
                }
            })

            .then(data => {
                const note = data['note']
                if(note.time_create != note.time_update){

                    fetch('/get_note/', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({'id_note': id_current_note})
                    })

                    .then(response => {
                        if(response.ok){
                            const note = document.getElementById(id_current_note)
                            const folder = document.getElementById(id_current_folder)
                            note.setAttribute("data-is-deleted", "true")
                            
                            deleted_notes.classList.add('active')
                            displays_note_of_clicked_folder(folder)

                            return response.text()
                        }
                    })

                    .then(data => {
                        console.log(data)
                    })
                    return
                }
                delete_note()
                return
            })

            .catch(error => {
                console.error('Error:', error)
            })
        }
        else{delete_note()}
    }
}

function delete_note(){
    fetch('/delete_note/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({'id_note': id_current_note})
    })

    .then(response => {
        if(response.ok){
            note = document.getElementById(id_current_note)
            note.remove()

            const folder = document.getElementById(id_current_folder)

            if(id_current_folder == 0){
                display_deleted_note()
            }
            else{displays_note_of_clicked_folder(folder)}
            return response.text()
        }
    })

    .then(data => {
        console.log(data)
    })

    .catch(error => {
        console.error('Error:', error)
    })
}

function restore_notes() {
    fetch('/restore_note/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({'id_note': id_current_note})
    })

    .then(response => {
        if(response.ok) {
            const note = document.getElementById(id_current_note)
            note.removeAttribute('data-is-deleted')

            display_deleted_note()
            return response.text()
        }
    })

    .then(data => {
        console.log(data)
    })
}

// Получаем CSRF-токен пользователя
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Получаем CSRF токен из куки  
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); // Декодируем токен
                break;
            }
        }
    }
    return cookieValue; 
}