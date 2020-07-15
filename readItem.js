// Modules
const { BrowserWindow } = require('electron')

// offscreen browserwindows
let offscreenWindow

// exports readItem function
module.exports = (url, callback) => {
  // create oddscreen window
  offscreenWindow = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
    },
  })

  //   load item url
  offscreenWindow.loadURL(url)

  // wait for content to finish loading
  offscreenWindow.webContents.on('did-finish-load', (e) => {
    // get page title
    let title = offscreenWindow.getTitle()

    // Get screenshot (thumbnail)
    offscreenWindow.webContents.capturePage((image) => {
      // get image as dataURL
      let screenshot = image.toDataURL()

      // execute callnack with new item object
      callback({ title, screenshot, url })

      // cleanup
      offscreenWindow.close()
      offscreenWindow = null
    })
  })
}
