#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const fileArg = process.argv[2];
const mode = process.argv[3]?.includes("fix") ? "fix" : "suggest";

if (!fileArg || !fileArg.endsWith(".jsx")) {
  console.error(chalk.red("❌ Please specify a JSX file"));
  process.exit(1);
}

const fullPath = path.join(process.cwd(), fileArg);
fs.readFile(fullPath, "utf8", (err, data) => {
  if (err) {
    console.error(chalk.red("❌ Failed to read file"), err);
    return;
  }

  const lines = data.split("\n");
  const updatedLines = [];
  let suggestions = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/<img\b[^>]*>/.test(line) && !/alt\s*=/.test(line)) {
      const srcMatch = line.match(/src\s*=\s*{?"([^"}]+)"/);
      const fallback = srcMatch?.[1]?.split("/").pop()?.split(".")[0] || "image";

      if (mode === "fix") {
        line = line.replace(/<img\b/, `<img alt="${fallback}"`);
        console.log(chalk.green(`✔️ Fixed alt="${fallback}" on <img src="${srcMatch?.[1] || ''}">`));
      } else {
        updatedLines.push(`{/* Suggestion: Add alt="${fallback}" to <img src="${srcMatch?.[1] || ''}"> */}`);
        console.log(chalk.blue(`💡 Suggest alt="${fallback}" for <img src="${srcMatch?.[1] || ''}">`));
      }
      suggestions++;
    }

    if (/<input\b[^>]*>/.test(line) && !/aria-label\s*=/.test(line)) {
      if (mode === "fix") {
        line = line.replace(/<input\b/, `<input aria-label="Input field"`);
        console.log(chalk.green(`✔️ Added aria-label to <input>`));
      } else {
        updatedLines.push(`{/* Suggestion: Add aria-label="Input field" to this input */}`);
        console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
      }
      suggestions++;
    }

    updatedLines.push(line);
  }

const outputFile = mode === "fix"
  ? path.join(path.dirname(fullPath), path.basename(fullPath).replace(/\.jsx$/, "_fixed.jsx"))
  : fullPath;

  fs.writeFile(outputFile, updatedLines.join("\n"), (err) => {
    if (err) {
      console.error(chalk.red("❌ Error writing output file:"), err);
    } else {
      const status =
        mode === "fix"
          ? `✅ ${suggestions} issue(s) fixed.\nOutput: ${path.basename(outputFile)}`
          : `💬 ${suggestions} suggestion(s) inserted directly into ${path.basename(outputFile)}`;
      console.log(chalk.yellow(`\n${status}\n`));
    }
  });
});
