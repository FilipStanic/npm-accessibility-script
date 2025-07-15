const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');

const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.endsWith('.html'));
const modeArg = args.find(arg => arg.includes('--mode='));
const mode = modeArg?.split('=')[1] || 'fix';
const quiet = args.includes('--quiet');

if (!fileArg) {
  console.error(chalk.red('❌ Please specify an HTML file to process'));
  process.exit(1);
}

const inputPath = path.join(process.cwd(), fileArg);
const fileBase = path.basename(fileArg);
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
    console.log('🗑️ Backup deleted after undo.');
  } else {
    console.log('⚠️ No backup file found.');
  }
  process.exit(0);
}

const html = fs.readFileSync(inputPath, 'utf-8');
const $ = cheerio.load(html, { decodeEntities: false });
let fixes = 0;

$('img').each((_, el) => {
  const img = $(el);
  const alt = img.attr('alt');
  const src = img.attr('src') || '';
  const fallback = src.split('/').pop()?.split('.')[0] || 'image';

  if (!alt || alt.trim() === '') {
    if (mode === 'fix') {
      img.attr('alt', fallback);
      if (!quiet) console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${src}">`));
    } else {
      img.before(`<!-- Suggestion: Add alt="${fallback}" to <img src="${src}"> -->\n`);
      if (!quiet) console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
    }
    fixes++;
  }
});

$('input').each((_, el) => {
  const input = $(el);
  const hasLabel = input.attr('aria-label');
  const id = input.attr('id');
  const hasLabelTag = id && $(`label[for="${id}"]`).length > 0;

  if (!hasLabel && !hasLabelTag) {
    if (mode === 'fix') {
      input.attr('aria-label', 'Input field');
      if (!quiet) console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
    } else {
      input.before(`<!-- Suggestion: Add aria-label="Input field" to <input> -->\n`);
      if (!quiet) console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
    }
    fixes++;
  }
});

fs.writeFileSync(inputPath, $.html());

console.log(
  chalk.yellow(
    `\n${mode === 'fix' ? `✅ ${fixes} issue(s) fixed.` : `💬 ${fixes} suggestion(s) inserted.`}\nFile updated: ${fileBase}\n`
  )
);
