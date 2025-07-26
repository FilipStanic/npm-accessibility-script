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

function getDirectoryContents(currentPath) {
  const items = [];
  
  
  const parentPath = path.dirname(currentPath);
  if (parentPath !== currentPath) {
    items.push({
      name: '📁 .. (Go back)',
      value: { type: 'directory', path: parentPath },
      short: '..'
    });
  }
  
  try {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    
    entries
      .filter(entry => entry.isDirectory())
      .filter(entry => !['node_modules', '.git', 'backup', 'dist', 'build', '.next'].includes(entry.name))
      .forEach(entry => {
        items.push({
          name: `📁 ${entry.name}/`,
          value: { type: 'directory', path: path.join(currentPath, entry.name) },
          short: entry.name
        });
      });
    
    
    entries
      .filter(entry => entry.isFile())
      .filter(entry => ['.html', '.jsx'].includes(path.extname(entry.name)))
      .forEach(entry => {
        const icon = entry.name.endsWith('.jsx') ? '⚛️' : '🌐';
        items.push({
          name: `${icon} ${entry.name}`,
          value: { type: 'file', path: path.join(currentPath, entry.name) },
          short: entry.name
        });
      });
      
  } catch (err) {
    console.log(`❌ Cannot read directory: ${err.message}`);
  }
  
  return items;
}

async function selectFile() {
  let currentPath = process.cwd();
  
  while (true) {
    console.clear();
    console.log(`📂 Current folder: ${currentPath}`);
    console.log('🔍 Navigate to find your HTML or JSX files\n');
    
    const items = getDirectoryContents(currentPath);
    
    if (items.length === 0) {
      console.log('📭 No folders or HTML/JSX files found here.');
      console.log('Press Enter to go back...');
      await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
      continue;
    }
    
    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: 'Choose a folder to enter or file to work with:',
        choices: items,
        pageSize: 15
      }
    ]);
    
    if (selection.type === 'directory') {
      currentPath = selection.path;
    } else if (selection.type === 'file') {
      return path.relative(process.cwd(), selection.path);
    }
  }
}

const file = await selectFile();

const { mode, quiet } = await inquirer.prompt([
  {
    type: 'list',
    name: 'mode',
    message: '🛠 Choose a mode:',
    choices: (answers) => {
      const targetPath = path.join(process.cwd(), file);
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