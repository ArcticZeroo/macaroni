import { types, template } from 'babel-core';
import { NodePath } from 'babel-traverse';
import { Identifier, MemberExpression } from 'babel-types';


interface IPluginOptions {
    importType?: 'require' | 'import';
    skipImport?: boolean;
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

function isFunctionCallUselessForBinaryExpression(path: NodePath<types.BinaryExpression>) {
    return types.isNumericLiteral(path.node.left) && types.isNumericLiteral(path.node.right);
}

function isFunctionCallUselessForAssignmentExpression(path: NodePath<types.AssignmentExpression>) {
    return path.node.operator === '=';
}

function isOperatorSupported(expressionString: string) {
    return expressionStringToOperatorName.hasOwnProperty(expressionString);
}

function getBaseOperatorFromAssignmentExpression(assignmentOperator: string) {
    return assignmentOperator.substr(0, assignmentOperator.length - 1);
}

type SupportedAssignmentExpression = Identifier | MemberExpression;

function isLValueSupported(lvalue: types.LVal): lvalue is SupportedAssignmentExpression {
    return types.isIdentifier(lvalue) || types.isMemberExpression(lvalue);
}

function createOperatorCall(operatorName: string, left: types.Expression, right: types.Expression) {
    return types.callExpression(
        types.memberExpression(
            types.identifier('Operator'),
            types.identifier(operatorName)
        ),
        [left, right]
    );
}

const requireStatement = `const {Operator} = require('macaroni');`;
const importStatement = `import {Operator} from 'macaroni'`;

export default function babelTransformer() {
    return {
        visitor: {
            BinaryExpression(path: NodePath<types.BinaryExpression>, state: ITransformerState) {
                if (isFunctionCallUselessForBinaryExpression(path)) {
                    return;
                }

                if (!isOperatorSupported(path.node.operator)) {
                    return;
                }

                const operatorName = expressionStringToOperatorName[path.node.operator];

                path.replaceWith(createOperatorCall(operatorName, path.node.left, path.node.right));

                state.hasTransformedAny = true;
            },
            AssignmentExpression(path: NodePath<types.AssignmentExpression>, state: ITransformerState) {
                if (isFunctionCallUselessForAssignmentExpression(path) || !isLValueSupported(path.node.left)) {
                    return;
                }

                const expressionString = getBaseOperatorFromAssignmentExpression(path.node.operator);

                if (!isOperatorSupported(expressionString)) {
                    return;
                }

                const operatorName = expressionStringToOperatorName[expressionString];

                const right = path.node.right;

                path.node.operator = '=';
                path.node.right = createOperatorCall(operatorName, path.node.left, right);
                state.hasTransformedAny = true;
            },
            Program: {
                enter(_, state: ITransformerState) {
                    state.hasTransformedAny = false;

                    state.opts = { importType: 'import', ...(state.opts || {}) };
                },
                exit(path: NodePath<types.Program>, state: ITransformerState) {
                    if (!state.hasTransformedAny || state.opts.skipImport) {
                        return;
                    }

                    const importTemplate = template(state.opts.importType === 'import' ? importStatement: requireStatement, { sourceType: 'module' });

                    const lastImportDeclaration = path.get('body').filter(p => p.isImportDeclaration()).pop();

                    if (lastImportDeclaration) {
                        lastImportDeclaration.insertAfter(importTemplate());
                    } else {
                        // @ts-ignore - it does exist mr typescript
                        path.unshiftContainer('body', [importTemplate()]);
                    }
                }
            }
        }
    }
}
