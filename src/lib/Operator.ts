/**
 * Cases:
 * literal + literal
 * expression + literal
 * literal + expression
 */
import operators from './symbols/operators';
import { operatorDisplays } from './internal/operator-to-other';

type TwoParameterNonPrimitive = (a, b, operator: symbol) => any;
type OneParameterNonPrimitive = (a, operator: symbol) => any;

export default abstract class Operator {
    static primitiveMethods: {} = {
        [operators.add](a, b) {
            return a + b;
        },

        [operators.subtract](a, b) {
            return a - b;
        },

        [operators.multiply](a, b) {
            return a * b;
        },

        [operators.divide](a, b) {
            return a / b;
        },

        [operators.mod](a, b) {
            return a % b;
        },

        [operators.pow](a, b) {
            return a ** b;
        },

        [operators.logicalAnd](a, b) {
            return a & b;
        },

        [operators.logicalOr](a, b) {
            return a | b;
        },

        [operators.logicalXor](a, b) {
            return a ^ b;
        },
        
        [operators.logicalNot](a) {
            return ~a;  
        },

        [operators.lessThan](a, b) {
            return a < b;
        },

        [operators.lessEqual](a, b) {
            return a <= b;
        },

        [operators.greaterThan](a, b) {
            return a > b;
        },

        [operators.greaterEqual](a, b) {
            return a >= b;
        },

        [operators.unsafeEqual](a, b) {
            return a == b;
        },

        [operators.strictEqual](a, b) {
            return a === b;
        },

        [operators.positive](a) {
            return +a;
        },

        [operators.negate](a) {
            return -a;
        },
        
        [operators.not](a) {
            return !a;
        },
        
        [operators.increment](a) {
            return ++a;
        },
        
        [operators.decrement](a) {
            return --a;
        },
        
        [operators.leftShift](a, b) {
            return a << b;
        },
        
        [operators.rightShift](a, b) {
            return a >> b;
        }
    };
    
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

    private static hasOverload(a: any, operator: symbol): boolean {
        return !!a[operator];
    }

    private static shouldUsePrimitiveMethod(a: any, operator: symbol): boolean {
        return Operator.isPrimitive(a) && !Operator.hasOverload(a, operator);
    }

    private static assertOverloadExists(a: any, operator: symbol) {
        const overload: Function | undefined = a[operator];

        if (!overload) {
            Operator.throwNoOverload(operator);
        }

        return overload.bind(a);
    }

    private static operateOnTwoOperands(a: any, b: any, operator: symbol): any {
        const overload = Operator.assertOverloadExists(a, operator);

        return overload(b);
    }

    private static operateOnOneOperand(a: any, operator: symbol): any {
        const overload = Operator.assertOverloadExists(a, operator);

        return overload();
    }

    private static defaultOperateTwoOperands(a: any, b: any, operator: symbol, nonPrimitiveMethod: TwoParameterNonPrimitive = Operator.operateOnTwoOperands) {
        Operator.verifyNotNull(a);
        Operator.verifyNotNull(b);

        if (Operator.shouldUsePrimitiveMethod(a, operator)) {
            return Operator.primitiveMethods[operator](a, b); // will use b's [Symbol.toPrimitive] if available
        }

        return nonPrimitiveMethod(a, b, operator);
    }

    private static defaultOperateOneOperand(a: any, operator: symbol, nonPrimitiveMethod: OneParameterNonPrimitive = Operator.operateOnOneOperand) {
        Operator.verifyNotNull(a);

        if (Operator.shouldUsePrimitiveMethod(a, operator)) {
            return Operator.primitiveMethods[operator](a);
        }

        return nonPrimitiveMethod(a, operator);
    }

    static add(a: any, b: any): any {
        return Operator.defaultOperateTwoOperands(a, b, operators.add);
    }

    static subtract(a: any, b: any): any {
        return Operator.defaultOperateTwoOperands(a, b, operators.subtract);
    }

    static multiply(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.multiply);
    }

    static divide(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.divide);
    }

    static pow(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.pow);
    }

    static mod(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.mod);
    }

    static logicalAnd(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.logicalAnd);
    }

    static logicalOr(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.logicalOr);
    }

    static logicalXor(a, b) {
        return Operator.defaultOperateTwoOperands(a, b, operators.logicalXor);
    }

    static unsafeEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.unsafeEqual);
    }

    static unsafeNotEqual(a, b): boolean {
        return !Operator.unsafeEqual(a, b);
    }

    static strictEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.strictEqual);
    }

    static strictNotEqual(a, b): boolean {
        return !Operator.strictEqual(a, b);
    }

    static lessThan(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.lessThan);
    }

    static lessEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.lessEqual);
    }

    static greaterThan(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.greaterThan);
    }

    static greaterEqual(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.greaterEqual);
    }

    static leftShift(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.leftShift);
    }

    static rightShift(a, b): boolean {
        return Operator.defaultOperateTwoOperands(a, b, operators.rightShift);
    }
    
    static decrement(a) {
        return Operator.defaultOperateOneOperand(a, operators.decrement);
    }

    static increment(a) {
        return Operator.defaultOperateOneOperand(a, operators.increment);
    }

    static negate(a) {
        return Operator.defaultOperateOneOperand(a, operators.negate);
    }

    static positive(a) {
        return Operator.defaultOperateOneOperand(a, operators.positive);
    }

    static not(a) {
        return Operator.defaultOperateOneOperand(a, operators.not);
    }

    static logicalNot(a) {
        return Operator.defaultOperateOneOperand(a, operators.logicalNot);
    }
}