import fs from 'fs';
import path from 'path';
import { createTwoFilesPatch } from 'diff';
import chalk from 'chalk';
import Diff2Html from 'diff2html';

export function showDiff(originalPath, modifiedPath) {
  if (!fs.existsSync(originalPath)) {
    console.log(chalk.red('❌ No backup file found. Cannot compare.'));
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
