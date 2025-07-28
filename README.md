# NPM Accessibility Script (NAS)

An automated tool for identifying and fixing common web accessibility issues in HTML and JSX files. This tool helps developers improve their websites' accessibility by automatically adding missing alt attributes to images and aria-labels to form inputs.

## 🚀 Features

- **Dual Interface**: Command-line tool and desktop GUI application
- **Multiple Modes**: Fix issues automatically or get suggestions for manual implementation
- **File Support**: Works with both HTML and JSX files
- **Safe Operations**: Automatic backup system with undo functionality
- **Visual Diff**: Compare original and modified files side-by-side
- **Cross-Platform**: Works on Windows, macOS and Linux

## 📋 What It Fixes

- **Missing Alt Text**: Automatically adds descriptive alt attributes to `<img>` elements
- **Unlabeled Inputs**: Adds `aria-label` attributes to form inputs without proper labels
- **WCAG Compliance**: Helps meet Web Content Accessibility Guidelines standards

## 🛠 Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Install Dependencies
```bash
npm install
```

## 💻 Usage

### Command Line Interface (CLI)

Run the interactive CLI tool:
```bash
nas
```

The CLI will guide you through:
1. **File Selection**: Navigate folders to find HTML/JSX files
2. **Mode Selection**: Choose between fix, suggest, diff, or undo
3. **Processing**: View results and backup information

### Graphical User Interface (GUI)

Launch the desktop application:
```bash
npm run gui
```

The GUI provides:
- **File Browser**: Click to select files graphically
- **Mode Options**: Radio buttons for different operations
- **Live Output**: Real-time results display
- **Diff Viewer**: Side-by-side comparison of changes

## 🔧 Modes Explained

### Fix Mode
- Automatically applies accessibility improvements
- Creates backup before making changes
- Shows count of issues resolved

### Suggest Mode
- Inserts HTML comments with recommended fixes
- Doesn't modify original code structure
- Useful for manual review and implementation

### Diff Mode
- Shows side-by-side comparison of original vs. modified files
- Color-coded additions (green) and removals (red)
- Line-by-line highlighting of changes

### Undo Mode
- Restores files from automatic backups
- Removes backup file after restoration
- Only available when backup exists

## 📁 Project Structure

```
npm-accessibility-script/
├── bin/
│   └── nas.mjs              # CLI entry point
├── gui/
│   ├── main.cjs             # Electron main process
│   ├── render.js            # GUI frontend logic
│   ├── index.html           # GUI interface
│   └── preload.js           # Electron security bridge
├── Bistro Delight/          # Test website files
│   ├── index.html
│   ├── menu.html
│   └── contact.html
├── backup/                  # Automatic backups (created when needed)
├── index.cjs                # HTML processor
├── jsxProcessor.cjs         # JSX processor
├── diffHelper.js            # Diff utilities
├── guiDiffHelper.cjs        # GUI diff processing
└── package.json
```

## 🧪 Testing

The project includes a test website called "Bistro Delight" with intentional accessibility issues:

- **Homepage** (`Bistro Delight/index.html`): Complex layout with various accessibility violations
- **Menu** (`Bistro Delight/menu.html`): Food images without alt text
- **Contact** (`Bistro Delight/contact.html`): Forms with missing labels


## 📊 Results

Testing on the Bistro Delight website showed:
- **Homepage**: 64 → 91 points (+42% improvement)
- **Menu**: 82 → 100 points (+22% improvement) 
- **Contact**: 62 → 90 points (+45% improvement)
- **Average**: 35% accessibility score improvement

## 🔒 Safety Features

- **Automatic Backups**: Every file is backed up before modification
- **Unique Naming**: Backups use MD5 hashes to prevent conflicts
- **Easy Undo**: Restore original files with one command
- **Non-Destructive Suggest Mode**: Comments only, no code changes

## 🎯 Technical Details

### HTML Processing
Uses regex patterns to iden
