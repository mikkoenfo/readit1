// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require('electron')
const items = require('./items')

// DOM Nodes
let showModal = document.getElementById('show-modal'),
  closeModal = document.getElementById('close-modal'),
  modal = document.getElementById('modal'),
  addItem = document.getElementById('add-item'),
  itemUrl = document.getElementById('url'),
  search = document.getElementById('search')

// Open new item modal
window.newItem = () => {
  showModal.click()
}

// Ref items.open globally
window.openItem = items.open

// Ref item.delete globally
window.deleteItem = () => {
  let selectedItem = items.getSelectedItem()
  items.delete(selectedItem.index)
}

// Open item in native browser
window.openItemNative = items.openNative

// Focus to search
window.searchItems = () => {
  search.focus()
}

// filter items with search
search.addEventListener('keyup', (e) => {
  // loop items
  Array.from(document.getElementsByClassName('read-item')).forEach((item) => {
    // hide items that dont match search value
    let hasMatch = item.innerText.toLowerCase().includes(search.value)
    item.style.display = hasMatch ? 'flex' : 'none'
  })
})

// Navigate item selection with up/down arrows
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    items.changeSelection(e.key)
  }
})

//  Disable &enable modal buttons
const toggleModalButtons = () => {
  // Check state of buttons
  if (addItem.disabled === true) {
    addItem.disabled = false
    addItem.style.opacity = 1
    addItem.innerText = 'Add Item'
    closeModal.style.display = 'inline'
  } else {
    addItem.disabled = true
    addItem.style.opacity = 0.5
    addItem.innerText = 'Adding...'
    closeModal.style.display = 'none'
  }
}

// Show modal
showModal.addEventListener('click', (e) => {
  modal.style.display = 'flex'
  itemUrl.focus()
})

// Hide modal
closeModal.addEventListener('click', (e) => {
  modal.style.display = 'none'
})

// Handle new Item
addItem.addEventListener('click', (e) => {
  // Chec value exists
  if (itemUrl.value) {
    // console.log(itemUrl.value)
    ipcRenderer.send('new-item', itemUrl.value)

    // DIsable buttons
    toggleModalButtons()
  }
})

// Listen for new item from main process
ipcRenderer.on('new-item-success', (e, newItem) => {
  // console.log(newItem)

  // Add new item to "items" node
  items.addItem(newItem, true)

  // Enable buttons
  toggleModalButtons()

  //   hide modal and clear value
  modal.style.display = 'none'
  itemUrl.value = ''
})

// listen for keyboard submit
itemUrl.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') addItem.click()
})
