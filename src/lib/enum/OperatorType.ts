enum OperatorType {
    add,
    sub,
    mul,
    mod,
    div, integerDiv,
    lessThan, lessEqual,
    greaterThan, greaterEqual,
    equal, notEqual,
    strictEqual, strictNotEqual,
    getItem, setItem,
    pow,
    leftShift, rightShift,
    logicalAnd, logicalXor, logicalOr,

    // todo: support the below symbols, which are considered prefixed operations
    increment, decrement,
    incrementAdd,
    incrementSub,
    incrementDivide,
    incrementPow,
    incrementLeftShift,
    incrementRightShift,
    incrementAnd,
    incrementXor,
    incrementOr,
    makeNegative, makePositive,
    absoluteValue,
    invert
}

export default OperatorType;