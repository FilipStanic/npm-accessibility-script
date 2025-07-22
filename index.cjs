const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');

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

function getUniqueBackupName(filePath) {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(path.resolve(filePath));
  const hash = crypto.createHash('md5').update(fileDir).digest('hex').substring(0, 8);
  const nameWithoutExt = path.parse(fileName).name;
  const ext = path.parse(fileName).ext;
  return `${nameWithoutExt}_${hash}${ext}.bak`;
}

const inputPath = path.join(process.cwd(), fileArg);
const inputFileName = path.basename(inputPath);
const backupDir = path.join(process.cwd(), 'backup');
fs.ensureDirSync(backupDir);
const backupFileName = getUniqueBackupName(inputPath);
const backupPath = path.join(backupDir, backupFileName);

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

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath);
  if (!quietArg) console.log(chalk.gray(`📄 Created backup: ${backupFileName}`));
}

fs.readFile(inputPath, 'utf-8', (err, html) => {
  if (err) {
    console.error(chalk.red('❌ Error reading input file:'), err);
    return;
  }

  let modifiedHtml = html;
  let fixes = 0;

  if (mode === 'fix') {
    
    modifiedHtml = modifiedHtml.replace(/<img([^>]*?)>/gis, (match, attributes) => {
      if (!/\salt\s*=/i.test(attributes)) {
        const srcMatch = attributes.match(/\ssrc\s*=\s*["']([^"']*?)["']/i);
        const src = srcMatch ? srcMatch[1] : '';
        const fallback = src.split('/').pop()?.split('.')[0] || 'image';
        
        if (!quietArg) console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${src}">`));
        fixes++;
        
        
        return match.replace('>', ` alt="${fallback}">`);
      }
      return match;
    });

    
    modifiedHtml = modifiedHtml.replace(/<input([^>]*?)>/gis, (match, attributes) => {
      if (!/\saria-label\s*=/i.test(attributes)) {
        const idMatch = attributes.match(/\sid\s*=\s*["']([^"']*?)["']/i);
        const hasLabel = idMatch && modifiedHtml.includes(`for="${idMatch[1]}"`);
        
        if (!hasLabel) {
          if (!quietArg) console.log(chalk.green(`✔️ Added aria-label="Input field" to <input>`));
          fixes++;
          
          
          if (match.endsWith('/>')) {
            return match.replace('/>', ' aria-label="Input field"/>');
          } else {
            return match.replace('>', ' aria-label="Input field">');
          }
        }
      }
      return match;
    });
    
  } else if (mode === 'suggest') {
    modifiedHtml = modifiedHtml.replace(/<img([^>]*?)>/gis, (match, attributes) => {
      if (!/\salt\s*=/i.test(attributes)) {
        const srcMatch = attributes.match(/\ssrc\s*=\s*["']([^"']*?)["']/i);
        const src = srcMatch ? srcMatch[1] : '';
        const fallback = src.split('/').pop()?.split('.')[0] || 'image';
        
        if (!quietArg) console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${src}">`));
        fixes++;
        
        return `<!-- Suggestion: Add alt="${fallback}" to <img src="${src}"> -->\n${match}`;
      }
      return match;
    });

    modifiedHtml = modifiedHtml.replace(/<input([^>]*?)>/gis, (match, attributes) => {
      if (!/\saria-label\s*=/i.test(attributes)) {
        const idMatch = attributes.match(/\sid\s*=\s*["']([^"']*?)["']/i);
        const hasLabel = idMatch && modifiedHtml.includes(`for="${idMatch[1]}"`);
        
        if (!hasLabel) {
          if (!quietArg) console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
          fixes++;
          
          return `<!-- Suggestion: Add aria-label="Input field" to <input> -->\n${match}`;
        }
      }
      return match;
    });
  }

  fs.writeFile(inputPath, modifiedHtml, err => {
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