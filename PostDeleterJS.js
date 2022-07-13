//feed-new-message-inf-text feed-new-message-inf-text-reload new-message-balloon
//feed-new-message-inf-text feed-new-message-inf-text-counter new-message-balloon
//document.getElementsByClassName("bx24-connection-status-text-reload-title")[0].click()
//

//>>>Переменные<<<//
let Deleted_posts_array = []    //Массив с id удаленных постов
let Nums_of_non_loaded_post = []  //Массив с количеcтвом неудачных попыток скрыть пост, он может быть неподгружен
let Nums_of_non_loaded_post_original = [] //Массив с количсетвом неудачных попыток скрыть пост из локального хранилища
let Posts_array = document.getElementsByClassName("feed-item-wrap")     //Cписок всех постов
let Settings = {}

let PostDeleter_Add_More_Posts_Button = document.createElement("div") //Способ загрузки новых сообщений в обход блокировки manifest v3
PostDeleter_Add_More_Posts_Button.hidden = true
PostDeleter_Add_More_Posts_Button.innerHTML = "<button onclick='BX.Livefeed.PageInstance.nextPageFirst=false;BX.Livefeed.PageInstance.getNextPage()'></button>"
document.body.append(PostDeleter_Add_More_Posts_Button)

let DataBase = {}

//>>>Константы<<<//
const Resources = chrome.runtime.getURL("Resources")
const Manifest = chrome.runtime.getManifest()

const About_path = Resources + "/about.html"
const Settings_path = Resources + "/settings.html"
const DataBase_path = Resources + "/PostDeleter.json"

const FeedWrap = document.querySelectorAll(".feed-wrap")[1]   //Это основная стена, все посты(начальные) являются детьми этого элемента
const PagetitleWrap = document.querySelectorAll(".pagetitle-wrap")[0]     //Это элемент над стеной с постами в нем содержится надпись "Новости", а данный аддон создает в нем меню с удаленными постами
const More_posts_button = document.getElementById("feed-new-message-inf-wrap-first")  //Кнопка "Ещё события"

//Для обратной совместимости
if (localStorage.getItem("DeletedPosts") != null) {    //Если в локальном хранилище есть такая переменная, значит аддон использовался до версии 3.5
    let Number_of_deleted_posts = parseInt(localStorage.getItem("DeletedPosts"))    //Получаем счетчик
    for (let i = 0; i < Number_of_deleted_posts; i++) { //Перебираем старые переменные в локальном хранилище
        Deleted_posts_array.push(localStorage.getItem("delpost" + i))   //Добавляем id в массив
        localStorage.removeItem("delpost" + i)    //И удаляем переменную из локального хранилища
    }
    localStorage.removeItem("DeletedPosts") //Удаляем переменную счетчика
    localStorage.setItem("Deleted_posts_array", Deleted_posts_array) //Ставим новую переменную с массивом
}
if (localStorage.getItem("Nums_of_non_loaded_post") == null & localStorage.getItem("Deleted_posts_array") != null) { //Если в локальном хранилище нет такой переменной, значит аддон использовался до версии 3.6 и ее требуется создать
    Deleted_posts_array = localStorage.getItem("Deleted_posts_array").split(',')
    for (i of Deleted_posts_array) {
        Nums_of_non_loaded_post.push(0)
    }
    localStorage.setItem("Nums_of_non_loaded_post", Nums_of_non_loaded_post)
    Nums_of_non_loaded_post_original = Nums_of_non_loaded_post.slice()
}
if (localStorage.getItem("Minimum_Number_Of_Posts") != null) {
    Settings.Minimum_number_of_posts = parseInt(localStorage.getItem("Minimum_Number_Of_Posts"))
    localStorage.removeItem("Minimum_Number_Of_Posts")
    localStorage.setItem("PostDeleterSettings", '{"Minimum_number_of_posts":' + Settings.Minimum_number_of_posts + '}')
}
if (localStorage.getItem("PostDeleterSettings") != null) {
    if (JSON.parse(localStorage.getItem("PostDeleterSettings")).Animation_enabled != undefined | JSON.parse(localStorage.getItem("PostDeleterSettings")).Button_enabled != undefined) {
        let oldSettings = JSON.parse(localStorage.getItem("PostDeleterSettings"))
        let NewSettings = {}
        NewSettings.theme = "classic"
        NewSettings.classicSettings = {}
        if (oldSettings.Animation_enabled != undefined) {
            NewSettings.classicSettings.Animation = oldSettings.Animation_enabled
        }
        if (oldSettings.Buttons_enabled != undefined) {
            NewSettings.classicSettings.Beautiful_Buttons = oldSettings.Animation_enabled
        }
        if (oldSettings.Minimum_number_of_posts != undefined) {
            NewSettings.Minimum_number_of_posts = oldSettings.Minimum_number_of_posts
        }
        localStorage.setItem("PostDeleterSettings", JSON.stringify(NewSettings))
    }
}

//Загрузка данных из локального хранилища
function Get_data() {
    if (Authorized()) {
        if (localStorage.getItem("Deleted_posts_array") != null & localStorage.getItem("Deleted_posts_array") != "") {
            Deleted_posts_array = localStorage.getItem("Deleted_posts_array").split(',')    //Помещаем id удаленных постов из локального хранилища в массив
            Nums_of_non_loaded_post = localStorage.getItem("Nums_of_non_loaded_post").split(',')    //Помещаем количество неудачных попыток скрыть посты в массив
            for (let i = 0; i < Nums_of_non_loaded_post.length; i++) {  //Делаем массив числовым
                Nums_of_non_loaded_post[i] = parseInt(Nums_of_non_loaded_post[i], 10)
            }
            Nums_of_non_loaded_post_original = Nums_of_non_loaded_post.slice()
        }
        if (localStorage.getItem("PostDeleterSettings") != null) {
            Settings = JSON.parse(localStorage.getItem("PostDeleterSettings"))
        }
        if (Settings.Minimum_number_of_posts == undefined) {
            Settings.Minimum_number_of_posts = 5
        }
        if (Settings.theme == undefined) {
            Settings.theme = "classic"
        }
        let getDB = new XMLHttpRequest
        getDB.responseType = "json"
        getDB.open("GET", DataBase_path, true)
        getDB.onload = function () {
            DataBase = getDB.response
            for (theme in DataBase.settings.theme) {
                if (Settings[theme + "Settings"] == undefined) {
                    Settings[theme + "Settings"] = {}
                }
            }
            for (theme in DataBase.theme) {
                if (DataBase.theme[theme].checkboxes == undefined) {
                    DataBase.theme[theme].checkboxes = {}
                }
                if (DataBase.theme[theme].select == undefined) {
                    DataBase.theme[theme].select = {}
                }
            }
            Create_deleter()
            Create_div_for_menus()
            Delete_posts()
        }
        getDB.send()
    }
}
Get_data()

//Удаление постов
function Delete_posts(PrevClass = undefined) {
    if (Authorized()) {
        for (let i = 0; i < Deleted_posts_array.length; i++) {
            try {   // Пытаемся удалить данный пост(может быть ситуация что пост старый и он еще не загружен на страницу)
                document.getElementById(Deleted_posts_array[i]).parentNode.hidden = true
                if (PrevClass != undefined) {
                    document.getElementById(Deleted_posts_array[i]).parentNode.classList.remove(PrevClass)
                }
                ClassHelper(document.getElementById(Deleted_posts_array[i]).parentNode, "add", "Deleted_Post")
                setTimeout(() => {
                    document.getElementById(Deleted_posts_array[i]).parentNode.hidden = false
                }, 1000);
                Nums_of_non_loaded_post[i] = Nums_of_non_loaded_post_original[i] + 0 //В случае если пост существует, то оставляем количество неудачных попыток удалить пост прежним
                Check_number_of_visible_posts()
            } catch (error) {
                Nums_of_non_loaded_post[i] = Nums_of_non_loaded_post_original[i] + 1 //Иначе прибавляем 1
            }
        }
        localStorage.setItem("Nums_of_non_loaded_post", Nums_of_non_loaded_post)
    }
}

//Создание крестиков
function Create_deleter() {
    let Post_deleter = document.querySelectorAll(".PostDeleter_PostDeleterDiv")    //Массив контейнеров с крестиками
    for (let i = 0; i < Post_deleter.length; i++) {    //Удаляем все крестики
        Post_deleter[i].remove()
    }
    for (Posts_array_item of Posts_array) {      // Перебираем все посты
        let Deleter_div = document.createElement("div")  //Создаем контейнер для крестика
        ClassHelper(Deleter_div, "add", "Deleter_Div")
        let Deleter = document.createElement("button") //Создаем кнопку
        ClassHelper(Deleter, "add", "Deleter_Button")
        Deleter.onclick = function () {     //Функция нажатия на крестик
            Deleted_posts_array.push(this.parentNode.nextSibling.id)    //Добавляем в массив с удаленными постами id удаленого поста
            localStorage.setItem("Deleted_posts_array", Deleted_posts_array) //Обновляем список удаленных постов в локальном хранилище
            Nums_of_non_loaded_post.push(0)
            Nums_of_non_loaded_post_original.push(0)
            localStorage.setItem("Nums_of_non_loaded_post", Nums_of_non_loaded_post)    //Обновляем массив с количеством не-загрузок поста
            ClassHelper(Deleter.parentNode.parentNode, "add", "Deleted_Post")
            Create_menu_with_deleted_posts()  //Пересоздаем меню со списком удаленных постов
            Check_number_of_visible_posts(true) //Проверяем количество видимых постов, чтобы не получилась пустая страница
        }
        let Deleter_image = document.createElement("div")   //Крестик для удаления поста
        ClassHelper(Deleter_image, "add", "Deleter_Image")
        Posts_array_item.insertBefore(Deleter_div, Posts_array_item.firstChild)
        Deleter_div.append(Deleter)
        Deleter.append(Deleter_image)
    }
}


//Функция создания контейнера для меню
function Create_div_for_menus() {
    if (Authorized()) {
        try {
            document.getElementById("PostDeleter_DivForMenus").remove()
        } catch (error) {
        }
        let Div_for_menus = document.createElement("div")
        Div_for_menus.id = "PostDeleter_DivForMenus"
        ClassHelper(Div_for_menus, "add", "Div_For_Menus")
        PagetitleWrap.append(Div_for_menus)
        Create_main_menu()
        Create_menu_with_deleted_posts()
    }
}


//Функция для создания главного меню
function Create_main_menu(recreate = false) {
    try {   //Пытаемся удалить кнопку открывающую меню и само меню, т.к. иногда нужно пересоздавать меню
        document.getElementById("MainMenuDiv").remove()
        document.getElementById("PostDeleter_BackgroundFullScreenPostDeleter").remove()
        document.getElementById("PostDeleter_AboutPostDeleter").remove()
        document.getElementById("PostDeleter_SettingsPostDeleter").remove()
    } catch (error) {
    }
    let About_PostDeleter = document.createElement("div") //Создание справки
    let Background_Fullscreen_PostDeleter = document.createElement("div")
    About_PostDeleter.id = "PostDeleter_AboutPostDeleter"
    ClassHelper(About_PostDeleter, "add", "Popups_Hidden")
    ClassHelper(About_PostDeleter, "add", "Popup_Basic")
    Background_Fullscreen_PostDeleter.id = "PostDeleter_BackgroundFullScreenPostDeleter"
    ClassHelper(Background_Fullscreen_PostDeleter, "add", "Hidden")
    ClassHelper(Background_Fullscreen_PostDeleter, "add", "Background_FullScreen")
    document.body.append(Background_Fullscreen_PostDeleter, About_PostDeleter)
    let About_Posdeleter_body = document.createElement("div")
    let Get_about = new XMLHttpRequest //Справка получается через XMLHttpRequest из файла about.html в папке Resources
    Get_about.open("GET", About_path, true)
    Get_about.onload = function () {
        About_Posdeleter_body.innerHTML = Get_about.response
    }
    Get_about.send()
    About_Posdeleter_body.id = "PostDeleter_AboutBody"
    ClassHelper(About_Posdeleter_body, "add", "About_Body")
    let About_Postdeleter_header = document.createElement("div")
    About_Postdeleter_header.id = "PostDeleter_AboutHeader"
    ClassHelper(About_Postdeleter_header, "add", "Popup_Header")
    About_Postdeleter_header.innerHTML = "<h1>PostDeleter v" + Manifest.version + "</h1>"
    ClassHelper(About_Postdeleter_header.firstChild, "add", "Popup_Title")
    About_PostDeleter.append(About_Postdeleter_header, About_Posdeleter_body)
    let Close_about_button = document.createElement("button")
    ClassHelper(Close_about_button, "add", "Close_Popup")
    Close_about_button.onclick = function () {
        ClassHelper(Background_Fullscreen_PostDeleter, "add", "Hidden")
        ClassHelper(About_PostDeleter, "toggle", "Popups")
    }
    About_Postdeleter_header.append(Close_about_button)
    let Close_about_image = document.createElement("div")
    ClassHelper(Close_about_image, "add", "Close_Popup_Image")
    Close_about_button.append(Close_about_image)

    let Settings_PostDeleter_window = document.createElement("div")    //Создание окна настроек
    Settings_PostDeleter_window.id = "PostDeleter_SettingsPostDeleter"
    ClassHelper(Settings_PostDeleter_window, "add", "Popups_Hidden")
    ClassHelper(Settings_PostDeleter_window, "add", "Popup_Basic")
    let Settings_header = document.createElement("div")
    Settings_header.id = "PostDeleter_SettingsHeader"
    ClassHelper(Settings_header, "add", "Popup_Header")
    Settings_header.innerHTML = "<h1>Настройки</h1>"
    ClassHelper(Settings_header.firstChild, "add", "Popup_Title")
    Settings_PostDeleter_window.append(Settings_header)
    let Close_settings_button = document.createElement("button")
    ClassHelper(Close_settings_button, "add", "Close_Popup")
    Close_settings_button.onclick = function () {
        ClassHelper(Background_Fullscreen_PostDeleter, "add", "Hidden")
        ClassHelper(Settings_PostDeleter_window, "toggle", "Popups")
        document.getElementById("PostDeleter_SettingsMessage").innerText = ""
    }
    Settings_header.append(Close_settings_button)
    let Close_settings_image = document.createElement("div")
    ClassHelper(Close_settings_image, "add", "Close_Popup_Image")
    Close_settings_button.append(Close_settings_image)
    let Settings_body = document.createElement("div")
    Settings_body.id = "PostDeleter_SettingsBody"
    Settings_PostDeleter_window.append(Settings_body)
    let Get_settings = new XMLHttpRequest //Настройки получаются через XMLHttpRequest из файла settings.html в папке Resources
    Get_settings.open("GET", Settings_path, true)
    Get_settings.onload = function () {
        Settings_body.innerHTML = Get_settings.response
        //Настройка настроек
        document.getElementById("PostDeleter_MinimumNumberOfPosts").value = Settings.Minimum_number_of_posts
        let Select_theme = document.createElement("select")
        Select_theme.id = "PostDeleter_SelectTheme"
        for (key in DataBase.settings.theme) {
            let option = new Option(DataBase.settings.theme[key].Title, key)
            if (Settings.theme == key) {
                option.selected = true
            }
            Select_theme.options[Select_theme.options.length] = option
        }
        let Select_theme_div = document.createElement("div")
        Select_theme.onchange = Create_Theme_Settings
        ClassHelper(Select_theme_div, "add", "Settings_Item")
        Select_theme_div.append(Select_theme)
        document.getElementById("PostDeleter_ThemeSelect").append(Select_theme_div)

        function Create_Theme_Settings() {
            document.getElementById("PostDeleter_ThemeSettings").innerHTML = ""
            for (key in DataBase.settings.theme[Select_theme.value].checkboxes) {
                let CheckBox_div = document.createElement("div")
                ClassHelper(CheckBox_div, "add", "SwitchClass", Select_theme.value)
                let CheckBox = document.createElement("input")
                CheckBox.type = "checkbox"
                ClassHelper(CheckBox, "add", "CheckboxClass", Select_theme.value)
                CheckBox.id = "PostDeleter_" + Select_theme.value + key
                if (Settings[Select_theme.value + "Settings"] != undefined) {
                    CheckBox.checked = Settings[Select_theme.value + "Settings"][key]
                }
                CheckBox_div.append(CheckBox)
                let CheckBox_title = document.createElement("div")
                CheckBox_title.innerText = DataBase.settings.theme[Select_theme.value].checkboxes[key]
                ClassHelper(CheckBox_title, "add", "Settings_Item_Description")
                let Settings_checkbox_item = document.createElement("div")
                ClassHelper(Settings_checkbox_item, "add", "Settings_Item")
                Settings_checkbox_item.append(CheckBox_div)
                document.getElementById("PostDeleter_ThemeSettings").append(CheckBox_title, Settings_checkbox_item)
                Append_Strip(document.getElementById("PostDeleter_ThemeSettings"))
            }
            for (key in DataBase.settings.theme[Select_theme.value].select) {
                let Select_title = document.createElement("div")
                Select_title.innerText = DataBase.settings.theme[Select_theme.value].select[key].Title
                ClassHelper(Select_title, "add", "Settings_Item_Description")
                let NewSelect = document.createElement("select")
                NewSelect.id = "PostDeleter_" + Select_theme.value + key
                for (option in DataBase.settings.theme[Select_theme.value].select[key].options) {
                    let newOption = new Option(DataBase.settings.theme[Select_theme.value].select[key].options[option], option)
                    if (Settings[Select_theme.value + "Settings"][key] != undefined) {
                        if (option == Settings[Select_theme.value + "Settings"][key]) {
                            newOption.selected = true
                        }
                    }
                    NewSelect.options[NewSelect.options.length] = newOption
                }
                let Settings_select_item = document.createElement("div")
                ClassHelper(Settings_select_item, "add", "Settings_Item")
                Settings_select_item.append(NewSelect)
                document.getElementById("PostDeleter_ThemeSettings").append(Select_title, Settings_select_item)
            }
        }
        Create_Theme_Settings()
    }
    Get_settings.send()
    let Settings_footer = document.createElement("div")
    ClassHelper(Settings_footer, "add", "Settings_Footer")
    let Save_settings = document.createElement("button")
    let Settings_message = document.createElement("div")
    Settings_message.id = "PostDeleter_SettingsMessage"
    ClassHelper(Save_settings, "add", "Save_Button")
    Save_settings.innerText = "Сохранить"
    Save_settings.onclick = function () {
        Settings.Minimum_number_of_posts = parseInt(document.getElementById("PostDeleter_MinimumNumberOfPosts").value)
        Check_number_of_visible_posts()
        let prevclass = ClassHelper(0, "return", "Deleted_Post")
        Settings.theme = document.getElementById("PostDeleter_SelectTheme").value
        if (Settings[Settings.theme + "Settings"] == undefined) {
            Settings[Settings.theme + "Settings"] = {}
        }
        for (key in DataBase.settings.theme[Settings.theme].checkboxes) {
            Settings[Settings.theme + "Settings"][key] = document.getElementById("PostDeleter_" + Settings.theme + key).checked
        }
        for (key in DataBase.settings.theme[Settings.theme].select) {
            Settings[Settings.theme + "Settings"][key] = document.getElementById("PostDeleter_" + Settings.theme + key).value
        }
        localStorage.setItem("PostDeleterSettings", JSON.stringify(Settings))
        Create_main_menu(true)
        Create_deleter()
        Delete_posts(prevclass)
        Create_menu_with_deleted_posts()
    }
    Settings_footer.append(Save_settings)
    Settings_footer.append(Settings_message)
    Settings_PostDeleter_window.append(Settings_footer)
    document.body.append(Settings_PostDeleter_window)
    if (recreate) {
        ClassHelper(Settings_PostDeleter_window, "toggle", "Popups")
        ClassHelper(Background_Fullscreen_PostDeleter, "remove", "Hidden")
        Settings_message.innerText = "Успешно сохранено"
    }


    let Main_menu_div = document.createElement("div")   //Создание контейнера для кнопки, открывающей меню, и самого меню
    Main_menu_div.id = "MainMenuDiv"
    document.getElementById("PostDeleter_DivForMenus").insertBefore(Main_menu_div, document.getElementById("PostDeleter_DivForMenus").firstChild)
    let Main_menu = document.createElement("div")   //Само меню

    let Main_menu_button = document.createElement("button") //Создание кнопки для открытия основного меню
    Main_menu_button.id = "PostDeleter_MainMenuButton"
    ClassHelper(Main_menu_button, "add", "Open_Menu_Buttons")
    Main_menu_button.innerText = "Меню"
    ClassHelper(Main_menu, "add", "Menus")
    ClassHelper(Main_menu_button, "add", "Menu_Buttons")
    Main_menu_button.onclick = function () { //Функция для открытия меню
        ClassHelper(Main_menu, "toggle", "Open_Menu")
        ClassHelper(Main_menu_button, "toggle", "Button_When_Menu_Open")
    }
    Main_menu_div.append(Main_menu_button)

    Main_menu.id = "PostDeleter_MainMenu"
    ClassHelper(Main_menu, "add", "Main_Menu")
    Main_menu_div.append(Main_menu)

    let Settings_PostDeleter = document.createElement("div") //Пункт меню, открывающий настройки
    ClassHelper(Settings_PostDeleter, "add", "Main_Menu_Item")
    Settings_PostDeleter.innerText = "Настройки"
    Settings_PostDeleter.onclick = function () {
        ClassHelper(document.getElementById("PostDeleter_SettingsPostDeleter"), "toggle", "Popups")
        ClassHelper(document.getElementById("PostDeleter_BackgroundFullScreenPostDeleter"), "remove", "Hidden")
    }
    Main_menu.append(Settings_PostDeleter)
    Append_Strip(Main_menu)

    let Remove_old_posts = document.createElement("div") //Пункт меню, удаляющий старые данные
    ClassHelper(Remove_old_posts, "add", "Main_Menu_Item")
    Remove_old_posts.innerText = "Удаление старых данных"
    Remove_old_posts.onclick = function () { //Если портал не пытался загрузить пост более 10 раз, то данные, о том что пост был удален стираются
        if (confirm("Вы хотите удалить данные о постах, которые портал не пытался загрузить 10 раз?")) {
            let Counter = 0
            for (let i = Nums_of_non_loaded_post.length - 1; i >= 0; i--) {
                if (Nums_of_non_loaded_post[i] >= 10) {
                    Counter++
                    Nums_of_non_loaded_post.splice(i, 1)
                    Nums_of_non_loaded_post_original.splice(i, 1)
                    Deleted_posts_array.splice(i, 1)
                }
            }
            localStorage.setItem("Deleted_posts_array", Deleted_posts_array) //Обновляем список удаленных постов в локальном хранилище
            localStorage.setItem("Nums_of_non_loaded_post", Nums_of_non_loaded_post)    //Обновляем массив с количеством не-загрузок поста
            let pr
            if (((toString(Counter)[0] == '1' & toString(Counter)[1] == '1') | Counter == 1)) { //Вычисление правильного построения предложения(предлог о/об и окончание простЕ/постАХ)
                pr = 'об'
            } else {
                pr = 'о'
            }
            if (Counter == 0) {
                alert("Таких постов нет")
            } else if (Counter % 10 == 1 & Counter % 100 != 11) {
                alert("Вы успешно удалили данные " + pr + " " + Counter + " посте")
            } else {
                alert("Вы успешно удалили данные " + pr + " " + Counter + " постах")
            }
        }
    }
    Main_menu.append(Remove_old_posts)
    Append_Strip(Main_menu)

    let Clear_cache_div = document.createElement("div") //Очистка данных (если надо удалить аддон, то надо очистить данные в локальном хранилище)
    ClassHelper(Clear_cache_div, "add", "Main_Menu_Item")
    Clear_cache_div.innerText = "Очистка данных"
    Clear_cache_div.id = "ClearCacheDiv"
    Clear_cache_div.onclick = function () { //Открытие меню с подтверждением действия
        if (confirm("Вы действительно хотите очистить данные PostDeleter?")) {
            localStorage.removeItem("Deleted_posts_array")
            localStorage.removeItem("Nums_of_non_loaded_post")
            localStorage.removeItem("PostDeleterSettings")
            Nums_of_non_loaded_post = []
            Nums_of_non_loaded_post_original = []
            Deleted_posts_array = []
            Create_menu_with_deleted_posts()
            alert("Данные успешно очищены")
        }
    }
    Main_menu.append(Clear_cache_div)

    let About_Div_Menu_item = document.createElement("div")   //Создание кнопки открытия справки
    ClassHelper(About_Div_Menu_item, "add", "Main_Menu_Item")
    About_Div_Menu_item.innerText = "Справка"
    About_Div_Menu_item.id = "AboutPostDeleterMenuItem"
    About_Div_Menu_item.onclick = function () {
        ClassHelper(document.getElementById("PostDeleter_BackgroundFullScreenPostDeleter"), "remove", "Hidden")
        ClassHelper(document.getElementById("PostDeleter_AboutPostDeleter"), "toggle", "Popups")
    }
    Append_Strip(Main_menu)
    Main_menu.append(About_Div_Menu_item)

    let Indent_div_2 = document.createElement("div")
    Indent_div_2.id = "PostDeleter_IndentDiv2"
    Main_menu.append(Indent_div_2)
}

function Append_Strip(elem) {    //Функция для добавления разделителя
    let Strip = document.createElement("hr")    //Создание тега hr для разделения элементов меню
    ClassHelper(Strip, "add", "Strips")
    elem.append(Strip)
}

//Создание выпадающего меню с удаленными постами
function Create_menu_with_deleted_posts() {
    try {   //Пытаемся удалить кнопку открывающую меню и само меню, т.к. иногда нужно пересоздавать меню
        document.getElementById("MenuDeletedPostsDiv").remove()
        document.getElementById("PostDeleter_DropMenuDeletedPosts").remove()
    } catch (error) {
    }

    let Menu_deleted_posts_div = document.createElement("div")
    Menu_deleted_posts_div.id = "MenuDeletedPostsDiv"
    document.getElementById("PostDeleter_DivForMenus").append(Menu_deleted_posts_div)
    let Deleted_posts_menu = document.createElement("div")    //Страница с меню
    let Menu_button_deleted_posts = document.createElement("button")    //Кнопка открывающая меню
    Menu_button_deleted_posts.innerText = "Удалённые посты"
    Menu_button_deleted_posts.id = "PostDeleter_DeletedPostsMenu"
    ClassHelper(Menu_button_deleted_posts, "add", "Open_Menu_Buttons")
    ClassHelper(Deleted_posts_menu, "add", "Menus")
    ClassHelper(Menu_button_deleted_posts, "add", "Menu_Buttons")
    Menu_button_deleted_posts.onclick = function () { //Функция открывающая и закрывающая меню
        ClassHelper(Deleted_posts_menu, "toggle", "Open_Menu")
        ClassHelper(Menu_button_deleted_posts, "toggle", "Button_When_Menu_Open")
    }
    Menu_deleted_posts_div.append(Menu_button_deleted_posts)

    Deleted_posts_menu.id = "PostDeleter_DropMenuDeletedPosts"
    ClassHelper(Deleted_posts_menu, "add", "Menu_With_Deleted_Posts")
    Menu_deleted_posts_div.append(Deleted_posts_menu)
    let Deleted_posts_table_div = document.createElement("div")
    Deleted_posts_table_div.id = "PostDeleter_DeletedPostsTableDiv"
    ClassHelper(Deleted_posts_table_div, "add", "Div_For_Table_With_Deleted_Posts")
    Deleted_posts_menu.append(Deleted_posts_table_div)
    let Deleted_posts_table = document.createElement("table")
    Deleted_posts_table.id = "DeletedPostsTable"
    Deleted_posts_table_div.append(Deleted_posts_table)

    for (let i = Deleted_posts_array.length - 1; i >= 0; i--) {     //Строки меню
        let Deleted_posts_row = document.createElement("tr")    //Строка
        Deleted_posts_row.id = "DeletedPostRow" + i
        Deleted_posts_table.append(Deleted_posts_row)
        let Deleted_post_name = document.createElement("th")    // id поста
        Deleted_post_name.id = "PostDeleter_DeletedPostName" + i
        ClassHelper(Deleted_post_name, "add", "Deleted_Post_Name")
        Deleted_post_name.innerText = Deleted_posts_array[i]
        let Deleted_post_button = document.createElement("th")  //Место для кнопки
        Deleted_post_button.id = "DeletedPostButton" + i
        Deleted_posts_row.append(Deleted_post_name)
        Deleted_posts_row.append(Deleted_post_button)
        Deleted_post_button = document.createElement("button")  //Сама кнопка
        ClassHelper(Deleted_post_button, "add", "Return_Buttons")
        Deleted_post_button.innerText = "Вернуть"
        Deleted_post_button.onclick = function () { //Функция нажатия на кнопку "Вернуть"
            try {
                ClassHelper(document.getElementById(Deleted_posts_array[i]).parentNode, "remove", "Deleted_Post")
            } catch (error) {
            }
            Deleted_posts_array.splice(i, 1)    //Удаляем его из списка удаленных постов
            localStorage.setItem("Deleted_posts_array", Deleted_posts_array) //Обновляем массив с id удаленных постов в локальном хранилище
            Nums_of_non_loaded_post.splice(i, 1)
            Nums_of_non_loaded_post_original.splice(i, 1)
            localStorage.setItem("Nums_of_non_loaded_post", Nums_of_non_loaded_post)    //Обновляем массив с количеством не-загрузок поста
            this.parentNode.parentNode.remove() //Удаляем строку из меню
        }
        document.getElementById("DeletedPostButton" + i).append(Deleted_post_button)
    }
}

//Функция для подсчета количества отображаемых постов
function Check_number_of_visible_posts(ondelete = false) {
    let Number_of_visible_posts = Posts_array.length
    for (Post of Posts_array) {
        if (Post.offsetWidth == 0 || Post.offsetHeight == 0) {   //Считаем количество отображаемых постов
            Number_of_visible_posts--
        }
    }
    if (Settings.Animation_enabled & ondelete) {
        Number_of_visible_posts--
    }
    if (Number_of_visible_posts < Settings.Minimum_number_of_posts) {   //Если отображаемых постов меньше 5, то зарпускаем триггер для загрузки дополнительных постов
        Add_more_posts()
    }
}

//Функция для загрузки новых постов
function Add_more_posts() {
    if (document.getElementById("LIVEFEED_search").value == "") { //Если в поиске ничего не набрано
        PostDeleter_Add_More_Posts_Button.firstChild.click()    //Вызов функции Bitrix для добавления новых сообщений 
    }
}

function Create_observers() {
    if (Authorized()) {
        const Observer_containers = new MutationObserver(Сontainer_has_been_added)  //Наблюдатель за контейнерами, необходим для того чтобы крестики появлялись на постах, появившихся в результате подгрузки старых постов
        Observer_containers.observe(document.getElementById("log_internal_container"), config = {
            childList: true
        })
    }
}
Create_observers()

function Create_observers_2() {
    if (Authorized()) {
        try {
            const Observer_posts = new MutationObserver(Create_deleter) //Наблюдатель за постами, необходим для того чтобы крестики появлялись на постах, появившихся в результаате нажатия на кнопку загруки новых сообщений 
            Observer_posts.observe(FeedWrap, config = {
                childList: true
            })
        } catch (error) {

        }
    }
}
Create_observers_2()

function Сontainer_has_been_added() {    //Мультифункция на случай загрузки нового контейнера
    setTimeout(() => {
        Delete_posts()
        Create_deleter()
        Create_observers_2()
    }, 10);
}

function Authorized() { //Функция проверки, находимся ли мы на портали или странице авторизации
    if (Posts_array.length != 0) {
        return true
    } else {
        return false
    }
}

function ClassHelper(elem, action, ClassPath, forcetheme = undefined) {
    let ClassName = ""
    let theme = ""
    let DefaultSettings = true
    if (forcetheme == undefined) {
        theme = Settings.theme
    } else {
        theme = forcetheme
    }
    let SettingsTheme = {}
    if (DataBase.settings.theme[theme] == undefined) {
        theme = "classic"
    }
    if (DataBase.settings.theme[theme][ClassPath] == undefined) {
        theme = "classic"
        DefaultSettings = false
    }
    if (Settings[theme + "Settings"] != undefined) {
        SettingsTheme = JSON.parse(JSON.stringify(Settings[theme + "Settings"]))
    }
    let db = DataBase.settings.theme[theme]
    switch (typeof (db[ClassPath])) {
        case 'string':
            ClassName = db[ClassPath]
            break
        case 'object':
            if (db.checkboxes[db[ClassPath].change] != undefined) {
                if (SettingsTheme[db[ClassPath].change] & DefaultSettings) {
                    ClassName = db[ClassPath].true
                } else {
                    ClassName = db[ClassPath].false
                }
            } else {
                if (SettingsTheme[db[ClassPath].change] == undefined | !DefaultSettings) {
                    if (Object.keys(db[ClassPath][0] == "change")) {
                        ClassName = Object.values(db[ClassPath])[1]
                    } else {
                        ClassName = Object.values(db[ClassPath])[0]
                    }
                } else {
                    ClassName = db[ClassPath][SettingsTheme[db[ClassPath].change]]
                }
            }
            break
    }
    switch (action) {
        case "add":
            elem.classList.add(ClassName)
            break
        case "remove":
            elem.classList.remove(ClassName)
            break
        case "toggle":
            elem.classList.toggle(ClassName)
            break
        case "return":
            return ClassName
    }
}