const { Operator, operators } = require('../../dist');
const { expect } = require('chai');
const sinon = require('sinon');

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
      const operateOn = Operator['operateOn'];

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

   describe('defaultOperate', function () {
      const defaultOperate = Operator['defaultOperate'];

      it('uses the primitive callback when both operands are primitive', function () {
         const callbackSymbol = Symbol();
         const callback = () => callbackSymbol;

         const returnValue = defaultOperate(1, 2, operators.add, callback);

         expect(returnValue).to.equal(callbackSymbol);
      });
   });
});