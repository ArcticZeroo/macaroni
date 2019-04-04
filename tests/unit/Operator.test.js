const { Operator, operators } = require('../../dist');
const { expect } = require('chai');
const runTests = require('../helper/dynamicTestRunner');

function twoOperandTests(name, operator) {
   const operatorMethod = Operator[name];
   const primitiveMethod = Operator.primitiveMethods[operator];

   describe(name, function () {
      it(`uses primitive method for two primitives as expected`, function () {
         expect(operatorMethod(1, 2)).to.equal(primitiveMethod(1, 2));
      });

      it(`uses the primitive method when the first parameter is a primitive`, function () {
         const testObj = {
            [Symbol.toPrimitive]() {
               return 5;
            }
         };

         expect(operatorMethod(3, testObj)).to.equal(primitiveMethod(3, 5));
      });

      it(`uses the overloaded method when the first parameter is a class with the method`, function () {
         const overloadSymbol = Symbol(name);

         const testObj = {
            [operator]() {
               return overloadSymbol;
            }
         };

         expect(operatorMethod(testObj, 3)).to.equal(overloadSymbol);
      });

      it(`throws when the first object is null, or does not have the overload`, function () {
         expect(() => operatorMethod(null, 3)).to.throw(TypeError);
         expect(() => operatorMethod({}, 3)).to.throw(TypeError);
      });

      it('uses the overloaded method on a primitive, if it has one', function () {
         const overloadSymbol = Symbol(name);

         Number.prototype[operator] = function () {
            return overloadSymbol;
         };

         expect(operatorMethod(2, 3)).to.equal(overloadSymbol);

         delete Number.prototype[operator];

         expect(operatorMethod(2, 3)).to.equal(primitiveMethod(2, 3));
      });
   });
}

// The boolean operand methods are purposely excluded here
const twoOperandTestCaseData = [
   ['add', operators.add],
   ['subtract', operators.subtract],
   ['multiply', operators.multiply],
   ['divide', operators.divide],
   ['mod', operators.mod],
   ['pow', operators.pow],
   ['logicalAnd', operators.logicalAnd],
   ['logicalOr', operators.logicalOr],
   ['logicalXor', operators.logicalXor],
   ['leftShift', operators.leftShift],
   ['rightShift', operators.rightShift]
];

describe('Operator', function () {
   describe('isPrimitive', function () {
      // Private member
      const isPrimitive = Operator['isPrimitive'];

      it('is true for all primitives', function () {
         expect(isPrimitive(true)).to.be.true;
         expect(isPrimitive(0)).to.be.true;
         expect(isPrimitive('hello')).to.be.true;
      });

      it('is false for functions', function () {
         expect(isPrimitive(function() {})).to.be.false;
         expect(isPrimitive(() => {})).to.be.false;
      });

      it('is false for objects', function () {
         expect(isPrimitive({})).to.be.false;
         expect(isPrimitive({ hello: 'world', foo: 'bar' })).to.be.false;
      });

      it('is false for classes', function () {
         class TestClass {

         }

         expect(isPrimitive(TestClass)).to.be.false;
         expect(isPrimitive(new TestClass())).to.be.false;
      });
   });

   describe('verifyNotNull', function () {
      const verifyNotNull = Operator['verifyNotNull'];

      it('throws when the item is null or undefined', function () {
         expect(() => verifyNotNull(null)).to.throw(TypeError);
         expect(() => verifyNotNull(undefined)).to.throw(TypeError);
      });

      it('does not throw for non null values, even if falsy', function () {
         expect(() => verifyNotNull(0)).to.not.throw;
         expect(() => verifyNotNull(false)).to.not.throw;
         expect(() => verifyNotNull('')).to.not.throw;
         expect(() => verifyNotNull(new Map())).to.not.throw;
      });
   });

   describe('operateOn', function () {
      describe('operateOnTwoOperands', function () {
         const operateOn = Operator['operateOnTwoOperands'];

         it('throws when the first parameter is missing the overload', function () {
            class TestClass {}

            expect(() => operateOn(new TestClass(), 2, operators.add)).to.throw(TypeError);
         });

         it('returns the result of the overload operation when overloaded', function () {
            const constantReturn = 5;

            class TestClass {
               [operators.add]() {
                  return constantReturn;
               }
            }

            const instance = new TestClass();

            expect(operateOn(instance, true, operators.add)).to.equal(constantReturn);
         });

         it('properly passes the other operand to the overload', function () {
            const otherValue = Symbol();

            class TestClass {
               [operators.add](other) {
                  expect(other).to.equal(otherValue);
               }
            }

            const instance = new TestClass();

            operateOn(instance, otherValue, operators.add);
         });
      });
   });

   describe('defaultOperateTwoOperands', function () {
      const defaultOperate = Operator['defaultOperateTwoOperands'];

      it('uses the primitive callback when both operands are primitive', function () {
         const tempPrimitiveMethod = Operator.primitiveMethods[operators.add];

         const callbackSymbol = Symbol();

         Operator.primitiveMethods[operators.add] = () => callbackSymbol;

         const returnValue = defaultOperate(1, 2, operators.add);

         expect(returnValue).to.equal(callbackSymbol);

         Operator.primitiveMethods[operators.add] = tempPrimitiveMethod;
      });
   });

   describe('two operand operators (non comparison)', () => runTests(twoOperandTests, twoOperandTestCaseData));
});