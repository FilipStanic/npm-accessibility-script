const fs = require('fs-extra');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const chalk = require('chalk');

const file = process.argv[2];
const mode = process.argv[3];
const quiet = process.argv.includes('--quiet');
const inputPath = path.join(process.cwd(), file);
const fileBase = path.basename(file);
const backupDir = path.join(process.cwd(), 'backup');
const backupPath = path.join(backupDir, `${fileBase}.bak`);

fs.ensureDirSync(backupDir);

if (mode !== 'undo' && !fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath);
}

if (mode === 'undo') {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, inputPath);
    fs.removeSync(backupPath);
    console.log(`🔄 Restored from backup: ${fileBase}`);
    console.log(`🗑️ Backup deleted after undo.`);
  } else {
    console.log('⚠️ No backup file found.');
  }
  process.exit(0);
}

const code = fs.readFileSync(inputPath, 'utf-8');
const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx'],
});

let fixes = 0;

traverse(ast, {
  JSXElement(path) {
    const opening = path.node.openingElement;
    const tag = opening.name.name;

    if (tag === 'img') {
      const hasAlt = opening.attributes.some(attr => attr.name?.name === 'alt');
      if (!hasAlt) {
        const srcAttr = opening.attributes.find(attr => attr.name?.name === 'src');
        const src = srcAttr?.value?.value || 'image';
        const fallback = src.split('/').pop()?.split('.')[0] || 'image';

        if (mode === 'fix') {
          opening.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: 'alt' },
            value: { type: 'StringLiteral', value: fallback },
          });
          if (!quiet) console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${src}">`));
        } else {
          const comment = {
            type: 'CommentLine',
            value: ` Suggestion: Add alt="${fallback}" to img src="${src}" `,
            loc: null
          };
          
          if (path.node.leadingComments) {
            path.node.leadingComments.push(comment);
          } else {
            path.node.leadingComments = [comment];
          }
          
          if (!quiet) console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
        }

        fixes++;
      }
    }

    if (tag === 'input') {
      const hasAria = opening.attributes.some(attr => attr.name?.name === 'aria-label');
      const hasId = opening.attributes.find(attr => attr.name?.name === 'id');

      if (!hasAria && !hasId) {
        if (mode === 'fix') {
          opening.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: 'aria-label' },
            value: { type: 'StringLiteral', value: 'Input field' },
          });
          if (!quiet) console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
        } else {
          const comment = {
            type: 'CommentLine',
            value: ` Suggestion: Add aria-label="Input field" to input `,
            loc: null
          };
          
          if (path.node.leadingComments) {
            path.node.leadingComments.push(comment);
          } else {
            path.node.leadingComments = [comment];
          }
          
          if (!quiet) console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
        }

        fixes++;
      }
    }
  },
});

const output = generate(ast, { 
  comments: true,
  compact: false,
  retainLines: true
}, code).code;
fs.writeFileSync(inputPath, output);

console.log(
  chalk.yellow(
    `\n${mode === 'fix' ? `✅ ${fixes} issue(s) fixed.` : `💬 ${fixes} suggestion(s) inserted.`}\nFile updated: ${fileBase}\n`
  )
);