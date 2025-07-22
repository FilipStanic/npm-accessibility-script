const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const [file, modeArg, quietArg] = process.argv.slice(2);
const mode = modeArg === 'fix' ? 'fix' : 'suggest';
const quiet = quietArg === '--quiet';

function getUniqueBackupName(filePath) {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(path.resolve(filePath));
  const hash = crypto.createHash('md5').update(fileDir).digest('hex').substring(0, 8);
  const nameWithoutExt = path.parse(fileName).name;
  const ext = path.parse(fileName).ext;
  return `${nameWithoutExt}_${hash}${ext}.bak`;
}

const inputPath = path.resolve(file);
const inputFileName = path.basename(file);
const backupDir = path.join(process.cwd(), 'backup');
const backupFileName = getUniqueBackupName(inputPath);
const backupPath = path.join(backupDir, backupFileName);

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath);
  if (!quiet) console.log(chalk.gray(`📄 Created backup: ${backupFileName}`));
}

const code = fs.readFileSync(inputPath, 'utf8');

let ast;
try {
  ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });
} catch (err) {
  console.error(chalk.red('❌ Failed to parse JSX file:'), err.message);
  process.exit(1);
}

let changes = 0;

traverse(ast, {
  JSXOpeningElement(path) {
    const tag = path.node.name.name;

    if (tag === 'img') {
      const hasAlt = path.node.attributes.some(attr => attr.name?.name === 'alt');
      const srcAttr = path.node.attributes.find(attr => attr.name?.name === 'src');
      const src = srcAttr?.value?.value || '';
      const fallback = src.split('/').pop()?.split('.')[0] || 'image';

      if (!hasAlt) {
        if (mode === 'fix') {
          path.node.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: 'alt' },
            value: { type: 'StringLiteral', value: fallback }
          });
          if (!quiet) console.log(chalk.green(`✔️ Added alt="${fallback}" to <img src="${src}">`));
        } else if (mode === 'suggest') {
          const comment = ` Suggestion: Add alt="${fallback}" to img src="${src}" `;
          path.addComment('leading', comment);
          if (!quiet) console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
        }
        changes++;
      }
    }

    if (tag === 'input') {
      const hasLabel = path.node.attributes.some(attr => attr.name?.name === 'aria-label');
      if (!hasLabel) {
        if (mode === 'fix') {
          path.node.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: 'aria-label' },
            value: { type: 'StringLiteral', value: 'Input field' }
          });
          if (!quiet) console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
        } else if (mode === 'suggest') {
          const comment = ' Suggestion: Add aria-label="Input field" to input ';
          path.addComment('leading', comment);
          if (!quiet) console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
        }
        changes++;
      }
    }
  }
});

const { code: output } = generate(ast, { comments: true }, code);
fs.writeFileSync(inputPath, output);

if (mode === 'fix') {
  console.log(chalk.yellow(`\n✅ ${changes} issue(s) fixed.\nFile updated: ${file}\n`));
} else {
  console.log(chalk.yellow(`\n💬 ${changes} suggestion(s) inserted directly into ${file}\n`));
}