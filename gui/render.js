const ipcRenderer = window.ipcRenderer;

const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const outputBox = document.getElementById('outputBox');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  console.log('[Renderer] 📂 Select File button clicked');
  const result = await ipcRenderer.invoke('open-file-dialog');
  console.log('[Renderer] 📂 open-file-dialog result:', result);
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    runBtn.disabled = false;
  }
});


runBtn.addEventListener('click', async () => {
  console.log('[Renderer] 🚀 Run button clicked');
  if (!selectedFilePath) {
    alert('Please select a file first.');
    return;
  }
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  outputBox.textContent = 'Running script...';
  const result = await ipcRenderer.invoke('run-script', { file: selectedFilePath, mode: selectedMode });
  console.log('[Renderer] 🚀 run-script result:', result);
  outputBox.textContent = result || 'No output from script.';
});
