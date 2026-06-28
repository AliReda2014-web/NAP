let currentView = "list"
let selected = null
let number = 0;
class Note {
  constructor(title, content){
    this.title = title
    this.content = content
    this.id = number++
    this.date = new Date()
    this.color = "White"
    this.lastEditDate = new Date()
    this.isPinned = false
    this.PIN = null
    this.tagsL = ["all"]
  }
}
let notesElement = document.querySelector("#notes")
let notes = []
let searchedValue = ""
let selectedTag = "all"
let tags = new Set(["all"])
loadData()
saveData()
renderUI()
document.querySelector("#addNote").addEventListener("click", () => {
  document.querySelector("#noteAdding").style.display = "block"
})
function addNote(){
  let title = document.querySelector("#title").value
  let content = document.querySelector("#conInpStart").value
  let tagsInp = document.querySelector("#tags").value.split(",")
  notes.push(new Note(title,content))
  let theNote = notes[notes.length-1]
  for (let tag of tagsInp) {
    theNote.tagsL.push(tag)
    tags.add(tag)
  }
  document.querySelector("#noteAdding").style.display = "none"
  document.querySelector("#noteAdding input").value = ""
  document.querySelector("#noteAdding textarea").value = ""
  renderUI()
  saveData()
}
document.querySelector("#done").addEventListener("click", addNote)
function renderUI(){
  if (notes.length === 0) {
    let msg = document.querySelector("#msg")
    msg.style.display = "block"
    msg.textContent = "لا توجد ملاحظات حتى الآن، إبدأ بإضافة أول ملاحظة لك عبر '+'📝"
  } else {
    msg.style.display = "none"
  }
  let colorValue = document.querySelector("#colors").value
  let sortValue = document.querySelector("#sort").value
  if (sortValue === "newestFirst") {
    notes.sort((n1,n2) => new Date(n2.date) - new Date(n1.date))
  } else if (sortValue === "oldestFirst"){
    notes.sort((n1,n2) => new Date(n1.date) - new Date(n2.date))
  } else if(sortValue === "lengthFirst"){
    notes.sort((n1,n2) => n2.content.length - n1.content.length)
  }
  document.querySelector("#tagsSelect").innerHTML = ""
  for (let tag of tags) {
    let theTagOption = document.createElement("option")
    theTagOption.textContent = tag
    theTagOption.value = tag
    if (tag === selectedTag) {
      theTagOption.selected = true
    }
    document.querySelector("#tagsSelect").appendChild(theTagOption)

  }
  let titleElement = document.querySelector("#noteTitle")
    let dateElement = document.querySelector("#noteDate")
    let contentElement = document.querySelector("#noteContent")
    let lastEditElement = document.querySelector("#noteLastEdit")
    let tagsElement = document.querySelector("#tagsElement")
  if (currentView === "list"){
    document.querySelector("#notes").style.display = "block"
    document.querySelector("#infoPage").style.display = "none"
    document.querySelector("#searchAndSort").style.display = "block"
    document.querySelector("#sorting").style.display = "block"
    document.querySelector('#notes').innerHTML = ''
    notes.sort((n1,n2) => n2.isPinned - n1.isPinned)
    for (let note of notes.filter(note => (note.title.includes(searchedValue) || note.content.includes(searchedValue)) && note.color.includes(colorValue) && note.tagsL.includes(selectedTag))){
      let noteCard = document.createElement("div")
      noteCard.style.backgroundColor = note.color
      noteCard.className = "noteTitleCard"
      if (note.isPinned === true){
        noteCard.textContent = `${note.title} 📌`
      } else {
        noteCard.textContent = note.title
      }
      noteCard.addEventListener("click", () => {noteJoin(note.id)})
      document.querySelector("#notes").appendChild(noteCard)
    }
  } else if(currentView === "noteView") {
    let selectedNote = getSelectedNote()
    document.querySelector('#notes').style.display = "none"
    document.querySelector("#notePage").style.display = "block"
    titleElement.textContent = selectedNote.title
    dateElement.textContent = `أنشأ في:${new Date(selectedNote.date).toLocaleDateString("ar-EG")} - ${new Date(selectedNote.date).toLocaleTimeString("ar-EG")}`
    lastEditElement.textContent = ` آخر تعديل كان في:${new Date(selectedNote.lastEditDate).toLocaleDateString("ar-EG")} - ${new Date(selectedNote.lastEditDate).toLocaleTimeString("ar-EG")}`
    contentElement.textContent = selectedNote.content
    tagsElement.innerHTML = ""
    for (let tag of selectedNote.tagsL){
      let tagElement = document.createElement("span")
      let comma = document.createElement("span")
      tagElement.textContent = tag
      comma.textContent = ","
      tagElement.style.textDecoration = "underline"
      tagElement.addEventListener("click", (e) => {tagOpen(e)})
      tagsElement.appendChild(tagElement)
      tagsElement.appendChild(comma)
    }
    document.querySelector("#editBtn").textContent = "️✏️"
    contentElement.style.backgroundColor = selectedNote.color
    titleElement.style.backgroundColor = selectedNote.color
  } else if(currentView === "noteEdit") {
    let selectedNote = getSelectedNote()

    document.querySelector("#notes").style.display = "none"
    document.querySelector("#notePage").style.display = "block"
    titleElement.innerHTML = ""
    contentElement.innerHTML = ""
    let titleInput = document.createElement("input")
    titleInput.className = "titleInput"
    titleInput.value = selectedNote.title
    titleElement.appendChild(titleInput)
    let contentInput = document.createElement("textarea")
    contentInput.className = "conInput"
    contentInput.value = selectedNote.content
    contentElement.appendChild(contentInput)
    let tagsInput = document.createElement("input")
    tagsInput.className = "tagsInput"
    tagsInput.type = "text"
    tagsInput.value = selectedNote.tagsL
    tagsElement.innerHTML = ""
    tagsElement.appendChild(tagsInput)
    document.querySelector("#editBtn").textContent = "✔️"
  } else if (currentView === "infoPage") {
    document.querySelector('#notes').style.display = "none"
    document.querySelector('#searchAndSort').style.display = "none"
    document.querySelector('#sorting').style.display = "none"
    document.querySelector("#infoPage").style.display = "block"
    msg.style.display = "none"
  }
}
function noteJoin(id){
  selected = id
  let selectedNote = getSelectedNote()
  if (typeof selectedNote.PIN === "number" ) {
    let writtenPIN = Number(prompt("اكتب الرقم السري الخاص بالملاحظة"))
    if (writtenPIN === selectedNote.PIN) {
      currentView = "noteView"
      renderUI()
    } else {
      alert("أنت كتبت رقم سري غير صحيح")
      selected = null
    }
  } else {
    currentView = "noteView"
    renderUI()
  }
}
document.querySelector('#back').addEventListener("click", backFromNote)
function backFromNote(){
  currentView = "list"
   document.querySelector("#notePage").style.display = "none"
  document.querySelector("#notes").style.display = "block"
  renderUI()
}
function deleteNote(){
    notes.splice(notes.indexOf(getSelectedNote()), 1)
    backFromNote()
    saveData()
}
document.querySelector("#delete").addEventListener("click", deleteNote)
document.querySelector("#editBtn").addEventListener("click", editNote)
function editNote(){
  if (currentView === "noteView"){
    currentView = "noteEdit"
    renderUI()
  } else if(currentView === "noteEdit") {
    let selectedNote = getSelectedNote()
    selectedNote.title = document.querySelector(".titleInput").value
    selectedNote.content = document.querySelector(".conInput").value
    selectedNote.tagsL = document.querySelector(".tagsInput").value.split(",")
    if (selectedNote.tagsL.includes("all") === false) {
      selectedNote.tagsL.push("all")
    }
    for (let tag of selectedNote.tagsL){
      tags.add(tag)
    }
    currentView = "noteView"
    selectedNote.lastEditDate = new Date()
    saveData()
    renderUI()
  }
}
function saveData(){
  localStorage.setItem("notes", JSON.stringify(notes))
  localStorage.setItem('number', String(number))
  localStorage.setItem("tags", JSON.stringify([...tags]))
}
function loadData(){
  notes = JSON.parse(localStorage.getItem("notes") || "[]")
  number = Number(localStorage.getItem("number"))
  tags = new Set(JSON.parse(localStorage.getItem("tags")))
}
document.querySelector("#bgClrs").addEventListener("change", (event) => {
  getSelectedNote().color = event.target.value
  renderUI()
  saveData()
})
document.querySelector("#pinBtn").addEventListener("click", () => {
  let thePinnedNote = getSelectedNote()
  thePinnedNote.isPinned = !thePinnedNote.isPinned
  backFromNote()
  saveData()
})
document.querySelector("#searchBar").addEventListener("input", (event) => {
  searchedValue = event.target.value
  renderUI()
})
document.querySelector("#settingOpen").addEventListener("click", toggleSettings)
let isSettingsShowed = false
function toggleSettings(){
  let settingBtns = document.querySelectorAll(".editButton")
  if (!isSettingsShowed) {
    for (let element = 0; element < settingBtns.length;element++){
      settingBtns[element].style.display = "inline"
      settingBtns[element].style.animation = "fadeIn 0.7s"
    isSettingsShowed = true
   }
  } else {
    for (let element = 0; element < settingBtns.length;element++){
      settingBtns[element].style.animation = "fadeOut 0.7s"
      setTimeout(() => {
        settingBtns[element].style.display = "none"
        isSettingsShowed = false
      },550)
   }
  }
}
document.querySelector("#sort").addEventListener("change", renderUI)
document.querySelector("#passBtn").addEventListener("click",togglePIN)
function togglePIN() {
  let selectedNote = getSelectedNote()
  if (selectedNote.PIN !== null) {
    selectedNote.PIN = null
    alert("تمالغاء الرقم السري")
    saveData()
  } else {
    let PIN = Number(prompt("الرقم السري"))
    if (PIN > 9999) {
      alert("لا يمكنك كتابة رقم سري مكون من أكثر من 4 أرقام")
    } else if (PIN < 1000) {
      alert("لا يمكنك كتابة رقم سري مكون من أقل من 4 أرقام")
    } else {
     selectedNote.PIN = PIN
     saveData()
   }
  }
}
function getSelectedNote() {
  return notes.find(n => n.id === selected)
}
document.querySelector("#colors").addEventListener("change", renderUI)
document.querySelector("#tagsSelect").addEventListener("change", (e) => {
  selectedTag = e.target.value
  renderUI()
})
function tagOpen(e){
  selectedTag = e.target.textContent
  backFromNote()
}
document.querySelector("#info").addEventListener("click", () => {
  if (currentView !== "infoPage") {
    currentView = "infoPage"
    renderUI()
  } else {
    currentView = "list"
    renderUI()
  }
})