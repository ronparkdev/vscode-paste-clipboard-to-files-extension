import * as vscode from 'vscode'
import { processClipboardContent } from './fileWriter'

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "paste-clipboard-to-files" is now active!')

  let disposable = vscode.commands.registerCommand('paste-clipboard-to-files.pasteAsFiles', async () => {
    try {
      const clipboardContent = await vscode.env.clipboard.readText()
      if (!clipboardContent) {
        vscode.window.showErrorMessage('Clipboard is empty')
        return
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Writing files from clipboard',
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log('User canceled the operation')
          })

          const result = await processClipboardContent(clipboardContent, progress)
          if (result.success) {
            vscode.window.showInformationMessage(`Successfully wrote ${result.fileCount} files`)
          }
        },
      )
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(error.message)
      } else {
        vscode.window.showErrorMessage('An unknown error occurred')
      }
    }
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
