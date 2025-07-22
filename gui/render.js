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

    
    const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
    
    
    undoOption.classList.toggle('hidden', !hasBackup);
    diffLabel.classList.toggle('hidden', !hasBackup);

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
    if (result.includes('FILES ARE IDENTICAL')) {
      outputBoxLeft.innerHTML = '<div class="text-yellow-400">⚠️ Files are identical - no changes to show!</div>';
      return;
    }

    const lines = result.split('\n');
    const leftLines = [];
    const rightLines = [];
    
    let currentLeftLine = 0;
    let currentRightLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('@@')) {
        const match = line.match(/-(\d+),?\d* \+(\d+),?\d*/);
        if (match) {
          currentLeftLine = parseInt(match[1]);
          currentRightLine = parseInt(match[2]);
        }
        continue;
      }
      
      if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
        continue;
      }
      
      if (line.startsWith('-')) {
        const content = line.slice(1);
        if (content.trim()) {
          leftLines.push(`<div class="flex text-red-400 border-l-2 border-red-500 pl-2 py-1"><span class="w-12 text-right mr-3 text-white font-mono text-xs flex-shrink-0">${currentLeftLine}</span><span class="font-mono text-sm break-all">${escapeHtml(content)}</span></div>`);
        }
        currentLeftLine++;
      } else if (line.startsWith('+')) {
        const content = line.slice(1);
        if (content.trim()) {
          rightLines.push(`<div class="flex text-green-400 border-l-2 border-green-500 pl-2 py-1"><span class="w-12 text-right mr-3 text-white font-mono text-xs flex-shrink-0">${currentRightLine}</span><span class="font-mono text-sm break-all">${escapeHtml(content)}</span></div>`);
        }
        currentRightLine++;
      } else if (line.startsWith(' ')) {
        const content = line.slice(1);
        if (content.trim()) {
          leftLines.push(`<div class="flex text-gray-400 pl-2 py-1"><span class="w-12 text-right mr-3 text-gray-500 font-mono text-xs flex-shrink-0">${currentLeftLine}</span><span class="font-mono text-sm break-all">${escapeHtml(content)}</span></div>`);
          rightLines.push(`<div class="flex text-gray-400 pl-2 py-1"><span class="w-12 text-right mr-3 text-gray-500 font-mono text-xs flex-shrink-0">${currentRightLine}</span><span class="font-mono text-sm break-all">${escapeHtml(content)}</span></div>`);
        }
        currentLeftLine++;
        currentRightLine++;
      }
    }

    const actualRemovals = leftLines.filter(line => line.includes('text-red-400')).length;
    const actualAdditions = rightLines.filter(line => line.includes('text-green-400')).length;

    outputBoxLeft.innerHTML = leftLines.length > 0 ? 
      `<div class="text-red-300 font-semibold mb-3 text-sm border-b border-gray-600 pb-2">Changes (${actualRemovals} removed):</div>${leftLines.join('')}` : 
      '<div class="text-gray-400">No removals</div>';

    outputBoxRight.innerHTML = rightLines.length > 0 ? 
      `<div class="text-green-300 font-semibold mb-3 text-sm border-b border-gray-600 pb-2">Changes (${actualAdditions} added):</div>${rightLines.join('')}` : 
      '<div class="text-gray-400">No additions</div>';

    outputBoxRight.classList.remove('hidden');
    syncScrolling(outputBoxLeft, outputBoxRight);
  } else {
    outputBoxLeft.textContent = result;
  }

  
  const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
  undoOption.classList.toggle('hidden', !hasBackup);

  if (mode === 'fix') {
    
    diffLabel.classList.toggle('hidden', !hasBackup);
  } else if (mode === 'undo') {
    
    diffLabel.classList.add('hidden');
    undoOption.classList.add('hidden');
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