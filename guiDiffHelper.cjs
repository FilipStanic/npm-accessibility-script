const fs = require('fs');
const path = require('path');
const { createTwoFilesPatch } = require('diff');

const [,, originalPath, modifiedPath] = process.argv;

if (!fs.existsSync(originalPath)) {
  console.error('⚠️ No backup file found. Cannot compare.');
  process.exit(1);
}

const original = fs.readFileSync(originalPath, 'utf-8');
const modified = fs.readFileSync(modifiedPath, 'utf-8');

const patch = createTwoFilesPatch(
  path.basename(originalPath),
  path.basename(modifiedPath),
  original,
  modified,
  '', ''
);

console.log(patch);