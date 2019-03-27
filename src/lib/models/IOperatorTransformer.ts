import Optional from './Optional';
import OperatorType from '../enum/OperatorType';

export default interface IOperatorTransformer<TNode> {
    isBinaryExpression(node: TNode): boolean;
    getLeftChild(node: TNode): Optional<TNode>;
    getRightChild(node: TNode): Optional<TNode>;
    getOperatorForBinaryExpression(node: TNode): OperatorType;
    replaceBinaryExpressionWithFunctionCall(node: TNode, operator: OperatorType);
}