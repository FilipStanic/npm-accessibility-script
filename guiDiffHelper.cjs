const fs = require('fs');
const path = require('path');
const { createTwoFilesPatch } = require('diff');

const [,, originalPath, modifiedPath] = process.argv;

if (!fs.existsSync(originalPath)) {
  console.log('⚠️ No backup file found. Cannot compare.');
  process.exit(1);
}

const original = fs.readFileSync(originalPath, 'utf-8');
const modified = fs.readFileSync(modifiedPath, 'utf-8');

if (original === modified) {
  console.log('⚠️ FILES ARE IDENTICAL - No changes to show!');
  process.exit(0);
}

const patch = createTwoFilesPatch(
  path.basename(originalPath),
  path.basename(modifiedPath),
  original,
  modified,
  '', '',
  { context: 2 }
);

const lines = patch.split('\n');
const processedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('@@')) {
    processedLines.push(line);
    continue;
  }
  
  if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
    continue;
  }
  
  if (line.startsWith('-') || line.startsWith('+') || line.startsWith(' ')) {
    const content = line.slice(1);
    
    if (line.startsWith('-') || line.startsWith('+')) {
      if (content.trim() !== '') {
        processedLines.push(line);
      }
    } else if (line.startsWith(' ')) {
      if (content.trim() !== '') {
        processedLines.push(line);
      }
    }
  }
}

console.log(processedLines.join('\n'));