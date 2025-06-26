const { dialog } = require('electron').remote;
const { exec } = require('child_process');
const path = require('path');

document.getElementById('select-file').addEventListener('click', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'HTML/JSX', extensions: ['html', 'jsx'] }],
    properties: ['openFile']
  });

  if (!canceled && filePaths.length > 0) {
    document.getElementById('file-path').innerText = filePaths[0];
  }
});

document.getElementById('run-script').addEventListener('click', () => {
  const filePath = document.getElementById('file-path').innerText;
  const mode = document.getElementById('mode').value;
  if (!filePath) return;

  const ext = path.extname(filePath);
  const command = ext === '.jsx'
    ? `node jsxProcessor.cjs "${filePath}" ${mode}`
    : `node index.cjs "${filePath}" --mode=${mode}`;

  exec(command, (err, stdout, stderr) => {
    const output = document.getElementById('output');
    if (err) return output.innerText = '❌ Error: ' + err.message;
    output.innerText = stdout + '\n' + stderr;
  });
});
