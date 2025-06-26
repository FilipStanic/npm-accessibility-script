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

const fullPath = path.resolve(process.cwd(), fileArg);

fs.readFile(fullPath, "utf8", (err, data) => {
  if (err) {
    console.error(chalk.red("❌ Failed to read file:"), err);
    return;
  }

  const lines = data.split("\n");
  const updatedLines = [];
  let suggestions = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const suggestionsToInsert = [];


    if (/<img\b[^>]*>/.test(line) && !/alt\s*=/.test(line)) {
      const srcMatch = line.match(/src\s*=\s*{?"([^"}]+)"/);
      const src = srcMatch?.[1] || "";
      const fallback = src.split("/").pop()?.split(".")[0] || "image";

      const imgTag = src ? `<img src="${src}">` : "<img>";

      if (mode === "fix") {
        line = line.replace(/<img\b/, `<img alt="${fallback}"`);
        console.log(chalk.green(`✔️ Fixed alt="${fallback}" on ${imgTag}`));
      } else {
        suggestionsToInsert.push(`// Suggestion: Add alt="${fallback}" to the image element below`);
        console.log(chalk.blue(`💡 Suggest alt="${fallback}" for ${imgTag}`));
      }

      suggestions++;
    }


    if (/<input\b[^>]*>/.test(line) && !/aria-label\s*=/.test(line)) {
      if (mode === "fix") {
        line = line.replace(/<input\b/, `<input aria-label="Input field"`);
        console.log(chalk.green(`✔️ Added aria-label to <input>`));
      } else {
        suggestionsToInsert.push(`// Suggestion: Add aria-label="Input field" to the input element below`);
        console.log(chalk.blue(`💡 Suggest aria-label="Input field" for <input>`));
      }

      suggestions++;
    }

    if (mode === "suggest" && suggestionsToInsert.length > 0) {
      updatedLines.push(...suggestionsToInsert);
    }

    updatedLines.push(line);
  }

  if (mode === "fix") {
    const outputPath = fullPath.replace(/\.jsx$/, "_fixed.jsx");
    fs.writeFile(outputPath, updatedLines.join("\n"), (err) => {
      if (err) {
        console.error(chalk.red("❌ Error writing output file:"), err);
      } else {
        console.log(
          chalk.yellow(`✅ ${suggestions} issue(s) fixed.\nOutput: ${path.basename(outputPath)}\n`)
        );
      }
    });
  } else {
    fs.writeFile(fullPath, updatedLines.join("\n"), (err) => {
      if (err) {
        console.error(chalk.red("❌ Error writing suggestions:"), err);
      } else {
        console.log(
          chalk.yellow(`💬 ${suggestions} suggestion(s) inserted directly into ${fileArg}\n`)
        );
      }
    });
  }
});
