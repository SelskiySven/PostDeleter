window.scroll(0,document.body.scrollHeight)
setTimeout(() => {
    window.scroll(0,0)
}, 100);

let deletedposts = 0
let postisdel = []
let onsite = true
let deletedpostersarray = []
let FeedWrap = document.querySelectorAll(".feed-wrap")[1]
let PagetitleWrap = document.querySelectorAll(".pagetitle-wrap")[0]

//Загрузка данных из локального хранилища
if (localStorage.getItem("DeletedPosts") == null) {
    localStorage.setItem("DeletedPosts", 0)
    deletedposts = 0
} else {
    deletedposts = parseInt(localStorage.getItem("DeletedPosts"))
}

//Удаление постов
function deleteposts() {
    for (let i = 0; i < deletedposts; i++) {
        let id = localStorage.getItem("delpost" + i)
        deletedpostersarray[i] = id
        try {
            document.getElementById(id).parentNode.remove()
            postisdel[i] = true
        } catch {
            if (postisdel[i] != true)
                postisdel[i] = false
        }
    }
}
deleteposts()

//Создание крестиков
let postarray = document.querySelectorAll(".feed-item-wrap")
function createdeleter() {
    for (let i=0;i<postarray.length;i++){
        postarray[i].style.background = "white"
    }
    let kr = document.querySelectorAll(".PostDeleter")
        for (let i = 0; i < kr.length; i++) {
            kr[i].remove()
        }
    postarray = document.querySelectorAll(".feed-item-wrap")
    for (let i = 0; i < postarray.length; i++) {
        let deleterdiv = document.createElement("div")
        deleterdiv.style.display = "flex"
        deleterdiv.style.justifyContent = "flex-end"
        deleterdiv.id = "PostDeleter" + i
        deleterdiv.className = "PostDeleter"
        let deleter = document.createElement("button")
        deleter.className = "test"
        deleter.innerHTML = "X"
        deleter.style.border = "none"
        deleter.style.color = "red"
        deleter.style.float = "right"
        deleter.style.fontSize = "25pt"
        deleter.style.margin = "0 5px"
        deleter.style.padding = "0 5px"
        deleter.style.background = "white"
        deleter.style.cursor = "pointer"
        deleter.addEventListener('mouseenter', function () {
            deleter.style.background = "pink"
        })
        deleter.addEventListener('mouseleave', function () {
            deleter.style.background = "white"
        })
        deleter.onclick = function () {
            localStorage.setItem("delpost" + deletedposts, deleter.parentNode.parentNode.children[1].id)
            deletedposts = deletedposts + 1
            localStorage.removeItem("DeletedPosts")
            localStorage.setItem("DeletedPosts", deletedposts)
            deleter.parentNode.parentNode.remove()
            postisdel.push(true)
            deleteposts()
            dropdowncreate()
            checknumitems()
        }
        postarray[i].insertBefore(deleterdiv, postarray[i].firstChild)
        document.getElementById("PostDeleter" + i).append(deleter)
    }
}

//Создание выпадающего меню с удаленными постами
function dropdowncreate() {
    try{
        document.getElementById("dropmenu").remove()
        document.getElementById("delpstbut").remove()
    } catch{

    }
    let m = document.createElement("button")
    m.style.background = "#3498DB"
    m.innerHTML = "Удаленные посты"
    m.style.border = "none"
    m.style.cursor = "pointer"
    m.style.fontSize = "14pt"
    m.id = "delpstbut"
    m.addEventListener('mouseenter', function () {
        m.style.background = "#2980B9"
    })
    m.addEventListener('mouseleave', function () {
        m.style.background = "#3498DB"
    })
    m.onclick = function () {
        if (document.getElementById("dropmenu").style.display == "none") {
            document.getElementById("dropmenu").style.display = "block"
        } else {
            if (document.getElementById("dropmenu").style.display == "block") {
                document.getElementById("dropmenu").style.display = "none"
            }
        }
    }
    PagetitleWrap.append(m)

    let DropDown = document.createElement("div")
    DropDown.id = "dropmenu"
    DropDown.style.display = "none"
    DropDown.style.position = "absolute"
    DropDown.style.background = "lightgray"
    DropDown.style.zIndex = "12"
    DropDown.style.maxHeight = window.innerHeight / 2 + "px"
    DropDown.style.maxWidth = DropDown.style.width + "px"
    DropDown.style.overflowY = "scroll"
    PagetitleWrap.append(DropDown)
    let DropDownMenu = document.getElementById("dropmenu")
    DropDownTable = document.createElement("table")
    DropDownTable.id = "DeletedPostTable"
    DropDownMenu.append(DropDownTable)
    let alertt = document.createElement("p")
    alertt.innerHTML = "Обновления вступят в силу после перезагрузки страницы"
    alertt.style.color = "red"
    alertt.id = "PostDeleterAlert"
    alertt.style.display = "none"
    DropDownMenu.insertBefore(alertt, DropDownMenu.firstChild)
    let reloadbutton = document.createElement("button")
    reloadbutton.id = "DelPostBut"
    reloadbutton.style.display = "none"
    reloadbutton.innerHTML = "Перезагрузить"
    reloadbutton.onclick = function () {
        location.reload()
    }
    DropDownMenu.insertBefore(reloadbutton, DropDownMenu.firstChild)

    for (let i = deletedpostersarray.length - 1; i >= 0; i--) {
        let ddt = document.getElementById("DeletedPostTable")
        let DropDownItems = document.createElement("tr")
        DropDownItems.id = "dp" + i
        ddt.append(DropDownItems)
        let DropDownItem = document.getElementById("dp" + i)
        let butth = document.createElement("th")
        butth.id = "butth" + i
        let pid = document.createElement("th")
        pid.innerHTML = deletedpostersarray[i]
        pid.id = "butt" + i
        DropDownItem.append(pid)
        DropDownItem.append(butth)
        butt = document.createElement("button")
        butt.innerHTML = "Вернуть"
        butt.onclick = function () {
            if (postisdel[i]) {
                document.getElementById("PostDeleterAlert").style.display = "block"
                document.getElementById("DelPostBut").style.display = "block"
            }
            deletedpostersarray.splice(i, 1)
            for (let j = 0; j < deletedpostersarray.length; j++) {
                localStorage.removeItem("delpost" + j)
                localStorage.setItem("delpost" + j, deletedpostersarray[j])
            }
            localStorage.removeItem("delpost" + deletedpostersarray.length)
            this.parentNode.parentNode.remove()
            localStorage.removeItem("DeletedPosts")
            deletedposts = deletedposts - 1
            localStorage.setItem("DeletedPosts", deletedposts)
        }
        document.getElementById("butth" + i).append(butt)
    }

}

//Проверка для загрузки дополнительных постов
function checknumitems() {
    let numpost = 0
    for (let i=0;i<FeedWrap.childNodes.length;i++){
        if (FeedWrap.childNodes[i].className == "feed-item-wrap"){
            numpost++
        }
    }
    if (numpost<5){
        clearInterval(update)
        document.getElementById("sonet_log_more_container_first").click()
        deleteposts()
        createdeleter()
    }
}

//Стартовая функция загрузки постов
function startcheckitems(){
    if (document.getElementById("sonet_log_more_container_first").firstChild.style.display == "block"){
        document.getElementById("sonet_log_more_container_first").click()
        clearInterval(update)
        createdeleter()
    }
}


function postupdate(goy){
    deleteposts()
    createdeleter()
    dropdowncreate()
    let postarray1 = document.querySelectorAll(".feed-item-wrap")
    for (let i=0;i<postarray1.length;i++){
        postarray1[i].style.background = "white"
    }
    if(goy){
        let h = pageYOffset
        window.scroll(0, document.body.scrollHeight)
        setTimeout(() => {
            window.scroll(0, h)
        }, 100);
        document.getElementById("sonet_log_more_container_first").click()
    }

}

dropdowncreate()
createdeleter()
let update
if (postarray.length<5){
    update = setInterval(startcheckitems,100)
}

const observerpostcontainer = new MutationObserver(multifunc)
observerpostcontainer.observe(document.getElementById("log_internal_container"), config = {
    childList: true
})


function multifunc(){
    setTimeout(() => {
        postupdate(false)
    }, 100);
}
function multifunc2(){
    setTimeout(() => {
        postupdate(true)
    }, 100);
}

const observernewpost = new MutationObserver(multifunc2)
observernewpost.observe(FeedWrap,config = {
    childList: true
})
