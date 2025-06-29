console.log('[Renderer] render.js loaded');

const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const outputBox = document.getElementById('outputBox');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  console.log('[Renderer] Select file button clicked');
  const result = await window.electronAPI.openFileDialog();
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    runBtn.disabled = false;
  }
});

runBtn.addEventListener('click', async () => {
  console.log('[Renderer] Run script button clicked');
  if (!selectedFilePath) {
    alert('Please select a file first.');
    return;
  }
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  outputBox.textContent = 'Running script...';
  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode: selectedMode });
  outputBox.textContent = result || 'No output from script.';
});
