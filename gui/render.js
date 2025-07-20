runBtn.addEventListener('click', async () => {
  if (!selectedFilePath) return alert('Please select a file first.');
  const mode = document.querySelector('input[name="mode"]:checked').value;

  outputBoxLeft.innerHTML = '<p class="text-gray-400">Running...</p>';
  outputBoxRight.innerHTML = '';
  outputBoxRight.classList.add('hidden');

  const result = await window.electronAPI.runScript({ file: selectedFilePath, mode });

  if (mode === 'diff') {
    const lines = result.split('\n');
    const leftLines = [];
    const rightLines = [];

    lines.forEach(line => {
      if (line.startsWith('-')) {
        leftLines.push(`<div class="text-red-400"><code>${line.slice(1)}</code></div>`);
        rightLines.push(`<div><code></code></div>`);
      } else if (line.startsWith('+')) {
        leftLines.push(`<div><code></code></div>`);
        rightLines.push(`<div class="text-green-400"><code>${line.slice(1)}</code></div>`);
      } else if (line.startsWith('@@') || line.startsWith('diff') || line.startsWith('---') || line.startsWith('+++')) {
        
      } else {
        leftLines.push(`<div class="text-white"><code>${line}</code></div>`);
        rightLines.push(`<div class="text-white"><code>${line}</code></div>`);
      }
    });

    outputBoxLeft.innerHTML = `<div class="overflow-auto max-h-[600px] px-4">${leftLines.join('')}</div>`;
    outputBoxRight.innerHTML = `<div class="overflow-auto max-h-[600px] px-4">${rightLines.join('')}</div>`;

    outputBoxRight.classList.remove('hidden');
    outputBoxLeft.classList.remove('hidden');

    
    const leftScroll = outputBoxLeft.querySelector('div');
    const rightScroll = outputBoxRight.querySelector('div');
    if (leftScroll && rightScroll) {
      leftScroll.addEventListener('scroll', () => {
        rightScroll.scrollTop = leftScroll.scrollTop;
      });
      rightScroll.addEventListener('scroll', () => {
        leftScroll.scrollTop = rightScroll.scrollTop;
      });
    }

  } else {
    outputBoxLeft.innerText = result;
    outputBoxRight.innerHTML = '';
    outputBoxRight.classList.add('hidden');

    const hasBackup = await window.electronAPI.checkBackup(selectedFilePath);
    if (mode === 'fix') {
      diffLabel.classList.remove('hidden');
    } else {
      diffLabel.classList.add('hidden');
    }

    undoOption.classList.toggle('hidden', !hasBackup);
  }
});