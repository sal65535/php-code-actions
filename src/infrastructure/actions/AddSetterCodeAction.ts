import ClassInspector from '../../application/ClassInspector';
import SetterCreator from '../../application/SetterCreator';
import EditorAction from '../../domain/EditorAction';
import Property from '../../domain/Property';
import VsCode from '../../domain/VsCode';

export class AddSetterCodeAction implements EditorAction {
  vsCode: VsCode;
  classInspector: ClassInspector;
  setterCreator: SetterCreator;
  title: string = 'Add Setter';
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
    properties = this.filterWithoutSetter(properties);

    if (properties.size <= 0) {
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

    let properties = this.classInspector.getNonPublicProperties();
    properties = this.filterWithoutSetter(properties);

    const selectedProperties: string[] = await this.vsCode.quickPickMultiple(
      'Add Setter for',
      Array.from(properties.values()).map((prop) => prop.name)
    );

    if (selectedProperties.length <= 0) {
      return Promise.resolve();
    }

    const offset = this.classInspector.getOffsetForGetter();
    let setter = '';
    selectedProperties.forEach((p, index) => {
      let property = properties.get(p) as Property;
      setter = setter.concat(this.setterCreator.build(property));
    });

    await this.vsCode.insertText(offset, setter);
    return Promise.resolve();
  }

  private filterWithoutSetter(properties: Map<string, Property>): Map<string, Property> {
    const propertiesWithoutSetter = new Map<string, Property>();

    properties.forEach((prop, propName) => {
      if (!this.vsCode.getText().includes(prop.setterName())) {
        return propertiesWithoutSetter.set(propName, prop);
      }
    });

    return propertiesWithoutSetter;
  }
}
