const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;const path = require("path");
const isDev = require("electron-is-dev");let mainWindow;
function createWindow() {mainWindow = new BrowserWindow({
  // webPreferences: {
  //   nodeIntegration: true
  // },
  width: 1920,
  height: 1080,
  show: false,
  // alwaysOnTop: true,
  frame: false,
  transparent: true});
mainWindow.loadURL(isDev? "http://localhost:3000": `file://${path.join(__dirname, "../build/index.html")}`);
// mainWindow.on("closed", () => (mainWindow = null));
mainWindow.on("close", () => (mainWindow = null));
mainWindow.once('ready-to-show', function(){mainWindow.show()});
};

app.on("ready", () => setTimeout(createWindow, 2000)); //WTF TIME BASED????
// app.on("activate", () => {if (mainWindow === null) {createWindow();}
// });
// app.on("window-all-closed", () => {if (process.platform !== "darwin") {app.quit();
// }
// });
