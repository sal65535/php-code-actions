import * as vscode from 'vscode';
import EditorPreferences from '../domain/EditorPreferences';
import GetterConfiguration from '../domain/GetterConfiguration';
import GroupOffset from '../domain/GroupOffset';
import PositionOffset from '../domain/PositionOffset';
import VsCode from '../domain/VsCode';

export class VsCodeEnvironment implements VsCode {
  replaceText(position: GroupOffset, content: string): Thenable<boolean> {
    const editor = this.getActiveTextEditor();
    const initPosition = editor.document.positionAt(position.start.value);
    const endPosition = editor.document.positionAt(position.end.value);
    const range = new vscode.Range(initPosition.with(initPosition.line, 0), endPosition);
    return editor.edit((edit) => {
      edit.replace(range, `${content}`);
      vscode.window.showTextDocument(this.getCurrentDocument());
    });
  }

  insertSnippet(offset: PositionOffset, snippet: string): Thenable<boolean> {
    const editor = this.getActiveTextEditor();

    const position = editor.document.positionAt(offset.value);

    return editor
      .edit((edit) => {
        edit.insert(position, '\n');
      })
      .then((ret) => {
        return editor.insertSnippet(new vscode.SnippetString('\n' + snippet), position.with(position.line + 1, 0));
      });
  }

  quickPickMultiple(title: string, options: readonly string[]): Thenable<string[]> {
    return vscode.window
      .showQuickPick(options, {
        canPickMany: true,
        title: title
      })
      .then((selectedProperties?: string[]) => {
        if (undefined === selectedProperties) {
          return [];
        }

        return selectedProperties;
      });
  }

  insertText(offset: PositionOffset, content: string): Thenable<boolean> {
    const editor = this.getActiveTextEditor();

    const position = editor.document.positionAt(offset.value);
    return editor.edit((edit) => {
      edit.insert(position, `\n${content}\n\n`);
      vscode.window.showTextDocument(this.getCurrentDocument());
    });
  }

  hasActiveEditor(): boolean {
    return !(null === vscode.window.activeTextEditor);
  }

  getEditorPreferences(): EditorPreferences {
    return new EditorPreferences(this.getIndentation(), '\n');
  }

  private getIndentation(): string {
    const editor = this.getActiveTextEditor();
    const uri = editor.document.uri;
    const insertSpaces: boolean = vscode.workspace.getConfiguration('editor', uri).get('insertSpaces') as boolean;

    if (!insertSpaces) {
      return '\t';
    }

    const repeatSpaces: number = vscode.workspace.getConfiguration('editor', uri).get('tabSize') as number;

    return ' '.repeat(repeatSpaces);
  }

  getGetterConfiguration(): GetterConfiguration {
    const addPrefix = vscode.workspace.getConfiguration('php-code-actions').get('getter.addPrefix', true) as boolean;
    return new GetterConfiguration(addPrefix);
  }

  getPositionAt(offset: number): vscode.Position {
    return this.getCurrentDocument().positionAt(offset);
  }

  getText(): string {
    return this.getCurrentDocument().getText();
  }

  getCurrentDocument(): vscode.TextDocument {
    return this.getActiveTextEditor().document;
  }

  getActiveTextEditor(): vscode.TextEditor {
    if (!vscode.window.activeTextEditor) {
      throw new Error('Theres no active text editor');
    }

    return vscode.window.activeTextEditor;
  }

  showErrorMessage(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options?: any, token?: any): Thenable<string[] | undefined> {
    return vscode.window.showQuickPick(items, options, token);
  }

  getCurrentLineText(): string {
    let curPos = this.getActiveTextEditor().selection.active;
    return this.getActiveTextEditor().document.lineAt(curPos.line).text;
  }

  isType(type: string): boolean {
    return this.getActiveTextEditor().document.languageId === type;
  }

  isPhp(): boolean {
    return this.isType("php");
  }
}
