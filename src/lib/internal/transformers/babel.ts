import { template, types } from 'babel-core';
import { NodePath } from 'babel-traverse';
import { Expression, Identifier, MemberExpression } from 'babel-types';


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
    '%': 'mod',
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

const unaryOperatorStringToOperatorName = {
    '~': 'logicalNot',
    '-': 'negate',
    '+': 'positive',
    '!': 'not'
};

const updateOperatorStringToOperatorName = {
    '--': 'decrement',
    '++': 'increment'
};

type SupportedOverloadType = Identifier | MemberExpression;

function isSideOnlyNumericLiterals(expression: Expression) {
    return types.isNumericLiteral(expression) || (types.isBinaryExpression(expression) && isBinaryExpressionOnlyNumericLiterals(expression));
}

function isBinaryExpressionOnlyNumericLiterals(node: types.BinaryExpression) {
    return isSideOnlyNumericLiterals(node.left) && isSideOnlyNumericLiterals(node.right);
}

function shouldBinaryExpressionBeReplaced(node: types.BinaryExpression) {
    if (!isBinaryOperatorSupported(node.operator)) {
        return false;
    }

    return isBinaryExpressionOnlyNumericLiterals(node);
}

function isFunctionCallUselessForAssignmentExpression(path: NodePath<types.AssignmentExpression>) {
    return path.node.operator === '=';
}

function shouldUseOperatorForArgument(expression: types.Expression): expression is SupportedOverloadType {
    return types.isMemberExpression(expression) || types.isIdentifier(expression);
}

function isOperatorSupported(sourceObject: { [key: string]: string }, expressionString: string) {
    return sourceObject.hasOwnProperty(expressionString);
}

function isBinaryOperatorSupported(expressionString: string) {
    return isOperatorSupported(expressionStringToOperatorName, expressionString);
}

function isUnaryOperatorSupported(expressionString: string) {
    return isOperatorSupported(unaryOperatorStringToOperatorName, expressionString);
}

function isUpdateOperatorSupported(expressionString: string) {
    return isOperatorSupported(updateOperatorStringToOperatorName, expressionString);
}

function getBaseOperatorFromAssignmentExpression(assignmentOperator: string) {
    return assignmentOperator.substr(0, assignmentOperator.length - 1);
}

function isLValueSupported(lvalue: types.LVal): lvalue is SupportedOverloadType {
    return types.isIdentifier(lvalue) || types.isMemberExpression(lvalue);
}

function createOperatorCall(operatorName: string, ...args: Array<types.Expression>) {
    return types.callExpression(
        types.memberExpression(
            types.identifier('Operator'),
            types.identifier(operatorName)
        ),
        args
    );
}

const requireStatement = `const {Operator} = require('macaroni');`;
const importStatement = `import {Operator} from 'macaroni'`;

const visitor = {
    BinaryExpression(path: NodePath<types.BinaryExpression>, state: ITransformerState) {
        if (shouldBinaryExpressionBeReplaced(path.node)) {
            return;
        }

        if (!isBinaryOperatorSupported(path.node.operator)) {
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

        if (!isBinaryOperatorSupported(expressionString)) {
            return;
        }

        const operatorName = expressionStringToOperatorName[expressionString];

        const right = path.node.right;

        path.node.operator = '=';
        path.node.right = createOperatorCall(operatorName, path.node.left, right);
        state.hasTransformedAny = true;
    },
    UnaryExpression(path: NodePath<types.UnaryExpression>, state: ITransformerState) {
        if (!shouldUseOperatorForArgument(path.node.argument)) {
            return;
        }

        if (!isUnaryOperatorSupported(path.node.operator)) {
            return;
        }

        const operatorName = unaryOperatorStringToOperatorName[path.node.operator];

        path.replaceWith(createOperatorCall(operatorName, path.node.argument));
        state.hasTransformedAny = true;
    },
    UpdateExpression(path: NodePath<types.UpdateExpression>, state: ITransformerState) {
        if (!isUpdateOperatorSupported(path.node.operator)) {
            return; // should never happen unless they add a new operator. Just to be safe though.
        }

        if (!shouldUseOperatorForArgument(path.node.argument)) {
            return;
        }

        const operatorName = updateOperatorStringToOperatorName[path.node.operator];

        const variableAssignment = types.assignmentExpression(
            '=',
            path.node.argument,
            createOperatorCall(operatorName, path.node.argument)
        );

        state.hasTransformedAny = true;

        // Yay, it's a prefix operator! Everything is easy for this one. Just replace with the call.
        if (path.node.prefix) {
            path.replaceWith(variableAssignment);
            return;
        }

        // For a postfix, we try to get this goal:
        // (temp = a && (a = Operator.increment(a) || temp) && temp))

        const tempVariable = path.scope.generateUidIdentifier('temp');

        // Hoist the variable to the scope without defining it yet
        path.scope.push({ id: tempVariable });

        const tempAssignment = types.assignmentExpression(
            '=',
            tempVariable,
            path.node.argument
        );

        const assignmentOrTemp = types.logicalExpression('||', variableAssignment, tempVariable);

        const getPostfixValueLogical = types.logicalExpression('&&', assignmentOrTemp, tempVariable);

        const assignTempAndGetValue = types.logicalExpression('&&', tempAssignment, getPostfixValueLogical);

        path.replaceWith(assignTempAndGetValue);
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

            const importTemplate = template(state.opts.importType === 'import' ? importStatement : requireStatement, { sourceType: 'module' });

            const lastImportDeclaration = path.get('body').filter(p => p.isImportDeclaration()).pop();

            if (lastImportDeclaration) {
                lastImportDeclaration.insertAfter(importTemplate());
            } else {
                // @ts-ignore - it does exist mr typescript
                path.unshiftContainer('body', [importTemplate()]);
            }
        }
    }
};

const transformer = () => ({ visitor });

export default transformer;