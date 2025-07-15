const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');
const beautify = require('js-beautify').html;

const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.endsWith('.html'));
const modeArg = args.find(arg => arg.includes('--mode='));
const quietArg = args.includes('--quiet');

const mode = modeArg?.split('=')[1] === 'suggest' ? 'suggest' :
             modeArg?.split('=')[1] === 'undo' ? 'undo' : 'fix';

if (!fileArg) {
  console.error(chalk.red('❌ Please specify an HTML file to process'));
  process.exit(1);
}

const inputPath = path.join(process.cwd(), fileArg);
const inputFileName = path.basename(inputPath);
const backupDir = path.join(process.cwd(), 'backup');
fs.ensureDirSync(backupDir);
const backupPath = path.join(backupDir, `${inputFileName}.bak`);

if (mode === 'undo') {
  if (!fs.existsSync(backupPath)) {
    console.log(chalk.red('⚠️ No backup file found. Cannot undo.'));
    process.exit(1);
  }

  fs.copyFileSync(backupPath, inputPath);
  fs.removeSync(backupPath);
  console.log(chalk.green(`🔄 Restored from backup: ${inputFileName}`));
  console.log(chalk.gray('🗑️ Backup deleted after undo.'));
  process.exit(0);
}

// Create backup if it doesn't exist
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath);
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
        if (!quietArg) console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${src}">`));
      } else if (mode === 'suggest') {
        img.before(`<!-- Suggestion: Add alt="${fallback}" to <img src="${src}"> -->\n`);
        if (!quietArg) console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
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
        if (!quietArg) console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
      } else if (mode === 'suggest') {
        input.before(`<!-- Suggestion: Add aria-label="Input field" to <input> -->\n`);
        if (!quietArg) console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
      }
      fixes++;
    }
  });

  const finalHtml = beautify($.html(), {
    indent_size: 2,
    preserve_newlines: true,
    max_preserve_newlines: 2
  });

  fs.writeFile(inputPath, finalHtml, err => {
    if (err) {
      console.error(chalk.red('❌ Error writing output file:'), err);
    } else {
      const status =
        mode === 'fix'
          ? `✅ ${fixes} issue(s) fixed.\nFile updated: ${fileArg}`
          : `💬 ${fixes} suggestion(s) inserted directly into ${fileArg}`;
      console.log(chalk.yellow(`\n${status}\n`));
    }
  });
});
