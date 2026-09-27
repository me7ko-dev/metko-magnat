// Windows версия: същата игра в собствен прозорец (F11 = цял екран).
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Само един прозорец, за да не се застъпват записите
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1320, height: 880, minWidth: 380, minHeight: 560, show: false,
    backgroundColor: '#113A28', title: 'Метко Магнат',
    icon: path.join(__dirname, 'icon.png'),
    // играта продължава да смята, докато прозорецът е отзад
    webPreferences: { backgroundThrottling: false },
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'Escape' && win.isFullScreen()) { win.setFullScreen(false); e.preventDefault(); }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
});
app.on('window-all-closed', () => app.quit());
