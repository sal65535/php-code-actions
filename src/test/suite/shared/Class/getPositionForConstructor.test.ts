import * as assert from 'assert';
import * as vscode from 'vscode';
import { getPositionForConstructor } from '../../../../shared/Class/getPositionForConstructor';

const example = `<?php
class Example
{
    private $property1;

    private $property2;

    private $property_3;

    private $property;

    private $PROPERTY;

    protected $protectedProperty;
    public $publicProperty;
}`;

suite('getPositionForConstructor tests', () => {

    test('constructor line should be after last property', () => {
        return vscode.workspace.openTextDocument({
            content: example
        }).then(document => {
            const position: vscode.Position = getPositionForConstructor(document);
            assert.strictEqual(position.line, 15);
            assert.strictEqual(position.character, 0);
        });
    });

});