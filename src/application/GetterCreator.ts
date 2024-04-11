import GetterConfiguration from '../domain/GetterConfiguration';
import Property from '../domain/Property';
import VsCode from '../domain/VsCode';
import PropertyCreator from './PropertyCreator';

export default class GetterCreator {
  propertyCreator: PropertyCreator;
  vsCode: VsCode;

  constructor(propertyCreator: PropertyCreator, vsCode: VsCode) {
    this.propertyCreator = propertyCreator;
    this.vsCode = vsCode;
  }

  build(property: Property): string {
    const breakLine = this.vsCode.getEditorPreferences().breakLine;
    const indentation = this.vsCode.getEditorPreferences().indentation;

    const getterPre = `${indentation}public function `;
    const getterPost = `${breakLine}${indentation}{`;
    const getterEnd = `${breakLine}${indentation}}`;

    let getter = '';

    getter = getter
      .concat(getterPre)
      .concat(this.getterMethod(property))
      .concat(`(): ${property.type}`)
      .concat(getterPost)
      .concat(`${breakLine}${indentation.repeat(2)}`)
      .concat('return $this->')
      .concat(property.name)
      .concat(';');

    return getter.concat(getterEnd);
  }

  private getterMethod(property: Property): string {
    const configuraton: GetterConfiguration = this.vsCode.getGetterConfiguration();

    return configuraton.addPrefix ? 'get'.concat(property.name.charAt(0).toUpperCase() + property.name.slice(1)) : property.name;
  }
}
