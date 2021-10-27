const { autoUpdater } = require("electron-updater");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const { app, BrowserWindow, ipcMain } = require("electron");
const { watchFile } = require("fs");
const { trackEvent } = require("./lib/analytics.js");
const glasstron = require("glasstron");
const electron = require("electron");
// Notify
const { Notification } = require("electron");
electron.app.commandLine.appendSwitch("enable-transparent-visuals");

function neterr() {
  const notification = {
    title: "SnailFM",
    body: "No valid network connection! Please reconnect!",
  };
}

// wait function
function wait(ms) {
  var d = new Date();
  var d2 = null;
  do {
    d2 = new Date();
  } while (d2 - d < ms);
}

// Start the libaries
require("./lib/rpc.js");
console.log("RPC lib init.");

// Blur Service
if (process.platform == "darwin") {
  app.whenReady().then(() => {
    // macOS
    global.blurType = "vibrancy";
    global.windowFrame = "false";
  });
} else if (process.platform == "win32") {
  app.whenReady().then(() => {
    // Windows
    global.blurType = "acrylic";
    global.windowFrame = "false"; // The effect won't work properly if the frame
    // is enabled on Windows
  });
} else {
    // Linux
    global.blurType = "blurbehind";
    global.windowFrame = "true";
}

// Loading screen
/// create a global var, wich will keep a reference to out loadingScreen window
let loadingScreen;
const createLoadingScreen = () => {
  loadingScreen = new BrowserWindow(
    Object.assign({
      width: 700,
      height: 120,
      alwaysOnTop: true,
      frame: false,
      fullscreen: false,
      show: true,
      transparent: true,
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadFile("splash.html");
  loadingScreen.on("closed", () => (loadingScreen = null));
  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
  });
};
console.log("Loading screen ready.");

// Convert boolean to string
var windowframz = (global.windowFrame === 'true');

// Start the main program
let mainWindow;

function createWindow() {
  mainWindow = new glasstron.BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    titlebarStyle: "hiddenInset",
    frame: windowframz,
    titlebarStyle: 'hiddenInset',
    fullscreen: false,
    blur: true,
    blurType: global.blurType,
    modal: true,
    icon: "snailfm.ico",
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      contextIsolation: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(false);
  mainWindow.loadFile("index.html");
  mainWindow.on("maximize", () => mainWindow.unmaximize());
  mainWindow.webContents.on("did-finish-load", () => {
    if (loadingScreen) {
      loadingScreen.close();
      trackEvent("stnailfm.started", "SnailFM has just loaded up!");
    }
    var isDev = require("isdev");

    if (isDev) {
      console.log("In Development!");
    } else {
      console.log("Not in Development!");
    }

    var internetAvailable = require("internet-available");

    // Set a timeout and a limit of attempts to check for connection
    internetAvailable({
      timeout: 2000,
      retries: 3,
    })
      .then(function () {
        console.log("Internet available");
      })
      .catch(function () {
        console.log("No internet");
        neterr();
        mainWindow.loadFile("nonet.html");
        new Notification(notification).show();
      });
    mainWindow.show();
    console.log("Ok! Window init, let's check for updates...");
    autoUpdater.checkForUpdatesAndNotify();
    console.log("Update checked. Let's see what happens!");
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

console.log("Main screen ready.");

app.on("ready", () => {
  createLoadingScreen();
  console.log("Send check for updates signal...");
  console.log("Alright, lets go!");
  setTimeout(() => {
    createWindow();
  }, 3000);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("relaunch", () => {
  mainWindow.close();
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('minimize', () => {mainWindow.minimize()})
ipcMain.on('maximize', () => {mainWindow.maximize()})
ipcMain.on('restore', () => {mainWindow.restore()})
ipcMain.on('close', () => {mainWindow.close()})