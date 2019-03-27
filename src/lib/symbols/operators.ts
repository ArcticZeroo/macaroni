import OperatorType from '../enum/OperatorType';

const symbolNames = {
    [OperatorType.add]: 'Add',
    [OperatorType.sub]: 'Sub',
    [OperatorType.mul]: 'Multiply',
    [OperatorType.div]: 'Divide',
    [OperatorType.getItem]: 'GetItem',
    [OperatorType.setItem]: 'SetItem'
};

function createSymbol(name: string): symbol {
    return Symbol.for(`[[Macaroni.Operator.${name}]]`);
}

const operators = {
    add: createSymbol(symbolNames[OperatorType.add]),
    subtract: createSymbol(symbolNames[OperatorType.sub]),
    multiply: createSymbol(symbolNames[OperatorType.mul]),
    divide: createSymbol(symbolNames[OperatorType.div]),
    getItem: createSymbol(symbolNames[OperatorType.getItem]),
    setItem: createSymbol(symbolNames[OperatorType.setItem])
};

export default operators;