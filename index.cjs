const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');

const args = process.argv.slice(2); 
const fileArg = args.find(arg => arg.endsWith('.html'));
const modeArg = args.find(arg => arg.includes('--mode='));
const mode = modeArg?.split('=')[1] === 'suggest' ? 'suggest' : 'fix';

console.log(chalk.gray(`Debug: args = ${JSON.stringify(args)}`));
console.log(chalk.gray(`Debug: fileArg = ${fileArg}`));
console.log(chalk.gray(`Debug: modeArg = ${modeArg}`));
console.log(chalk.gray(`Debug: mode = ${mode}`));

if (!fileArg) {
  console.error(chalk.red('❌ Please specify an HTML file to process'));
  console.log(chalk.yellow('Usage: npm start -- filename.html [--mode=suggest|fix]'));
  process.exit(1);
}

const inputPath = path.join(__dirname, 'test-pages', fileArg);
const inputFileName = path.basename(inputPath, '.html');

let outputPath;
if (mode === 'fix') {
  outputPath = path.join(__dirname, 'test-pages', `${inputFileName}_fixed.html`);
} else {
  outputPath = inputPath;
}

if (mode === 'suggest') {
  console.log(
    chalk.magenta(
      `\n💬 SUGGEST MODE ENABLED — writing suggestions directly into: ${fileArg}\n`
    )
  );
}

fs.readFile(inputPath, 'utf-8', (err, html) => {
  if (err) {
    console.error(chalk.red('❌ Error reading input file:'), err);
    return;
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  let fixes = 0;

  $('img').each((i, el) => {
    const img = $(el);
    const alt = img.attr('alt');
    const src = img.attr('src') || '';
    const fallback = src.split('/').pop()?.split('.')[0] || 'image';

    if (!alt || alt.trim() === '') {
      if (mode === 'fix') {
        img.attr('alt', fallback);
        console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${src}">`));
      } else {
        img.before(`<!-- Suggestion: Add alt="${fallback}" to this image -->\n      `);
        console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
      }
      fixes++;
    }
  });

  $('input').each((i, el) => {
    const input = $(el);
    const hasLabel = input.attr('aria-label');
    const id = input.attr('id');
    const hasLabelTag = id && $(`label[for="${id}"]`).length > 0;

    if (!hasLabel && !hasLabelTag) {
      if (mode === 'fix') {
        input.attr('aria-label', 'Input field');
        console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
      } else {
        input.before(`<!-- Suggestion: Add aria-label="Input field" to this input -->\n      `);
        console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
      }
      fixes++;
    }
  });

  fs.writeFile(outputPath, $.html(), err => {
    if (err) {
      console.error(chalk.red('❌ Error writing output file:'), err);
    } else {
      const status =
        mode === 'fix'
          ? `✅ ${fixes} issue(s) fixed.\nOutput: ${inputFileName}_fixed.html`
          : `💬 ${fixes} suggestion(s) inserted directly into ${fileArg}`;
      console.log(chalk.yellow(`\n${status}\n`));
    }
  });
});