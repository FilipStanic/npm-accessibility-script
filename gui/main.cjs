const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const crypto = require("crypto");

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
app.whenReady().then(createWindow);

ipcMain.handle("open-file-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "HTML & JSX Files", extensions: ["html", "jsx"] }],
  });
  return canceled ? null : filePaths[0];
});

function getUniqueBackupName(filePath) {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);
  const hash = crypto.createHash('md5').update(fileDir).digest('hex').substring(0, 8);
  const nameWithoutExt = path.parse(fileName).name;
  const ext = path.parse(fileName).ext;
  return `${nameWithoutExt}_${hash}${ext}.bak`;
}

ipcMain.handle("run-script", async (event, { file, mode }) => {
  const relativeFile = path.relative(process.cwd(), file);
  const ext = path.extname(relativeFile);
  const backupFileName = getUniqueBackupName(file);
  const backupPath = path.join(process.cwd(), "backup", backupFileName);
  let command = "";

  if (mode === "undo") {
    if (!fs.existsSync(backupPath)) {
      return "⚠️ No backup found. Cannot undo.";
    }
    command = `cp "${backupPath}" "${relativeFile}" && rm "${backupPath}" && echo "🔄 Restored from backup and removed backup file."`;
  } else if (mode === "diff") {
    if (!fs.existsSync(backupPath)) {
      return "⚠️ No backup file found. Cannot show diff.";
    }
    const guiDiffHelperPath = path.join(__dirname, "..", "guiDiffHelper.cjs");
    command = `node "${guiDiffHelperPath}" "${backupPath}" "${file}"`;
  } else {
    command =
      ext === ".jsx"
        ? `node jsxProcessor.cjs "${relativeFile}" ${mode}`
        : `node index.cjs "${relativeFile}" --mode=${mode}`;
  }

  return new Promise((resolve) => {
    exec(command, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) return resolve(`❌ Error: ${error.message}`);
      if (stderr) return resolve(`⚠️ STDERR: ${stderr}`);
      resolve(stdout);
    });
  });
});

ipcMain.handle("check-backup", async (event, fullPath) => {
  const backupFileName = getUniqueBackupName(fullPath);
  const backupPath = path.join(process.cwd(), "backup", backupFileName);
  return fs.existsSync(backupPath);
});