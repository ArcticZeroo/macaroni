import { types, template } from 'babel-core';
import { NodePath } from 'babel-traverse';


interface IPluginOptions {
    importType?: 'require' | 'import';
}

interface ITransformerState {
    hasTransformedAny: boolean;
    opts: IPluginOptions;
}

const expressionStringToOperatorName = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '**': 'pow',
    '/': 'divide',
    '<': 'lessThan',
    '>': 'greaterThan',
    '<=': 'lessEqual',
    '>=': 'greaterEqual',
    '==': 'unsafeEqual',
    '===': 'strictEqual',
    '!=': 'unsafeNotEqual',
    '!==': 'strictNotEqual',
    '&': 'logicalAnd',
    '|': 'logicalOr',
    '^': 'logicalXor',
    '<<': 'leftShift',
    '>>': 'rightShift'
};

function isFunctionCallUseless(path: NodePath<types.BinaryExpression>) {
    return types.isNumericLiteral(path.node.left) && types.isNumericLiteral(path.node.right);
}

function isOperatorSupported(expressionString: string) {
    return expressionStringToOperatorName.hasOwnProperty(expressionString);
}

const requireStatement = `const {Operator} = require('macaroni');`;
const importStatement = `import {Operator} from 'macaroni'`;

export default function babelTransformer() {
    return {
        visitor: {
            BinaryExpression(path: NodePath<types.BinaryExpression>, state: ITransformerState) {
                if (isFunctionCallUseless(path)) {
                    return;
                }

                if (!isOperatorSupported(path.node.operator)) {
                    return;
                }

                const operatorName = expressionStringToOperatorName[path.node.operator];

                path.replaceWith(types.callExpression(
                    types.memberExpression(
                        types.identifier('Operator'),
                        types.identifier(operatorName)
                    ),
                    [path.node.left, path.node.right]
                ));

                state.hasTransformedAny = true;
            },
            Program: {
                enter(_, state: ITransformerState) {
                    state.hasTransformedAny = false;

                    if (!state.opts || !state.opts.importType) {
                        state.opts = {
                            importType: 'import'
                        };
                    }
                },
                exit(path: NodePath<types.Program>, state: ITransformerState) {
                    if (!state.hasTransformedAny) {
                        return;
                    }

                    const importTemplate = template(state.opts.importType === 'import' ? importStatement: requireStatement, { sourceType: 'module' });

                    const lastImportDeclaration = path.get('body').filter(p => p.isImportDeclaration()).pop();

                    if (lastImportDeclaration) {
                        lastImportDeclaration.insertAfter(importTemplate());
                    } else {
                        // @ts-ignore
                        path.unshiftContainer('body', [importTemplate()]);
                    }
                }
            }
        }
    }
}
