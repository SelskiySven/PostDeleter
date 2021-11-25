//feed-new-message-inf-text feed-new-message-inf-text-reload new-message-balloon
//feed-new-message-inf-text feed-new-message-inf-text-counter new-message-balloon
//<div id="test123" style="width: 100vw;height: 100vh;position: fixed;background: black;z-index: 1000;opacity: 0.5;top: 0;"></div>
//document.getElementsByClassName("bx24-connection-status-text-reload-title")[0].click()

//>>>Переменные<<<//
let Number_of_deleted_posts = 0     //Счетчик удаленных постов
let Deleted_posts_array = []    //Массив с id удаленных постов

let FeedWrap = document.querySelectorAll(".feed-wrap")[1]   //Это основная стена, все посты являются детьми этого элемента
let PagetitleWrap = document.querySelectorAll(".pagetitle-wrap")[0]     //Это элемент над стеной с постами в нем содержится надмись "Новости", а данный аддон создает в нем меню с удаленными постами
let Posts_array = document.getElementsByClassName("feed-item-wrap")     //Cписок всех постов
let More_posts_button = document.getElementById("feed-new-message-inf-wrap-first")  //Кнопка "Ещё события"

//>>>Константы<<<//
const Resources = chrome.runtime.getURL("Resources")

const Deleter_button_path = Resources + "/delete.svg"

let starts = setInterval(Load_new_posts_button, 100)

//Функция для загрузки кнопки "Ещё события", для того чтобы нажать на нее в случае необходимости
function Load_new_posts_button() {
    if (More_posts_button != null) {   //Выполняем только если есть кнопка "Ещё события"
        if (More_posts_button.style.display == "none") {   //Значит кнопка уже нажата
            clearInterval(starts)
        } else {
            if (More_posts_button.className == "feed-new-message-inf-wrap-first") {    //Иначе спускаемся в самый низ для активации скрипта сайта для загрузки этой кнопки
                window.scroll(0, document.body.scrollHeight)
            }
            if (More_posts_button.className == "feed-new-message-inf-wrap-first feed-new-message-inf-wrap-first-visible") {    //Кнопка подгрузилась значит возвращаемся в начало страницы и завершаем данную функцию
                window.scroll(0, 0)
                try {
                    clearInterval(starts)
                } catch (error) {
                }
            }
        }
    } else {    //Если кнопки "Ещё события" нет, то и делать ничего не надо(дело в том, что в адресной строке может быть https://portal.unn.ru/stream/ , но мы по факту будем находится на странице авторизации)
        try {
            clearInterval(starts)
        } catch (error) {
        }
    }
}

//Загрузка счетчика из локального хранилища
if (localStorage.getItem("DeletedPosts") == null) {    //Если в локальном хранилище нет переменной, содержащей количество удаленных постов, значит аддон запущен впервые
    Number_of_deleted_posts = 0
} else {    //Иначе просто возьмем её значение
    Number_of_deleted_posts = parseInt(localStorage.getItem("DeletedPosts"))
}

//Удаление постов
function Delete_posts() {
    for (let i = 0; i < Number_of_deleted_posts; i++) {
        Deleted_posts_array[i] = localStorage.getItem("delpost" + i)    //Помещаем id удаленных постов из локального хранилища в массив
        Check_number_of_visible_posts()
        try {   // Пытаемся удалить данный пост(может быть ситуация что пост старый и он еще не загружен на страницу)
            document.getElementById(Deleted_posts_array[i]).parentNode.hidden = true
        } catch (error) {
        }
    }
}
Delete_posts()

//Создание крестиков
function Create_deleter() {
    let Post_deleter = document.querySelectorAll(".PostDeleterDiv")    //Массив контейнеров с крестиками
    for (let i = 0; i < Post_deleter.length; i++) {    //Удаляем все крестики
        Post_deleter[i].remove()
    }
    for (Posts_array_item of Posts_array) {      // Перебираем все посты
        let Deleter_div = document.createElement("div")  //Создаем контейнер для крестика
        Deleter_div.className = "PostDeleterDiv"
        let Deleter = document.createElement("button") //Создаем кнопку
        Deleter.className = "PostDeleter"
        Deleter.onclick = function () {     //Функция нажатия на крестик
            if (Number_of_deleted_posts == 0) { //Если в локальном хранилище отсутствует счетчик удаленных постов, то надо его создать
                localStorage.setItem("DeletedPosts", 0)
            }
            localStorage.setItem("delpost" + Number_of_deleted_posts, Deleter.parentNode.parentNode.children[1].id)    //Добавляем в локальное хранилище id поста
            Number_of_deleted_posts = Number_of_deleted_posts + 1     //Прибаляем к счетчику 1
            localStorage.removeItem("DeletedPosts")     //Перезаписываем счетчик в локальное хранилище 
            localStorage.setItem("DeletedPosts", Number_of_deleted_posts)
            Deleter.parentNode.parentNode.hidden = true    //Удаляем пост
            Deleted_posts_array.push(this.parentNode.nextSibling.id)    //Добавляем в массив с удаленными постами id удаленого поста
            Create_menu_with_deleted_posts()  //Пересоздаем меню со списком удаленных постов
            Check_number_of_visible_posts() //Проверяем количество видимых постов, чтобы не получилась пустая страница
        }
        let Deleter_image = document.createElement("img")   //Крестик для удаления поста
        Deleter_image.src = Deleter_button_path
        Deleter_image.className = "DeleterImage"
        Posts_array_item.insertBefore(Deleter_div, Posts_array_item.firstChild)
        Deleter_div.append(Deleter)
        Deleter.append(Deleter_image)
    }
}
Create_deleter()

//Функция создания контейнера для меню
function Create_div_for_menus() {
    if (PagetitleWrap != undefined) {
        let Div_for_menus = document.createElement("div")
        Div_for_menus.id = "DivForMenus"
        PagetitleWrap.append(Div_for_menus)
        Create_main_menu()
    }
}
Create_div_for_menus()

function Append_Strip(elem){    //Функция для добавления разделителя
    let Strip = document.createElement("hr")    //Создание тега hr для разделения элементов меню
    Strip.className = "Strips"
    elem.append(Strip)
}


//Функция для создания главного меню
function Create_main_menu() {

    let Main_menu_div = document.createElement("div")   //Создание контейнера для кнопки, открывающей меню, и самого меню
    Main_menu_div.id = "MainMenuDiv"
    document.getElementById("DivForMenus").append(Main_menu_div)

    let Main_menu_button = document.createElement("button") //Создание кнопки для открытия основного меню
    Main_menu_button.id = "MainMenuButton"
    Main_menu_button.innerHTML = "Меню"
    Main_menu_button.onclick = function () { //Функция для открытия меню
        Main_menu_button.classList.toggle("WhenMenuOpen")
        if (document.getElementById("MainMenu").hidden == true) {
            document.getElementById("MainMenu").hidden = false
        } else {
            document.getElementById("MainMenu").hidden = true
            document.getElementById("ClearCacheMenu").hidden = true
        }
    }
    Main_menu_div.append(Main_menu_button)

    let Main_menu = document.createElement("div")   //Само меню
    Main_menu.id = "MainMenu"
    Main_menu.className = "PostDeleterMenu"
    Main_menu.hidden = true
    Main_menu_div.append(Main_menu)

    let Clear_cache_div = document.createElement("div") //Очистка данных (если надо удалить аддон, то надо очистить данные в локальном хранилище)
    Clear_cache_div.className = "MainMenuItem"
    Clear_cache_div.innerHTML = "Очистить данные"
    Clear_cache_div.id = "ClearCacheDiv"
    Clear_cache_div.onclick = function () { //Открытие меню с подтверждением действия
        if (document.getElementById("ClearCacheMenu").hidden == true) {
            document.getElementById("ClearCacheMenu").hidden = false
        } else {
            document.getElementById("ClearCacheMenu").hidden = true
        }
    }
    Main_menu.append(Clear_cache_div)

    let Clear_cache_menu = document.createElement("div") //Меню с подтверждением очищения данных
    Clear_cache_menu.id = "ClearCacheMenu"
    Clear_cache_menu.hidden = true
    let Clear_cache_sure = document.createElement("div")    //Контейнер с текстом
    Clear_cache_sure.id = "ClearCacheSure"
    Clear_cache_sure.innerHTML = "Очистить данные?"
    let Clear_cache_YES = document.createElement("button")  //Кнопка подтверждения удаления
    Clear_cache_YES.id = "ClearCacheYES"
    Clear_cache_YES.innerHTML = "ДА"
    Clear_cache_YES.onclick = function () { //Функция очистки данных
        for (let i = 0; i < Number_of_deleted_posts; i++) { //Удаляем id удаленных постов
            localStorage.removeItem("delpost" + i)
        }
        localStorage.removeItem("DeletedPosts") //Удаляем счетчик удаленных постов
        location.reload()   //Перезагружаем страницу
    }
    let Clear_cache_NO = document.createElement("button")   //Кнопка отмены удаления
    Clear_cache_NO.id = "ClearCacheNO"
    Clear_cache_NO.innerHTML = "НЕТ"
    Clear_cache_NO.onclick = function () {  //Закрываем меню с подтверждением удаления
        document.getElementById("ClearCacheMenu").hidden = true
    }
    Append_Strip(Clear_cache_menu)
    Clear_cache_menu.append(Clear_cache_sure, Clear_cache_YES, Clear_cache_NO)
    Main_menu.append(Clear_cache_menu)

    let About_PostDeleter=document.createElement("div") //Создание справки
    let Background_About_PostDeleter = document.createElement("div")
    About_PostDeleter.id = "AboutPostDeleter"
    Background_About_PostDeleter.id = "BackgroundFullScreen_PostDeleter"
    Background_About_PostDeleter.hidden = true
    About_PostDeleter.hidden = true
    document.body.append(Background_About_PostDeleter,About_PostDeleter)

    let About_Div = document.createElement("div")   //Создание кнопки открытия справки
    About_Div.className="MainMenuItem"
    About_Div.innerHTML="Справка"
    About_Div.id="AboutPostDeleterMenuItem"
    About_Div.onclick = function(){
        Background_About_PostDeleter.hidden = false
        About_PostDeleter.hidden = false
    }
    Append_Strip(Main_menu)
    Main_menu.append(About_Div)

    let Indent_div_2 = document.createElement("div")
    Indent_div_2.id = "IndentDiv2"
    Main_menu.append(Indent_div_2)
}

//Создание выпадающего меню с удаленными постами
function Create_menu_with_deleted_posts() {
    try {   //Пытаемся удалить кнопку открывающую меню и само меню, т.к. иногда нужно пересоздавать меню
        document.getElementById("DropMenuDeletedPosts").remove()
        document.getElementById("DeletedPostsMenu").remove()
        document.getElementById("IndentDiv").remove()
    } catch (error) {
    }

    let Menu_deleted_posts_div = document.createElement("div")
    Menu_deleted_posts_div.id = "MenuDeletedPostsDiv"
    document.getElementById("DivForMenus").append(Menu_deleted_posts_div)

    let Menu_button_deleted_posts = document.createElement("button")    //Кнопка открывающая меню
    Menu_button_deleted_posts.innerHTML = "Удаленные посты"
    Menu_button_deleted_posts.id = "DeletedPostsMenu"
    Menu_button_deleted_posts.onclick = function () { //Функция открывающая и закрывающая меню
        Menu_button_deleted_posts.classList.toggle("WhenMenuOpen")
        if (document.getElementById("DropMenuDeletedPosts").hidden == true) {
            document.getElementById("DropMenuDeletedPosts").hidden = false
        } else {
            document.getElementById("DropMenuDeletedPosts").hidden = true
        }
    }
    Menu_deleted_posts_div.append(Menu_button_deleted_posts)

    let Deleted_posts_menu = document.createElement("div")    //Страница с меню
    Deleted_posts_menu.id = "DropMenuDeletedPosts"
    Deleted_posts_menu.hidden = true
    Deleted_posts_menu.className = "PostDeleterMenu"
    Menu_deleted_posts_div.append(Deleted_posts_menu)
    let Deleted_posts_table_div = document.createElement("div")
    Deleted_posts_table_div.id = "DeletedPostsTableDiv"
    Deleted_posts_menu.append(Deleted_posts_table_div)
    let Deleted_posts_table = document.createElement("table")
    Deleted_posts_table.id = "DeletedPostsTable"
    Deleted_posts_table_div.append(Deleted_posts_table)

    for (let i = Deleted_posts_array.length - 1; i >= 0; i--) {     //Строки меню
        let Deleted_posts_row = document.createElement("tr")    //Строка
        Deleted_posts_row.id = "DeletedPostRow" + i
        Deleted_posts_table.append(Deleted_posts_row)
        let Deleted_post_name = document.createElement("th")    // id поста
        Deleted_post_name.id = "DeletedPostName" + i
        Deleted_post_name.className = "DeletedPostName"
        Deleted_post_name.innerHTML = Deleted_posts_array[i]
        let Deleted_post_button = document.createElement("th")  //Место для кнопки
        Deleted_post_button.id = "DeletedPostButton" + i
        Deleted_posts_row.append(Deleted_post_name)
        Deleted_posts_row.append(Deleted_post_button)
        Deleted_post_button = document.createElement("button")  //Сама кнопка
        Deleted_post_button.innerHTML = "Вернуть"
        Deleted_post_button.onclick = function () { //Функция нажатия на кнопку "Вернуть"
            try {
                document.getElementById(Deleted_posts_array[i]).parentNode.hidden = false  //Делаем пост снова видимым
            } catch (error) {
            }
            Deleted_posts_array.splice(i, 1)    //Удаляем его из списка удаленных постов
            for (let j = 0; j < Deleted_posts_array.length; j++) {  //Перебираем локальное хранилище удаляя оттуда данный пост, т.к. локальное хранилище поддерживает только данные типа String и мы просто перезаписываем все записи
                localStorage.removeItem("delpost" + j)
                localStorage.setItem("delpost" + j, Deleted_posts_array[j])
            }
            localStorage.removeItem("delpost" + Deleted_posts_array.length) //Обновляем в локальном хранилище счетчик удаленных постов
            this.parentNode.parentNode.remove()
            localStorage.removeItem("DeletedPosts")
            Number_of_deleted_posts = Number_of_deleted_posts - 1
            localStorage.setItem("DeletedPosts", Number_of_deleted_posts)
        }
        document.getElementById("DeletedPostButton" + i).append(Deleted_post_button)
    }

    let Indent_div = document.createElement("div")    //Создание контейнера для отступа кнопки "Удаленные посты" от контейнера с постами
    Indent_div.id = "IndentDiv"
    PagetitleWrap.append(Indent_div)

}
Create_menu_with_deleted_posts()

//Функция для подсчета количества отображаемых постов
function Check_number_of_visible_posts() {
    let Visible_posts_array = Array.from(Posts_array)
    for (let i = Visible_posts_array.length - 1; i >= 0; i--) {
        if (Visible_posts_array[i].offsetWidth == 0 || Visible_posts_array[i].offsetHeight == 0) {   //Считаем количество отображаемых постов
            Visible_posts_array.splice(i, 1)
        }
    }
    if (Visible_posts_array.length < 5) {   //Если отображаемых постов меньше 5, то зарпускаем триггер для загрузки дополнительных постов
        Add_more_posts()
    }
}

//Функция для загрузки новых постов
function Add_more_posts() {
    if (document.getElementById("sonet_log_more_container_first") != null) { //Если кнопка существует (в поиске ее не существует)
        if (document.getElementById("sonet_log_more_container_first").parentNode.style.display != "none") { //Если есть кнопка "Еще события", то нажимаем на неё
            document.getElementById("sonet_log_more_container_first").click()
        } else {    //Если нет, то запускаем триггер для загрузки новых постов(он запускается, когда пользователь опускается вниз страницы)
            let h = pageYOffset
            let w = pageXOffset
            window.scroll(0, 0)
            setTimeout(() => {
                window.scroll(w, document.body.scrollHeight) //Опускаемся в самый низ
                setTimeout(() => {  //Через 100 милисекунд возвращаемся на предыдущую позицию
                    window.scroll(w, h)
                }, 100);
            }, 100);
        }
    }
}

const Observer_posts = new MutationObserver(Post_has_been_added) //Наблюдатель за постами, необходим для того чтобы крестики появлялись на постах, появившихся в результаате нажатия на кнопку загруки новых сообщений 
Observer_posts.observe(FeedWrap, config = {
    childList: true
})

function Post_has_been_added() {     //Мультифункция на случай добавления нового поста
    setTimeout(() => {
        Create_deleter()
    }, 10);
}

const Observer_containers = new MutationObserver(Сontainer_has_been_added)  //Наблюдатель за контейнерами, необходим для того чтобы крестики появлялись на постах, появившихся в результате подгрузки старых постов
Observer_containers.observe(document.getElementById("log_internal_container"), config = {
    childList: true
})

function Сontainer_has_been_added() {    //Мультифункция на случай загрузки нового контейнера
    setTimeout(() => {
        Delete_posts()
        Create_deleter()
        starts = setInterval(Load_new_posts_button, 100) //На случай, если выходим из поиска
    }, 10);
}