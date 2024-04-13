import ClassInspector from '../../application/ClassInspector';
import SetterCreator from '../../application/SetterCreator';
import EditorAction from '../../domain/EditorAction';
import Property from '../../domain/Property';
import VsCode from '../../domain/VsCode';

export class AddSetterCodeAction implements EditorAction {
  vsCode: VsCode;
  classInspector: ClassInspector;
  setterCreator: SetterCreator;
  title: string = 'Setter';
  command: string = 'php-code-actions.addSetter';

  constructor(vsCode: VsCode, classInspector: ClassInspector, setterCreator: SetterCreator) {
    this.vsCode = vsCode;
    this.setterCreator = setterCreator;
    this.classInspector = classInspector;
  }

  runnable(): boolean {
    if (!this.vsCode.hasActiveEditor()) {
      false;
    }

    if (!this.vsCode.isPhp()) {
      return false;
    }

    let properties = this.classInspector.getNonPublicProperties();
    let propertiesWithoutSetter = this.classInspector.filterWithoutSetter(properties);

    if (propertiesWithoutSetter.size <= 0) {
      return false;
    }

    return true;
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

    const nameMatch = this.vsCode.getCurrentLineText().match(
      /private\s+\$(\w+)\s*(?:(?:\/\*\*)([\s\S]*?)(?:\*\/))?/
    );

    if (!nameMatch) {
      return Promise.resolve();
    }

    const propertyName = nameMatch[1];

    const propertiesArray = Array.from(this.classInspector.getNonPublicProperties().entries());
    const propertyEntry = propertiesArray.find(([propName, prop]) => propName === propertyName);

    if (!propertyEntry) {
      return Promise.resolve();
    }

    const [propName, property] = propertyEntry;

    const setterOffset = this.classInspector.getOffsetForGetter();
    let getter = '';
    getter = getter.concat(this.setterCreator.build(property));
    await this.vsCode.insertText(setterOffset, getter);

    return Promise.resolve();
  }
}
