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
  if (!selectedFilePath) return alert('Please select a file first.');
  const mode = document.querySelector('input[name="mode"]:checked').value;

  outputBoxLeft.textContent = 'Running...';
  outputBoxRight.textContent = '';

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode });

  if (mode === 'diff') {
    const lines = result.split('\n');
    const leftLines = lines.filter(line => line.startsWith('-')).map(line => line.slice(1));
    const rightLines = lines.filter(line => line.startsWith('+')).map(line => line.slice(1));

    outputBoxLeft.innerHTML = leftLines.length
      ? leftLines.map(l => `<div class="text-red-400">${l}</div>`).join('')
      : '<span class="text-gray-500">No removed content.</span>';

    outputBoxRight.innerHTML = rightLines.length
      ? rightLines.map(l => `<div class="text-green-400">${l}</div>`).join('')
      : '<span class="text-gray-500">No added content.</span>';
  } else {
    outputBoxLeft.textContent = result;
  }

  const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
  undoOption.classList.toggle('hidden', !hasBackup);
});
