const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const outputBoxLeft = document.getElementById('outputBoxLeft');
const outputBoxRight = document.getElementById('outputBoxRight');
const undoOption = document.getElementById('undoOption');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFileDialog();
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    outputBoxLeft.textContent = 'Output will appear here...';
    outputBoxRight.textContent = '';
    runBtn.disabled = false;

    const hasBackup = await window.electronAPI.checkBackup(result);
    undoOption.classList.toggle('hidden', !hasBackup);
  }
});

clearBtn.addEventListener('click', () => {
  selectedFilePath = '';
  selectedFileNameElem.textContent = 'No file selected yet.';
  outputBoxLeft.textContent = 'Output will appear here...';
  outputBoxRight.textContent = '';
  runBtn.disabled = true;
  undoOption.classList.add('hidden');
});

runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) {
    alert('Please select a file first.');
    return;
  }

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  outputBoxLeft.textContent = 'Running script...';
  outputBoxRight.textContent = '';

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode: selectedMode });

  if (selectedMode === 'diff') {
    outputBoxLeft.textContent = result || 'No differences.';
    outputBoxRight.textContent = '';
  } else {
    outputBoxLeft.textContent = result || 'No output.';
    outputBoxRight.textContent = '';
  }
});
