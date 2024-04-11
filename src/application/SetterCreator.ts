import Property from '../domain/Property';
import VsCode from '../domain/VsCode';
import PropertyCreator from './PropertyCreator';

export default class SetterCreator {
  propertyCreator: PropertyCreator;
  vsCode: VsCode;

  constructor(propertyCreator: PropertyCreator, vsCode: VsCode) {
    this.propertyCreator = propertyCreator;
    this.vsCode = vsCode;
  }

  build(property: Property): string {
    const breakLine = this.vsCode.getEditorPreferences().breakLine;
    const indentation = this.vsCode.getEditorPreferences().indentation;

    const methodPre = `${indentation}public function `;
    const methodParam = `(${this.propertyCreator.getForConstructor(property)})`;
    const methodPost = `: void${breakLine}${indentation}{`;
    const methodEnd = `${breakLine}${indentation}}`;

    let method = '';

    method = method
      .concat(methodPre)
      .concat(property.setterName())
      .concat(methodParam)
      .concat(methodPost)
      .concat(`${breakLine}${indentation.repeat(2)}`)
      .concat(`$this->${property.name} = $${property.name};`);

    return method.concat(methodEnd);
  }
}
