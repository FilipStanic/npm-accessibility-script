const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileNameElem = document.getElementById('selectedFileName');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const outputBoxLeft = document.getElementById('outputBoxLeft');
const outputBoxRight = document.getElementById('outputBoxRight');
const undoOption = document.getElementById('undoOption');
const diffLabel = document.getElementById('diffLabel');
const modeToggles = document.querySelectorAll('.mode-toggle');
const outputWrapper = document.getElementById('outputWrapper');

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
    outputWrapper.classList.remove('flex-row');
    outputWrapper.classList.add('justify-center');
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
  outputWrapper.classList.remove('flex-row');
  outputWrapper.classList.add('justify-center');
});

runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) return alert('Please select a file first.');
  const mode = document.querySelector('input[name="mode"]:checked').value;

  outputBoxLeft.innerHTML = '<span class="text-gray-400">Running...</span>';
  outputBoxRight.innerHTML = '';
  outputBoxRight.classList.add('hidden');
  outputWrapper.classList.remove('flex-row');
  outputWrapper.classList.add('justify-center');

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode });

  if (mode === 'diff') {
    const [original, modified] = result.split(/^@@.*?@@$/m);

    const coloredLeft = highlightDiff(original.trim(), 'left');
    const coloredRight = highlightDiff(modified.trim(), 'right');

    outputBoxLeft.innerHTML = `<pre>${coloredLeft}</pre>`;
    outputBoxRight.innerHTML = `<pre>${coloredRight}</pre>`;

    outputBoxRight.classList.remove('hidden');

    outputWrapper.classList.remove('justify-center');
    outputWrapper.classList.add('flex-row');

    syncScrolling(outputBoxLeft, outputBoxRight);
  } else {
    outputBoxLeft.textContent = result;
  }

  const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
  undoOption.classList.toggle('hidden', !hasBackup);
  diffLabel.classList.toggle('hidden', mode !== 'fix');
});

function highlightDiff(text, side) {
  return text
    .split('\n')
    .filter(line => {
      if (side === 'left') {
        return !line.startsWith('+') || line.startsWith('+++'); 
      } else {
        return !line.startsWith('-') || line.startsWith('---'); 
      }
    })
    .map(line => {
      const escaped = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (line.startsWith('+++') && side === 'right') {
        return `<span class="text-green-400">${escaped}</span>`;
      }
      if (line.startsWith('---') && side === 'left') {
        return `<span class="text-red-400">${escaped}</span>`;
      }

      if (line.startsWith('+') && side === 'right') {
        return `<span class="text-green-400">${escaped}</span>`;
      }
      if (line.startsWith('-') && side === 'left') {
        return `<span class="text-red-400">${escaped}</span>`;
      }

      return `<span class="text-white">${escaped}</span>`;
    })
    .join('\n');
}

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