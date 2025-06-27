const ipcRenderer = window.ipcRenderer;

const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const outputBox = document.getElementById('outputBox');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('open-file-dialog');
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    runBtn.disabled = false;
  }
});

runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) {
    alert('Please select a file first.');
    return;
  }
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  outputBox.textContent = 'Running script...';
  const result = await ipcRenderer.invoke('run-script', { file: selectedFilePath, mode: selectedMode });
  outputBox.textContent = result || 'No output from script.';
});
