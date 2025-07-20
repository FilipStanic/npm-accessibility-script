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
  console.log('Raw result from runScript:', result);

  if (mode === 'diff') {
    outputBoxRight.classList.remove('hidden');

    const lines = result.split('\n');

    const leftRendered = [];
    const rightRendered = [];

    lines.forEach(line => {
      if (line.startsWith('-')) {
        leftRendered.push(`<div class="text-red-400">${line.slice(1)}</div>`);
        rightRendered.push(`<div class="text-white"></div>`);
      } else if (line.startsWith('+')) {
        leftRendered.push(`<div class="text-white"></div>`);
        rightRendered.push(`<div class="text-green-400">${line.slice(1)}</div>`);
      } else {
        leftRendered.push(`<div class="text-white">${line}</div>`);
        rightRendered.push(`<div class="text-white">${line}</div>`);
      }
    });

    outputBoxLeft.innerHTML = leftRendered.join('');
    outputBoxRight.innerHTML = rightRendered.join('');
  } else {
    outputBoxLeft.textContent = result;

    const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);

    if (mode === 'fix') {
      diffLabel?.classList.remove('hidden');
    } else {
      diffLabel?.classList.add('hidden');
    }

    undoOption.classList.toggle('hidden', !hasBackup);
  }
});