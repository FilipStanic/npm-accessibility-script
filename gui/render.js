const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const outputBox = document.getElementById('outputBox');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  console.log('[Renderer] 📂 Choose File button clicked');
  const result = await window.electronAPI.openFileDialog();
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    outputBox.textContent = 'Output will appear here...';
    runBtn.disabled = false;
  }
});

clearBtn.addEventListener('click', () => {
  console.log('[Renderer] 🗑️ Clear button clicked');
  selectedFilePath = '';
  selectedFileNameElem.textContent = 'No file selected yet.';
  outputBox.textContent = 'Output will appear here...';
  runBtn.disabled = true;
});

runBtn.addEventListener('click', async () => {
  console.log('[Renderer] 🚀 Run Script button clicked');
  if (!selectedFilePath) {
    alert('Please select a file first.');
    return;
  }
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  outputBox.textContent = 'Running script...';
  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode: selectedMode });
  outputBox.textContent = result || 'No output from script.';
});
