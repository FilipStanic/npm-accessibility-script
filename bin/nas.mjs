#!/usr/bin/env node

import inquirer from 'inquirer';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs-extra';
import crypto from 'crypto';
import { showDiff } from '../diffHelper.js'; 

const backupDir = path.join(process.cwd(), 'backup');
fs.ensureDirSync(backupDir);

function getUniqueBackupName(filePath) {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(path.resolve(filePath));
  const hash = crypto.createHash('md5').update(fileDir).digest('hex').substring(0, 8);
  const nameWithoutExt = path.parse(fileName).name;
  const ext = path.parse(fileName).ext;
  return `${nameWithoutExt}_${hash}${ext}.bak`;
}

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
      const targetPath = path.join(process.cwd(), answers.file);
      const backupFileName = getUniqueBackupName(targetPath);
      const backupPath = path.join(backupDir, backupFileName);
      const options = ['fix', 'suggest', 'diff'];
      if (fs.existsSync(backupPath)) options.push('undo');
      return options;
    },
  },
  {
    type: 'confirm',
    name: 'quiet',
    message: 'Show less detail in the logs?',
    default: false,
    when: (answers) => answers.mode !== 'undo' && answers.mode !== 'diff',
  },
]);

const ext = path.extname(file);
const quietFlag = quiet ? '--quiet' : '';
const targetPath = path.join(process.cwd(), file);
const backupFileName = getUniqueBackupName(targetPath);
const backupPath = path.join(backupDir, backupFileName);

if (mode === 'undo') {
  if (!fs.existsSync(backupPath)) {
    console.log('⚠️ No backup file found. Cannot undo.');
    console.log(`Looking for: ${backupPath}`);
    process.exit(1);
  }
  fs.copyFileSync(backupPath, targetPath);
  fs.removeSync(backupPath);
  console.log(`🔄 Restored from backup: ${path.basename(file)}`);
  console.log('🗑️ Backup deleted after undo.');
  process.exit(0);
}

if (mode === 'diff') {
  showDiff(backupPath, targetPath);
  process.exit(0);
}

const command =
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