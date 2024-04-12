import ClassInspector from '../../application/ClassInspector';
import GetterCreator from '../../application/GetterCreator';
import EditorAction from '../../domain/EditorAction';
import Property from '../../domain/Property';
import VsCode from '../../domain/VsCode';

export class AddGetterCodeAction implements EditorAction {
  vsCode: VsCode;
  classInspector: ClassInspector;
  getterCreator: GetterCreator;
  title: string = 'Add Getter';
  command: string = 'php-code-actions.addGetter';

  constructor(vsCode: VsCode, classInspector: ClassInspector, getterCreator: GetterCreator) {
    this.vsCode = vsCode;
    this.getterCreator = getterCreator;
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
    properties = this.filterWithoutGetter(properties);

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
    properties = this.filterWithoutGetter(properties);

    const selectedProperties: string[] = await this.vsCode.quickPickMultiple(
      'Add Getter for',
      Array.from(properties.values()).map((prop) => prop.name)
    );

    if (selectedProperties.length <= 0) {
      return Promise.resolve();
    }

    const offset = this.classInspector.getOffsetForGetter();
    let getter = '';
    selectedProperties.forEach((p, index) => {
      let property = properties.get(p) as Property;
      getter = getter.concat(this.getterCreator.build(property));
    });

    await this.vsCode.insertText(offset, getter);
    return Promise.resolve();
  }

  private filterWithoutGetter(properties: Map<string, Property>): Map<string, Property> {
    const propertiesWithoutGetter = new Map<string, Property>();

    properties.forEach((prop, propName) => {
      const regex = new RegExp(`return \\$this->${propName};`, 'g');
      if (-1 === this.vsCode.getText().search(regex)) {
        return propertiesWithoutGetter.set(propName, prop);
      }
    });

    return propertiesWithoutGetter;
  }
}
