import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createTwoFilesPatch } from 'diff';
import chalk from 'chalk';
import Diff2Html from 'diff2html';

function getUniqueBackupName(filePath) {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(path.resolve(filePath));
  const hash = crypto.createHash('md5').update(fileDir).digest('hex').substring(0, 8);
  const nameWithoutExt = path.parse(fileName).name;
  const ext = path.parse(fileName).ext;
  return `${nameWithoutExt}_${hash}${ext}.bak`;
}

export function showDiff(originalPath, modifiedPath) {
  
  if (!path.isAbsolute(originalPath)) {
    const backupFileName = getUniqueBackupName(modifiedPath);
    originalPath = path.join(process.cwd(), 'backup', backupFileName);
  }
  
  if (!fs.existsSync(originalPath)) {
    console.log(chalk.red('❌ No backup file found. Cannot compare.'));
    console.log(chalk.gray(`Looking for: ${originalPath}`));
    process.exit(1);
  }

  const original = fs.readFileSync(originalPath, 'utf-8');
  const modified = fs.readFileSync(modifiedPath, 'utf-8');

  if (original === modified) {
    console.log(chalk.yellow('⚠️ Files are identical - no changes to show!'));
    return;
  }

  const patch = createTwoFilesPatch(
    path.basename(originalPath),
    path.basename(modifiedPath),
    original,
    modified,
    '', ''
  );

  const jsonDiff = Diff2Html.parse(patch, {
    inputFormat: 'diff',
    showFiles: true,
    matching: 'lines'
  });

  jsonDiff.forEach(part => {
    console.log(chalk.cyan.bold(`\nFile: ${part.fileName}`));
    part.blocks.forEach(block => {
      block.lines.forEach(line => {
        if (line.type === 'insert') {
          console.log(chalk.green(`+ ${line.content}`));
        } else if (line.type === 'delete') {
          console.log(chalk.red(`- ${line.content}`));
        } else {
          console.log(`  ${line.content}`);
        }
      });
    });
  });
}