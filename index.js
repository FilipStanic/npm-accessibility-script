const fs = require('fs-extra');
const cheerio = require('cheerio');
const path = require('path');
const chalk = require('chalk');

const inputPath = path.join(__dirname, 'test-pages', 'test1.html');
const outputPath = path.join(__dirname, 'test-pages', 'output1.html');

fs.readFile(inputPath, 'utf-8', (err, html) => {
  if (err) {
    console.error(chalk.red('Error reading file:'), err);
    return;
  }

  const $ = cheerio.load(html);

  let fixes = 0;

  $('img').each((i, el) => {
    const img = $(el);
    const alt = img.attr('alt');
    const src = img.attr('src') || '';

    if (!alt || alt.trim() === '') {
      const fallback = src.split('/').pop().split('.')[0] || 'image';
      img.attr('alt', fallback);
      fixes++;
      console.log(chalk.yellow(`✔️ Added alt="${fallback}" to <img src="${src}">`));
    }
  });

  fs.writeFile(outputPath, $('body').html(), err => {
    if (err) {
      console.error(chalk.red('Error writing file:'), err);
    } else {
      console.log(chalk.green(`\n✅ Done! Fixed ${fixes} image(s). Output saved to test-pages/output1.html`));
    }
  });
});
