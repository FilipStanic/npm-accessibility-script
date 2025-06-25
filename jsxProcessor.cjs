const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const chalk = require('chalk');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error(chalk.red('❌ Please provide a .jsx file.'));
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputFile);
fs.readFile(inputPath, 'utf8', (err, code) => {
  if (err) {
    console.error(chalk.red('❌ Failed to read file'), err);
    return;
  }

  let suggestions = 0;
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });

  traverse(ast, {
    JSXOpeningElement(path) {
      const name = path.node.name.name;

      if (name === 'img') {
        const hasAlt = path.node.attributes.some(attr => attr.name?.name === 'alt');
        if (!hasAlt) {
          const suggestion = `// 💡 Suggestion: <img> is missing alt text\n`;
          code = suggestion + code;
          suggestions++;
        }
      }

      if (name === 'input') {
        const hasAria = path.node.attributes.some(attr => attr.name?.name === 'aria-label');
        if (!hasAria) {
          const suggestion = `// 💡 Suggestion: <input> is missing aria-label\n`;
          code = suggestion + code;
          suggestions++;
        }
      }
    }
  });

  const outputPath = inputPath.replace(/\.jsx$/, '_suggested.jsx');
  fs.writeFileSync(outputPath, code, 'utf8');
  console.log(chalk.green(`💬 ${suggestions} suggestion(s) written to ${path.basename(outputPath)}\n`));
});
