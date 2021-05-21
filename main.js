const { autoUpdater } = require('electron-updater');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { app, BrowserWindow, ipcMain } = require('electron');
const { watchFile } = require('fs');


// wait function
function wait(ms)
{
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
}

// Start the libaries
require('./lib/rpc.js');
console.log("RPC lib init.");


// Loading screen
/// create a global var, wich will keep a reference to out loadingScreen window
let loadingScreen;
const createLoadingScreen = () => {
  loadingScreen = new glasstron.BrowserWindow(
    Object.assign({
      width: 700,
      height: 120,
      alwaysOnTop: true,
      frame: false,
      fullscreen: false,
      show: true,
      transparent: true
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadFile('splash.html');
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();
  });
};
console.log("Loading screen ready.");

// Start the main program
let mainWindow;

function createWindow () {
  mainWindow = new glasstron.BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    fullscreen: false,
    modal: true,
    icon: 'snailfm.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setResizable(false)
  mainWindow.loadFile('index.html');
  mainWindow.on('maximize', () => mainWindow.unmaximize());
  mainWindow.webContents.on('did-finish-load', () => {
    if (loadingScreen) {
      loadingScreen.close();
    }
    var isDev = require('isdev')

if(isDev) {
  console.log("In Development!")
} else {
  console.log("Not in Development!")
}
    mainWindow.show();
    console.log("Ok! Window init, let's check for updates...")
    autoUpdater.checkForUpdatesAndNotify();
    console.log("Update checked. Let's see what happens!");
  });

  
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

console.log("Main screen ready.");

app.on('ready', () => {
  createLoadingScreen();
  console.log("Send check for updates signal...");
  console.log("Alright, lets go!");
  setTimeout(() => {
    createWindow();
  }, 3000);
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('relaunch', () => {
  mainWindow.close();
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

