let starts = setInterval(Load_new_posts_button, 100)

// function Customize_posts() {    //просто кастомизирует таблички для красоты
//     let Posts_array = document.querySelectorAll(".feed-item-wrap")
//     for (let i = 0; i < Posts_array.length; i++) {
//          
//     }
// }
// Customize_posts()

//Стартовая функция для загрузки кнопки "Ещё события", для того чтобы нажать на нее в случае необходимости
function Load_new_posts_button() {
    if (document.getElementById("feed-new-message-inf-wrap-first") != null) {   //Выполняем только если есть кнопка "Ещё события"
        if (document.getElementById("feed-new-message-inf-wrap-first").style.display == "none") {   //Значит кнопка уже нажата
            clearInterval(starts)
        } else {
            if (document.getElementById("feed-new-message-inf-wrap-first").className == "feed-new-message-inf-wrap-first") {    //Иначе спускаемся в самый низ для активации скрипта сайта для загрузки этой кнопки
                window.scroll(0, document.body.scrollHeight)
            }
            if (document.getElementById("feed-new-message-inf-wrap-first").className == "feed-new-message-inf-wrap-first feed-new-message-inf-wrap-first-visible") {    //Кнопка подгрузилась значит возвращаемся в начало страницы и завершаем данную функкцию
                window.scroll(0, 0)
                clearInterval(starts)
            }
        }
    } else {    //Если кнопки "Ещё события" нет, то и делать ничего не надо(дело в том, что в адресной строке может быть https://portal.unn.ru/stream/ , но мы по факту будем находится на странице авторизации)
        clearInterval(starts)
    }
}

//>>>Переменные<<<//
let Number_of_deleted_posts = 0 //Счетчик удаленных постов
let Number_of_deleted_post_is_checked = false //Проверка проверки количества отображенных постов, т.к. если убрать все загруженные со старта посты, то сайт не запустит скрипт для подкрузки новых постов
let Deleted_posts_array = [] //Массив с id удаленных постов
let FeedWrap = document.querySelectorAll(".feed-wrap")[1] //Это основная стена, все посты являются детьми этого элемента
let PagetitleWrap = document.querySelectorAll(".pagetitle-wrap")[0] //Это элемент над стеной с постами в нем содержится надмись "Новости", а данный аддон создает в нем меню с удаленными постами
let Posts_array  //Cписок всех постов


//Загрузка счетчика из локального хранилища
if (localStorage.getItem("DeletedPosts") == null) {    //Если в локальном хранилище нет переменной, содержащей количество удаленных постов, значит аддон запущен впервые и её требуется создать
    localStorage.setItem("DeletedPosts", 0)
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
            document.getElementById(Deleted_posts_array[i]).parentNode.style.display = "none"
        } catch (error) {
        }
    }
}
Delete_posts()

//Создание крестиков
function Create_deleter() {
    let Post_deleter = document.querySelectorAll(".PostDeleter")
    for (let i = 0; i < Post_deleter.length; i++) {    //Удаляем все крестики
        Post_deleter[i].remove()
    }
    Posts_array = document.querySelectorAll(".feed-item-wrap")  //Получаем список всех постов
    for (let i = 0; i < Posts_array.length; i++) {      // Перебираем все посты
        let Deleter_div = document.createElement("div")  //Создаем контейнер для крестика
        Deleter_div.style.display = "flex"
        Deleter_div.style.background = "white"
        Deleter_div.style.justifyContent = "flex-end"
        Deleter_div.id = "PostDeleter" + i
        Deleter_div.className = "PostDeleter"
        let Deleter = document.createElement("button") //Создаем сам крестик
        Deleter.className = "test"
        Deleter.innerHTML = "X"
        Deleter.style.border = "none"
        Deleter.style.color = "red"
        Deleter.style.float = "right"
        Deleter.style.fontSize = "25pt"
        Deleter.style.margin = "0 5px"
        Deleter.style.padding = "0 5px"
        Deleter.style.background = "white"
        Deleter.style.cursor = "pointer"
        Deleter.addEventListener('mouseenter', function () {
            Deleter.style.background = "pink"
        })
        Deleter.addEventListener('mouseleave', function () {
            Deleter.style.background = "white"
        })
        Deleter.onclick = function () {     //Функция нажатия на крестик
            localStorage.setItem("delpost" + Number_of_deleted_posts, Deleter.parentNode.parentNode.children[1].id)    //Добавляем в локальное хранилище id поста
            Number_of_deleted_posts = Number_of_deleted_posts + 1     //Прибаляем к счетчику 1
            localStorage.removeItem("DeletedPosts")     //Перезаписываем счетчик в локальное хранилище 
            localStorage.setItem("DeletedPosts", Number_of_deleted_posts)
            Deleter.parentNode.parentNode.style.display = "none"    //Удаляем пост
            Deleted_posts_array.push(this.parentNode.nextSibling.id)    //Добавляем в массив с удаленными постами id удаленого поста
            Create_dropdown_menu()  //Пересоздаем меню со списком удаленных постов
            Check_number_of_visible_posts() //Проверяем количество видимых постов, чтобы не получилась пустая страница
        }
        Posts_array[i].insertBefore(Deleter_div, Posts_array[i].firstChild)
        document.getElementById("PostDeleter" + i).append(Deleter)
    }
}
Create_deleter()

//Создание выпадающего меню с удаленными постами
function Create_dropdown_menu() {
    try {   //Пытаемся удалить кнопку открывающую меню и само меню, т.к. иногда нужно пересоздавать меню
        document.getElementById("DropMenu").remove()
        document.getElementById("DeletedPostsMenu").remove()
    } catch (error) {
    }
    let Menu_button = document.createElement("button")    //Кнопка открывающая меню
    Menu_button.style.background = "#3498DB"
    Menu_button.innerHTML = "Удаленные посты"
    Menu_button.style.border = "none"
    Menu_button.style.cursor = "pointer"
    Menu_button.style.fontSize = "14pt"
    Menu_button.style.margin = "1% 0"
    Menu_button.id = "DeletedPostsMenu"
    Menu_button.addEventListener('mouseenter', function () {
        Menu_button.style.background = "#2980B9"
    })
    Menu_button.addEventListener('mouseleave', function () {
        Menu_button.style.background = "#3498DB"
    })
    Menu_button.onclick = function () {
        if (document.getElementById("DropMenu").style.display == "none") {
            document.getElementById("DropMenu").style.display = "block"
        } else {
            if (document.getElementById("DropMenu").style.display == "block") {
                document.getElementById("DropMenu").style.display = "none"
            }
        }
    }
    PagetitleWrap.append(Menu_button)

    let Deleted_posts_menu = document.createElement("div")    //Страница с меню
    Deleted_posts_menu.id = "DropMenu"
    Deleted_posts_menu.style.display = "none"
    Deleted_posts_menu.style.position = "absolute"
    Deleted_posts_menu.style.background = "lightgray"
    Deleted_posts_menu.style.zIndex = "12"
    Deleted_posts_menu.style.boxShadow = "0px 8px 16px 0px rgba(0,0,0,0.2)"
    Deleted_posts_menu.style.maxHeight = window.innerHeight / 2 + "px"
    Deleted_posts_menu.style.maxWidth = Deleted_posts_menu.style.width + "px"
    Deleted_posts_menu.style.overflowY = "scroll"
    PagetitleWrap.append(Deleted_posts_menu)
    Deleted_posts_menu = document.getElementById("DropMenu")
    let Deleted_posts_table = document.createElement("table")
    Deleted_posts_table.id = "DeletedPostsTable"
    Deleted_posts_menu.append(Deleted_posts_table)
    Deleted_posts_table = document.getElementById("DeletedPostsTable")

    for (let i = Deleted_posts_array.length - 1; i >= 0; i--) {     //Строки меню
        let Deleted_posts_row = document.createElement("tr")    //Строка
        Deleted_posts_row.id = "DeletedPostRow" + i
        Deleted_posts_table.append(Deleted_posts_row)
        Deleted_posts_row = document.getElementById("DeletedPostRow" + i)
        let Deleted_post_name = document.createElement("th")    // id поста
        Deleted_post_name.id = "DeletedPostName" + i
        Deleted_post_name.style.margin = "0.5% 0"
        Deleted_post_name.innerHTML = Deleted_posts_array[i]
        let Deleted_post_button = document.createElement("th")  //Место для кнопки
        Deleted_post_button.id = "DeletedPostButton" + i
        Deleted_posts_row.append(Deleted_post_name)
        Deleted_posts_row.append(Deleted_post_button)
        Deleted_post_button = document.createElement("button")  //Сама кнопка
        Deleted_post_button.innerHTML = "Вернуть"
        Deleted_post_button.onclick = function () {
            document.getElementById(Deleted_posts_array[i]).parentNode.style.display = "block"  //Делаем пост снова видимым
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

}
Create_dropdown_menu()

//Функция для подсчета количества отображаемых постов
function Check_number_of_visible_posts() {
    let Visible_posts_array = document.querySelectorAll(".feed-item-wrap")
    Visible_posts_array = Array.prototype.slice.call(Visible_posts_array)
    for (let i = Visible_posts_array.length - 1; i >= 0; i--) {
        if (Visible_posts_array[i].offsetWidth == 0 || Visible_posts_array[i].offsetHeight == 0) {   //Считаем количество отображаемых постов
            Visible_posts_array.splice(i, 1)
        }
    }
    if (Visible_posts_array.length < 5) {   //Если отображаемых постов меньше 5, то зарпускаем триггер для загрузки дополнительных постов
        console.log(Visible_posts_array)
        Add_more_posts()
    }
}

//Функция для загрузки новых постов
function Add_more_posts() {
    if (document.getElementById("sonet_log_more_container_first").parentNode.style.display != "none") { //Если есть кнопка "Еще события", то нажимаем на неё
        document.getElementById("sonet_log_more_container_first").click()
    } else {    //Если нет, то запускаем триггер для загрузки новых постов(он запускается, когда пользователь опускается вниз страницы)
        let h = pageYOffset
        let w = pageXOffset
        window.scroll(w, document.body.scrollHeight) //Опускаемся в самый низ
        setTimeout(() => {  //Через 100 милисекунд возвращаемся на предыдущую позицию
            window.scroll(w, h)
        }, 100);
    }
}

const Observer_posts = new MutationObserver(Post_has_been_added) //Наблюдатель за постами, необходим для того чтобы крестики появлялись на постах, появившихся в результаате нажатия на кнопку загруки новых сообщений 
Observer_posts.observe(FeedWrap, config = {
    childList: true
})

function Post_has_been_added(){     //Мультифункция на случай добавления нового поста
    setTimeout(() => {
        Create_deleter()
    }, 10);
}

const Observer_containers = new MutationObserver(Сontainer_has_been_added)  //Наблюдатель за контейнерами, необходим для того чтобы крестики появлялись на постах, появившихся в результате подгрузки старых постов
Observer_containers.observe(document.getElementById("log_internal_container"), config = {
    childList: true
})

function Сontainer_has_been_added(){    //Мультифункция на случай загрузки нового контейнера
    setTimeout(() => {
        Delete_posts()
        Create_deleter() 
    }, 10);
}
