enum OperatorType {
    add,
    sub,
    mul,
    mod,
    div,
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
    makeNegative, makePositive,
    absoluteValue,
    invert
}

export default OperatorType;