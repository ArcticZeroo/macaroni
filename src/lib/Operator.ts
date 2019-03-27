/**
 * Cases:
 * literal + literal
 * expression + literal
 * literal + expression
 */
import operators from './symbols/operators';
import { operatorDisplays } from './internal/operator-to-other';

export default abstract class Operator {
    private static isPrimitive(item: any): boolean {
        const type = typeof item;

        return type !== 'object' && type !== 'function';
    }

    private static verifyNotNull(item: any) {
        if (item == null) {
            throw new TypeError('Item cannot be null');
        }
    }

    private static operateOn(a: any, b: any, operator: symbol): any {
        const overloaded = a[operator];

        if (!overloaded) {
            throw new TypeError(`No such operator '${operatorDisplays[operator] || '?<unknown>'}' exists for type`)
        }

        return overloaded(b);
    }

    private static defaultOperate(a: any, b: any, operator: symbol, primitiveMethod: (a: any, b: any) => any) {
        Operator.verifyNotNull(a);
        Operator.verifyNotNull(b);

        if (Operator.isPrimitive(a)) {
            return primitiveMethod(a, b); // will use b's [Symbol.toPrimitive] if available
        }

        Operator.operateOn(a, b, operator);
    }

    static add(a: any, b: any): any {
        return Operator.defaultOperate(a, b, operators.add, (itemA, itemB) => itemA + itemB);
    }

    static subtract(a: any, b: any): any {
        return Operator.defaultOperate(a, b, operators.subtract, (itemA, itemB) => itemA - itemB);
    }

    static multiply(a, b) {
        return Operator.defaultOperate(a, b, operators.multiply, (itemA, itemB) => itemA * itemB);
    }

    static divide(a, b) {
        return Operator.defaultOperate(a, b, operators.divide, (itemA, itemB) => itemA / itemB);
    }
}