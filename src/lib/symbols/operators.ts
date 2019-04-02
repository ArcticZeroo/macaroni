function createSymbol(name: string): symbol {
    if (name == null) {
        throw new TypeError('Expected a valid name for operator identifier');
    }

    return Symbol.for(`[[Macaroni.Operator.${name}]]`);
}

const operators = {
    add: createSymbol('Add'),
    subtract: createSymbol('Sub'),
    multiply: createSymbol('Mul'),
    divide: createSymbol('Div'),
    pow: createSymbol('Pow'),
    mod: createSymbol('Mod'),
    lessThan: createSymbol('Less'),
    lessEqual: createSymbol('LessEq'),
    greaterThan: createSymbol('Greater'),
    greaterEqual: createSymbol('GreaterEq'),
    unsafeEqual: createSymbol('UnsafeEq'),
    strictEqual: createSymbol('StrictEq'),
    logicalAnd: createSymbol('LogicalAnd'),
    logicalOr: createSymbol('LogicalOr'),
    logicalXor: createSymbol('LogicalXor'),
    logicalNot: createSymbol('LogicalNot'),
    leftShift: createSymbol('LShift'),
    rightShift: createSymbol('RShift'),
    increment: createSymbol('Increment'),
    decrement: createSymbol('Decrement'),
    negate: createSymbol('Negate'),
    positive: createSymbol('Positive'),
    not: createSymbol('Not')
};

export default operators;