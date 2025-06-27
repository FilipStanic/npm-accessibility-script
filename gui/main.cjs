const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('run-script', async (event, { file, mode }) => {
  return new Promise((resolve) => {
    const ext = path.extname(file);
    const command = ext === '.jsx'
      ? `node jsxProcessor.cjs "${file}"`
      : `node index.cjs "${file}" --mode=${mode}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(`❌ Error: ${error.message}`);
        return;
      }
      if (stderr) {
        resolve(`⚠️ STDERR: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
});
