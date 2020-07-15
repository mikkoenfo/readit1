// Modules
const { remote, shell } = require('electron')

// menu template
const template = [
  {
    label: 'Items',
    submenu: [
      {
        label: 'Add new',
        click: window.newItem,
        accelerator: 'CmdOrCtrl+o',
      },
      {
        label: 'Read item',
        accelerator: 'CmdOrCtrl+Enter',
        click: window.openItem,
      },
      {
        label: 'Delete item',
        accelerator: 'CmdOrCtrl+Backspace',
        click: window.deleteItem,
      },
      {
        label: 'Open in browser',
        accelerator: 'CmdOrCtrl+Shift+o',
        click: window.openItemNative,
      },
      {
        label: 'Search items',
        accelerator: 'CmdOrCtrl+s',
        click: window.searchItems,
      },
    ],
  },
  {
    role: 'editMenu',
  },
  {
    role: 'windowMenu',
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn more',
        click: () => {
          shell.openExternal('https://www.hs.fi')
        },
      },
    ],
  },
]

// set mac specific first menu item
if (process.platform === 'darwin') {
  template.unshift({
    label: remote.app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  })
}

// build menu
const menu = remote.Menu.buildFromTemplate(template)

// et as main app menu
remote.Menu.setApplicationMenu(menu)
