const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const outputBoxLeft = document.getElementById('outputBoxLeft');
const outputBoxRight = document.getElementById('outputBoxRight');
const undoOption = document.getElementById('undoOption');
const diffLabel = document.getElementById('diffLabel');
const modeToggles = document.querySelectorAll('.mode-toggle');

let selectedFilePath = '';

selectFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFileDialog();
  if (result) {
    selectedFilePath = result;
    const fileName = result.split(/[/\\]/).pop();
    selectedFileNameElem.textContent = `Selected file: ${fileName}`;
    outputBoxLeft.textContent = 'Output will appear here...';
    outputBoxRight.textContent = '';
    outputBoxRight.classList.add('hidden');
    runBtn.disabled = false;
    diffLabel?.classList.add('hidden');
    undoOption.classList.add('hidden');
    modeToggles.forEach(el => el.classList.remove('hidden'));
    document.querySelector('input[value="fix"]').checked = true;
  }
});

clearBtn.addEventListener('click', () => {
  selectedFilePath = '';
  selectedFileNameElem.textContent = 'No file selected yet.';
  outputBoxLeft.textContent = 'Output will appear here...';
  outputBoxRight.textContent = '';
  outputBoxRight.classList.add('hidden');
  runBtn.disabled = true;
  diffLabel?.classList.add('hidden');
  undoOption.classList.add('hidden');
});

runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) return alert('Please select a file first.');
  const mode = document.querySelector('input[name="mode"]:checked').value;

  outputBoxLeft.textContent = 'Running...';
  outputBoxRight.textContent = '';
  outputBoxRight.classList.add('hidden');

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode });

  if (mode === 'diff') {
    const lines = result.split('\n');

    const leftLines = [];
    const rightLines = [];

    for (let line of lines) {
      if (line.startsWith('-')) {
        leftLines.push(`<div class="text-red-400">${line.slice(1)}</div>`);
        rightLines.push(`<div class="text-white">${line.slice(1)}</div>`);
      } else if (line.startsWith('+')) {
        leftLines.push(`<div class="text-white">${line.slice(1)}</div>`);
        rightLines.push(`<div class="text-green-400">${line.slice(1)}</div>`);
      } else {
        leftLines.push(`<div class="text-white">${line}</div>`);
        rightLines.push(`<div class="text-white">${line}</div>`);
      }
    }

    outputBoxLeft.innerHTML = leftLines.join('') || '<span class="text-gray-500">No removed content.</span>';
    outputBoxRight.innerHTML = rightLines.join('') || '<span class="text-gray-500">No added content.</span>';
    outputBoxRight.classList.remove('hidden');
    return;
  }

  
  outputBoxLeft.textContent = result;
  const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
  undoOption.classList.toggle('hidden', !hasBackup);

  if (mode === 'fix') {
    diffLabel?.classList.remove('hidden');
  } else {
    diffLabel?.classList.add('hidden');
  }
});