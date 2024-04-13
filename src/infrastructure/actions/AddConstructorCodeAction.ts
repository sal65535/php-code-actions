import { CodeActionKind } from 'vscode';
import ClassInspector from '../../application/ClassInspector';
import ConstructorCreator from '../../application/ConstructorCreator';
import EditorAction from '../../domain/EditorAction';
import VsCode from '../../domain/VsCode';

export class AddConstructorCodeAction implements EditorAction {
  vsCode: VsCode;
  classInspector: ClassInspector;
  constructorCreator: ConstructorCreator;
  title: string = 'Add Constructor';
  command: string = 'php-sculptor.addConstructor';

  constructor(vsCode: VsCode, classInspector: ClassInspector, constructorCreator: ConstructorCreator) {
    this.vsCode = vsCode;
    this.constructorCreator = constructorCreator;
    this.classInspector = classInspector;
  }

  runnable(): boolean {
    if (!this.vsCode.hasActiveEditor()) {
      return false;
    }

    if (!this.vsCode.isPhp()) {
      return false;
    }

    if (null !== this.vsCode.getText().match(/__construct\(/)) {
      return false;
    }

    return true;
  }

  getKind(): CodeActionKind {
    return CodeActionKind.QuickFix;
  }

  getTitle(): string {
    return this.title;
  }

  getCommand(): string {
    return this.command;
  }

  async run(): Promise<void> {
    if (!this.runnable()) {
      return Promise.resolve();
    }

    const offset = this.classInspector.getOffsetForConstructor();
    const properties = this.classInspector.getProperties().values();

    const constructor = this.constructorCreator.build([...properties]);
    await this.vsCode.insertText(offset, constructor);

    return Promise.resolve();
  }
}
