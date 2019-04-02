import operators from '../symbols/operators';

const operatorDisplays: {} = {
    [operators.add]: '+',
    [operators.multiply]: '*',
    [operators.subtract]: '-',
    [operators.divide]: '/',
    [operators.pow]: '**',
    [operators.mod]: '%',
    [operators.lessThan]: '<',
    [operators.lessEqual]: '<=',
    [operators.greaterThan]: '>',
    [operators.greaterEqual]: '>=',
    [operators.unsafeEqual]: '==',
    [operators.strictEqual]: '===',
    [operators.logicalAnd]: '&',
    [operators.logicalOr]: '|',
    [operators.logicalXor]: '^',
    [operators.logicalNot]: '~',
    [operators.leftShift]: '<<',
    [operators.rightShift]: '>>',
    [operators.increment]: '++',
    [operators.decrement]: '--',
    [operators.negate]: '-x',
    [operators.positive]: '+x',
    [operators.not]: '!'
};

export { operatorDisplays };