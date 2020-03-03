const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;const path = require("path");
const isDev = require("electron-is-dev");let mainWindow;
function createWindow() {mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true
  },
  width: 1920,
  height: 1080,
  show: false,
  alwaysOnTop: true,
  frame: false,
  transparent: true});
mainWindow.setAlwaysOnTop(true, 'screen');
mainWindow.loadURL(isDev? "http://localhost:3000": `file://${path.join(__dirname, "../build/index.html")}`);
// mainWindow.on("closed", () => (mainWindow = null));
mainWindow.on("close", () => (mainWindow = null));
mainWindow.once('ready-to-show', function(){mainWindow.show()});

// mainWindow.setIgnoreMouseEvents(true, {forward: true});
};

app.on("ready", () => setTimeout(createWindow, 2000)); // TIME BASED????
