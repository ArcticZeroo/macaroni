import OperatorType from '../enum/OperatorType';

const symbolNames = {
    [OperatorType.add]: 'Add',
    [OperatorType.sub]: 'Sub',
    [OperatorType.mul]: 'Multiply',
    [OperatorType.div]: 'Divide',
    [OperatorType.lessThan]: 'LessThan',
    [OperatorType.lessEqual]: 'LessEqual',
    [OperatorType.greaterThan]: 'GreaterThan',
    [OperatorType.greaterEqual]: 'GreaterEqual',
    [OperatorType.equal]: 'UnsafeEqual',
    [OperatorType.strictEqual]: 'StrictEqual',
    [OperatorType.pow]: 'Power',
    [OperatorType.leftShift]: 'LShift',
    [OperatorType.rightShift]: 'RShift',
    [OperatorType.logicalAnd]: 'AND',
    [OperatorType.logicalOr]: 'OR',
    [OperatorType.logicalXor]: 'XOR'
};

function createSymbol(name: string): symbol {
    if (name == null) {
        throw new TypeError('Expected a valid name for operator identifier');
    }

    return Symbol.for(`[[Macaroni.Operator.${name}]]`);
}

const operators = {
    add: createSymbol(symbolNames[OperatorType.add]),
    subtract: createSymbol(symbolNames[OperatorType.sub]),
    multiply: createSymbol(symbolNames[OperatorType.mul]),
    divide: createSymbol(symbolNames[OperatorType.div]),
    lessThan: createSymbol(symbolNames[OperatorType.lessThan]),
    lessEqual: createSymbol(symbolNames[OperatorType.lessEqual]),
    greaterThan: createSymbol(symbolNames[OperatorType.greaterThan]),
    greaterEqual: createSymbol(symbolNames[OperatorType.greaterEqual]),
    unsafeEqual: createSymbol(symbolNames[OperatorType.equal]),
    strictEqual: createSymbol(symbolNames[OperatorType.strictEqual]),
    and: createSymbol(symbolNames[OperatorType.logicalAnd]),
    or: createSymbol(symbolNames[OperatorType.logicalOr]),
    xor: createSymbol(symbolNames[OperatorType.logicalXor]),
    leftShift: createSymbol(symbolNames[OperatorType.leftShift]),
    rightShift: createSymbol(symbolNames[OperatorType.rightShift])
};

export default operators;