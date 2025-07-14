#!/usr/bin/env node

import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs-extra';

const backupDir = path.join(process.cwd(), 'backup');
fs.ensureDirSync(backupDir);

const walkFiles = (dir, extList = ['.html', '.jsx'], fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    const isIgnored = fullPath.includes('node_modules') || fullPath.includes('backup');
    if (stat.isDirectory() && !isIgnored) {
      walkFiles(fullPath, extList, fileList);
    } else if (!isIgnored && extList.includes(path.extname(fullPath))) {
      fileList.push(path.relative(process.cwd(), fullPath));
    }
  }
  return fileList;
};

const availableFiles = walkFiles(process.cwd());
if (availableFiles.length === 0) {
  console.log('❌ No .html or .jsx files found in this folder or its subfolders.');
  process.exit(1);
}

const { file, mode, quiet } = await inquirer.prompt([
  {
    type: 'list',
    name: 'file',
    message: '📄 Which file do you want to work with?',
    choices: availableFiles,
  },
  {
    type: 'list',
    name: 'mode',
    message: '🛠 Choose a mode:',
    choices: (answers) => {
      const fileBase = path.basename(answers.file);
      const backupPath = path.join(backupDir, `${fileBase}.bak`);
      const options = ['fix', 'suggest'];
      if (fs.existsSync(backupPath)) options.push('undo');
      return options;
    },
  },
  {
    type: 'confirm',
    name: 'quiet',
    message: 'Show less detail in the logs?',
    default: false,
    when: (answers) => answers.mode !== 'undo',
  },
]);

const ext = path.extname(file);
const quietFlag = quiet ? '--quiet' : '';
let command;

if (mode === 'undo') {
  const fileBase = path.basename(file);
  const targetPath = path.join(process.cwd(), file);
  const backupPath = path.join(backupDir, `${fileBase}.bak`);

  if (!fs.existsSync(backupPath)) {
    console.log('⚠️ No backup file found. Cannot undo.');
    process.exit(1);
  }

  fs.copyFileSync(backupPath, targetPath);
  fs.unlinkSync(backupPath);
  console.log(`🔄 Restored from backup: ${fileBase}`);
  console.log('🗑️ Backup deleted after undo.');
  process.exit(0);
}

command =
  ext === '.jsx'
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
