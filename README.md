# Paste Clipboard to Files

A VS Code extension that creates files from clipboard content with path declarations in comments. It allows you to easily create multiple files from a markdown-like text format.

## Features

- Create multiple files from clipboard content with path declarations
- Supports both files with and without extensions
- Recognizes common configuration files (Dockerfile, Makefile, etc.)
- Supports code blocks in markdown format
- Shows progress indicator while creating files
- Maintains directory structure from paths

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Paste Clipboard to Files"
4. Click Install

## Usage

1. Copy content that includes file paths in comments, for example:

   ```
   # src/index.js
   console.log('Hello World');

   # src/styles.css
   body {
     margin: 0;
   }

   # Dockerfile
   FROM node:16
   ```

2. In VS Code, press `Ctrl+Alt+Shift+V` (or `Cmd+Alt+Shift+V` on macOS) or use the command palette to run "Paste Clipboard Content as Files"

3. The extension will create all files in their respective paths under your current workspace

### Supported Comment Formats

The extension recognizes file paths in the following comment formats:

```
# path/to/file.ext
// path/to/file.ext
# `path/to/file.ext`
// `path/to/file.ext`
```

### Markdown Code Blocks

The extension also supports markdown code blocks:

````
# src/example.js
```javascript
function hello() {
    console.log('Hello');
}
````

````

## Configuration

You can customize the list of recognized files without extensions through VS Code settings:

```json
{
    "pasteClipboardToFiles.extensionlessFiles": [
        "dockerfile",
        "makefile",
        "jenkinsfile",
        "vagrantfile",
        "brewfile",
        "gemfile",
        "procfile",
        "dockerignore",
        "gitignore",
        "env",
        "bashrc",
        "zshrc",
        "vimrc",
        "tmux.conf"
    ]
}
````

## File Path Rules

The extension recognizes the following as valid file paths:

1. Files with extensions (e.g., `file.txt`, `script.js`)
2. Known files without extensions (configurable through settings)
3. Files starting with a capital letter and ending with "file" (e.g., `Dockerfile`, `Makefile`)
4. Hidden configuration files (e.g., `.gitignore`, `.env`)

## Keyboard Shortcut

- Windows/Linux: `Ctrl+Alt+Shift+V`
- macOS: `Cmd+Alt+Shift+V`

You can customize this shortcut in VS Code's keyboard shortcuts settings.

## Requirements

- VS Code version 1.75.0 or higher

## Extension Settings

This extension contributes the following settings:

- `pasteClipboardToFiles.extensionlessFiles`: Array of filenames without extensions that should be recognized as valid file paths

## Known Issues

- The extension requires an open workspace folder
- All files will be created relative to the root of the first workspace folder

## Contributing

Found a bug or have a feature request? Feel free to create an issue on our GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Release Notes

### 0.0.1

- Initial release
- Basic file creation from clipboard content
- Support for files with and without extensions
- Configurable list of extensionless files
- Progress indicator
- Markdown code block support
