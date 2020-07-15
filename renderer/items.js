// Modules
const fs = require('fs')
const { shell } = require('electron')

// DOM nodes
let items = document.getElementById('items')

// get readerJS contents
let readerJS
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString()
})

// Track items in storage
exports.storage = JSON.parse(localStorage.getItem('readit-items')) || []

// listen for done message from reader window
window.addEventListener('message', (e) => {
  // console.log(e.data)
  // delete item at given index
  this.delete(e.data.itemIndex)

  // Close the the reader window, check for correct message

  if (e.data.action === 'delete-reader-item') {
    e.source.close()
  }
})

exports.delete = (itemIndex) => {
  // remove ite from DOM
  items.removeChild(items.childNodes[itemIndex])

  // remove from storage
  this.storage.splice(itemIndex, 1)

  // persist
  this.save()

  // select previous item or new first item if first was deleted
  if (this.storage.length) {
    // get new slected item index
    let newSelectedItemIndex = itemIndex === 0 ? 0 : itemIndex - 1

    // set item at new index as selected
    document
      .getElementsByClassName('read-item')
      [newSelectedItemIndex].classList.add('selected')
  }
}

exports.getSelectedItem = () => {
  // get selected node
  let currentItem = document.getElementsByClassName('read-item selected')[0]

  // get item index
  let itemIndex = 0
  let child = currentItem
  while ((child = child.previousSibling) != null) itemIndex++

  // return selected item and index
  return { node: currentItem, index: itemIndex }
}

// persist storage
exports.save = () => {
  localStorage.setItem('readit-items', JSON.stringify(this.storage))
}

// set item as selected
exports.select = (e) => {
  // remove currently selected item class
  // document
  //   .getElementsByClassName('read-item selected')[0]
  //   .classList.remove('selected')
  this.getSelectedItem().node.classList.remove('selected')

  // add to cliecked item
  e.currentTarget.classList.add('selected')
}

// Move to newly selected item
exports.changeSelection = (direction) => {
  // get selected item
  // let currentItem = document.getElementsByClassName('read-item selected')[0]
  let currentItem = this.getSelectedItem()

  // handle up/down
  if (direction === 'ArrowUp' && currentItem.node.previousSibling) {
    currentItem.node.classList.remove('selected')
    currentItem.node.previousSibling.classList.add('selected')
  } else if (direction === 'ArrowDown' && currentItem.node.nextSibling) {
    currentItem.node.classList.remove('selected')
    currentItem.node.nextSibling.classList.add('selected')
  }
}

// Open item in bative browser
exports.openNative = () => {
  // only if we have items (in case of menu open)
  if (!this.storage.length) return

  // get selected item
  let selectedItem = this.getSelectedItem()

  // Open in system browser
  shell.openExternal(selectedItem.node.dataset.url)
}

exports.open = () => {
  // only if we have items (in case of menu open)
  if (!this.storage.length) return

  // get selected item
  let selectedItem = this.getSelectedItem()

  // get items url
  let contentURL = selectedItem.node.dataset.url

  // console.log('Opening item: ', contentURL)

  // open item in proxy BrowserWindow
  let readerWin = window.open(
    contentURL,
    '',
    `
    maxWidth=2000,
    maxHeight=2000,
    width=1200,
    heigth=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1
  `
  )

  // inject javaacript
  readerWin.eval(readerJS.replace('{{index}}', selectedItem.index))
}

// Add new item
exports.addItem = (item, isNew = false) => {
  // Create a new DOM node
  let itemNode = document.createElement('div')

  // Assign "read-item" class
  itemNode.setAttribute('class', 'read-item')

  // set item url as data attribute
  itemNode.setAttribute('data-url', item.url)

  // Add inner HTML
  itemNode.innerHTML = `<img src="${item.screenshot}"><h2>${item.title}</h2>`

  // append new node to "items"
  items.appendChild(itemNode)

  // Attach click handler to select
  itemNode.addEventListener('click', this.select)

  // Attach open doubleclick handler
  itemNode.addEventListener('dblclick', this.open)

  // if this is the forst item, select it
  if (document.getElementsByClassName('read-item').length === 1) {
    itemNode.classList.add('selected')
  }

  // add item to storage and persist
  if (isNew) {
    this.storage.push(item)
    this.save()
  }
}

// add items from storage when app loads
this.storage.forEach((item) => {
  this.addItem(item)
})
