import { types, template } from 'babel-core';
import { NodePath } from 'babel-traverse';

interface ITransformerState {
    hasTransformedAny: boolean;
}

const expressionStringToOperatorName = {
    '+': 'add',
    '-': 'subtract'
};

function isFunctionCallUseless(path: NodePath<types.BinaryExpression>) {
    return types.isNumericLiteral(path.node.left) && types.isNumericLiteral(path.node.right);
}

function isOperatorSupported(expressionString: string) {
    return expressionStringToOperatorName.hasOwnProperty(expressionString);
}

export default function babelTransformer() {
    const importTemplate = template(`const {Operator} = require('macaroni');`, { sourceType: 'module' });

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
                },
                exit(path: NodePath<types.Program>, state: ITransformerState) {
                    if (!state.hasTransformedAny) {
                        return;
                    }

                    const lastImportDeclaration = path.get('body').filter(p => p.isImportDeclaration()).pop();

                    if (lastImportDeclaration) {
                        lastImportDeclaration.insertAfter(importTemplate());
                    } else {
                        path.insertBefore(importTemplate());
                    }
                }
            }
        }
    }
}
