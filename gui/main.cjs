const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');

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
    const relativeFile = path.relative(process.cwd(), file);

    const ext = path.extname(relativeFile);
    const command = ext === '.jsx'
      ? `node jsxProcessor.cjs "${relativeFile}" ${mode}`
      : `node index.cjs "${relativeFile}" --mode=${mode}`;

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

