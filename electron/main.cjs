const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const APP_URL = "https://id-preview--04f458ee-f120-4e10-af8a-482b8bb51b5e.lovable.app";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#202122",
    title: "MJD Wellness",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL)) return { action: "allow" };
    void shell.openExternal(url);
    return { action: "deny" };
  });
  void win.loadURL(APP_URL);
  win.webContents.on("did-fail-load", (_event, code, description, url, isMainFrame) => {
    if (isMainFrame && code !== -3) void win.loadFile(path.join(__dirname, "offline.html"), { query: { url, description } });
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });