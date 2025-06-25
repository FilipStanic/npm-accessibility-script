#!/usr/bin/env node

import inquirer from 'inquirer';
import { exec } from 'child_process';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const testPagesPath = path.join(__dirname, '..', 'test-pages');
const htmlFiles = readdirSync(testPagesPath).filter(file => file.endsWith('.html'));


const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'file',
    message: 'Which HTML file do you want to analyze?',
    choices: htmlFiles
  },
  {
    type: 'list',
    name: 'mode',
    message: 'Choose a mode:',
    choices: ['fix', 'suggest']
  }
]);


const command = `node index.cjs ${answers.file} --mode=${answers.mode}`;
console.log(`\n🔧 Running: ${command}\n`);

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Error:', stderr);
  } else {
    console.log(stdout);
  }
});
