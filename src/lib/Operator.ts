/**
 * Cases:
 * literal + literal
 * expression + literal
 * literal + expression
 */
import operators from './symbols/operators';
import { operatorDisplays } from './internal/operator-to-other';

type PrimitiveMethod = (a: any, b: any) => any;
type NonPrimitiveMethod = (a, b, operator: symbol) => any;

const compareInverses: {} = {
    [operators.lessThan]: operators.greaterEqual,
    [operators.lessEqual]: operators.greaterThan,
    [operators.greaterThan]: operators.lessEqual,
    [operators.greaterEqual]: operators.lessThan
};

const compareCompounds: {} = {
    [operators.lessEqual]: [operators.lessThan, operators.strictEqual],
    [operators.greaterEqual]: [operators.greaterThan, operators.strictEqual]
};

export default abstract class Operator {
    private static isPrimitive(item: any): boolean {
        const type = typeof item;

        return type !== 'object' && type !== 'function';
    }

    private static verifyNotNull(item: any): void {
        if (item == null) {
            throw new TypeError('Operand cannot be null');
        }
    }

    private static throwNoOverload(operator: symbol) {
        throw new TypeError(`No such operator '${operatorDisplays[operator] || '?<unknown>'}' exists for type`)
    }

    private static operateOn(a: any, b: any, operator: symbol): any {
        const overloaded = a[operator];

        if (!overloaded) {
            Operator.throwNoOverload(operator);
        }

        return overloaded(b);
    }

    private static defaultOperateTwoOperands(a: any, b: any, operator: symbol, primitiveMethod: PrimitiveMethod, nonPrimitiveMethod: NonPrimitiveMethod = Operator.operateOn) {
        Operator.verifyNotNull(a);
        Operator.verifyNotNull(b);

        if (Operator.isPrimitive(a)) {
            return primitiveMethod(a, b); // will use b's [Symbol.toPrimitive] if available
        }

        return nonPrimitiveMethod(a, b, operator);
    }

    private static operateCompare(a, b, operator: symbol): boolean {
        if (a[operator]) {
            return a[operator](b);
        }

        const inverse = compareInverses[operator];

        if (inverse && a[inverse]) {
            return !a[inverse](b);
        }

        Operator.throwNoOverload(operator);
    }

    private static defaultCompare(a, b, operator: symbol, primitiveMethod: PrimitiveMethod): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operator, primitiveMethod, Operator.operateCompare);
    }

    static add(a: any, b: any): any {
        return Operator.defaultOperateTwoOperands(a, b, operators.add, (itemA, itemB) => itemA + itemB);
    }

    static subtract(a: any, b: any): any {
        return Operator.defaultOperateTwoOperands(a, b, operators.subtract, (itemA, itemB) => itemA - itemB);
    }

    static multiply(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.multiply, (itemA, itemB) => itemA * itemB);
    }

    static divide(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.divide, (itemA, itemB) => itemA / itemB);
    }

    static unsafeEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.unsafeEqual, (itemA, itemB) => itemA == itemB);
    }

    static unsafeNotEqual(a, b): boolean {
        return !Operator.unsafeEqual(a, b);
    }

    static strictEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.strictEqual, (itemA, itemB) => itemA === itemB);
    }

    static strictNotEqual(a, b,): boolean {
        return !Operator.strictEqual(a, b);
    }




}