const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.whenReady().then(createWindow);

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'HTML & JSX Files', extensions: ['html', 'jsx'] },
    ],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('run-script', async (event, { file, mode }) => {
  console.log(`[Main] Received run-script request: file=${file}, mode=${mode}`);
  return new Promise((resolve) => {
    const relativeFile = path.relative(process.cwd(), file);
    const ext = path.extname(relativeFile);
    const command = ext === '.jsx'
      ? `node jsxProcessor.cjs "${relativeFile}" ${mode}`
      : `node index.cjs "${relativeFile}" --mode=${mode}`;
    console.log(`[Main] Running command: ${command}`);
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
