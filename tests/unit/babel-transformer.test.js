const { expect } = require('chai');
const transformCode = require('../helper/babel');
const runDynamicTests = require('../helper/dynamicTestRunner');
const { operators } = require('../../dist');

function expectNoTransformation(source) {
   // The second call to transform without plugins is done because sometimes babel strips "useless"
   // stuff out of the source code, such as left-hand parens for addition (don't ask me why).
   // Thus, we compare it to a transformation that occurs with no plugins enabled, so that we know
   // that any potential transformations are the work of Babel, and not us.
   expect(transformCode(source)).to.equal(transformCode(source, true));
}

function expectSpecificTransformation(source, desiredOutput) {
   expect(transformCode(source)).to.equal(desiredOutput);
}

function expectAnyTransformation(source) {
   expect(transformCode(source)).to.not.equal(transformCode(source, true));
}

function binaryExpressionTests(symbol, methodName) {
   describe(`a ${symbol} b [${methodName}]`, function () {
      describe(`numeric literal ${symbol} other`, function () {
         it('does not perform any transformations when other is a numeric literal', function () {
            expectNoTransformation(`1 ${symbol} 2;`);
         });

         it('generates the operator when other is not a numeric literal', function () {
            expectSpecificTransformation(`1 ${symbol} a`, `Operator.${methodName}(1, a);`);
         });

         describe('nested expressions', function () {
            it('does not transform when all variables are numeric literals, on the right side', function () {
               expectNoTransformation(`1 ${symbol} (2 ${symbol} (3 ${symbol} (4 ${symbol} (5 ${symbol} 6 ${symbol} 7 ${symbol} 8 ${symbol} (9 ${symbol} 10)))));`);
            });

            it('does not transform when all variables are numeric literals, on the left side', function () {
               expectNoTransformation(`(((((9 ${symbol} 10) ${symbol} 8 ${symbol} 7 ${symbol} 6 ${symbol} 5) ${symbol} 4) ${symbol} 3) ${symbol} 2) ${symbol} 1;`);
            });
         });
      });

      describe(`non numeric literal ${symbol} other`, function () {
         it(`generates the operator when both are identifiers`, function () {
            expectSpecificTransformation(`a ${symbol} b`, `Operator.${methodName}(a, b);`);
         });

         it(`generates the operator when either one is a member expression`, function () {
            expectSpecificTransformation(`cat.a ${symbol} b`, `Operator.${methodName}(cat.a, b);`);
            expectSpecificTransformation(`a ${symbol} cat.b`, `Operator.${methodName}(a, cat.b);`);
            expectSpecificTransformation(`cat.a ${symbol} cat.b`, `Operator.${methodName}(cat.a, cat.b);`);
         });

         it('does transform when variables are identifiers in nested expressions', function () {
            expectAnyTransformation(`a ${symbol} (b ${symbol} c ${symbol} (d ${symbol} e ${symbol} f) ${symbol} g) + h`);
         });
      });
   });
}

function assignmentExpressionTests(symbol, methodName) {
   describe(`a ${symbol}= b [${methodName}]`, function () {
      it(`transforms when performing ${methodName} on a numeric literal to an identifier`, function () {
         expectSpecificTransformation(`a ${symbol}= 2`, `a = Operator.${methodName}(a, 2);`);
      });

      it(`transforms when performing ${methodName} on a numeric literal to a member expression`, function () {
         expectSpecificTransformation(`cat.a ${symbol}= 2`, `cat.a = Operator.${methodName}(cat.a, 2);`);
      });

      it(`transforms when performing ${methodName} on a binary expression of an identifier to an identifier`, function () {
         expectSpecificTransformation(`a ${symbol}= (b ${symbol} 5)`, `a = Operator.${methodName}(a, Operator.${methodName}(b, 5));`);
      });
   });
}

function updateExpressionTests(symbol, methodName) {
   const Operator = {
      decrement(a) {
         return a - 1;
      },

      increment(a) {
         return a + 1;
      }
   };

   describe(`${symbol}a [prefix ${methodName}]`, function () {
      it('transforms when on its own', function () {
         expectSpecificTransformation(`${symbol}a`, `a = Operator.${methodName}(a);`);
      });

      it('transforms when assigning to a value', function () {
         expectSpecificTransformation(`a = ${symbol}b`, `a = b = Operator.${methodName}(b);`);
      });

      it('immediately returns the value after updating it', function () {
         let a = 5;

         const incrementReturn = eval(transformCode(`${symbol}a`));

         expect(incrementReturn).to.equal(a);
      });
   });

   describe(`a${symbol} [postfix ${methodName}]`, function () {
      it('transforms when on its own', function () {
         expectAnyTransformation(`a${symbol}`);
      });

      it('transforms when assigning to a value', function () {
         expectAnyTransformation(`a = b${symbol}`);
      });

      it('returns the value before updating it, but updates it in the same expression', function () {
         let a = 5;

         const initialValue = a;

         const incrementReturn = eval(transformCode(`a${symbol}`));

         expect(incrementReturn).to.equal(initialValue);
         expect(a).to.equal(Operator[methodName](initialValue));
      });
   });
}

function unaryExpressionTests(symbol, methodName) {
   describe(`${symbol}a [${methodName}]`, function () {
      it('does not transform types that are not identifiers/member expressions', function () {
         expectNoTransformation(`${symbol}2`);
         expectNoTransformation(`${symbol}[]`);
         expectNoTransformation(`${symbol}true`);
         expectNoTransformation(`${symbol}'cat'`);
         expectAnyTransformation(`${symbol}a`);
         expectAnyTransformation(`${symbol}cat.a`);
      });

      it('transforms identifiers and member expressions properly', function () {
         expectSpecificTransformation(`${symbol}a`, `Operator.${methodName}(a);`);
         expectSpecificTransformation(`${symbol}cat.a`, `Operator.${methodName}(cat.a);`);
      });
   });
}

const assignmentOperatorTestCaseData = [
   ['+', 'add'],
   ['-', 'subtract'],
   ['*', 'multiply'],
   ['%', 'mod'],
   ['/', 'divide'],
   ['**', 'pow'],
   ['&', 'logicalAnd'],
   ['|', 'logicalOr'],
   ['^', 'logicalXor'],
   ['<<', 'leftShift'],
   ['>>', 'rightShift']
];

const binaryOperatorTestCaseData = [
   ...assignmentOperatorTestCaseData,
   ['==', 'unsafeEqual'],
   ['!=', 'unsafeNotEqual'],
   ['===', 'strictEqual'],
   ['!==', 'strictNotEqual'],
   ['<', 'lessThan'],
   ['>', 'greaterThan'],
   ['<=', 'lessEqual'],
   ['>=', 'greaterEqual']
];

const updateOperatorTestCaseData = [
   ['++', 'increment'],
   ['--', 'decrement']
];

const unaryOperatorTestCaseData = [
   ['-', 'negate'],
   ['+', 'positive'],
   ['~', 'logicalNot'],
   ['!', 'not']
];

describe('babel transformer', function () {
   describe('Binary Expressions', () => runDynamicTests(binaryExpressionTests, binaryOperatorTestCaseData));

   describe('Assignment Expressions', () => runDynamicTests(assignmentExpressionTests, assignmentOperatorTestCaseData));

   describe('Unary Expressions', () => runDynamicTests(unaryExpressionTests, unaryOperatorTestCaseData));

   describe('Update Expressions', () => runDynamicTests(updateExpressionTests, updateOperatorTestCaseData));
});