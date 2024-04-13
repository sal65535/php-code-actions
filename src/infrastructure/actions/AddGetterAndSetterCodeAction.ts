import { CodeActionKind } from 'vscode';
import ClassInspector from '../../application/ClassInspector';
import GetterCreator from '../../application/GetterCreator';
import SetterCreator from '../../application/SetterCreator';
import EditorAction from '../../domain/EditorAction';
import VsCode from '../../domain/VsCode';

export class AddGetterAndSetterCodeAction implements EditorAction {
    vsCode: VsCode;
    classInspector: ClassInspector;
    getterCreator: GetterCreator;
    setterCreator: SetterCreator;
    title: string = 'Getter and Setter';
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
        let propertiesWithoutGetter = this.classInspector.filterWithoutGetter(properties);
        let propertiesWithoutSetter = this.classInspector.filterWithoutSetter(properties);

        if (propertiesWithoutGetter.size <= 0 || propertiesWithoutSetter.size <= 0) {
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

        const getterOffset = this.classInspector.getOffsetForGetter();
        let getter = '';
        getter = getter.concat(this.getterCreator.build(property));
        await this.vsCode.insertText(getterOffset, getter);

        const setterOffset = this.classInspector.getOffsetForGetter();
        let setter = '';
        setter = setter.concat(this.setterCreator.build(property));
        await this.vsCode.insertText(setterOffset, setter);

        return Promise.resolve();
    }
}
