let starts = setInterval(start, 100)
let startisrunning = true

function start() {
    if (document.getElementById("feed-new-message-inf-wrap-first") != null) {
        if (document.getElementById("feed-new-message-inf-wrap-first").style.display == "none") {
            clearInterval(starts)
            startisrunning = false
        } else {
            if (document.getElementById("feed-new-message-inf-wrap-first").className == "feed-new-message-inf-wrap-first") {
                window.scroll(0, document.body.scrollHeight)
            }
            if (document.getElementById("feed-new-message-inf-wrap-first").className == "feed-new-message-inf-wrap-first feed-new-message-inf-wrap-first-visible") {
                window.scroll(0, 0)
                clearInterval(starts)
                startisrunning = false
            }
        }
    } else {
        clearInterval(starts)
        startisrunning = false
    }
}
let deletedposts = 0
let numischecked = false
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
        let postarray1 = document.querySelectorAll(".feed-item-wrap")
        postarray1 = Array.prototype.slice.call(postarray1)
        for (let i = postarray1.length - 1; i >= 0; i--) {
            if (postarray1[i].style.display == "none") {
                postarray1.splice(i, 1)
            }
        }
        if (postarray1.length < 5) {
            addmoreposts(true)
        }
        try {
            document.getElementById(id).parentNode.style.display = "none"
        } catch(error) {
        }
    }
}
deleteposts()

//Создание крестиков
let postarray = document.querySelectorAll(".feed-item-wrap")
function createdeleter() {
    for (let i = 0; i < postarray.length; i++) {
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
            deleter.parentNode.parentNode.style.display = "none"
            let postarray1 = document.querySelectorAll(".feed-item-wrap")
            postarray1 = Array.prototype.slice.call(postarray1)
            for (let i = postarray1.length - 1; i >= 0; i--) {
                if (postarray1[i].style.display == "none") {
                    postarray1.splice(i, 1)
                }
            }
            if (postarray1.length < 5) {
                addmoreposts()
            }
            deletedpostersarray.push(this.parentNode.nextSibling.id)
            dropdowncreate()
            if (!numischecked) {
                checknumitems()
            }
        }
        postarray[i].insertBefore(deleterdiv, postarray[i].firstChild)
        document.getElementById("PostDeleter" + i).append(deleter)
    }
}

//Создание выпадающего меню с удаленными постами
function dropdowncreate() {
    try {
        document.getElementById("dropmenu").remove()
        document.getElementById("deletedpostbutton").remove()
    } catch(error) {

    }
    let m = document.createElement("button")
    m.style.background = "#3498DB"
    m.innerHTML = "Удаленные посты"
    m.style.border = "none"
    m.style.cursor = "pointer"
    m.style.fontSize = "14pt"
    m.style.margin = "1% 0"
    m.id = "deletedpostbutton"
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

    for (let i = deletedpostersarray.length - 1; i >= 0; i--) {
        let ddt = document.getElementById("DeletedPostTable")
        let DropDownItems = document.createElement("tr")
        DropDownItems.id = "DeletedPostRow" + i
        ddt.append(DropDownItems)
        let DropDownItem = document.getElementById("DeletedPostRow" + i)
        let DeletedPostName = document.createElement("th")
        DeletedPostName.id = "DeletedPostName" + i
        let pid = document.createElement("th")
        pid.innerHTML = deletedpostersarray[i]
        pid.id = "DeletedPostButton" + i
        DropDownItem.append(pid)
        DropDownItem.append(DeletedPostName)
        DeletedPostButton = document.createElement("button")
        DeletedPostButton.innerHTML = "Вернуть"
        DeletedPostButton.onclick = function () {
            document.getElementById(deletedpostersarray[i]).parentNode.style.display = "block"
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
        document.getElementById("DeletedPostName" + i).append(DeletedPostButton)
    }

}

//Проверка для загрузки дополнительных постов
function checknumitems() {
    let numpost = 0
    for (let i = 0; i < FeedWrap.childNodes.length; i++) {
        if (FeedWrap.childNodes[i].className == "feed-item-wrap") {
            if (FeedWrap.childNodes[i].style.display != "none") {
                numpost++
            }
        }
    }
    if (numpost < 5) {
        clearInterval(update)
        document.getElementById("sonet_log_more_container_first").click()
        deleteposts()
        createdeleter()
        numischecked = true
    }
}

//Стартовая функция загрузки постов
function startcheckitems() {
    if (document.getElementById("sonet_log_more_container_first").firstChild.style.display == "block") {
        document.getElementById("sonet_log_more_container_first").click()
        clearInterval(update)
        createdeleter()
    }
}


function postupdate(goy) {
    deleteposts()
    createdeleter()
    dropdowncreate()
    let postarray1 = document.querySelectorAll(".feed-item-wrap")
    for (let i = 0; i < postarray1.length; i++) {
        postarray1[i].style.background = "white"
    }
    postarray1 = Array.prototype.slice.call(postarray1)
    for (let i = postarray1.length - 1; i >= 0; i--) {
        if (postarray1[i].style.display == "none") {
            postarray1.splice(i, 1)
        }
    }
    if (goy) {
        let h = pageYOffset
        let w = pageXOffset
        window.scroll(w, document.body.scrollHeight)
        setTimeout(() => {
            window.scroll(w, h)
        }, 100);
        if (postarray1.length < 5) {
            document.getElementById("sonet_log_more_container_first").click()
        }
    }
}

function addmoreposts(start = false) {
    let h = pageYOffset
    let w = pageXOffset
    if (start) {
        h = 0
        w = 0
    }
    window.scroll(w, document.body.scrollHeight)
    setTimeout(() => {
        window.scroll(w, h)
    }, 100);
}

dropdowncreate()
createdeleter()
let update
let postarray2 = document.querySelectorAll(".feed-item-wrap")
postarray2 = Array.prototype.slice.call(postarray2)
for (let i = postarray2.length - 1; i >= 0; i--) {
    if (postarray2[i].style.display == "none") {
        postarray2.splice(i, 1)
    }
}
if (postarray2.length < 5) {
    update = setInterval(startcheckitems, 100)
}

const observerpostcontainer = new MutationObserver(multifunc)
observerpostcontainer.observe(document.getElementById("log_internal_container"), config = {
    childList: true
})


function multifunc() {
    if (!startisrunning) {
        starts = setInterval(start, 100)
        startisrunning = true
    }
    setTimeout(() => {
        postupdate(false)
    }, 100);
    checknumitems()
}
function multifunc2() {
    setTimeout(() => {
        postupdate(true)
    }, 100);
}

const observernewpost = new MutationObserver(multifunc2)
observernewpost.observe(FeedWrap, config = {
    childList: true
})