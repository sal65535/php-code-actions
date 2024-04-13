import { CodeActionKind } from "vscode";

export default interface EditorAction {
  getKind(): CodeActionKind

  getTitle(): string;

  getCommand(): string;

  runnable(): boolean;

  run(): Promise<void>;
}
