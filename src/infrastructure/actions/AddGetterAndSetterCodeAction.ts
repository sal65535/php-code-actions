import ClassInspector from '../../application/ClassInspector';
import GetterCreator from '../../application/GetterCreator';
import SetterCreator from '../../application/SetterCreator';
import EditorAction from '../../domain/EditorAction';
import Property from '../../domain/Property';
import VsCode from '../../domain/VsCode';

export class AddGetterAndSetterCodeAction implements EditorAction {
    vsCode: VsCode;
    classInspector: ClassInspector;
    getterCreator: GetterCreator;
    setterCreator: SetterCreator;
    title: string = 'Add Getter and Setter';
    command: string = 'php-code-actions.addGetterAndSetter';

    constructor(
        vsCode: VsCode,
        classInspector: ClassInspector,
        getterCreator: GetterCreator,
        setterCreator: SetterCreator
    ) {
        this.vsCode = vsCode;
        this.getterCreator = getterCreator;
        this.classInspector = classInspector;
        this.setterCreator = setterCreator;
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
            'Add Getter and Setter for',
            Array.from(properties.values()).map((prop) => prop.name)
        );

        if (selectedProperties.length <= 0) {
            return Promise.resolve();
        }

        const getterOffset = this.classInspector.getOffsetForGetter();
        let getter = '';
        selectedProperties.forEach((p, index) => {
            let property = properties.get(p) as Property;
            getter = getter.concat(this.getterCreator.build(property));
        });
        await this.vsCode.insertText(getterOffset, getter);

        const setterOffset = this.classInspector.getOffsetForGetter();
        let setter = '';
        selectedProperties.forEach((p, index) => {
            let property = properties.get(p) as Property;
            setter = setter.concat(this.setterCreator.build(property));
        });
        await this.vsCode.insertText(setterOffset, setter);

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
