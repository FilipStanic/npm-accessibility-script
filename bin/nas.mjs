#!/usr/bin/env node

import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';

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

const { file, mode, quiet } = await inquirer.prompt([
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
  },
  {
    type: 'confirm',
    name: 'quiet',
    message: '🤫 Suppress per-element logs?',
    default: false,
  }
]);

const ext = path.extname(file);
const quietFlag = quiet ? '--quiet' : '';
const command = ext === '.jsx'
  ? `node jsxProcessor.cjs "${file}" ${mode} ${quietFlag}`
  : `node index.cjs "${file}" --mode=${mode} ${quietFlag}`;

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
