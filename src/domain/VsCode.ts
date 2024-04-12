import EditorPreferences from './EditorPreferences';
import GetterConfiguration from './GetterConfiguration';
import GroupOffset from './GroupOffset';
import PositionOffset from './PositionOffset';

export default interface VsCode {
  hasActiveEditor(): boolean;

  insertSnippet(offset: PositionOffset, snippet: string): Thenable<boolean>;

  getText(): string;

  getCurrentLineText(): string;

  getLineText(line: number): string;

  getCurrentPreviousLineText(): string

  isType(type: string): boolean;

  isPhp(): boolean;

  insertText(offset: PositionOffset, content: string): Thenable<boolean>;

  replaceText(position: GroupOffset, content: string): Thenable<boolean>;

  getEditorPreferences(): EditorPreferences;

  getGetterConfiguration(): GetterConfiguration;

  showErrorMessage(message: string): void;

  showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options?: any, token?: any): Thenable<string[] | undefined>;

  quickPickMultiple(title: string, options: readonly string[]): Thenable<string[]>;
}
