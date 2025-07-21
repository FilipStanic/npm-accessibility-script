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
    outputBoxLeft.innerHTML = '<span class="text-gray-400">Output will appear here...</span>';
    outputBoxRight.innerHTML = '';
    outputBoxRight.classList.add('hidden');
    runBtn.disabled = false;
    diffLabel.classList.add('hidden');
    undoOption.classList.add('hidden');

    modeToggles.forEach(el => el.classList.remove('hidden'));
    document.querySelector('input[value="fix"]').checked = true;
  }
});

clearBtn.addEventListener('click', () => {
  selectedFilePath = '';
  selectedFileNameElem.textContent = 'No file selected yet.';
  outputBoxLeft.innerHTML = '<span class="text-gray-400">Output will appear here...</span>';
  outputBoxRight.innerHTML = '';
  outputBoxRight.classList.add('hidden');
  runBtn.disabled = true;
  diffLabel.classList.add('hidden');
  undoOption.classList.add('hidden');
});

runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) return alert('Please select a file first.');
  const mode = document.querySelector('input[name="mode"]:checked').value;

  outputBoxLeft.innerHTML = '<span class="text-gray-400">Running...</span>';
  outputBoxRight.innerHTML = '';
  outputBoxRight.classList.add('hidden');

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode });

if (mode === 'diff') {
  const lines = result.split('\n');

  const leftLines = [];
  const rightLines = [];

  lines.forEach(line => {
    if (line.startsWith('-')) {
      leftLines.push(`<div class="text-red-400">- ${escapeHtml(line.slice(1))}</div>`);
    } else if (line.startsWith('+')) {
      rightLines.push(`<div class="text-green-400">+ ${escapeHtml(line.slice(1))}</div>`);
    } else if (line.trim() !== '') {
      const safe = `<div class="text-white">${escapeHtml(line)}</div>`;
      leftLines.push(safe);
      rightLines.push(safe);
    }
  });

  outputBoxLeft.innerHTML = leftLines.join('');
  outputBoxRight.innerHTML = rightLines.join('');
  outputBoxRight.classList.remove('hidden');
  syncScrolling(outputBoxLeft, outputBoxRight);
} else {
  outputBoxLeft.textContent = result;
}

  const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
  undoOption.classList.toggle('hidden', !hasBackup);

  if (mode === 'fix') {
    diffLabel.classList.remove('hidden');
  } else {
    diffLabel.classList.add('hidden');
  }
});

function syncScrolling(left, right) {
  let active = false;
  left.addEventListener('scroll', () => {
    if (!active) {
      active = true;
      right.scrollTop = left.scrollTop;
      active = false;
    }
  });
  right.addEventListener('scroll', () => {
    if (!active) {
      active = true;
      left.scrollTop = right.scrollTop;
      active = false;
    }
  });
}

function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}