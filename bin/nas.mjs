#!/usr/bin/env node

import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

const walkFiles = (dir, extList = ['.html', '.jsx'], fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkFiles(fullPath, extList, fileList);
    } else if (extList.includes(path.extname(fullPath))) {
      fileList.push(path.relative(process.cwd(), fullPath));
    }
  }
  return fileList;
};

const availableFiles = walkFiles(process.cwd());

if (availableFiles.length === 0) {
  console.log('❌ No .html or .jsx files found in the current folder or subfolders.');
  process.exit(1);
}

const { file, mode } = await inquirer.prompt([
  {
    type: 'list',
    name: 'file',
    message: '📄 Which file do you want to analyze?',
    choices: availableFiles,
  },
  {
    type: 'list',
    name: 'mode',
    message: '🛠 Choose a mode:',
    choices: ['fix', 'suggest'],
  }
]);

const ext = path.extname(file);
const command = ext === '.jsx'
  ? `node jsxProcessor.cjs "${file}"`
  : `node index.cjs "${file}" --mode=${mode}`;

console.log(`\n🔧 Running: ${command}\n`);

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  if (stderr) {
    console.error(stderr);
  }
  console.log(stdout);
});
