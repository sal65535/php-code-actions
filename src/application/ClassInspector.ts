import GroupOffset from '../domain/GroupOffset';
import PositionOffset from '../domain/PositionOffset';
import Property from '../domain/Property';
import PropertyType from '../domain/PropertyType';
import { PropertyVisibility } from '../domain/PropertyVisibility';
import VsCode from '../domain/VsCode';
import RegexpHelper from './RegexpHelper';

export default class ClassInspector {
  constructor(private vsCode: VsCode, private regexpHelper: RegexpHelper) { }

  getOffsetForProperty(): PositionOffset {
    const properties = this.getProperties();
    let offset = new PositionOffset(0);

    if (0 === properties.size) {
      const regex = /([\w\W]*?)({)([\w\W]*)(})/gm;
      let match: RegExpExecArray | null = regex.exec(this.vsCode.getText());
      if (null !== match) {
        const group = this.regexpHelper.getGroupOffset(match, 2);
        offset = group.end;
      }
    } else {
      let prop = Array.from(properties.values()).pop();
      if (prop) {
        offset = prop.offset;
      }
    }

    return offset;
  }

  getOffsetForConstructor(): PositionOffset {
    return this.getOffsetForProperty();
  }

  getOffsetForGetter(): PositionOffset {
    const regex = /([\w\W]*?)({)([\w\W]*)(})/gm;

    let match: RegExpExecArray | null = regex.exec(this.vsCode.getText());
    let offset = new PositionOffset(0);
    if (null !== match) {
      const group = this.regexpHelper.getGroupOffset(match, 3);
      offset = group.end;
    }

    return offset;
  }

  getConstructorGroupOffset(): GroupOffset | null {
    const content = this.vsCode.getText();

    const regex = /((\/\*\*((?!\/\*\*)[\s\S])*\*\/([\s]+))?((public)?(private)?\s*function\s*__construct\s*\([\w\W]+?\))\s*){/gm;
    let match: RegExpExecArray | null = regex.exec(content);
    let startPosition = undefined;
    if (null !== match) {
      const group = this.regexpHelper.getGroupOffset(match, 1);
      startPosition = group.start;
    }

    if (startPosition === undefined) {
      return null;
    }

    let bracketsFound = 0;
    let atLeastOneBracketFound = false;
    let endPosition = undefined;
    for (let i = startPosition.value; i < content.length; i++) {
      const charAt = content.charAt(i);

      if (charAt === '{') {
        bracketsFound++;
        atLeastOneBracketFound = true;
      }

      if (charAt === '}') {
        bracketsFound--;
      }

      if (bracketsFound === 0 && atLeastOneBracketFound) {
        endPosition = new PositionOffset(i + 1);
        break;
      }
    }

    if (endPosition === undefined) {
      return null;
    }

    return new GroupOffset(startPosition, endPosition);
  }

  getNonPublicProperties(): Map<string, Property> {
    const properties = this.getProperties();
    const propertiesSelected = Array.from(properties.values())
      .filter((prop) => prop.visibility !== PropertyVisibility.public)
      .map((prop) => prop.name);

    const selected: Map<string, Property> = new Map<string, Property>();
    propertiesSelected.forEach((value) => {
      selected.set(value, properties.get(value) as Property);
    });

    return selected;
  }

  getProperties(): Map<string, Property> {
    const regex = /((@var\s+([\w\\|<>\s,\[\]]+)[\t\r\n\s]{1}[\w\W]*?\*\/)?[\t\r\n\s]+(private|protected|public)\s+\$(.+)\;)/gm;

    const properties = new Map<string, Property>();

    let match = null;
    const text = this.vsCode.getText();
    while ((match = regex.exec(text))) {
      const type = match[3] === undefined ? PropertyType.mixed : match[3].trim();
      const visibility: PropertyVisibility = match[4] as PropertyVisibility;
      const name = match[5];
      const property: Property = new Property(name, type, new PositionOffset(match.index + match[0].length), visibility);
      properties.set(property.name, property);
    }

    return properties;
  }

  filterWithoutSetter(properties: Map<string, Property>): Map<string, Property> {
    const propertiesWithoutSetter = new Map<string, Property>();

    properties.forEach((prop, propName) => {
      if (!this.vsCode.getText().includes(prop.setterName())) {
        return propertiesWithoutSetter.set(propName, prop);
      }
    });

    return propertiesWithoutSetter;
  }

  filterWithoutGetter(properties: Map<string, Property>): Map<string, Property> {
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
