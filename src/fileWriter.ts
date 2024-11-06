import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs/promises'

interface FileSection {
  path: string
  content: string[]
}

interface ProcessResult {
  success: boolean
  fileCount: number
}

function getExtensionlessFiles(): Set<string> {
  const config = vscode.workspace.getConfiguration('pasteClipboardToFiles')
  const files = config.get<string[]>('extensionlessFiles', [])
  return new Set(files.map(f => f.toLowerCase()))
}

function isValidFilePath(path: string): boolean {
  if (!/^[a-zA-Z0-9._\-/]+$/.test(path)) {
    return false
  }

  const filename = path.split('/').pop()?.toLowerCase() || ''

  if (filename.includes('.')) {
    return true
  }

  const knownFiles = getExtensionlessFiles()
  if (knownFiles.has(filename)) {
    return true
  }

  if (/^[A-Z][a-zA-Z]*file$/.test(filename)) {
    return true
  }

  if (filename.startsWith('.')) {
    return true
  }

  return false
}

interface CommentLineResult {
  commentChar: string
  path: string
}

function parseCommentLine(line: string): CommentLineResult | null {
  const trimmed = line.trim()

  const patterns = [/^#\s+(.+)$/, /^\/\/\s+(.+)$/, /^#\s+`?(.+?)`?$/, /^\/\/\s+`?(.+?)`?$/]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      const potentialPath = match[1]
      if (isValidFilePath(potentialPath)) {
        return {
          commentChar: trimmed.startsWith('#') ? '#' : '//',
          path: potentialPath,
        }
      }
    }
  }

  return null
}

function isPathLine(line: string): CommentLineResult | null {
  if (!line.trim()) return null
  return parseCommentLine(line)
}

function parseFileSections(lines: string[]): FileSection[] {
  const sections: FileSection[] = []
  let currentSection: FileSection | null = null
  let lineNumber = 0

  while (lineNumber < lines.length) {
    const line = lines[lineNumber]
    const pathInfo = isPathLine(line)

    if (pathInfo) {
      if (currentSection) {
        while (
          currentSection.content.length > 0 &&
          currentSection.content[currentSection.content.length - 1].trim() === ''
        ) {
          currentSection.content.pop()
        }
        sections.push(currentSection)
      }

      currentSection = {
        path: pathInfo.path,
        content: [],
      }

      if (lineNumber + 1 < lines.length && lines[lineNumber + 1].trim().startsWith('```')) {
        lineNumber += 2
        continue
      }
    } else if (currentSection) {
      if (line.trim() === '```') {
        lineNumber++
        continue
      }
      currentSection.content.push(line)
    }

    lineNumber++
  }

  if (currentSection) {
    while (
      currentSection.content.length > 0 &&
      currentSection.content[currentSection.content.length - 1].trim() === ''
    ) {
      currentSection.content.pop()
    }
    sections.push(currentSection)
  }

  return sections
}

export async function processClipboardContent(
  content: string,
  progress: vscode.Progress<{ message?: string; increment?: number }>,
): Promise<ProcessResult> {
  const lines = content.split('\n')
  if (lines.length === 0) {
    throw new Error('No content to process')
  }

  const firstLine = parseCommentLine(lines[0])
  if (!firstLine) {
    throw new Error('First line must contain a valid file path (e.g., "# path/to/file.txt" or "# path/to/Dockerfile")')
  }

  const sections = parseFileSections(lines)
  if (sections.length === 0) {
    throw new Error('No valid file sections found')
  }

  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    throw new Error('No workspace folder is opened')
  }
  const rootPath = workspaceFolders[0].uri.fsPath

  let filesProcessed = 0
  const totalFiles = sections.length

  for (const section of sections) {
    const fullPath = path.join(rootPath, section.path)
    const dirPath = path.dirname(fullPath)

    try {
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(fullPath, section.content.join('\n'))

      filesProcessed++
      progress.report({
        message: `Writing file ${filesProcessed} of ${totalFiles}: ${section.path}`,
        increment: (1 / totalFiles) * 100,
      })
    } catch (error) {
      throw new Error(`Failed to write file ${section.path}: ${error}`)
    }
  }

  return {
    success: true,
    fileCount: filesProcessed,
  }
}
